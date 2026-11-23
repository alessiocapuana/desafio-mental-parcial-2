const API_URL = "http://localhost:3000/api";

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