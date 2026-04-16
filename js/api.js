// 🛡️ CEA ELECCIONES - MOTOR DE RED v3.0 INDESTRUCTIBLE
const SYSTEM_VERSION = "3.0.0";

// FUERZA RECARGA TOTAL Y LIMPIEZA DE "GHOST SERVERS"
if (localStorage.getItem("cea_v") !== SYSTEM_VERSION) {
    const oldUrl = localStorage.getItem("custom_api_url") || "";
    if (oldUrl.includes("elecciones-cea-backend")) {
        localStorage.removeItem("custom_api_url"); // Purga total del servidor con "S"
    }
    localStorage.setItem("cea_v", SYSTEM_VERSION);
    console.log("🚀 Versión 3.0 detectada. Reiniciando con sistema indestructible...");
    location.reload(true);
}

const POSSIBLE_BACKENDS = [
    localStorage.getItem("custom_api_url"),
    "https://eleccione-cea-backend.onrender.com", // ESTABLE
    "https://votacion-cea-backend.onrender.com",
    window.location.origin
].filter(url => url && !url.includes("elecciones-cea-backend")); // BLACKLIST ESTRICTA DEL SERVIDOR CON "S"

let API_URL = POSSIBLE_BACKENDS[0] || "https://eleccione-cea-backend.onrender.com";
let buscandoPromise = null;

async function descubrirBackend() {
    if (buscandoPromise) return buscandoPromise;
    
    buscandoPromise = (async () => {
        debugLog("🔍 Buscando servidor estable...");
        for (const url of POSSIBLE_BACKENDS) {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), 3000); 
                const res = await fetch(`${url}/ping`, { signal: controller.signal });
                clearTimeout(id);
                if (res.ok) {
                    debugLog(`✨ ¡Conectado a ${url}!`);
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
  const timeoutId = setTimeout(() => controller.abort(), 20000); 
  
  try {
    debugLog(`📡 Pidiendo: ${endpoint}...`);
    options.headers = getAuthHeaders();
    options.signal = controller.signal;
    
    let res = await fetch(`${API_URL}${endpoint}`, options);
    clearTimeout(timeoutId);

    if (res.status === 401) {
      debugLog(`🔐 Sesión expirada.`);
      cerrarSesion();
      return;
    }
    
    // Si el servidor responde con error de servidor, intentamos buscar otro
    if (res.status >= 500) {
        throw new Error("Server Error");
    }

    debugLog(`✅ OK (${res.status})`);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    debugLog("🚨 Error de red detectado. Iniciando autoconmutación...");
    
    const encontrado = await descubrirBackend();
    if (encontrado) {
        debugLog("🔄 Reintentando petición con nuevo servidor...");
        // Clonar el body si existe, ya que fetch consume los streams
        if (options.body && typeof options.body === 'string') {
            // Es un string JSON, podemos reusarlo
        } else if (options.body) {
            debugLog("⚠️ No se puede reintentar petición con stream de body. Recarga manual necesaria.");
            return { ok: false, status: 503, json: async() => ({detail: "Error de red. Intenta de nuevo."})};
        }
        return apiFetch(endpoint, options);
    }
    
    return { 
        ok: false, 
        status: 503, 
        json: async () => ({ detail: "Sin conexión. Revisa el Monitor de Sistema abajo." }) 
    };
  }
}

function getAuthHeaders() {
    const token = localStorage.getItem("jwt_token");
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

function debugLog(msg) {
    console.log("[DEBUG]", msg);
    const el = document.getElementById('debug-monitor');
    if (el) {
        const time = new Date().toLocaleTimeString();
        el.innerHTML = `<div style="border-bottom:1px solid #334155; padding:2px 0;"><span style="color:#64748b;">[${time}]</span> ${msg}</div>` + el.innerHTML;
        if (el.innerHTML.length > 3000) el.innerHTML = el.innerHTML.substring(0, 3000);
    }
}

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
