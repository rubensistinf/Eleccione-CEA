// --- Registro de Estudiantes ---
const formEstudiante = document.getElementById('form-estudiante');
const listaEstudiantes = document.getElementById('lista-estudiantes');
let votantes = JSON.parse(localStorage.getItem('votantes')) || [];

function generarCodigoVotacion(dni) {
  return `CEA-${dni}`;
}

function obtenerEstadisticas() {
  const total = votantes.length;
  const hanVotado = votantes.filter(v => v.haVotado).length;
  const pendientes = total - hanVotado;
  const porcentajeVotacion = total ? ((hanVotado / total) * 100).toFixed(1) : 0;

  return {
    total,
    hanVotado,
    pendientes,
    porcentajeVotacion
  };
}

function renderEstudiantes() {
  const stats = obtenerEstadisticas();
  
  // Contenedor principal
  let html = `
    <div class="estadisticas-registro">
      <div class="stat-card">
        <span class="stat-value">${stats.total}</span>
        <span class="stat-label">Total Registrados</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${stats.hanVotado}</span>
        <span class="stat-label">Han Votado</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${stats.pendientes}</span>
        <span class="stat-label">Pendientes</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${stats.porcentajeVotacion}%</span>
        <span class="stat-label">Participación</span>
      </div>
    </div>

    <div class="lista-control">
      <div class="busqueda-container">
        <input type="text" id="buscar-estudiante" placeholder="Buscar estudiante..." class="buscar-input">
      </div>
      <div class="filtros">
        <button class="filtro-btn active" data-filtro="todos">Todos</button>
        <button class="filtro-btn" data-filtro="votaron">Ya Votaron</button>
        <button class="filtro-btn" data-filtro="pendientes">Pendientes</button>
      </div>
    </div>

    <div class="tabla-container">
      <table class="tabla-estudiantes">
        <thead>
          <tr>
            <th>Nº</th>
            <th>Nombre Completo</th>
            <th>Carnet</th>
            <th>Código de Votación</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (votantes.length === 0) {
    html += `
      <tr>
        <td colspan="6" class="empty-state">
          <div class="empty-message">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <p>No hay estudiantes registrados</p>
            <small>Los estudiantes registrados aparecerán aquí</small>
          </div>
        </td>
      </tr>
    `;
  } else {
    // Ordenar alfabéticamente por nombre
    const votantesOrdenados = [...votantes].sort((a, b) => 
      a.nombre.localeCompare(b.nombre, 'es', {sensitivity: 'base'})
    );

    votantesOrdenados.forEach((v, idx) => {
      const estadoClase = v.haVotado ? 'estado-votado' : 'estado-pendiente';
      const estadoTexto = v.haVotado ? '✓ Ya votó' : '⏳ Pendiente';
      
      html += `
        <tr class="estudiante-row" data-estado="${v.haVotado ? 'votado' : 'pendiente'}">
          <td class="numero-orden">${idx + 1}</td>
          <td class="nombre-estudiante">${v.nombre}</td>
          <td class="carnet-estudiante">${v.dni}</td>
          <td class="codigo-estudiante"><code>${v.codigo}</code></td>
          <td class="estado-estudiante">
            <span class="estado-badge ${estadoClase}">${estadoTexto}</span>
          </td>
          <td class="acciones-estudiante">
            <button class="btn-accion copiar-codigo" data-codigo="${v.codigo}" title="Copiar código">
              📋
            </button>
            <button class="btn-accion eliminar-estudiante" data-index="${votantes.findIndex(est => est.dni === v.dni)}" title="Eliminar estudiante">
              🗑️
            </button>
          </td>
        </tr>
      `;
    });
  }

  html += `
      </tbody>
    </table>
  </div>`;
  
  listaEstudiantes.innerHTML = html;

  // Configurar búsqueda
  const buscarInput = document.getElementById('buscar-estudiante');
  if (buscarInput) {
    buscarInput.addEventListener('input', (e) => {
      const busqueda = e.target.value.toLowerCase();
      document.querySelectorAll('.estudiante-row').forEach(row => {
        const nombre = row.querySelector('.nombre-estudiante').textContent.toLowerCase();
        const carnet = row.querySelector('.carnet-estudiante').textContent.toLowerCase();
        const codigo = row.querySelector('.codigo-estudiante').textContent.toLowerCase();
        
        if (nombre.includes(busqueda) || carnet.includes(busqueda) || codigo.includes(busqueda)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // Configurar filtros
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filtro = btn.dataset.filtro;
      document.querySelectorAll('.estudiante-row').forEach(row => {
        if (filtro === 'todos') {
          row.style.display = '';
        } else if (filtro === 'votaron') {
          row.style.display = row.dataset.estado === 'votado' ? '' : 'none';
        } else if (filtro === 'pendientes') {
          row.style.display = row.dataset.estado === 'pendiente' ? '' : 'none';
        }
      });
    });
  });

  // Configurar botones de acción
  document.querySelectorAll('.copiar-codigo').forEach(btn => {
    btn.addEventListener('click', () => {
      const codigo = btn.dataset.codigo;
      navigator.clipboard.writeText(codigo).then(() => {
        mostrarNotificacion('Código copiado al portapapeles');
      });
    });
  });

  document.querySelectorAll('.eliminar-estudiante').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const estudiante = votantes[idx];
      if (confirm('¿Estás seguro de eliminar este estudiante?')) {
        // Eliminar su voto si ya votó
        if (estudiante.haVotado) {
          let votos = JSON.parse(localStorage.getItem('votos')) || [];
          votos = votos.filter(v => v.codigo !== estudiante.codigo);
          localStorage.setItem('votos', JSON.stringify(votos));
        }
        votantes.splice(idx, 1);
        localStorage.setItem('votantes', JSON.stringify(votantes));
        renderEstudiantes();
        mostrarNotificacion('Estudiante eliminado correctamente');
      }
    });
  });
}

function mostrarNotificacion(mensaje) {
  const notificacion = document.createElement('div');
  notificacion.className = 'notificacion';
  notificacion.textContent = mensaje;
  document.body.appendChild(notificacion);
  setTimeout(() => {
    notificacion.classList.add('fadeOut');
    setTimeout(() => notificacion.remove(), 300);
  }, 2000);
}

formEstudiante.onsubmit = function(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre-estudiante').value.trim();
  const dni = document.getElementById('dni-estudiante').value.trim();
  
  if (!nombre || !dni) {
    mostrarNotificacion('Todos los campos son obligatorios');
    return;
  }
  
  if (votantes.find(v => v.dni === dni)) {
    mostrarNotificacion('Este carnet ya está registrado');
    return;
  }

  const codigo = generarCodigoVotacion(dni);
  votantes.push({ 
    nombre, 
    dni, 
    codigo, 
    haVotado: false 
  });
  
  localStorage.setItem('votantes', JSON.stringify(votantes));
  formEstudiante.reset();
  document.getElementById('nombre-estudiante').focus();
  renderEstudiantes();
  
  // Mostrar el código generado
  const mensajeDiv = document.createElement('div');
  mensajeDiv.className = 'mensaje-dinamico';
  mensajeDiv.innerHTML = `
    <p>Estudiante registrado exitosamente</p>
    <div class="codigo-votacion">
      <p>Tu código de votación es:</p>
      <strong>${codigo}</strong>
      <small>(Guarda este código, lo necesitarás para votar)</small>
    </div>
  `;
  formEstudiante.appendChild(mensajeDiv);
  setTimeout(() => mensajeDiv.remove(), 5000);
};

renderEstudiantes(); 