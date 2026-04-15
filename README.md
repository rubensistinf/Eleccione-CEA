# Plataforma de Elecciones Estudiantiles - CEA

Este es un sistema **Fullstack** (FastAPI + Vanilla JS + PostgreSQL) de uso oficial para las elecciones estudiantiles del CEA (Centro de Educación Alternativa). 

## 🏗️ Estructura del Proyecto

```
/backend          # API construida en Python (FastAPI, SQLAlchemy)
/frontend         # Interfaz web responsiva con Vanilla HTML/CSS/JS
render.yaml       # Archivo de configuración Blueprint de Render
```

## 🚀 Despliegue en Render (Cloud)

Gracias al archivo `render.yaml` incluido, el despliegue es prácticamente automático utilizando "Render Blueprints".

### Pasos:
1. Sube este repositorio actualizado a tu **GitHub** personal.
2. Inicia sesión en [Render.com](https://render.com) usando tu cuenta `condorirubenla@gmail.com`.
3. Ve a la sección **Blueprints** en el navbar superior de Render.
4. Presiona **New Blueprint Instance**.
5. Conecta tu repositorio de GitHub `Elecciones-CEA`.
6. Selecciona el archivo `render.yaml` y dale **Apply**.
7. Render automáticamente levantará:
   - Una base de datos **PostgreSQL**.
   - Tu **Backend (API FastAPI)**.
   - Tu **Frontend (Sitio Estático)**.
8. **IMPORTANTE:** Una vez finalizado el proceso de Render, copia la URL final que Render le asigna a tu **Backend** (ej: `https://elecciones-cea-backend.onrender.com`) y colócala en tu archivo `/frontend/js/api.js` reemplazando la URL por defecto que se encuentra allí. Después de ese cambio, actualiza tu commit en GitHub para que el Frontend impacte el cambio.

---

## 💻 Desarrollo Local (Pruebas antes de subir a la nube)

### Requisitos locales
- Python 3.9+ instalado.
- Opcionalmente un entorno virtual.

### Correr Backend (Servidor)
1. Abre tu terminal y ve a la subcarpeta `backend`:
   ```bash
   cd backend
   ```
2. Instala dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Levanta FastAPI. Automáticamente usará SQLite para base local de pruebas si no recibe la variable de entorno PostgreSQL:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 10000 --reload
   ```

### Correr Frontend (Cliente)
Debido al sistema CORS y los Imports (Fetch), debes levantar el HTML con un servidor local básico o usando la extensión "Live Server" de VS Code.
- Vía Python en la raíz del proyecto:
  ```bash
  python -m http.server 5500
  ```
Entra en tu navegador a: `http://localhost:5500/frontend/index.html`

---

## 👥 Usuarios de Arranque por Defecto
El sistema, al ejecutarse por primera vez, creará la base de datos automáticamente e insertará a los siguientes 4 roles claves. **La contraseña de todos es `12345`**.

| Correo | Rol | Dashboard Acceso |
|--------|-----|------------------|
| `admin@cea.com` | Administrador | /frontend/pages/dashboard-admin.html |
| `secretaria@cea.com`| Secretaria | /frontend/pages/dashboard-secretaria.html |
| `jefe@cea.com` | Jefe de Mesa | /frontend/pages/dashboard-jefe.html |
| `votante@cea.com` | Votante | /frontend/pages/dashboard-votante.html |

> Todo el flujo de roles, cifrado hash y seguridad JSON Web Tokens (JWT) funciona nativamente por HTTP.
