import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { WelcomePanel } from "../components/WelcomePanel";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    const nombreLimpio = name.trim();
    const emailLimpio = email.trim().toLowerCase();

    if (!nombreLimpio || !emailLimpio || !password || !confirmPassword) {
      setMensaje({
        texto: "Completá todos los campos para continuar.",
        tipo: "error",
      });
      return;
    }

    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoEmail.test(emailLimpio)) {
      setMensaje({
        texto: "Ingresá un correo electrónico válido.",
        tipo: "error",
      });
      return;
    }

    if (nombreLimpio.length < 3 || nombreLimpio.length > 30) {
      setMensaje({
        texto: "El nombre de usuario debe tener entre 3 y 30 caracteres.",
        tipo: "error",
      });
      return;
    }

    if (password.length < 8) {
      setMensaje({
        texto: "La contraseña debe tener al menos 8 caracteres.",
        tipo: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      setMensaje({
        texto: "Las contraseñas no coinciden.",
        tipo: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      await register(nombreLimpio, emailLimpio, password);
      setMensaje({
        texto: "¡Cuenta creada correctamente! Ya podés iniciar sesión.",
        tipo: "exito",
      });
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMensaje({
        texto: err.message || "No se pudo crear la cuenta.",
        tipo: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="pantalla pantalla-acceso">
      <div className="panel-formulario">
        <div className="etiqueta-seccion">
          <span className="indicador"></span>
          NUEVO JUGADOR
        </div>

        <h1>Registro</h1>
        <p className="texto-introduccion">
          Creá tu cuenta para guardar tus resultados y seguir tu progreso.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="nombre-registro">Nombre de usuario</label>
          <input
            type="text"
            id="nombre-registro"
            placeholder="Ingresá tu nombre"
            autoComplete="username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="email-registro">Correo electrónico</label>
          <input
            type="email"
            id="email-registro"
            placeholder="nombre@correo.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password-registro">Contraseña</label>
          <input
            type="password"
            id="password-registro"
            placeholder="Creá una contraseña"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label htmlFor="confirmar-password-registro">
            Confirmar contraseña
          </label>
          <input
            type="password"
            id="confirmar-password-registro"
            placeholder="Volvé a ingresar la contraseña"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {mensaje.texto && (
            <p
              className={`mensaje-formulario ${mensaje.tipo}`}
              aria-live="polite"
            >
              {mensaje.texto}
            </p>
          )}

          <button
            type="submit"
            className="boton-principal"
            disabled={submitting}
          >
            {submitting ? "Creando cuenta..." : "Crear cuenta"}
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <p className="texto-alternativo">
          ¿Ya tenés una cuenta?
          <Link to="/login" className="boton-enlace">
            Iniciar sesión
          </Link>
        </p>
      </div>

      <WelcomePanel
        edicion="02 / EMPEZÁ TU RECORRIDO"
        sobrelinea="TODO EMPIEZA CON UNA PREGUNTA"
        tituloPrincipal="Tu lugar en el ranking"
        tituloDestacado="se construye jugando."
        descripcion="Registrá tu cuenta, acumulá puntaje y consultá tu historial. Cada partida suma una nueva marca en tu recorrido."
        datoNumero="01"
        datoTitulo="Un punto de partida."
        datoSubtitulo="Muchas formas de superarte."
      />
    </section>
  );
}