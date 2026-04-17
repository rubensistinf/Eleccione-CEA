// CEA ELECCIONES - Motor de conexión y descubrimiento de backend
const SYSTEM_VERSION = "4.2.0";

// Fuerza recarga si la versión cambió (solo UNA vez)
if (localStorage.getItem("cea_v") !== SYSTEM_VERSION) {
    localStorage.setItem("cea_v", SYSTEM_VERSION);
    location.reload(true);
}

const POSSIBLE_BACKENDS = [
    localStorage.getItem("custom_api_url"),
    "https://elecciones-cea-backend.onrender.com",
    "https://eleccione-cea-backend.onrender.com",
    "https://votacion-cea-backend.onrender.com",
    window.location.origin
].filter(Boolean);

let API_URL = POSSIBLE_BACKENDS[0] || "https://elecciones-cea-backend.onrender.com";
let buscandoPromise = null;

async function descubrirBackend() {
    if (buscandoPromise) return buscandoPromise;
    
    buscandoPromise = (async () => {
        for (const url of POSSIBLE_BACKENDS) {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), 6000); 
                const res = await fetch(`${url}/ping`, { signal: controller.signal });
                clearTimeout(id);
                if (res.ok) {
                    localStorage.setItem("custom_api_url", url);
                    API_URL = url;
                    return true;
                }
            } catch (e) {}
        }
        return false;
    })();

    const result = await buscandoPromise;
    buscandoPromise = null;
    return result;
}

async function apiFetch(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s
  
  try {
    options.headers = getAuthHeaders();
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
        json: async () => ({ detail: "Error 500 del Servidor. Si el problema persiste, ve a Panel Admin -> 'Reparar Base de Datos'." }) 
      };
    }
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    // Recuperación silenciosa
    const encontrado = await descubrirBackend();
    if (encontrado) {
        if (options.body && typeof options.body !== 'string') {
            return { ok: false, status: 503, json: async() => ({detail: "Reintenta ahora."})};
        }
        return apiFetch(endpoint, options);
    }
    return { 
        ok: false, 
        status: 503, 
        json: async () => ({ detail: "Error de conexión. Intenta de nuevo en un momento." }) 
    };
  }
}

function getAuthHeaders() {
    const token = localStorage.getItem("jwt_token");
    const headers = { 'Content-Type': 'application/json' };
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
