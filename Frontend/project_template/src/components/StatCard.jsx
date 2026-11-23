export function StatCard({ etiqueta, valor, descripcion }) {
  return (
    <article className="tarjeta-estadistica">
      <span className="etiqueta-tarjeta">{etiqueta}</span>
      <strong>{valor}</strong>
      {descripcion && <p>{descripcion}</p>}
    </article>
  );
}