// --- Registro de Candidatos ---
const formCandidato = document.getElementById('form-candidato');
const listaCandidatos = document.getElementById('lista-candidatos');
let candidatos = JSON.parse(localStorage.getItem('candidatos')) || [];

function eliminarCandidato(index) {
  if (confirm('¿Estás seguro de que deseas eliminar este candidato?')) {
    candidatos.splice(index, 1);
    localStorage.setItem('candidatos', JSON.stringify(candidatos));
    renderCandidatos();
  }
}

function renderCandidatos() {
  listaCandidatos.innerHTML = '<h3>Lista de Candidatos Registrados</h3>';
  if (candidatos.length === 0) {
    listaCandidatos.innerHTML += '<p>No hay candidatos registrados.</p>';
    return;
  }
  candidatos.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = 'candidato-item';
    div.innerHTML = `
      <div class="candidato-info">
        <img src="${c.foto}" alt="Foto de ${c.nombre}">
        <div class="candidato-datos">
          <b>${c.nombre}</b>
          <span>(${c.siglas})</span>
        </div>
      </div>
      <button class="btn-eliminar" onclick="eliminarCandidato(${i})">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
        Eliminar
      </button>
    `;
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