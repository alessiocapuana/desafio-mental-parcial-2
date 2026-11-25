import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="pantalla pantalla-contenido">
        <p>Verificando sesión...</p>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="pantalla-error-403" role="alert">
        <div className="error-403-contenedor">
          <div className="error-403-ilustracion" aria-hidden="true">
            <svg viewBox="0 0 260 230" fill="none">
              <defs>
                <clipPath id="clip-barrera-403">
                  <rect x="34" y="142" width="192" height="24" rx="6" />
                </clipPath>
              </defs>

              {/* Halo y anillo punteado de fondo */}
              <circle cx="130" cy="116" r="88" fill="currentColor" opacity="0.04" />
              <circle
                cx="130"
                cy="116"
                r="98"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                opacity="0.18"
              />

              {/* Escudo geométrico */}
              <path
                d="M130 24L198 50V114C198 158 168 190 130 206C92 190 62 158 62 114V50L130 24Z"
                fill="currentColor"
              />
              {/* Mitad derecha con brillo sutil para dar volumen editorial */}
              <path
                d="M130 24L198 50V114C198 158 168 190 130 206V24Z"
                fill="#FFFFFF"
                opacity="0.06"
              />

              {/* Candado central */}
              <path
                d="M115 92V78C115 69.7 121.7 63 130 63C138.3 63 145 69.7 145 78V92"
                stroke="#F5F3EE"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <rect x="107" y="92" width="46" height="35" rx="7" fill="#F5F3EE" />
              <circle cx="130" cy="106" r="4.2" fill="currentColor" />
              <path
                d="M130 109V118"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Soportes de la barrera */}
              <rect x="50" y="164" width="10" height="36" rx="2" fill="currentColor" />
              <rect x="200" y="164" width="10" height="36" rx="2" fill="currentColor" />
              <line
                x1="28"
                y1="201"
                x2="232"
                y2="201"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.22"
              />

              {/* Barrera de acceso restringido con franjas diagonales */}
              <g clipPath="url(#clip-barrera-403)">
                <rect x="34" y="142" width="192" height="24" fill="#F5F3EE" />
                <path
                  d="M22 172L46 136H64L40 172H22ZM58 172L82 136H100L76 172H58ZM94 172L118 136H136L112 172H94ZM130 172L154 136H172L148 172H130ZM166 172L190 136H208L184 172H166ZM202 172L226 136H244L220 172H202Z"
                  fill="#D45B49"
                />
              </g>
              <rect
                x="34"
                y="142"
                width="192"
                height="24"
                rx="6"
                stroke="currentColor"
                strokeWidth="3"
              />
            </svg>
          </div>

          <div className="error-403-contenido">
            <span className="error-403-badge">ERROR 403</span>
            <h1 className="error-403-titulo">Acceso denegado.</h1>
            <p className="error-403-descripcion">
              Esta sección está reservada exclusivamente para cuentas con rol de
              administrador.
            </p>
            <button
              type="button"
              className="error-403-boton"
              onClick={() => navigate("/", { replace: true })}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}