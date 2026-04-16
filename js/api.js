const POSSIBLE_BACKENDS = [
    localStorage.getItem("custom_api_url"),
    "https://elecciones-cea-backend.onrender.com",
    "https://eleccione-cea-backend.onrender.com",
    "https://votacion-cea-backend.onrender.com",
    "https://votacion-backend.onrender.com"
].filter(Boolean);

let API_URL = POSSIBLE_BACKENDS[0] || "https://elecciones-cea-backend.onrender.com";

async function descubrirBackend() {
    console.log("🔍 Iniciando auto-descubrimiento de Backend...");
    for (const url of POSSIBLE_BACKENDS) {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 2000); // 2s timeout
            const res = await fetch(`${url}/admin/elecciones`, { signal: controller.signal });
            clearTimeout(id);
            if (res.ok || res.status === 401) {
                console.log("✅ Backend encontrado en:", url);
                localStorage.setItem("custom_api_url", url);
                API_URL = url;
                return true;
            }
        } catch (e) {
            console.warn(`❌ No hay respuesta en: ${url}`);
        }
    }
    return false;
}

// Intentar descubrir si el actual falla
async function apiFetch(endpoint, options = {}) {
  try {
    options.headers = getAuthHeaders();
    let res = await fetch(`${API_URL}${endpoint}`, options);

    // Si no responde o da error de red, intentamos redescubrir
    if (!res.ok && res.status >= 500) {
        // Podría ser error interno, no necesariamente URL mal
    }
    
    if (res.status === 401) {
      console.warn("🔐 Sesión expirada.");
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_rol");
      window.location.href = "/index.html";
    }
    return res;
  } catch (err) {
    console.error("🚨 Error de conexión, reintentando descubrimiento...");
    const encontrado = await descubrirBackend();
    if (encontrado) {
        return apiFetch(endpoint, options); // Reintento con la nueva URL
    }
    return { 
        ok: false, 
        status: 503, 
        json: async () => ({ detail: "Error técnico: El servidor no responde. Por favor asegúrate de que el 'Web Service' en Render esté ACTIVO." }) 
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
