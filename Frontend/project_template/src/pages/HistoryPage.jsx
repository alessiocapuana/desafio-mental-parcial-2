import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { GameDetailModal } from "../components/GameDetailModal";

export function HistoryPage() {
  const navigate = useNavigate();

  const [todasLasPartidas, setTodasLasPartidas] = useState([]);
  const [partidasFiltradas, setPartidasFiltradas] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [partidaSeleccionada, setPartidaSeleccionada] = useState(null);

  // Cargar resumen general del usuario desde la API
  useEffect(() => {
    async function cargarResumen() {
      try {
        const data = await api.getHistory();
        setTodasLasPartidas(data);
      } catch (err) {
        setError(err.message || "Error al cargar el historial.");
      }
    }
    cargarResumen();
  }, []);

  // Consultar partidas filtradas en el servidor cuando cambian los selectores
  useEffect(() => {
    async function cargarFiltradas() {
      setCargando(true);
      setError("");
      try {
        const data = await api.getHistory({
          categoria: filtroCategoria,
          estado: filtroEstado,
        });
        setPartidasFiltradas(data);
      } catch (err) {
        setError(err.message || "Error al filtrar las partidas.");
      } finally {
        setCargando(false);
      }
    }
    cargarFiltradas();
  }, [filtroCategoria, filtroEstado]);

  // Resumen general (completadas, abandonadas y puntaje acumulado)
  const resumen = todasLasPartidas.reduce(
    (acc, partida) => {
      if (partida.estado === "completada") {
        acc.completadas += 1;
        acc.puntajeAcumulado += partida.puntaje;
      } else if (partida.estado === "abandonada") {
        acc.abandonadas += 1;
      }
      return acc;
    },
    { completadas: 0, abandonadas: 0, puntajeAcumulado: 0 }
  );

  // Estadística por categoría sobre las partidas filtradas
  const totales = partidasFiltradas.reduce(
    (acc, partida) => {
      acc.respuestasCorrectas += partida.respuestasCorrectas;
      acc.preguntasRespondidas += partida.preguntasRespondidas;
      return acc;
    },
    { respuestasCorrectas: 0, preguntasRespondidas: 0 }
  );

  const porcentaje =
    totales.preguntasRespondidas === 0
      ? 0
      : Math.round(
          (totales.respuestasCorrectas / totales.preguntasRespondidas) * 100
        );

  let mensajeEstadistica =
    "Seleccioná una categoría para consultar tus resultados.";
  let textoPorcentaje = "";
  let detalleEstadistica =
    "Elegí una categoría para calcular el porcentaje de aciertos.";
  let anchoBarra = 0;

  if (filtroCategoria !== "") {
    if (totales.preguntasRespondidas === 0) {
      mensajeEstadistica =
        "Todavía no hay respuestas registradas para esta selección.";
      textoPorcentaje = "0%";
      detalleEstadistica =
        "Respondé algunas preguntas para obtener tu porcentaje de aciertos.";
      anchoBarra = 0;
    } else {
      mensajeEstadistica = `Tu porcentaje de aciertos en ${filtroCategoria}:`;
      textoPorcentaje = `${porcentaje}%`;
      detalleEstadistica = `${totales.respuestasCorrectas} respuestas correctas de ${totales.preguntasRespondidas} preguntas respondidas.`;
      anchoBarra = porcentaje;
    }
  }

  return (
    <>
      <section id="pantalla-historial" className="pantalla pantalla-contenido">
        <div className="encabezado-pantalla">
          <div>
            <p className="sobrelinea">REGISTRO PERSONAL / PARTIDAS</p>
            <h1>Historial</h1>
            <p>
              Revisá tus resultados, consultá tus partidas anteriores y seguí la
              evolución de tu puntaje.
            </p>
          </div>

          <span className="sello sello-grande" aria-hidden="true">
            ↗
          </span>
        </div>

        <div className="panel-listado panel-historial">
          <div className="encabezado-historial">
            <div>
              <p className="sobrelinea">TU ACTIVIDAD</p>
              <h2>Tus partidas</h2>
              <p className="descripcion-historial">
                Consultá los resultados y encontrá una partida por categoría o
                estado.
              </p>
            </div>
          </div>

          <div id="resumen-historial" className="resumen-historial">
            <h3>Resumen de actividad</h3>

            <div className="estadisticas-historial">
              <div className="estadistica-historial">
                <p>Partidas completadas</p>
                <strong id="resumen-completadas">{resumen.completadas}</strong>
              </div>

              <div className="estadistica-historial">
                <p>Partidas abandonadas</p>
                <strong id="resumen-abandonadas">{resumen.abandonadas}</strong>
              </div>

              <div className="estadistica-historial">
                <p>Puntaje acumulado</p>
                <strong id="resumen-puntaje">
                  {resumen.puntajeAcumulado} puntos
                </strong>
              </div>
            </div>
          </div>

          <div className="bloque-filtros-historial">
            <div className="titulo-filtros">
              <h3>Filtrar resultados</h3>
              <p>Podés combinar ambos filtros.</p>
            </div>

            <div className="filtros-historial">
              <div className="campo-filtro-historial">
                <label htmlFor="filtro-categoria-historial">Categoría</label>

                <select
                  id="filtro-categoria-historial"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  <option value="Historia y cultura">Historia y cultura</option>
                  <option value="Ciencia y naturaleza">
                    Ciencia y naturaleza
                  </option>
                  <option value="Geografía">Geografía</option>
                  <option value="Informática y programación">
                    Informática y programación
                  </option>
                </select>
              </div>

              <div className="campo-filtro-historial">
                <label htmlFor="filtro-estado-historial">
                  Estado de la partida
                </label>

                <select
                  id="filtro-estado-historial"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="completada">Completadas</option>
                  <option value="abandonada">Abandonadas</option>
                </select>
              </div>
            </div>

            <p className="ayuda-filtros">
              Seleccioná una opción para actualizar los resultados.
            </p>
          </div>

          <div className="estadistica-categoria">
            <h3>Porcentaje de aciertos</h3>

            <p id="mensaje-estadistica-categoria">{mensajeEstadistica}</p>

            <strong id="porcentaje-aciertos">{textoPorcentaje}</strong>

            <div
              id="barra-progreso-aciertos"
              className="barra-progreso-aciertos"
              role="progressbar"
              aria-label="Porcentaje de respuestas correctas"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={anchoBarra}
            >
              <div
                id="progreso-aciertos"
                className="progreso-aciertos"
                style={{ width: `${anchoBarra}%` }}
              ></div>
            </div>

            <p id="detalle-estadistica-categoria">{detalleEstadistica}</p>
          </div>

          <div className="resultados-historial">
            <h3 className="titulo-resultados">Resultados</h3>

            {error && (
              <p className="mensaje-formulario error" role="status">
                {error}
              </p>
            )}

            <ul id="lista-historial" aria-live="polite">
              {cargando ? (
                <li>Cargando historial de partidas...</li>
              ) : partidasFiltradas.length === 0 ? (
                <li>
                  No hay partidas que coincidan con los filtros seleccionados.
                </li>
              ) : (
                partidasFiltradas.map((partida) => {
                  const fechaFormateada = new Intl.DateTimeFormat("es-AR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(partida.fechaFinalizacion));

                  return (
                    <li key={partida.id}>
                      <h3>{partida.categoria}</h3>
                      <p>Fecha: {fechaFormateada}</p>
                      <p>Puntaje: {partida.puntaje} puntos</p>
                      <p>
                        Respuestas correctas: {partida.respuestasCorrectas} de{" "}
                        {partida.cantidadPreguntas}
                      </p>
                      <p
                        className={
                          partida.estado === "completada"
                            ? "estado-completada"
                            : "estado-abandonada"
                        }
                      >
                        Estado:{" "}
                        {partida.estado === "completada"
                          ? "Completada"
                          : "Abandonada"}
                      </p>

                      <button
                        type="button"
                        className="btn-ver-detalle"
                        aria-label={`Ver respuestas de la partida de ${partida.categoria}`}
                        onClick={() => setPartidaSeleccionada(partida)}
                      >
                        Ver respuestas
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        <button
          type="button"
          id="btn-menu-historial"
          className="boton-secundario"
          onClick={() => navigate("/")}
        >
          <span aria-hidden="true">←</span>
          <span>Volver al menú</span>
        </button>
      </section>

      <GameDetailModal
        partida={partidaSeleccionada}
        onClose={() => setPartidaSeleccionada(null)}
      />
    </>
  );
}