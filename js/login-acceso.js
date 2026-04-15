const linkRegistrarEstudiantes = document.getElementById('link-registrar-estudiantes');
const linkRegistroCandidatos = document.getElementById('link-registro-candidatos');
const modalLogin = document.getElementById('modal-login');
const confirmarLogin = document.getElementById('confirmar-login');
const cancelarLogin = document.getElementById('cancelar-login');
const mensajeLogin = document.getElementById('mensaje-login');
let destinoLogin = '';

function abrirLogin(destino) {
  destinoLogin = destino;
  modalLogin.style.display = 'flex';
  mensajeLogin.textContent = '';
  document.getElementById('usuario-login').value = '';
  document.getElementById('contrasena-login').value = '';
}

linkRegistrarEstudiantes.onclick = function(e) {
  e.preventDefault();
  abrirLogin('registrar-estudiantes.html');
};

linkRegistroCandidatos.onclick = function(e) {
  e.preventDefault();
  abrirLogin('registro-candidatos.html');
};

cancelarLogin.onclick = function() {
  modalLogin.style.display = 'none';
};

confirmarLogin.onclick = function() {
  const usuario = document.getElementById('usuario-login').value.trim();
  const contrasena = document.getElementById('contrasena-login').value.trim();
  if (usuario === 'sistemas' && contrasena === '1234') {
    sessionStorage.setItem('accesoAdmin', 'ok');
    window.location.href = destinoLogin;
  } else {
    mensajeLogin.textContent = 'Usuario o contraseña incorrectos.';
  }
}; 