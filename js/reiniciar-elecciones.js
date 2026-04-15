// Lógica para el botón y modal de reinicio de elecciones
const btnReiniciar = document.getElementById('btn-reiniciar-elecciones');
const modalReiniciar = document.getElementById('modal-reiniciar');
const confirmarReinicio = document.getElementById('confirmar-reinicio');
const cancelarReinicio = document.getElementById('cancelar-reinicio');
const mensajeReinicio = document.getElementById('mensaje-reinicio');

btnReiniciar.onclick = function() {
  modalReiniciar.style.display = 'flex';
  mensajeReinicio.textContent = '';
  document.getElementById('usuario-reinicio').value = '';
  document.getElementById('contrasena-reinicio').value = '';
};

cancelarReinicio.onclick = function() {
  modalReiniciar.style.display = 'none';
};

confirmarReinicio.onclick = function() {
  const usuario = document.getElementById('usuario-reinicio').value.trim();
  const contrasena = document.getElementById('contrasena-reinicio').value.trim();
  if (usuario === 'sistemas' && contrasena === '1234') {
    // Eliminar todos los datos
    localStorage.removeItem('votantes');
    localStorage.removeItem('candidatos');
    localStorage.removeItem('votos');
    mensajeReinicio.style.color = 'green';
    mensajeReinicio.textContent = '¡Elecciones reiniciadas correctamente!';
    setTimeout(() => {
      modalReiniciar.style.display = 'none';
      location.reload();
    }, 1200);
  } else {
    mensajeReinicio.style.color = 'red';
    mensajeReinicio.textContent = 'Usuario o contraseña incorrectos.';
  }
}; 