import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { api } from "../services/api";

const TIEMPO_POR_PREGUNTA = 15;
const PAUSA_ENTRE_PREGUNTAS = 2000;

const MARCADOR_INICIAL = {
  puntaje: 0,
  correctas: 0,
  incorrectas: 0,
  rachaActual: 0,
  mejorRacha: 0,
};

export function GamePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const preguntas = location.state?.preguntas || [];
  const categoria = location.state?.categoria || "";
  const cantidad = location.state?.cantidad || 0;

  const [indiceActual, setIndiceActual] = useState(0);
  const [marcador, setMarcador] = useState(MARCADOR_INICIAL);
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_POR_PREGUNTA);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(undefined);
  const [respondida, setRespondida] = useState(false);
  const [validando, setValidando] = useState(false);
  // Resultado que devuelve el servidor para la pregunta actual
  const [resultado, setResultado] = useState(null);
  const [errorValidacion, setErrorValidacion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");

  const tiempoInicioRef = useRef(Date.now());
  // Solo se guarda lo que eligió el jugador; los resultados los calcula el servidor
  const respuestasRef = useRef([]);
  const avanceTimeoutRef = useRef(null);
  const finalizadoRef = useRef(false);
  // Evita responder dos veces la misma pregunta (clic + fin del tiempo, etc.)
  const respondiendoRef = useRef(false);
  const payloadFinalRef = useRef(null);

  const guardarPartidaCompletada = useCallback(async () => {
    setGuardando(true);
    setErrorGuardado("");
    try {
      const partidaGuardada = await api.saveGame(payloadFinalRef.current);
      navigate("/resultados", {
        replace: true,
        state: {
          partida: partidaGuardada,
          config: { categoria, cantidad },
        },
      });
    } catch (err) {
      setErrorGuardado(
        err.message || "No se pudo guardar la partida en el servidor."
      );
      setGuardando(false);
    }
  }, [categoria, cantidad, navigate]);

  const finalizarPartida = useCallback(() => {
    if (finalizadoRef.current) return;
    finalizadoRef.current = true;

    payloadFinalRef.current = {
      categoria,
      cantidadPreguntas: preguntas.length,
      fechaInicio: new Date(tiempoInicioRef.current).toISOString(),
      fechaFinalizacion: new Date().toISOString(),
      respuestas: respuestasRef.current,
      estado: "completada",
    };

    guardarPartidaCompletada();
  }, [categoria, preguntas.length, guardarPartidaCompletada]);

  const responderPregunta = useCallback(
    async (indiceOpcion) => {
      if (
        respondiendoRef.current ||
        finalizadoRef.current ||
        preguntas.length === 0
      ) {
        return;
      }
      respondiendoRef.current = true;

      const preguntaActual = preguntas[indiceActual];
      const esUltima = indiceActual + 1 >= preguntas.length;

      setRespondida(true);
      setOpcionSeleccionada(indiceOpcion);
      setValidando(true);
      setErrorValidacion("");

      try {
        // La respuesta se valida en el servidor
        const data = await api.checkAnswer(preguntaActual.id, indiceOpcion);
        setResultado(data);
        setMarcador((m) => {
          const rachaActual = data.correcta ? m.rachaActual + 1 : 0;
          return {
            puntaje: m.puntaje + data.puntajeObtenido,
            correctas: m.correctas + (data.correcta ? 1 : 0),
            incorrectas: m.incorrectas + (data.correcta ? 0 : 1),
            rachaActual,
            mejorRacha: Math.max(m.mejorRacha, rachaActual),
          };
        });
      } catch (err) {
        setErrorValidacion(
          "No se pudo validar la respuesta. Se registrará igual al guardar la partida."
        );
      } finally {
        setValidando(false);
      }

      respuestasRef.current.push({
        preguntaId: preguntaActual.id,
        respuestaSeleccionada: indiceOpcion,
      });

      avanceTimeoutRef.current = setTimeout(() => {
        if (esUltima) {
          finalizarPartida();
          return;
        }
        setIndiceActual((prev) => prev + 1);
        setRespondida(false);
        setOpcionSeleccionada(undefined);
        setResultado(null);
        setErrorValidacion("");
        setTiempoRestante(TIEMPO_POR_PREGUNTA);
        respondiendoRef.current = false;
      }, PAUSA_ENTRE_PREGUNTAS);
    },
    [preguntas, indiceActual, finalizarPartida]
  );

  // Temporizador: solo descuenta segundos (sin efectos secundarios dentro del setState)
  useEffect(() => {
    if (preguntas.length === 0 || respondida || finalizadoRef.current) return;

    const intervalo = setInterval(() => {
      setTiempoRestante((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [indiceActual, respondida, preguntas.length]);

  // Cuando el tiempo llega a 0, la pregunta queda sin responder
  useEffect(() => {
    if (tiempoRestante === 0 && !respondida) {
      responderPregunta(null);
    }
  }, [tiempoRestante, respondida, responderPregunta]);

  // Limpiar timeout de avance al desmontar
  useEffect(() => {
    return () => {
      if (avanceTimeoutRef.current) clearTimeout(avanceTimeoutRef.current);
    };
  }, []);

  if (preguntas.length === 0) {
    return <Navigate to="/" replace />;
  }

  async function handleAbandonarPartida() {
    if (finalizadoRef.current || guardando || validando) return;

    const confirmar = window.confirm(
      "¿Seguro que querés abandonar la partida? El progreso de esta ronda se perderá."
    );
    if (!confirmar) return;

    if (avanceTimeoutRef.current) clearTimeout(avanceTimeoutRef.current);
    finalizadoRef.current = true;
    setGuardando(true);

    if (!respondida) {
      respuestasRef.current.push({
        preguntaId: preguntas[indiceActual].id,
        respuestaSeleccionada: null,
        abandonada: true,
      });
    }

    try {
      await api.saveGame({
        categoria,
        cantidadPreguntas: preguntas.length,
        fechaInicio: new Date(tiempoInicioRef.current).toISOString(),
        fechaFinalizacion: new Date().toISOString(),
        respuestas: respuestasRef.current,
        estado: "abandonada",
      });
    } catch (err) {
      window.alert(
        `No se pudo registrar la partida abandonada: ${err.message}`
      );
    }

    navigate("/", { replace: true });
  }

  const preguntaActual = preguntas[indiceActual];
  const respuestaCorrecta = resultado ? resultado.respuestaCorrecta : undefined;

  let mensajeFeedback = "";
  let claseFeedback = "";

  if (respondida) {
    if (validando) {
      mensajeFeedback = "Validando respuesta...";
    } else if (errorValidacion) {
      mensajeFeedback = errorValidacion;
      claseFeedback = "respuesta-incorrecta";
    } else if (resultado?.correcta) {
      mensajeFeedback = `Respuesta correcta. +${resultado.puntajeObtenido} puntos.`;
      claseFeedback = "respuesta-correcta";
    } else if (resultado && opcionSeleccionada === null) {
      mensajeFeedback = `Se acabó el tiempo. La respuesta correcta era: ${resultado.respuestaCorrectaTexto}`;
      claseFeedback = "respuesta-incorrecta";
    } else if (resultado) {
      mensajeFeedback = `Respuesta incorrecta. La respuesta correcta era: ${resultado.respuestaCorrectaTexto}`;
      claseFeedback = "respuesta-incorrecta";
    }
  }

  return (
    <section className="pantalla pantalla-contenido">
      <div className="encabezado-pantalla">
        <div>
          <p className="sobrelinea">PARTIDA EN CURSO / 01</p>
          <h1>Hora de responder.</h1>
          <p>Leé con atención antes de elegir tu respuesta.</p>
        </div>
        <span className="sello sello-grande">?</span>
      </div>

      <div className="datos-partida">
        <div>
          <span className="etiqueta-tarjeta">PREGUNTA</span>
          <strong id="numero-pregunta">
            {indiceActual + 1} / {preguntas.length}
          </strong>
        </div>

        <div>
          <span className="etiqueta-tarjeta">TIEMPO RESTANTE</span>
          <strong>
            <span id="tiempo-restante">{tiempoRestante}</span> s
          </strong>
        </div>

        <div>
          <span className="etiqueta-tarjeta">PUNTAJE</span>
          <strong id="puntaje-partida">{marcador.puntaje}</strong>
        </div>
      </div>

      <div className="datos-rachas">
        <p>
          Racha actual
          <strong id="racha-actual">{marcador.rachaActual}</strong>
        </p>

        <p>
          Mejor racha
          <strong id="mejor-racha">{marcador.mejorRacha}</strong>
        </p>
      </div>

      <div className="tarjeta-pregunta">
        <p className="sobrelinea">TU TURNO</p>
        <h2 id="texto-pregunta">{preguntaActual.enunciado}</h2>

        <div id="opciones-respuesta" className="opciones-respuesta">
          {preguntaActual.opciones.map((opcion, indice) => {
            let claseExtra = "";
            if (respondida && respuestaCorrecta !== undefined) {
              if (indice === respuestaCorrecta) {
                claseExtra = "opcion-correcta";
              } else if (indice === opcionSeleccionada) {
                claseExtra = "opcion-incorrecta";
              }
            }

            return (
              <button
                key={indice}
                type="button"
                className={`opcion-respuesta ${claseExtra}`}
                disabled={respondida || guardando}
                onClick={() => responderPregunta(indice)}
              >
                {opcion}
              </button>
            );
          })}
        </div>

        {mensajeFeedback && (
          <p
            id="mensaje-respuesta"
            className={claseFeedback}
            aria-live="polite"
          >
            {mensajeFeedback}
          </p>
        )}

        {errorGuardado && (
          <div role="alert">
            <p className="mensaje-formulario error">{errorGuardado}</p>
            <div className="grupo-botones">
              <button
                type="button"
                className="boton-principal"
                disabled={guardando}
                onClick={guardarPartidaCompletada}
              >
                {guardando ? "Guardando..." : "Reintentar guardado"}
              </button>
              <button
                type="button"
                className="boton-secundario"
                onClick={() => navigate("/", { replace: true })}
              >
                Volver al menú sin guardar
              </button>
            </div>
          </div>
        )}

        {!errorGuardado && (
          <div className="contenedor-volver-partida">
            <button
              type="button"
              id="btn-abandonar-partida"
              className="btn-preguntas-volver"
              disabled={guardando || validando}
              onClick={handleAbandonarPartida}
            >
              {guardando ? "Guardando..." : "Abandonar partida"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
