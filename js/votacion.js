// --- Votación ---
const formVotacion = document.getElementById('form-votacion');
const candidatosVotacion = document.getElementById('candidatos-votacion');
const mensajeVotacion = document.getElementById('mensaje-votacion');
const btnValidarCodigo = document.getElementById('btn-validar-codigo');
let candidatos = JSON.parse(localStorage.getItem('candidatos')) || [];
let votantes = JSON.parse(localStorage.getItem('votantes')) || [];
let votanteActivo = null;

function mostrarMensaje(mensaje, tipo = 'error') {
  mensajeVotacion.textContent = mensaje;
  mensajeVotacion.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-exito';
}

function renderCandidatosVotacion() {
  candidatosVotacion.innerHTML = '';
  if (candidatos.length === 0) {
    candidatosVotacion.innerHTML = '<p>No hay candidatos registrados.</p>';
    return;
  }
  const boleta = document.createElement('div');
  boleta.className = 'boleta-candidatos';
  candidatos.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'candidato-card';
    card.innerHTML = `
      <img src="${c.foto}" alt="Foto de ${c.nombre}">
      <div class="candidato-nombre">${c.nombre}</div>
      <div class="candidato-siglas">${c.siglas}</div>
      <button class="btn-votar" data-index="${i}">Votar</button>
    `;
    boleta.appendChild(card);
  });
  candidatosVotacion.appendChild(boleta);

  // Asignar eventos a los botones
  document.querySelectorAll('.btn-votar').forEach(btn => {
    btn.onclick = function(e) {
      e.preventDefault();
      votarCandidato(parseInt(btn.getAttribute('data-index')));
    };
  });
}

function validarCodigo(codigo) {
  // Si el código comienza con CEA-, validar como código de votación
  if (codigo.startsWith('CEA-')) {
    return votantes.find(v => v.codigo.toUpperCase() === codigo.toUpperCase());
  }
  // Si no, validar como número de carnet
  return votantes.find(v => v.dni === codigo);
}

function votarCandidato(candidatoIndex) {
  if (!votanteActivo) {
    mostrarMensaje('Debes validar tu código antes de votar.');
    return;
  }
  // Registrar el voto
  let votos = JSON.parse(localStorage.getItem('votos')) || [];
  votos.push({ 
    codigo: votanteActivo.codigo,
    candidato: candidatoIndex,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('votos', JSON.stringify(votos));

  // Marcar como votado
  votanteActivo.haVotado = true;
  localStorage.setItem('votantes', JSON.stringify(votantes));

  mostrarMensaje('¡Gracias por tu voto! Tu participación ha sido registrada.', 'exito');
  formVotacion.reset();
  candidatosVotacion.style.display = 'none';
  votanteActivo = null;
}

btnValidarCodigo.onclick = function() {
  const codigoInput = document.getElementById('codigo-unico');
  const codigo = codigoInput.value.trim();
  if (!codigo) {
    mostrarMensaje('Debes ingresar tu código de votación o carnet.');
    codigoInput.focus();
    return;
  }
  const votante = validarCodigo(codigo);
  if (!votante) {
    mostrarMensaje('El código de votación o carnet ingresado no es válido.');
    return;
  }
  if (votante.haVotado) {
    mostrarMensaje('Este código ya fue usado para votar.');
    return;
  }
  votanteActivo = votante;
  mostrarMensaje('Selecciona un candidato para votar.', 'exito');
  renderCandidatosVotacion();
  candidatosVotacion.style.display = 'block';
};

// Al cargar, ocultar candidatos
candidatosVotacion.style.display = 'none';

// Manejar el envío del formulario
formVotacion.onsubmit = function(e) {
  e.preventDefault();
  mostrarMensaje('Selecciona un candidato para votar.');
}; 