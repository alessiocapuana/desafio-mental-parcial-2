# 🧠 Desafío Mental — Aplicación Full-Stack (React + Node.js/Express)

> **Proyecto correspondiente al Segundo Parcial — Plataformas de Desarrollo.**  
> Migración completa de la aplicación web de trivia **Desafío Mental** hacia una arquitectura **Cliente-Servidor**, incorporando una **API REST** con persistencia en servidor, autenticación mediante **JWT**, control de acceso por **roles** (`USER` / `ADMIN`) y una interfaz **SPA** desarrollada en **React**.

---

## 📋 Tabla de contenidos

1. [Arquitectura y tecnologías utilizadas](#-arquitectura-y-tecnologías-utilizadas)
2. [Estructura del proyecto](#-estructura-del-proyecto)
3. [Requisitos previos](#-requisitos-previos)
4. [Instalación y configuración (paso a paso)](#-instalación-y-configuración-paso-a-paso)
5. [Ejecución de ambos proyectos](#-ejecución-de-ambos-proyectos)
6. [Credenciales de prueba y roles](#-credenciales-de-prueba-y-roles)
7. [Funcionalidades principales](#-funcionalidades-principales)
8. [Endpoints de la API REST](#-endpoints-de-la-api-rest)

---

## 🛠️ Arquitectura y tecnologías utilizadas

El sistema está dividido en **dos aplicaciones independientes** que se comunican mediante peticiones HTTP en formato JSON:

### **Frontend (SPA)**
- **React** + **Vite**: Construcción de la interfaz de usuario mediante componentes reutilizables.
- **React Router DOM**: Navegación fluida sin recarga de página y protección de rutas privadas según autenticación y rol, incluyendo una **pantalla dedicada de Error 403 (Acceso denegado)** para accesos no autorizados.
- **Context API (`AuthContext`)**: Gestión global de la sesión del usuario, recuperación automática al recargar el navegador y cierre de sesión.
- **Fetch API**: Cliente HTTP centralizado con envío automático de cabecera `Authorization: Bearer <token>`.
- **CSS3**: Conserva la identidad visual, paleta de colores y diseño *responsive* del proyecto original.

### **Backend (API REST)**
- **Node.js** + **Express**: Servidor web y enrutamiento RESTful por capas (`routes`, `controllers`, `models`, `dtos`, `middlewares`).
- **JSON Web Tokens (`jsonwebtoken`)**: Autenticación basada en tokens con expiración.
- **Bcrypt (`bcrypt`)**: Encriptación segura de contraseñas antes de su almacenamiento.
- **Joi (`joi`)**: Validación estricta de esquemas de entrada en peticiones `POST` y `PUT`.
- **Persistencia en archivos JSON**: Almacenamiento permanente de usuarios, preguntas y partidas en el servidor.

---

## 📁 Estructura del proyecto

```text
Segundo Parcial Usach - Capuana/
├── README.md                         # Documentación e instrucciones de ejecución
├── Backend/                          # Servidor API REST (Node.js + Express)
│   ├── src/
│   │   ├── controllers/              # Controladores de lógica HTTP (auth, user, question, game)
│   │   ├── data/                     # Base de datos persistente en JSON
│   │   │   ├── games.json            # Registro histórico de partidas jugadas y abandonadas
│   │   │   ├── questions.json        # Banco de preguntas en 4 categorías
│   │   │   └── users.json            # Usuarios registrados con contraseñas hasheadas
│   │   ├── dtos/                     # Esquemas de validación Joi (user, login, question, game)
│   │   ├── middlewares/              # Middlewares de autenticación, roles y validación
│   │   ├── models/                   # Acceso a datos y reglas de negocio
│   │   ├── routes/                   # Definición de rutas de la API (/api/...)
│   │   ├── utils/                    # Lectura y escritura segura de archivos JSON
│   │   └── app.js                    # Configuración de Express, CORS y manejo global de errores
│   ├── .env.example                  # Plantilla de variables de entorno
│   └── package.json
│
└── Frontend/
    └── project_template/             # Aplicación Web (React + Vite)
        ├── src/
        │   ├── components/           # Componentes reutilizables (Layout, StatCard, GameDetailModal, ProtectedRoute con vista 403)
        │   ├── context/              # Estado global de sesión (AuthContext.jsx)
        │   ├── pages/                # Pantallas (Login, Registro, Menú, Partida, Resultados, Historial, Ranking, Admin)
        │   ├── services/             # Servicio centralizado de peticiones HTTP (api.js)
        │   ├── App.jsx               # Definición de rutas públicas, privadas y de administrador
        │   ├── index.css             # Estilos globales y diseño responsive
        │   └── main.jsx              # Punto de entrada de React
        └── package.json
```

---

## 💻 Requisitos previos

Antes de comenzar, asegurarse de tener instalado en el equipo:

- **Node.js** (versión **18.0** o superior recomendada).
- **npm** (gestor de paquetes incluido con Node.js).

---

## ⚙️ Instalación y configuración (paso a paso)

### **1. Configurar el Backend**

1. Abrir una terminal y ubicarse dentro de la carpeta `Backend`:
   ```bash
   cd Backend
   ```
2. Instalar todas las dependencias necesarias:
   ```bash
   npm install
   ```
3. Crear un archivo llamado **`.env`** dentro de `Backend/` copiando `Backend/.env.example` (que incluye valores de ejemplo listos para entorno local):
   ```env
   PORT=3000
   JWT_SECRET=cambiar_por_una_clave_secreta
   ```

---

### **2. Configurar el Frontend**

1. Abrir una **segunda terminal** y ubicarse dentro de la carpeta del proyecto React:
   ```bash
   cd Frontend/project_template
   ```
2. Instalar todas las dependencias necesarias:
   ```bash
   npm install
   ```

---

## 🚀 Ejecución de ambos proyectos

Para utilizar la aplicación completa, **ambos servidores deben estar corriendo en simultáneo** en dos terminales separadas:

### **Terminal 1 — Levantar el servidor Backend**
Dentro de `Backend/`:
```bash
npm run dev
```
- El servidor iniciará en **`http://localhost:3000`**.
- Al arrancar por primera vez, el sistema verifica y crea automáticamente la cuenta de **Administrador** por defecto si aún no existe.

### **Terminal 2 — Levantar la aplicación Frontend**
Dentro de `Frontend/project_template/`:
```bash
npm run dev
```
- Vite iniciará la aplicación web y mostrará la URL local en consola (habitualmente **`http://localhost:5173`**).
- Abrir esa dirección en el navegador para comenzar a usar **Desafío Mental**.

---

## 🔐 Credenciales de prueba y roles

El sistema contempla **dos tipos de usuarios** con permisos diferenciados tanto en la interfaz como en los endpoints del servidor:

### **1. Usuario Administrador (`ADMIN`)**
Cuenta creada automáticamente por el servidor para gestionar el banco de preguntas además de poder jugar:
- **Correo electrónico:** `admin@admin.com`
- **Contraseña:** `admin1234`

### **2. Usuario Jugador (`USER`)**
- Se crea desde la pantalla pública **Registro** dentro de la aplicación web.
- Por seguridad, todo registro público asigna automáticamente el rol **`USER`**.
- **Protección de acceso (403):** Si un usuario con rol `USER` intenta ingresar manualmente por URL a `/admin/preguntas`, `ProtectedRoute` bloquea la vista y muestra una **pantalla dedicada de Error 403 — Acceso denegado** con opción para volver al inicio. En paralelo, el backend valida el rol mediante middleware y rechaza con estado HTTP **`403 Forbidden`** cualquier petición no autorizada sobre el banco de preguntas.

---

## 🎮 Funcionalidades principales

- **Autenticación, persistencia de sesión y control de acceso:** Registro con validaciones, inicio de sesión con JWT, recuperación automática de sesión al recargar el navegador (`F5`), cierre de sesión, protección de rutas privadas y **pantalla de Error 403** ante intentos de acceso directo a secciones restringidas por rol.
- **Configuración y desarrollo de partidas:**
  - Selección entre **4 categorías** (*Historia y cultura*, *Ciencia y naturaleza*, *Geografía* e *Informática y programación*) y cantidad de preguntas (**5** o **10**).
  - **Temporizador de 15 segundos** por pregunta con validación inmediata en el servidor, bloqueo de opciones tras responder y avance automático.
  - Seguimiento en tiempo real de **puntaje acumulado**, **racha actual** y **mejor racha**.
  - Posibilidad de **abandonar la partida** con confirmación previa, registrando el estado correspondiente.
- **Resultados y estadísticas:** Resumen detallado al finalizar cada ronda y métricas globales del jugador en el menú principal calculadas a partir de sus partidas completadas.
- **Historial con filtros y detalle por pregunta:** Resumen de partidas completadas/abandonadas, filtros combinables por categoría y estado, barra dinámica de porcentaje de aciertos y **modal de detalle** para revisar respuesta por respuesta.
- **Ranking Top 10:** Clasificación general de las 10 mejores partidas completadas, ordenadas por **mayor puntaje**, luego **menor duración** y finalmente **fecha de finalización más antigua**.
- **Panel de Administración (`ADMIN`):** Vista exclusiva para dar de alta nuevas preguntas, editar enunciados/opciones/puntajes y eliminar preguntas del banco con buscador y filtro por categoría.

---

## 🌐 Endpoints de la API REST

Todas las rutas protegidas requieren enviar el token JWT en el header: `Authorization: Bearer <token>`.

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público | Registra un nuevo usuario con rol `USER`. |
| `POST` | `/api/auth/login` | Público | Autentica credenciales y devuelve el token JWT. |
| `GET` | `/api/auth/profile` | Autenticado | Devuelve los datos del usuario de la sesión activa. |
| `GET` | `/api/questions` | Autenticado | Obtiene preguntas (soporta `?category=` y `?limit=`). Solo el `ADMIN` recibe la respuesta correcta. |
| `GET` | `/api/questions/:id` | Autenticado | Obtiene el detalle de una pregunta por su ID. Solo el `ADMIN` recibe la respuesta correcta. |
| `POST` | `/api/questions/:id/check` | Autenticado | Valida en el servidor la respuesta elegida (`{ respuestaSeleccionada }`, `null` = tiempo agotado). |
| `POST` | `/api/questions` | Solo `ADMIN` | Crea una nueva pregunta en el banco. |
| `PUT` | `/api/questions/:id` | Solo `ADMIN` | Modifica una pregunta existente. |
| `DELETE` | `/api/questions/:id` | Solo `ADMIN` | Elimina una pregunta del banco. |
| `POST` | `/api/games` | Autenticado | Registra una partida (`completada` o `abandonada`). El cliente envía solo las opciones elegidas; el servidor calcula aciertos, puntaje y rachas. |
| `GET` | `/api/games/history` | Autenticado | Lista el historial del usuario (`?categoria=`, `?estado=`). |
| `GET` | `/api/games/stats` | Autenticado | Calcula las estadísticas globales del jugador. |
| `GET` | `/api/games/ranking` | Autenticado | Devuelve el Top 10 del ranking general. |