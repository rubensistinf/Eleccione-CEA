document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    const mensajeLogin = document.getElementById('mensaje-login');

    if(formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('usuario').value;
            const password = document.getElementById('contrasena').value;

            try {
                // OAuth2PasswordRequestForm requiere x-www-form-urlencoded
                const bodyDatos = new URLSearchParams();
                bodyDatos.append("username", username);
                bodyDatos.append("password", password);

                const res = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: bodyDatos
                });

                if(res.ok) {
                    const data = await res.json();
                    localStorage.setItem("jwt_token", data.access_token);
                    
                    // Decodificar JWT para ver el rol
                    const base64Url = data.access_token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const payload = JSON.parse(jsonPayload);
                    const rol = payload.rol;
                    localStorage.setItem("user_rol", rol);

                    // Importar de api.js
                    if(typeof redirigirPorRol !== 'undefined') redirigirPorRol(rol);
                    else window.location.href = "/frontend/index.html"; // Por si falla
                } else {
                    const err = await res.json();
                    mensajeLogin.textContent = err.detail || 'Credenciales incorrectas';
                }
            } catch (error) {
                console.error(error);
                mensajeLogin.textContent = "Error al conectar con el servidor.";
            }
        });
    }
});
