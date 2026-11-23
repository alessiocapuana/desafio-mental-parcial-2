import { useEffect } from "react";

export function GameDetailModal({ partida, onClose }) {
  useEffect(() => {
    if (!partida) return;

    document.body.classList.add("modal-abierto");

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("modal-abierto");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [partida, onClose]);

  if (!partida) return null;

  const estadoTexto =
    partida.estado === "completada" ? "Completada" : "Abandonada";

  return (
    <div
      id="modal-detalle-partida"
      className="modal-detalle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="modal-detalle__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-detalle-titulo"
      >
        <header className="modal-detalle__encabezado">
          <div>
            <p className="modal-detalle__etiqueta">HISTORIAL DE PARTIDAS</p>
            <h2 id="modal-detalle-titulo">Detalle de la partida</h2>
            <p id="modal-detalle-subtitulo">
              {partida.categoria} · {estadoTexto}
            </p>
          </div>

          <button
            type="button"
            id="btn-cerrar-detalle"
            className="modal-detalle__cerrar"
            aria-label="Cerrar detalle de la partida"
            onClick={onClose}
          >
            &times;
          </button>
        </header>

        <div className="modal-detalle__contenido" id="contenido-detalle-partida">
          {!Array.isArray(partida.respuestas) ||
          partida.respuestas.length === 0 ? (
            <p className="modal-detalle__vacio">
              Esta partida no tiene respuestas individuales guardadas.
            </p>
          ) : (
            partida.respuestas.map((respuesta, indice) => {
              let textoEstado = "Sin responder";
              let claseEstado = "es-sin-responder";

              if (respuesta.resultado === "correcta") {
                textoEstado = "Correcta";
                claseEstado = "es-correcta";
              } else if (respuesta.resultado === "incorrecta") {
                textoEstado = "Incorrecta";
                claseEstado = "es-incorrecta";
              } else if (respuesta.resultado === "sin_responder") {
                textoEstado = "Tiempo agotado";
                claseEstado = "es-incorrecta";
              }

              return (
                <article key={indice} className="respuesta-modal">
                  <div className="respuesta-modal__encabezado">
                    <span className="respuesta-modal__numero">
                      Pregunta {indice + 1}
                    </span>
                    <span className={`respuesta-modal__estado ${claseEstado}`}>
                      {textoEstado}
                    </span>
                  </div>

                  <h3 className="respuesta-modal__pregunta">
                    {respuesta.enunciado}
                  </h3>

                  <p className="respuesta-modal__seleccionada">
                    Tu respuesta:{" "}
                    {respuesta.respuestaSeleccionadaTexto ||
                      "Sin respuesta registrada"}
                  </p>

                  {respuesta.resultado !== "correcta" ? (
                    <p className="respuesta-modal__correcta">
                      Respuesta correcta:{" "}
                      {respuesta.respuestaCorrectaTexto || "No disponible"}
                    </p>
                  ) : (
                    <p className="respuesta-modal__puntos">
                      +{respuesta.puntajeObtenido} puntos
                    </p>
                  )}
                </article>
              );
            })
          )}
        </div>

        <footer className="modal-detalle__pie">
          <button
            type="button"
            id="btn-cerrar-detalle-pie"
            className="btn-modal-detalle"
            onClick={onClose}
          >
            Cerrar detalle
          </button>
        </footer>
      </section>
    </div>
  );
}