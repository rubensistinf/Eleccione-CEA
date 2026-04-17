// CEA ELECCIONES - Backend API URL
const SYSTEM_VERSION = "4.3.0";

// Fuerza recarga si la versión cambió (solo UNA vez)
if (localStorage.getItem("cea_v") !== SYSTEM_VERSION) {
    localStorage.removeItem("custom_api_url");
    localStorage.setItem("cea_v", SYSTEM_VERSION);
    location.reload(true);
}

const API_URL = "https://elecciones-cea-backend.onrender.com";

async function apiFetch(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s
  
  try {
    const headers = getAuthHeaders();
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    options.headers = { ...headers, ...options.headers };
    options.signal = controller.signal;
    
    let res = await fetch(`${API_URL}${endpoint}`, options);
    clearTimeout(timeoutId);

    if (res.status === 401) {
      cerrarSesion();
      return;
    }
    
    if (res.status >= 500) {
      return { 
        ok: false, 
        status: res.status, 
        json: async () => ({ detail: "Error 500 del Servidor. Ve al Panel Admin -> 'Forzar Migración de Base de Datos'." }) 
      };
    }
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("apiFetch Error:", err);
    return { 
        ok: false, 
        status: 503, 
        json: async () => ({ detail: "Error de conexión. Verifica tu internet o espera un momento." }) 
    };
  }
}

function getAuthHeaders() {
    const token = localStorage.getItem("jwt_token");
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

function debugLog(msg) { console.log("[CEA API]", msg); }

function getConnectedUrl() { return API_URL; }

function cerrarSesion() {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_rol");
    window.location.href = "/index.html";
}

function redirigirPorRol(rol) {
    const base = window.location.origin;
    if (rol === "admin") window.location.href = base + "/pages/dashboard-admin.html";
    else if (rol === "secretaria") window.location.href = base + "/pages/dashboard-secretaria.html";
    else if (rol === "jefe") window.location.href = base + "/pages/dashboard-jefe.html";
    else if (rol === "votante") window.location.href = base + "/pages/dashboard-votante.html";
}
