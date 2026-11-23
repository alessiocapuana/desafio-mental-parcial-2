import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export function RankingPage() {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarRanking() {
      setCargando(true);
      setError("");
      try {
        const data = await api.getRanking();
        setRanking(data);
      } catch (err) {
        setError(err.message || "Error al cargar el ranking.");
      } finally {
        setCargando(false);
      }
    }
    cargarRanking();
  }, []);

  return (
    <section id="pantalla-ranking" className="pantalla pantalla-contenido">
      <div className="encabezado-pantalla">
        <div>
          <p className="sobrelinea">CLASIFICACIÓN / JUGADORES</p>
          <h1>Ranking</h1>
          <p>
            Compará los resultados de todos los jugadores y descubrí quiénes
            lideran la clasificación.
          </p>
        </div>

        <span className="sello sello-grande" aria-hidden="true">
          #
        </span>
      </div>

      <div className="panel-listado panel-ranking">
        <div className="encabezado-ranking">
          <div>
            <p className="sobrelinea">CLASIFICACIÓN GENERAL</p>
            <h2>Tabla de posiciones</h2>
            <p>Los diez mejores resultados de las partidas completadas.</p>
          </div>
        </div>

        {error && (
          <p className="mensaje-formulario error" role="status">
            {error}
          </p>
        )}

        <div className="contenedor-tabla-ranking">
          <ol id="lista-ranking" aria-live="polite">
            {cargando ? (
              <li>Cargando tabla de posiciones...</li>
            ) : ranking.length === 0 ? (
              <li>
                Todavía no hay partidas completadas para mostrar en el ranking.
              </li>
            ) : (
              ranking.map((partida, indice) => {
                const fechaFormateada = new Intl.DateTimeFormat("es-AR", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(partida.fechaFinalizacion));

                return (
                  <li key={partida.id}>
                    <span className="posicion-ranking">#{indice + 1}</span>
                    <div className="datos-ranking">
                      <h3>{partida.usuario}</h3>
                      <p>{partida.categoria}</p>
                      <p>Finalizada: {fechaFormateada}</p>
                    </div>
                    <strong className="puntaje-ranking">
                      {partida.puntaje} pts.
                    </strong>
                  </li>
                );
              })
            )}
          </ol>
        </div>

        <p className="nota-ranking">
          En caso de empate, se prioriza la partida de menor duración. Si
          continúa el empate, prevalece la fecha de finalización más antigua.
        </p>
      </div>

      <button
        type="button"
        id="btn-menu-ranking"
        className="boton-secundario"
        onClick={() => navigate("/")}
      >
        <span aria-hidden="true">←</span>
        <span>Volver al menú</span>
      </button>
    </section>
  );
}