import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const CATEGORIAS = [
  "Historia y cultura",
  "Ciencia y naturaleza",
  "Geografía",
  "Informática y programación",
];

const FORM_INICIAL = {
  categoria: "Historia y cultura",
  enunciado: "",
  opcion0: "",
  opcion1: "",
  opcion2: "",
  opcion3: "",
  respuestaCorrecta: 0,
  puntaje: 10,
};

export function AdminQuestionsPage() {
  const navigate = useNavigate();

  const [preguntas, setPreguntas] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const cargarPreguntas = useCallback(async () => {
    setCargando(true);
    try {
      const params =
        filtroCategoria !== "Todas" ? { category: filtroCategoria } : {};
      const data = await api.getQuestions(params);
      setPreguntas(data);
    } catch (err) {
      setMensaje({
        texto: err.message || "Error al cargar el banco de preguntas.",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  }, [filtroCategoria]);

  useEffect(() => {
    cargarPreguntas();
  }, [cargarPreguntas]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function iniciarEdicion(pregunta) {
    setMensaje({ texto: "", tipo: "" });
    setEditandoId(pregunta.id);
    setForm({
      categoria: pregunta.categoria,
      enunciado: pregunta.enunciado,
      opcion0: pregunta.opciones[0] || "",
      opcion1: pregunta.opciones[1] || "",
      opcion2: pregunta.opciones[2] || "",
      opcion3: pregunta.opciones[3] || "",
      respuestaCorrecta: pregunta.respuestaCorrecta,
      puntaje: pregunta.puntaje || 10,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setMensaje({ texto: "", tipo: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    const payload = {
      categoria: form.categoria.trim(),
      enunciado: form.enunciado.trim(),
      opciones: [
        form.opcion0.trim(),
        form.opcion1.trim(),
        form.opcion2.trim(),
        form.opcion3.trim(),
      ],
      respuestaCorrecta: Number(form.respuestaCorrecta),
      puntaje: Number(form.puntaje),
    };

    if (
      !payload.categoria ||
      payload.enunciado.length < 5 ||
      payload.opciones.some((op) => op === "")
    ) {
      setMensaje({
        texto:
          "Completá la categoría, el enunciado (mínimo 5 caracteres) y las 4 opciones.",
        tipo: "error",
      });
      return;
    }

    setGuardando(true);
    try {
      if (editandoId !== null) {
        await api.updateQuestion(editandoId, payload);
        setMensaje({
          texto: "Pregunta actualizada correctamente.",
          tipo: "exito",
        });
      } else {
        await api.createQuestion(payload);
        setMensaje({
          texto: "Pregunta agregada al banco correctamente.",
          tipo: "exito",
        });
      }

      setEditandoId(null);
      setForm(FORM_INICIAL);
      await cargarPreguntas();
    } catch (err) {
      setMensaje({
        texto: err.message || "No se pudo guardar la pregunta.",
        tipo: "error",
      });
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(id) {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar esta pregunta del banco?"
    );
    if (!confirmar) return;

    try {
      await api.deleteQuestion(id);
      if (editandoId === id) {
        cancelarEdicion();
      }
      setMensaje({
        texto: "Pregunta eliminada correctamente.",
        tipo: "exito",
      });
      await cargarPreguntas();
    } catch (err) {
      setMensaje({
        texto: err.message || "No se pudo eliminar la pregunta.",
        tipo: "error",
      });
    }
  }

  const preguntasVisibles = preguntas.filter((p) =>
    p.enunciado.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  return (
    <section className="pantalla pantalla-contenido">
      <div className="encabezado-pantalla">
        <div>
          <p className="sobrelinea">ADMINISTRACIÓN / BANCO DE PREGUNTAS</p>
          <h1>Gestión de preguntas</h1>
          <p>
            Panel exclusivo para administradores: dá de alta nuevas preguntas,
            editá las existentes o eliminá las que no correspondan.
          </p>
        </div>
        <span className="sello sello-grande">AD</span>
      </div>

      <div className="configuracion-partida">
        <h2>{editandoId !== null ? "Modificar pregunta" : "Nueva pregunta"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="admin-campo">
              <label htmlFor="admin-categoria">Categoría</label>
              <select
                id="admin-categoria"
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-grid" style={{ gap: "12px" }}>
              <div className="admin-campo">
                <label htmlFor="admin-correcta">Respuesta correcta</label>
                <select
                  id="admin-correcta"
                  name="respuestaCorrecta"
                  value={form.respuestaCorrecta}
                  onChange={handleChange}
                >
                  <option value={0}>Opción 1</option>
                  <option value={1}>Opción 2</option>
                  <option value={2}>Opción 3</option>
                  <option value={3}>Opción 4</option>
                </select>
              </div>

              <div className="admin-campo">
                <label htmlFor="admin-puntaje">Puntaje</label>
                <input
                  type="number"
                  id="admin-puntaje"
                  name="puntaje"
                  min="1"
                  max="100"
                  value={form.puntaje}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="admin-campo admin-form-full">
              <label htmlFor="admin-enunciado">Enunciado de la pregunta</label>
              <input
                type="text"
                id="admin-enunciado"
                name="enunciado"
                placeholder="Escribí la pregunta..."
                value={form.enunciado}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-campo">
              <label htmlFor="admin-opcion-0">Opción 1</label>
              <input
                type="text"
                id="admin-opcion-0"
                name="opcion0"
                placeholder="Primera opción"
                value={form.opcion0}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-campo">
              <label htmlFor="admin-opcion-1">Opción 2</label>
              <input
                type="text"
                id="admin-opcion-1"
                name="opcion1"
                placeholder="Segunda opción"
                value={form.opcion1}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-campo">
              <label htmlFor="admin-opcion-2">Opción 3</label>
              <input
                type="text"
                id="admin-opcion-2"
                name="opcion2"
                placeholder="Tercera opción"
                value={form.opcion2}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-campo">
              <label htmlFor="admin-opcion-3">Opción 4</label>
              <input
                type="text"
                id="admin-opcion-3"
                name="opcion3"
                placeholder="Cuarta opción"
                value={form.opcion3}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {mensaje.texto && (
            <p
              className={`mensaje-formulario ${mensaje.tipo}`}
              role="status"
              aria-live="polite"
            >
              {mensaje.texto}
            </p>
          )}

          <div className="grupo-botones">
            <button
              type="submit"
              className="boton-principal"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : editandoId !== null
                ? "Guardar cambios"
                : "Agregar pregunta"}
              <span aria-hidden="true">→</span>
            </button>

            {editandoId !== null && (
              <button
                type="button"
                className="boton-secundario"
                onClick={cancelarEdicion}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="panel-listado">
        <h2>Banco de preguntas ({preguntasVisibles.length})</h2>

        <div className="admin-filtros-barra">
          <div className="admin-campo">
            <label htmlFor="admin-busqueda">Buscar por enunciado</label>
            <input
              type="text"
              id="admin-busqueda"
              placeholder="Ej: Cristóbal Colón, capital, SQL..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="admin-campo">
            <label htmlFor="admin-filtro-cat">Filtrar por categoría</label>
            <select
              id="admin-filtro-cat"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="Todas">Todas las categorías</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {cargando ? (
          <p>Cargando preguntas...</p>
        ) : preguntasVisibles.length === 0 ? (
          <p>No hay preguntas que coincidan con el filtro.</p>
        ) : (
          <div className="admin-grid-preguntas">
            {preguntasVisibles.map((p) => (
              <article key={p.id} className="tarjeta-admin-pregunta">
                <div>
                  <div className="tarjeta-admin-top">
                    <span className="admin-badge-categoria">
                      {p.categoria} · {p.puntaje || 10} PTS
                    </span>

                    <div className="admin-acciones-card">
                      <button
                        type="button"
                        className="btn-admin-editar"
                        onClick={() => iniciarEdicion(p)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-admin-eliminar"
                        onClick={() => handleEliminar(p.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <h3 style={{ marginTop: "12px" }}>{p.enunciado}</h3>
                </div>

                <div className="admin-opciones-grid">
                  {p.opciones.map((op, i) => (
                    <div
                      key={i}
                      className={`admin-opcion-item ${
                        i === p.respuestaCorrecta ? "es-correcta" : ""
                      }`}
                    >
                      {op} {i === p.respuestaCorrecta ? "✓" : ""}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className="boton-secundario"
        onClick={() => navigate("/")}
      >
        <span aria-hidden="true">←</span>
        <span>Volver al menú</span>
      </button>
    </section>
  );
}