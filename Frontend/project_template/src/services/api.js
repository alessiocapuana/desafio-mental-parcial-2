const API_URL = "http://localhost:3000/api";

// Nombre del evento que avisa que la sesión venció (lo escucha AuthContext)
export const SESSION_EXPIRED_EVENT = "auth:session-expired";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  // Si había sesión y el servidor responde 401, el token venció o es inválido
  if (response.status === 401 && token && endpoint !== "/auth/login") {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  if (!response.ok) {
    throw new Error(data.message || "Error al comunicarse con el servidor");
  }

  return data;
}

export const api = {
  // Autenticación
  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  getProfile: () => request("/auth/profile"),

  // Preguntas
  getQuestions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/questions${query ? `?${query}` : ""}`);
  },
  checkAnswer: (id, respuestaSeleccionada) =>
    request(`/questions/${id}/check`, {
      method: "POST",
      body: JSON.stringify({ respuestaSeleccionada }),
    }),
  createQuestion: (questionData) =>
    request("/questions", {
      method: "POST",
      body: JSON.stringify(questionData),
    }),
  updateQuestion: (id, questionData) =>
    request(`/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(questionData),
    }),
  deleteQuestion: (id) =>
    request(`/questions/${id}`, {
      method: "DELETE",
    }),

  // Partidas, Historial, Estadísticas y Ranking
  saveGame: (gameData) =>
    request("/games", {
      method: "POST",
      body: JSON.stringify(gameData),
    }),
  getHistory: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== "")
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/games/history${query ? `?${query}` : ""}`);
  },
  getStats: () => request("/games/stats"),
  getRanking: () => request("/games/ranking"),
};
