// --- Registro de Candidatos ---
const formCandidato = document.getElementById('form-candidato');
const listaCandidatos = document.getElementById('lista-candidatos');
let candidatos = JSON.parse(localStorage.getItem('candidatos')) || [];

function renderCandidatos() {
  listaCandidatos.innerHTML = '<h3>Lista de Candidatos Registrados</h3>';
  if (candidatos.length === 0) {
    listaCandidatos.innerHTML += '<p>No hay candidatos registrados.</p>';
    return;
  }
  candidatos.forEach((c, i) => {
    const div = document.createElement('div');
    div.innerHTML = `<img src="${c.foto}" alt="Foto"><b>${c.nombre}</b> (${c.siglas})`;
    listaCandidatos.appendChild(div);
  });
}

formCandidato.onsubmit = function(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre-candidato').value.trim();
  const siglas = document.getElementById('siglas-candidato').value.trim();
  const fotoInput = document.getElementById('foto-candidato');
  if (!nombre || !siglas || !fotoInput.files[0]) {
    alert('Todos los campos son obligatorios.');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(evt) {
    candidatos.push({ nombre, siglas, foto: evt.target.result });
    localStorage.setItem('candidatos', JSON.stringify(candidatos));
    renderCandidatos();
    formCandidato.reset();
  };
  reader.readAsDataURL(fotoInput.files[0]);
};
renderCandidatos();

// --- Registro de Votantes ---
const formVotante = document.getElementById('form-votante');
const listaVotantes = document.getElementById('lista-votantes');
const codigoVotanteDiv = document.getElementById('codigo-votante');
let votantes = JSON.parse(localStorage.getItem('votantes')) || [];

function showToast(msg, color = '#003366') {
  let toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.background = color;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function renderVotantes(addedIdx = null) {
  let html = '<h3>Lista de Votantes Registrados</h3>';
  html += '<table class="table-anim" style="width:100%;border-collapse:collapse;">';
  html += '<tr><th>Nombre</th><th>Carnet de Identidad</th><th>Clave</th><th>Acción</th></tr>';
  if (votantes.length === 0) {
    html += '<tr><td colspan="4" style="text-align:center;color:#888;">No hay votantes registrados.</td></tr>';
  } else {
    votantes.forEach((v, idx) => {
      html += `<tr${addedIdx === idx ? " class='added'" : ''}><td>${v.nombre}</td><td>${v.dni}</td><td>${v.codigo}</td><td><button class='btn-eliminar-votante btn-destacado' data-index='${idx}'>Eliminar</button></td></tr>`;
    });
  }
  html += '</table>';
  listaVotantes.innerHTML = html;
  // Asignar eventos a los botones de eliminar
  document.querySelectorAll('.btn-eliminar-votante').forEach(btn => {
    btn.onclick = function() {
      const idx = parseInt(btn.getAttribute('data-index'));
      votantes.splice(idx, 1);
      localStorage.setItem('votantes', JSON.stringify(votantes));
      renderVotantes();
      showToast('Votante eliminado', '#e53935');
    };
  });
}

// Validación en tiempo real para carnet duplicado
const dniInput = document.getElementById('dni-votante');
dniInput.addEventListener('input', function() {
  const dni = dniInput.value.trim();
  if (votantes.find(v => v.dni === dni)) {
    dniInput.style.border = '2px solid #e53935';
    dniInput.setCustomValidity('Este carnet ya está registrado.');
  } else {
    dniInput.style.border = '';
    dniInput.setCustomValidity('');
  }
});

formVotante.onsubmit = function(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre-votante').value.trim();
  const dni = dniInput.value.trim();
  if (!nombre || !dni) {
    showToast('Todos los campos son obligatorios.', '#e53935');
    return;
  }
  if (votantes.find(v => v.dni === dni)) {
    showToast('Este carnet ya está registrado.', '#e53935');
    return;
  }
  const inicial = nombre.charAt(0).toUpperCase();
  const codigo = inicial + dni;
  votantes.push({ nombre, dni, codigo, haVotado: false });
  localStorage.setItem('votantes', JSON.stringify(votantes));
  formVotante.reset();
  document.getElementById('nombre-votante').focus();
  renderVotantes(votantes.length - 1);
  showToast('Votante registrado exitosamente', '#0055a5');
  codigoVotanteDiv.innerHTML = `<b>Tu clave para votar es:</b> <span style='color:#0055a5;font-size:1.2em;'>${codigo}</span> <br><small>Guárdala, la necesitarás para votar.</small>`;
};
renderVotantes();

btnExportarExcel.onclick = function() {
  const votantes = JSON.parse(localStorage.getItem('votantes')) || [];
  if (votantes.length === 0) {
    alert('No hay votantes para exportar.');
    return;
  }
  const data = votantes.map(v => ({
    'Nombre': v.nombre,
    'Carnet de Identidad': v.dni,
    'Clave para la Elección': v.codigo
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Votantes');
  XLSX.writeFile(wb, 'votantes.xlsx');
}; 