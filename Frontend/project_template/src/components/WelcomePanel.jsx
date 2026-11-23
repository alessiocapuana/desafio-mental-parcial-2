export function WelcomePanel({
  edicion,
  sobrelinea,
  tituloPrincipal,
  tituloDestacado,
  descripcion,
  datoNumero,
  datoTitulo,
  datoSubtitulo,
}) {
  return (
    <aside className="panel-bienvenida">
      <div className="bienvenida-superior">
        <span className="numero-edicion">{edicion}</span>
        <span className="sello">DM</span>
      </div>

      <div className="bienvenida-contenido">
        <p className="sobrelinea">{sobrelinea}</p>
        <h2>
          {tituloPrincipal} <span>{tituloDestacado}</span>
        </h2>
        <p>{descripcion}</p>
      </div>

      <div className="dato-destacado">
        <span className="dato-numero">{datoNumero}</span>
        <div>
          <strong>{datoTitulo}</strong>
          <p>{datoSubtitulo}</p>
        </div>
      </div>

      <div className="bienvenida-pie">
        <span>LEÉ · PENSÁ · RESPONDÉ</span>
        <span>DESAFÍO MENTAL ©</span>
      </div>
    </aside>
  );
}