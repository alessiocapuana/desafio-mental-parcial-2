# Cambios de esta versión corregida

Copia del repo `desafio-mental-parcial-2` con correcciones, para probar en local antes de pasarlas al repositorio.
No se subió nada a GitHub.

## Correcciones importantes

### 1. El puntaje ya no se puede falsificar
**Antes:** el backend mandaba la respuesta correcta de cada pregunta al navegador, el frontend calculaba el puntaje y el servidor guardaba lo que recibía. Con un `POST /api/games` armado a mano se podía guardar cualquier puntaje y quedar primero en el ranking.

**Ahora:**
- `GET /api/questions` y `GET /api/questions/:id` ya no incluyen `respuestaCorrecta` para los usuarios comunes (el `ADMIN` sí la recibe, la necesita para el panel).
- Nuevo endpoint `POST /api/questions/:id/check` que valida cada respuesta en el servidor y devuelve si fue correcta, cuál era la correcta y los puntos.
- `POST /api/games` recibe solo `categoria`, `cantidadPreguntas`, `fechaInicio`, `fechaFinalizacion`, `estado` y `respuestas: [{ preguntaId, respuestaSeleccionada, abandonada? }]`.
  El servidor (`GameModel.buildGame`) recalcula aciertos, incorrectas, puntaje, mejor racha, duración y los textos del detalle, comparando contra el banco de preguntas.
- Validaciones nuevas (responden 400): cantidad de preguntas 5 o 10, preguntas existentes y de la categoría elegida, sin preguntas repetidas, una partida completada tiene que tener todas sus respuestas, fechas coherentes.

Archivos: `Backend/src/dtos/game.dto.js`, `Backend/src/dtos/question.dto.js`, `Backend/src/models/game.model.js`, `Backend/src/models/question.model.js`, `Backend/src/controllers/game.controller.js`, `Backend/src/controllers/question.controller.js`, `Backend/src/routes/question.routes.js`, `Frontend/.../services/api.js`, `Frontend/.../pages/GamePage.jsx`.

### 2. No se expone más el hash de la contraseña
`POST /api/auth/register` y `GET /api/auth/profile` devolvían el usuario completo con la contraseña encriptada. Ahora usan `UserModel.toPublic()`, que quita el campo `password`.
El handler de `/profile` pasó de `auth.routes.js` a `AuthController.profile`.

### 3. El temporizador ya no saltea preguntas
`GamePage.jsx` llamaba a `responderPregunta(null)` dentro de `setTiempoRestante(prev => ...)`. En modo desarrollo, `StrictMode` ejecuta esa función dos veces: la respuesta se registraba duplicada y la partida avanzaba 2 preguntas.
Ahora el intervalo solo descuenta segundos y un `useEffect` aparte responde cuando el tiempo llega a 0. Además, una referencia (`respondiendoRef`) impide responder dos veces la misma pregunta.

## Otras mejoras
- **Sesión vencida:** si el servidor responde 401 con una sesión activa, se borra el token y se redirige al login (`api.js` + `AuthContext.jsx`).
- **Error al guardar una partida:** antes solo quedaba en la consola. Ahora se muestra el error con botones para reintentar o volver al menú. Si falla el registro de una partida abandonada, se avisa con un mensaje.
- **Mensajes de error en español** en `authenticate.js` y `authorize.js`.
- **Se agregó `Backend/.env.example`**, que el README mencionaba pero no existía.
- **Se borró el comentario suelto** `// ... dejá getMyHistory...` de `game.controller.js`.
- **Limpieza de la plantilla de Vite:** título "Desafío Mental", `lang="es"`, paquete renombrado a `desafio-mental-frontend` y se borraron `App.css`, `hero.png`, `react.svg` y `vite.svg` (no se usaban).
- **README:** tabla de endpoints actualizada.

## Lo que NO se cambió
- La carpeta `Frontend/project_template` conserva su nombre para no romper las instrucciones del README.
- El ranking sigue mostrando las 10 mejores partidas (no los 10 mejores jugadores), igual que antes.
- Las partidas ya guardadas en `games.json` quedan como estaban.

## Cómo probarlo
1. `cd Backend`, `npm install`, copiar `.env.example` como `.env`, `npm run dev`.
2. En otra terminal: `cd Frontend/project_template`, `npm install`, `npm run dev`.
3. Cosas para probar:
   - Jugar una partida dejando que se acabe el tiempo en alguna pregunta: tiene que avanzar de a una.
   - Abandonar una partida y verla en el historial.
   - Entrar como `admin@admin.com` / `admin1234` y crear/editar/borrar una pregunta.
   - Ver en las herramientas del navegador (pestaña Red) que `/api/questions` no trae `respuestaCorrecta` con un usuario común, y que `/api/auth/profile` no trae `password`.
