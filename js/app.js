// Funciones de utilidad
function mostrarToast(mensaje, tipo = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function actualizarTablaVotantes() {
  const tablaVotantes = document.getElementById('tabla-votantes');
  if (!tablaVotantes) return;
  
  const tbody = tablaVotantes.querySelector('tbody') || tablaVotantes;
  tbody.innerHTML = '';
  
  votantes.forEach(v => {
    const tr = document.createElement('tr');
    tr.className = 'added';
    tr.innerHTML = `
      <td>${v.nombre}</td>
      <td>${v.dni}</td>
      <td>${v.codigo}</td>
      <td>${v.haVotado ? '✓' : '✗'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function validarFormulario(campos) {
  return campos.every(campo => {
    if (!campo.value.trim()) {
      mostrarToast(`El campo ${campo.placeholder || campo.name} es obligatorio`, 'error');
      campo.focus();
      return false;
    }
    return true;
  });
}

// --- Registro de Candidatos ---
const formCandidato = document.getElementById('form-candidato');
const listaCandidatos = document.getElementById('lista-candidatos');
let candidatos = JSON.parse(localStorage.getItem('candidatos')) || [];

function renderCandidatos() {
  listaCandidatos.innerHTML = '';
  candidatos.forEach((c, i) => {
    const div = document.createElement('div');
    div.innerHTML = `<img src="${c.foto}" alt="Foto"><b>${c.nombre}</b> (${c.siglas})`;
    listaCandidatos.appendChild(div);
  });
}

formCandidato.onsubmit = function(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre-candidato');
  const siglas = document.getElementById('siglas-candidato');
  const fotoInput = document.getElementById('foto-candidato');

  if (!validarFormulario([nombre, siglas]) || !fotoInput.files[0]) {
    if (!fotoInput.files[0]) mostrarToast('Debes seleccionar una foto', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    candidatos.push({ 
      nombre: nombre.value.trim(), 
      siglas: siglas.value.trim(), 
      foto: evt.target.result 
    });
    localStorage.setItem('candidatos', JSON.stringify(candidatos));
    renderCandidatos();
    formCandidato.reset();
    mostrarToast('Candidato registrado exitosamente', 'success');
  };
  reader.readAsDataURL(fotoInput.files[0]);
};
renderCandidatos();

// --- Registro de Votantes ---
const formVotante = document.getElementById('form-votante');
const codigoVotanteDiv = document.getElementById('codigo-votante');
let votantes = JSON.parse(localStorage.getItem('votantes')) || [];

function generarCodigoUnico() {
  return 'V-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

formVotante.onsubmit = function(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre-votante');
  const dni = document.getElementById('dni-votante');

  if (!validarFormulario([nombre, dni])) return;

  if (votantes.find(v => v.dni === dni.value.trim())) {
    mostrarToast('Este DNI ya está registrado', 'error');
    return;
  }

  const codigo = generarCodigoUnico();
  votantes.push({ 
    nombre: nombre.value.trim(), 
    dni: dni.value.trim(), 
    codigo, 
    haVotado: false 
  });
  localStorage.setItem('votantes', JSON.stringify(votantes));
  codigoVotanteDiv.innerHTML = `<b>Tu código único es:</b> <span>${codigo}</span> (guárdalo para votar)`;
  formVotante.reset();
  actualizarTablaVotantes();
  mostrarToast('Votante registrado exitosamente', 'success');
};

// --- Votación ---
const formVotacion = document.getElementById('form-votacion');
const candidatosVotacion = document.getElementById('candidatos-votacion');
const mensajeVotacion = document.getElementById('mensaje-votacion');

function renderCandidatosVotacion() {
  candidatosVotacion.innerHTML = '';
  candidatos.forEach((c, i) => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="radio" name="candidato-voto" value="${i}" required> <img src="${c.foto}" alt="Foto"> <b>${c.nombre}</b> (${c.siglas})`;
    candidatosVotacion.appendChild(label);
  });
}
renderCandidatosVotacion();

formVotacion.onsubmit = function(e) {
  e.preventDefault();
  const codigoInput = document.getElementById('codigo-unico');
  
  if (!validarFormulario([codigoInput])) return;

  const codigo = codigoInput.value.trim();
  const votante = votantes.find(v => v.codigo === codigo);
  
  if (!votante) {
    mostrarToast('Código no válido', 'error');
    return;
  }
  
  if (votante.haVotado) {
    mostrarToast('Este código ya fue usado para votar', 'error');
    return;
  }
  
  const candidatoSeleccionado = document.querySelector('input[name="candidato-voto"]:checked');
  if (!candidatoSeleccionado) {
    mostrarToast('Selecciona un candidato', 'error');
    return;
  }

  let votos = JSON.parse(localStorage.getItem('votos')) || [];
  votos.push({ codigo, candidato: parseInt(candidatoSeleccionado.value) });
  localStorage.setItem('votos', JSON.stringify(votos));
  
  votante.haVotado = true;
  localStorage.setItem('votantes', JSON.stringify(votantes));
  
  formVotacion.reset();
  mostrarToast('¡Gracias por tu voto!', 'success');
  actualizarTablaVotantes();
};

// --- Resultados ---
function mostrarResultados(candidatos, votantes, votos) {
  const contenedorResultados = document.getElementById('resultados-container');
  if (!contenedorResultados) return;

  const resultados = candidatos.map((c, index) => ({
    ...c,
    votos: votos.filter(v => v.candidato === index).length
  }));

  // Ordenar resultados por número de votos (de mayor a menor)
  resultados.sort((a, b) => b.votos - a.votos);

  const totalVotos = votos.length;
  const votantesRegistrados = votantes.length;
  const votantesPendientes = votantes.filter(v => !v.haVotado).length;
  const votosNulos = 0; // Aquí puedes agregar la lógica para contar votos nulos si es necesario
  const votosBlancos = 0; // Aquí puedes agregar la lógica para contar votos blancos si es necesario

  let html = `
    <div class="estadisticas-container">
      <div class="estadistica">
        <h3>Total de Votos</h3>
        <p>${totalVotos}</p>
      </div>
      <div class="estadistica">
        <h3>Votantes Registrados</h3>
        <p>${votantesRegistrados}</p>
      </div>
      <div class="estadistica">
        <h3>Votos Pendientes</h3>
        <p>${votantesPendientes}</p>
      </div>
    </div>
    <div class="lista-resultados">
  `;

  // Agregar resultados de candidatos
  resultados.forEach((candidato, index) => {
    const porcentaje = totalVotos > 0 ? ((candidato.votos / totalVotos) * 100).toFixed(1) : 0;
    html += `
      <div class="resultado-item">
        <div class="candidato-info">
          <img src="${candidato.foto}" alt="Foto de ${candidato.nombre}">
          <div class="info-texto">
            <h3>${candidato.nombre}</h3>
            <span class="siglas">${candidato.siglas}</span>
          </div>
        </div>
        <div class="votos-info">
          <div class="barra-progreso">
            <div class="progreso" style="width: ${porcentaje}%"></div>
          </div>
          <div class="datos-votos">
            <span class="numero-votos">${candidato.votos} votos</span>
            <span class="porcentaje">${porcentaje}%</span>
          </div>
        </div>
      </div>
    `;
  });

  // Agregar votos nulos y blancos al final
  if (votosNulos > 0 || votosBlancos > 0) {
    html += `
      <div class="otros-votos">
        ${votosNulos > 0 ? `
          <div class="resultado-item voto-nulo">
            <div class="candidato-info">
              <div class="info-texto">
                <h3>Votos Nulos</h3>
              </div>
            </div>
            <div class="votos-info">
              <div class="barra-progreso">
                <div class="progreso" style="width: ${(votosNulos / totalVotos) * 100}%"></div>
              </div>
              <div class="datos-votos">
                <span class="numero-votos">${votosNulos} votos</span>
                <span class="porcentaje">${((votosNulos / totalVotos) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ` : ''}
        ${votosBlancos > 0 ? `
          <div class="resultado-item voto-blanco">
            <div class="candidato-info">
              <div class="info-texto">
                <h3>Votos en Blanco</h3>
              </div>
            </div>
            <div class="votos-info">
              <div class="barra-progreso">
                <div class="progreso" style="width: ${(votosBlancos / totalVotos) * 100}%"></div>
              </div>
              <div class="datos-votos">
                <span class="numero-votos">${votosBlancos} votos</span>
                <span class="porcentaje">${((votosBlancos / totalVotos) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  html += '</div>';
  contenedorResultados.innerHTML = html;
}

// Inicialización de las páginas
document.addEventListener('DOMContentLoaded', () => {
  // Eliminar el código de inicialización de resultados de aquí
  // Este evento ahora solo se usa para otras páginas si es necesario
  if (document.getElementById('form-candidato')) {
    renderCandidatos();
  }
  if (document.getElementById('candidatos-votacion')) {
    renderCandidatosVotacion();
  }
  if (document.getElementById('tabla-votantes')) {
    actualizarTablaVotantes();
  }
}); 