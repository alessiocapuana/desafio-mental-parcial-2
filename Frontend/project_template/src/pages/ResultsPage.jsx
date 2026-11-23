import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { api } from "../services/api";
import { StatCard } from "../components/StatCard";

export function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cargandoNueva, setCargandoNueva] = useState(false);

  const partida = location.state?.partida;
  const config = location.state?.config;

  if (!partida) {
    return <Navigate to="/" replace />;
  }

  const minutos = Math.floor(partida.duracion / 60000);
  const segundos = Math.floor((partida.duracion % 60000) / 1000);

  const porcentajeCorrectas =
    partida.preguntasRespondidas === 0
      ? 0
      : Math.round(
          (partida.respuestasCorrectas / partida.preguntasRespondidas) * 100
        );

  let mensajeDesempeno = "¡Partida perfecta!";
  if (porcentajeCorrectas < 40) {
    mensajeDesempeno = "Necesitás seguir practicando";
  } else if (porcentajeCorrectas < 70) {
    mensajeDesempeno = "Vas por buen camino";
  } else if (porcentajeCorrectas < 100) {
    mensajeDesempeno = "¡Excelente desempeño!";
  }

  const fechaFormateada = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(partida.fechaFinalizacion));

  async function handleJugarNuevamente() {
    if (!config?.categoria || !config?.cantidad) {
      navigate("/");
      return;
    }

    setCargandoNueva(true);
    try {
      const nuevasPreguntas = await api.getQuestions({
        category: config.categoria,
        limit: config.cantidad,
      });

      navigate("/partida", {
        state: {
          preguntas: nuevasPreguntas,
          categoria: config.categoria,
          cantidad: config.cantidad,
        },
      });
    } catch (error) {
      console.error("Error al reiniciar partida:", error);
      navigate("/");
    } finally {
      setCargandoNueva(false);
    }
  }

  return (
    <section className="pantalla pantalla-contenido">
      <div className="encabezado-pantalla">
        <div>
          <p className="sobrelinea">FIN DE PARTIDA / RESULTADO</p>
          <h1>Partida finalizada.</h1>
          <p>Cada resultado es una nueva referencia para la próxima ronda.</p>
        </div>
        <span className="sello sello-grande">✓</span>
      </div>

      <div className="bloque-puntaje">
        <p className="sobrelinea">PUNTAJE OBTENIDO</p>
        <strong id="resultado-puntaje">{partida.puntaje}</strong>
        <span>puntos</span>
      </div>

      <div className="estadisticas">
        <StatCard
          etiqueta="RESPUESTAS CORRECTAS"
          valor={partida.respuestasCorrectas}
        />
        <StatCard
          etiqueta="RESPUESTAS INCORRECTAS"
          valor={partida.respuestasIncorrectas}
        />
        <StatCard
          etiqueta="PORCENTAJE DE ACIERTOS"
          valor={`${porcentajeCorrectas} %`}
        />
        <StatCard etiqueta="MEJOR RACHA" valor={partida.mejorRacha} />
        <StatCard
          etiqueta="DURACIÓN"
          valor={`${minutos} min ${segundos} s`}
        />
        <StatCard etiqueta="CATEGORÍA" valor={partida.categoria} />
      </div>

      <div className="panel-listado datos-finalizacion">
        <span className="etiqueta-tarjeta">FECHA Y HORA DE FINALIZACIÓN</span>
        <p id="resultado-fecha">{fechaFormateada}</p>
      </div>

      <div className="mensaje-desempeno">
        <p className="sobrelinea">TU DESEMPEÑO</p>
        <h2 id="mensaje-desempeno">{mensajeDesempeno}</h2>
      </div>

      <div className="grupo-botones">
        <button
          type="button"
          id="btn-volver-menu"
          className="boton-principal"
          onClick={() => navigate("/")}
        >
          Volver al menú
        </button>

        <button
          type="button"
          id="btn-jugar-nuevamente"
          className="boton-secundario"
          disabled={cargandoNueva}
          onClick={handleJugarNuevamente}
        >
          {cargandoNueva ? "Preparando..." : "Jugar nuevamente"}
        </button>
      </div>
    </section>
  );
}