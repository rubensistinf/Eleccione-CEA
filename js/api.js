// 🛡️ CEA ELECCIONES - MOTOR DE RED v3.1.0 INDESTRUCTIBLE
const SYSTEM_VERSION = "3.1.0";

// FUERZA RECARGA TOTAL Y LIMPIEZA DE "GHOST SERVERS"
if (localStorage.getItem("cea_v") !== SYSTEM_VERSION) {
    const oldUrl = localStorage.getItem("custom_api_url") || "";
    if (oldUrl.includes("elecciones-cea-backend")) {
        localStorage.removeItem("custom_api_url"); 
    }
    localStorage.setItem("cea_v", SYSTEM_VERSION);
    console.log("🚀 Nueva versión 3.1 detectada. Optimizando conexión...");
    location.reload(true);
}

const POSSIBLE_BACKENDS = [
    localStorage.getItem("custom_api_url"),
    "https://eleccione-cea-backend.onrender.com", 
    "https://votacion-cea-backend.onrender.com",
    "https://cea- pailon-backend.onrender.com",
    window.location.origin
].filter(url => url && !url.includes("elecciones-cea-backend")); 

let API_URL = POSSIBLE_BACKENDS[0] || "https://eleccione-cea-backend.onrender.com";
let buscandoPromise = null;

async function descubrirBackend() {
    if (buscandoPromise) return buscandoPromise;
    
    buscandoPromise = (async () => {
        debugLog("🔍 Despertando servidores (puede tardar 40s)...");
        for (const url of POSSIBLE_BACKENDS) {
            try {
                const controller = new AbortController();
                // Tiempo de espera por servidor aumentado para Render
                const id = setTimeout(() => controller.abort(), 6000); 
                const res = await fetch(`${url}/ping`, { signal: controller.signal });
                clearTimeout(id);
                if (res.ok) {
                    debugLog(`✨ Servidor encontrado: ${url}`);
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
  // Timeout aumentado a 60 segundos para permitir el "Cold Start" de Render
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); 
  
  try {
    debugLog(`📡 Solicitando: ${endpoint}...`);
    options.headers = getAuthHeaders();
    options.signal = controller.signal;
    
    let res = await fetch(`${API_URL}${endpoint}`, options);
    clearTimeout(timeoutId);

    if (res.status === 401) {
      debugLog(`🔐 Sesión caducada.`);
      cerrarSesion();
      return;
    }
    
    if (res.status >= 500) {
        throw new Error("Server Error");
    }

    debugLog(`✅ Conexión Ok (${res.status})`);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    debugLog("🚨 Servidor en reposo. Intentando despertar...");
    
    const encontrado = await descubrirBackend();
    if (encontrado) {
        debugLog("🔄 Servidor despierto. Reintentando...");
        if (options.body && typeof options.body !== 'string') {
            debugLog("⚠️ Error de reintento. Por favor pulsa el botón de nuevo.");
            return { ok: false, status: 503, json: async() => ({detail: "Reintenta ahora, el servidor ya despertó."})};
        }
        return apiFetch(endpoint, options);
    }
    
    return { 
        ok: false, 
        status: 503, 
        json: async () => ({ detail: "El servidor no responde. Pulsa REPARAR CONEXIÓN." }) 
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
        if (el.innerHTML.length > 5000) el.innerHTML = el.innerHTML.substring(0, 5000);
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
