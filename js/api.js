// Si el frontend está alojado en el mismo dominio, usamos cadena vacía para ruta relativa o se define hardcoded el del servidor.
// Para este proyecto alojaremos frontend en Render Static Site y Backend en Render Web Service.
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
    ? "http://localhost:10000" 
    : "https://elecciones-cea-backend.onrender.com"; // <-- REEMPLAZAR CON TU URL REAL DE RENDER

// Utilidad para extraer encabezados con JWT
function getAuthHeaders() {
  const token = localStorage.getItem("jwt_token");
  if (!token) return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

// Interceptar fetch para manejar 401 (No autorizado) - redirigir a index
async function apiFetch(endpoint, options = {}) {
  try {
    options.headers = getAuthHeaders();
    const res = await fetch(`${API_URL}${endpoint}`, options);
    
    if (res.status === 401) {
      console.warn("🔐 Sesión expirada.");
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_rol");
      window.location.href = "/index.html";
    }
    return res;
  } catch (err) {
    console.error("🚨 Error en apiFetch:", err);
    // Retornamos un objeto "falso" para evitar que el código que llama a apiFetch explote al hacer await r.json()
    return { 
        ok: false, 
        status: 503, 
        json: async () => ({ detail: "Error técnico: El servidor no responde o la sesión ha expirado. Por favor refresca la página o intenta de nuevo." }) 
    };
  }
}

function redirigirPorRol(rol) {
    if (rol === "admin") window.location.href = "/pages/dashboard-admin.html";
    else if (rol === "secretaria") window.location.href = "/pages/dashboard-secretaria.html";
    else if (rol === "jefe") window.location.href = "/pages/dashboard-jefe.html";
    else if (rol === "votante") window.location.href = "/pages/dashboard-votante.html";
    else alert("Rol desconocido: " + rol);
}

function cerrarSesion() {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_rol");
    window.location.href = "/index.html";
}
