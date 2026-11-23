import { Link } from "react-router-dom";

export function Layout({ children }) {
  return (
    <>
      <header className="encabezado">
        <Link to="/" className="marca" aria-label="Desafío Mental, inicio">
          <span className="marca-simbolo">D.</span>
          <span>DESAFÍO MENTAL</span>
        </Link>
        <p className="encabezado-etiqueta">TRIVIA · CONOCIMIENTO · ESTRATEGIA</p>
      </header>

      <main className="contenedor-principal">{children}</main>

      <footer className="pie-pagina">
        <span>DESAFÍO MENTAL</span>
        <span>EL CONOCIMIENTO SE PONE A PRUEBA.</span>
      </footer>
    </>
  );
}