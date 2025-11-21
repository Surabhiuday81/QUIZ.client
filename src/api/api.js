// client/src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
});

// Attach token automatically if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function generateQuiz(payload) {
  const res = await API.post("/quizzes/generate", payload);
  return res.data;
}

/* Auth endpoints */
export async function register(payload) {
  const res = await API.post("/auth/register", payload);
  return res.data;
}
export async function login(payload) {
  const res = await API.post("/auth/login", payload);
  return res.data;
}

/* Quiz endpoints (protected) */
export async function saveQuiz(payload) {
  const res = await API.post("/quizzes", payload);
  return res.data;
}
// client/src/api/api.js  (additions at bottom)
export async function startSession(quizId) {
  const res = await API.post(`/sessions/quizzes/${quizId}/start`);
  return res.data;
}

export async function submitSession(sessionId, answers) {
  const res = await API.post(`/sessions/${sessionId}/submit`, { answers });
  return res.data;
}

export default API;
