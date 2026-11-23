import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { api } from "../services/api";

export function GamePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const preguntas = location.state?.preguntas || [];
  const categoria = location.state?.categoria || "";
  const cantidad = location.state?.cantidad || 0;

  const [indiceActual, setIndiceActual] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [correctas, setCorrectas] = useState(0);
  const [incorrectas, setIncorrectas] = useState(0);
  const [rachaActual, setRachaActual] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(15);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(undefined);
  const [respondida, setRespondida] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const tiempoInicioRef = useRef(Date.now());
  const respuestasRef = useRef([]);
  const avanceTimeoutRef = useRef(null);
  const finalizadoRef = useRef(false);

  const finalizarYGuardar = useCallback(
    async ({
      puntajeFinal,
      correctasFinal,
      incorrectasFinal,
      mejorRachaFinal,
    }) => {
      if (finalizadoRef.current) return;
      finalizadoRef.current = true;
      setGuardando(true);

      const fechaFinalizacion = new Date();
      const duracionTotal =
        fechaFinalizacion.getTime() - tiempoInicioRef.current;
      const preguntasRespondidas = correctasFinal + incorrectasFinal;

      const partidaPayload = {
        categoria,
        cantidadPreguntas: preguntas.length,
        preguntasRespondidas,
        puntaje: puntajeFinal,
        respuestasCorrectas: correctasFinal,
        respuestasIncorrectas: incorrectasFinal,
        mejorRacha: mejorRachaFinal,
        duracion: duracionTotal,
        fechaInicio: new Date(tiempoInicioRef.current).toISOString(),
        fechaFinalizacion: fechaFinalizacion.toISOString(),
        respuestas: respuestasRef.current,
        estado: "completada",
      };

      try {
        await api.saveGame(partidaPayload);
      } catch (err) {
        console.error("Error al guardar la partida:", err);
      }

      navigate("/resultados", {
        replace: true,
        state: {
          partida: partidaPayload,
          config: { categoria, cantidad },
        },
      });
    },
    [categoria, cantidad, navigate, preguntas.length]
  );

  const responderPregunta = useCallback(
    (indiceOpcion) => {
      if (respondida || finalizadoRef.current || preguntas.length === 0) return;

      setRespondida(true);
      setOpcionSeleccionada(indiceOpcion);

      const preguntaActual = preguntas[indiceActual];
      const respuestaCorrecta = preguntaActual.respuestaCorrecta;
      const respuestaCorrectaTexto = preguntaActual.opciones[respuestaCorrecta];
      const esCorrecta = indiceOpcion === respuestaCorrecta;
      const puntosPregunta = preguntaActual.puntaje || 10;

      respuestasRef.current.push({
        preguntaId: preguntaActual.id,
        enunciado: preguntaActual.enunciado,
        opciones: [...preguntaActual.opciones],
        respuestaSeleccionada: indiceOpcion,
        respuestaSeleccionadaTexto:
          indiceOpcion === null
            ? "Sin responder (tiempo agotado)"
            : preguntaActual.opciones[indiceOpcion],
        respuestaCorrecta,
        respuestaCorrectaTexto,
        resultado:
          indiceOpcion === null
            ? "sin_responder"
            : esCorrecta
            ? "correcta"
            : "incorrecta",
        puntajeObtenido: esCorrecta ? puntosPregunta : 0,
      });

      const nuevoPuntaje = esCorrecta ? puntaje + puntosPregunta : puntaje;
      const nuevasCorrectas = esCorrecta ? correctas + 1 : correctas;
      const nuevasIncorrectas = esCorrecta ? incorrectas : incorrectas + 1;
      const nuevaRacha = esCorrecta ? rachaActual + 1 : 0;
      const nuevaMejorRacha =
        nuevaRacha > mejorRacha ? nuevaRacha : mejorRacha;

      setPuntaje(nuevoPuntaje);
      setCorrectas(nuevasCorrectas);
      setIncorrectas(nuevasIncorrectas);
      setRachaActual(nuevaRacha);
      setMejorRacha(nuevaMejorRacha);

      avanceTimeoutRef.current = setTimeout(() => {
        if (indiceActual + 1 < preguntas.length) {
          setIndiceActual((prev) => prev + 1);
          setRespondida(false);
          setOpcionSeleccionada(undefined);
          setTiempoRestante(15);
        } else {
          finalizarYGuardar({
            puntajeFinal: nuevoPuntaje,
            correctasFinal: nuevasCorrectas,
            incorrectasFinal: nuevasIncorrectas,
            mejorRachaFinal: nuevaMejorRacha,
          });
        }
      }, 2000);
    },
    [
      respondida,
      preguntas,
      indiceActual,
      puntaje,
      correctas,
      incorrectas,
      rachaActual,
      mejorRacha,
      finalizarYGuardar,
    ]
  );

  // Temporizador de 15 segundos por pregunta
  useEffect(() => {
    if (preguntas.length === 0 || respondida || guardando) return;

    const intervalo = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          responderPregunta(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [indiceActual, respondida, guardando, preguntas.length, responderPregunta]);

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
    if (finalizadoRef.current || guardando) return;

    const confirmar = window.confirm(
      "¿Seguro que querés abandonar la partida? El progreso de esta ronda se perderá."
    );
    if (!confirmar) return;

    if (avanceTimeoutRef.current) clearTimeout(avanceTimeoutRef.current);
    finalizadoRef.current = true;
    setGuardando(true);

    const fechaAbandono = new Date();
    const duracionTotal = fechaAbandono.getTime() - tiempoInicioRef.current;
    const preguntasRespondidas = correctas + incorrectas;

    if (!respondida) {
      const preguntaActual = preguntas[indiceActual];
      respuestasRef.current.push({
        preguntaId: preguntaActual.id,
        enunciado: preguntaActual.enunciado,
        opciones: [...preguntaActual.opciones],
        respuestaSeleccionada: null,
        respuestaSeleccionadaTexto: "Sin responder (partida abandonada)",
        respuestaCorrecta: preguntaActual.respuestaCorrecta,
        respuestaCorrectaTexto:
          preguntaActual.opciones[preguntaActual.respuestaCorrecta],
        resultado: "abandonada",
        puntajeObtenido: 0,
      });
    }

    const partidaAbandonada = {
      categoria,
      cantidadPreguntas: preguntas.length,
      preguntasRespondidas,
      puntaje,
      respuestasCorrectas: correctas,
      respuestasIncorrectas: incorrectas,
      mejorRacha,
      duracion: duracionTotal,
      fechaInicio: new Date(tiempoInicioRef.current).toISOString(),
      fechaFinalizacion: fechaAbandono.toISOString(),
      respuestas: respuestasRef.current,
      estado: "abandonada",
    };

    try {
      await api.saveGame(partidaAbandonada);
    } catch (err) {
      console.error("Error al registrar partida abandonada:", err);
    }

    navigate("/", { replace: true });
  }

  const preguntaActual = preguntas[indiceActual];
  const respuestaCorrecta = preguntaActual.respuestaCorrecta;
  const puntosPregunta = preguntaActual.puntaje || 10;

  let mensajeFeedback = "";
  let claseFeedback = "";

  if (respondida) {
    if (opcionSeleccionada === respuestaCorrecta) {
      mensajeFeedback = `Respuesta correcta. +${puntosPregunta} puntos.`;
      claseFeedback = "respuesta-correcta";
    } else if (opcionSeleccionada === null) {
      mensajeFeedback = `Se acabó el tiempo. La respuesta correcta era: ${preguntaActual.opciones[respuestaCorrecta]}`;
      claseFeedback = "respuesta-incorrecta";
    } else {
      mensajeFeedback = `Respuesta incorrecta. La respuesta correcta era: ${preguntaActual.opciones[respuestaCorrecta]}`;
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
          <strong id="puntaje-partida">{puntaje}</strong>
        </div>
      </div>

      <div className="datos-rachas">
        <p>
          Racha actual
          <strong id="racha-actual">{rachaActual}</strong>
        </p>

        <p>
          Mejor racha
          <strong id="mejor-racha">{mejorRacha}</strong>
        </p>
      </div>

      <div className="tarjeta-pregunta">
        <p className="sobrelinea">TU TURNO</p>
        <h2 id="texto-pregunta">{preguntaActual.enunciado}</h2>

        <div id="opciones-respuesta" className="opciones-respuesta">
          {preguntaActual.opciones.map((opcion, indice) => {
            let claseExtra = "";
            if (respondida) {
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

        <div className="contenedor-volver-partida">
          <button
            type="button"
            id="btn-abandonar-partida"
            className="btn-preguntas-volver"
            disabled={guardando}
            onClick={handleAbandonarPartida}
          >
            {guardando ? "Guardando..." : "Abandonar partida"}
          </button>
        </div>
      </div>
    </section>
  );
}