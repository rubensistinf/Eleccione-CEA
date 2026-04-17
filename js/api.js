const SYSTEM_VERSION = "4.3.4";

// Fuerza recarga si la versión cambió
if (localStorage.getItem("cea_v") !== SYSTEM_VERSION) {
    localStorage.removeItem("custom_api_url");
    localStorage.setItem("cea_v", SYSTEM_VERSION);
    location.reload(true);
}

const API_VERSIONS = [
    "https://elecciones-cea-backend.onrender.com",
    "https://eleccione-cea-backend.onrender.com"
];
let currentApiUrl = localStorage.getItem("working_api_url") || API_VERSIONS[0];

// Exponer URL detectada globalmente para el Login
window.getApiUrl = () => {
    return localStorage.getItem("custom_api_url") || currentApiUrl;
};

async function apiFetch(endpoint, options = {}, retryCount = 0) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); 
  
  try {
    const headers = getAuthHeaders();
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    options.headers = { ...headers, ...options.headers };
    options.signal = controller.signal;
    
    const activeUrl = localStorage.getItem("custom_api_url") || currentApiUrl;
    let res = await fetch(`${activeUrl}${endpoint}`, options);
    
    // Si funciona, guardar esta URL como la que sirve
    if (res.ok && !localStorage.getItem("custom_api_url")) {
        localStorage.setItem("working_api_url", activeUrl);
    }

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
    
    // AUTO-SANACIÓN: Si falla por red/CORS, probar con la otra versión de URL
    if (retryCount < API_VERSIONS.length - 1 && err.toString().includes("TypeError")) {
        console.warn("⚠️ Fallo en URL actual. Reintentando con variante alternativa...");
        currentApiUrl = API_VERSIONS[retryCount + 1];
        return apiFetch(endpoint, options, retryCount + 1);
    }

    let extra = "";
    if (err.name === 'AbortError') extra = " (Tiempo de espera agotado - Servidor despertando?)";
    else if (err.toString().includes("TypeError")) extra = " (Error de red o CORS - ¿URL correcta?)";

    return { 
        ok: false, 
        status: 503, 
        json: async () => ({ detail: `Error de conexión [v${SYSTEM_VERSION}]: ${err.message || err}${extra}` }) 
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
