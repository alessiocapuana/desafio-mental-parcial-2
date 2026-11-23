import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { WelcomePanel } from "../components/WelcomePanel";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Completá el correo electrónico y la contraseña.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/");
    } catch (err) {
      setError(err.message || "El correo o la contraseña son incorrectos.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="pantalla pantalla-acceso">
      <div className="panel-formulario">
        <div className="etiqueta-seccion">
          <span className="indicador"></span>
          ACCESO DE JUGADOR
        </div>

        <h1>Iniciar sesión</h1>
        <p className="texto-introduccion">
          Cada respuesta cuenta. Ingresá para continuar donde dejaste tu última
          partida.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email-login">Correo electrónico</label>
          <input
            type="email"
            id="email-login"
            placeholder="nombre@correo.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password-login">Contraseña</label>
          <input
            type="password"
            id="password-login"
            placeholder="Ingresá tu contraseña"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="boton-principal"
            disabled={submitting}
          >
            {submitting ? "Ingresando..." : "Iniciar sesión"}
            <span aria-hidden="true">→</span>
          </button>

          {error && (
            <p
              className="mensaje-formulario error"
              role="status"
              aria-live="polite"
            >
              {error}
            </p>
          )}
        </form>

        <p className="texto-alternativo">
          ¿Todavía no tenés una cuenta?
          <Link to="/registro" className="boton-enlace">
            Registrate
          </Link>
        </p>
      </div>

      <WelcomePanel
        edicion="01 / TU PRÓXIMA PARTIDA"
        sobrelinea="EL CONOCIMIENTO ESTÁ EN JUEGO"
        tituloPrincipal="Una pregunta puede cambiar"
        tituloDestacado="tu resultado."
        descripcion="Poné a prueba lo que sabés, elegí con criterio y sumá puntos en cada ronda. Tu próxima respuesta empieza acá."
        datoNumero="?"
        datoTitulo="La pregunta es tuya."
        datoSubtitulo="La respuesta, también."
      />
    </section>
  );
}