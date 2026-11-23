import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { StatCard } from "../components/StatCard";

const CATEGORIAS_BASE = [
  "Historia y cultura",
  "Ciencia y naturaleza",
  "Geografía",
  "Informática y programación",
];

export function MenuPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalPartidas: 0,
    totalPreguntas: 0,
    porcentajeAciertos: 0,
    puntajeMasAlto: 0,
    mejorRachaGlobal: 0,
    puntajeTotal: 0,
  });

  const [categorias, setCategorias] = useState(CATEGORIAS_BASE);
  const [estadoCarga, setEstadoCarga] = useState("cargando"); // "cargando" | "completa" | "error"
  const [categoria, setCategoria] = useState("");
  const [cantidad, setCantidad] = useState("5");
  const [errorConfig, setErrorConfig] = useState("");
  const [iniciando, setIniciando] = useState(false);

  const cargarDatosMenu = useCallback(async () => {
    setEstadoCarga("cargando");
    try {
      const [preguntasData, statsData] = await Promise.all([
        api.getQuestions(),
        api.getStats(),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      if (!Array.isArray(preguntasData) || preguntasData.length === 0) {
        throw new Error("No hay preguntas disponibles.");
      }

      const categoriasUnicas = Array.from(
        new Set([
          ...CATEGORIAS_BASE,
          ...preguntasData.map((p) => p.categoria).filter(Boolean),
        ])
      );

      setCategorias(categoriasUnicas);
      setStats(statsData);
      setEstadoCarga("completa");
    } catch (error) {
      console.error("Error al cargar datos del menú:", error);
      setEstadoCarga("error");
    }
  }, []);

  useEffect(() => {
    cargarDatosMenu();
  }, [cargarDatosMenu]);

  async function handleComenzarPartida(e) {
    e.preventDefault();
    setErrorConfig("");

    const cantidadNum = Number(cantidad);
    if (!categoria || (cantidadNum !== 5 && cantidadNum !== 10)) {
      setErrorConfig(
        "Seleccioná una categoría y una cantidad válida de preguntas."
      );
      return;
    }

    setIniciando(true);
    try {
      const preguntasPartida = await api.getQuestions({
        category: categoria,
        limit: cantidadNum,
      });

      if (preguntasPartida.length < cantidadNum) {
        setErrorConfig(
          "No hay suficientes preguntas disponibles en esta categoría."
        );
        return;
      }

      navigate("/partida", {
        state: {
          preguntas: preguntasPartida,
          categoria,
          cantidad: cantidadNum,
        },
      });
    } catch (err) {
      setErrorConfig(err.message || "No se pudo iniciar la partida.");
    } finally {
      setIniciando(false);
    }
  }

  function handleCerrarSesion() {
    logout();
    navigate("/login");
  }

  return (
    <section className="pantalla pantalla-contenido">
      <div className="encabezado-pantalla">
        <div>
          <p className="sobrelinea">CENTRO DE JUEGO / 01</p>
          <h1>Menú principal</h1>
          <p id="bienvenida">
            {user
              ? `¡Bienvenido/a, ${user.name}!`
              : "Tu próxima partida te está esperando."}
          </p>
        </div>
        <span className="sello sello-grande">DM</span>
      </div>

      <div className="bloque-destacado">
        <div>
          <p className="sobrelinea">¿ACEPTÁS EL DESAFÍO?</p>
          <h2>El próximo punto está en juego.</h2>
          <p>
            Elegí una categoría, definí la cantidad de preguntas y poné a prueba
            tus conocimientos.
          </p>
        </div>
      </div>

      <div className="zona-carga-preguntas">
        <div
          id="estado-carga-preguntas"
          className={`estado-carga-preguntas ${
            estadoCarga === "completa"
              ? "carga-completa"
              : estadoCarga === "error"
              ? "carga-error"
              : ""
          }`}
          role="status"
          aria-live="polite"
        >
          {estadoCarga === "cargando" && (
            <span className="spinner-carga" aria-hidden="true"></span>
          )}
          <p id="mensaje-carga-preguntas">
            {estadoCarga === "cargando" && "Preparando el banco de preguntas..."}
            {estadoCarga === "completa" && "Banco de preguntas listo."}
            {estadoCarga === "error" &&
              "No se pudieron cargar las preguntas. Intentá nuevamente."}
          </p>
        </div>

        {estadoCarga === "error" && (
          <button
            type="button"
            id="btn-reintentar-carga"
            className="boton-secundario"
            onClick={cargarDatosMenu}
          >
            Reintentar carga
            <span aria-hidden="true">↻</span>
          </button>
        )}
      </div>

      <div className="configuracion-partida">
        <form onSubmit={handleComenzarPartida}>
          <label htmlFor="categoria-partida">Categoría</label>
          <select
            id="categoria-partida"
            name="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
          >
            <option value="">Seleccioná una categoría</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label htmlFor="cantidad-preguntas">Cantidad de preguntas</label>
          <select
            id="cantidad-preguntas"
            name="cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            required
          >
            <option value="5">5 preguntas</option>
            <option value="10">10 preguntas</option>
          </select>

          {errorConfig && (
            <p
              className="mensaje-formulario error"
              role="status"
              aria-live="polite"
            >
              {errorConfig}
            </p>
          )}

          <button
            type="submit"
            id="btn-jugar"
            className="boton-principal"
            disabled={estadoCarga !== "completa" || iniciando}
          >
            {iniciando ? "Cargando partida..." : "Comenzar partida"}
            <span aria-hidden="true">→</span>
          </button>
        </form>
      </div>

      <h3 className="titulo-grupo">Tu recorrido</h3>

      <div className="estadisticas">
        <StatCard
          etiqueta="PARTIDAS COMPLETADAS"
          valor={stats.totalPartidas}
          descripcion="Rondas finalizadas"
        />
        <StatCard
          etiqueta="PREGUNTAS RESPONDIDAS"
          valor={stats.totalPreguntas}
          descripcion="En partidas completadas"
        />
        <StatCard
          etiqueta="PORCENTAJE DE ACIERTOS"
          valor={`${stats.porcentajeAciertos} %`}
          descripcion="Rendimiento global"
        />
        <StatCard
          etiqueta="PUNTAJE MÁS ALTO"
          valor={stats.puntajeMasAlto}
          descripcion="Mejor resultado"
        />
        <StatCard
          etiqueta="MEJOR RACHA"
          valor={stats.mejorRachaGlobal}
          descripcion="Aciertos consecutivos"
        />
        <StatCard
          etiqueta="PUNTAJE TOTAL"
          valor={stats.puntajeTotal}
          descripcion="Puntos acumulados"
        />
      </div>

      <h3 className="titulo-grupo">Consultá tus resultados</h3>

      <div className="acciones-secundarias">
        <button
          type="button"
          className="boton-secundario"
          onClick={() => navigate("/ranking")}
        >
          <span>01</span>
          <span>
            Ranking <small>Compará los puntajes</small>
          </span>
          <span aria-hidden="true">↗</span>
        </button>

        <button
          type="button"
          className="boton-secundario"
          onClick={() => navigate("/historial")}
        >
          <span>02</span>
          <span>
            Historial <small>Revisá tus partidas</small>
          </span>
          <span aria-hidden="true">↗</span>
        </button>

        {user?.role === "ADMIN" && (
          <button
            type="button"
            className="boton-secundario"
            onClick={() => navigate("/admin/preguntas")}
          >
            <span>03</span>
            <span>
              Banco de preguntas <small>Alta, edición y baja (Admin)</small>
            </span>
            <span aria-hidden="true">↗</span>
          </button>
        )}
      </div>

      <button
        type="button"
        id="btn-cerrar-sesion"
        className="boton-enlace boton-salir"
        onClick={handleCerrarSesion}
      >
        Cerrar sesión
      </button>
    </section>
  );
}