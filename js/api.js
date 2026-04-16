// SISTEMA DE CONTROL DE VERSIONES - FUERZA RECARGA DE CACHE
const SYSTEM_VERSION = "2.0.1";
if (localStorage.getItem("cea_v") !== SYSTEM_VERSION) {
    localStorage.setItem("cea_v", SYSTEM_VERSION);
    location.reload(true);
}

const POSSIBLE_BACKENDS = [
    localStorage.getItem("custom_api_url"),
    window.location.origin, // Probar si el backend está en el mismo dominio
    "https://eleccione-cea-backend.onrender.com",
    "https://elecciones-cea-backend.onrender.com",
    "https://votacion-cea-backend.onrender.com",
    "https://votacion-backend.onrender.com"
].filter(Boolean);

let API_URL = POSSIBLE_BACKENDS[0] || "https://eleccione-cea-backend.onrender.com";
let buscandoPromise = null;

async function descubrirBackend() {
    if (buscandoPromise) {
        console.log("⏳ Ya hay una búsqueda en curso, esperando...");
        return buscandoPromise;
    }
    
    buscandoPromise = (async () => {
        console.log("🔍 Buscando motor del sistema (Backend)...");
        for (const url of POSSIBLE_BACKENDS) {
            try {
                console.log(`📡 Probando conexión con: ${url}...`);
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), 3500); // 3.5s por intento
                const res = await fetch(`${url}/ping`, { signal: controller.signal });
                clearTimeout(id);
                if (res.ok) {
                    console.log("✅ ¡Conexión establecida!", url);
                    localStorage.setItem("custom_api_url", url);
                    API_URL = url;
                    return true;
                }
            } catch (e) {
                console.warn(`❌ Falló ${url}`);
            }
        }
        console.error("⛔ No se encontró ningún servidor activo. Revisa tu panel de Render.");
        return false;
    })();

    const resultado = await buscandoPromise;
    buscandoPromise = null;
    return resultado;
}

// Intentar descubrir si el actual falla
async function apiFetch(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout total
  
  try {
    debugLog(`📡 Pidiendo: ${endpoint}...`);
    options.headers = getAuthHeaders();
    options.signal = controller.signal;
    
    let res = await fetch(`${API_URL}${endpoint}`, options);
    clearTimeout(timeoutId);

    if (res.status === 401) {
      debugLog(`🔐 401: Sesión expirada.`);
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_rol");
      window.location.href = "/index.html";
    }
    debugLog(`✅ Respuesta: ${res.status}`);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
        debugLog(`⏱️ Tiempo agotado (20s) en ${endpoint}`);
    } else {
        debugLog(`🚨 Error de red en ${endpoint}`);
    }
    
    console.error("🚨 Error de conexión, reintentando descubrimiento...");
    debugLog("🔍 Reintentando autoconexión...");
    const encontrado = await descubrirBackend();
    if (encontrado) {
        debugLog("✨ ¡Reconectado! Reintentando petición...");
        return apiFetch(endpoint, options); // Reintento con la nueva URL
    }
    return { 
        ok: false, 
        status: 503, 
        json: async () => ({ detail: "El servidor está tardando demasiado en responder o está fuera de línea." }) 
    };
  }
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

function getConnectedUrl() {
    return API_URL;
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
