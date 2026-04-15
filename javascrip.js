// Este script crea interfaces de usuario personalizadas (UserForms)
// para gestionar un sistema de elecciones estudiantiles en Google Sheets.

const SS = SpreadsheetApp.getActiveSpreadsheet();

// --- Funciones para abrir las interfaces de usuario (UserForms) ---

/**
 * Abre la interfaz de usuario principal de administración.
 */
function abrirMenuAdmin() {
  const html = HtmlService.createHtmlOutputFromFile('AdminUI')
      .setWidth(700)
      .setHeight(500);
  SpreadsheetApp.getUi()
      .showModalDialog(html, 'Administración de Elecciones');
}

/**
 * Abre la interfaz de usuario para que los estudiantes voten.
 */
function abrirFormularioVoto() {
  const html = HtmlService.createHtmlOutputFromFile('VotoUI')
      .setWidth(500)
      .setHeight(400);
  SpreadsheetApp.getUi()
      .showModalDialog(html, 'Emite tu Voto');
}

// --- Funciones para manejar los datos (llamadas desde el frontend HTML/JS) ---

/**
 * Autentica a un estudiante y devuelve sus datos si la autenticación es exitosa.
 * @param {string} studentId El ID del estudiante.
 * @param {string} password La contraseña del estudiante.
 * @returns {object|null} Los datos del estudiante o null si la autenticación falla o ya votó.
 */
function autenticarEstudiante(studentId, password) {
  const sheet = SS.getSheetByName('Estudiantes');
  const data = sheet.getDataRange().getValues();
  // La primera fila son cabeceras, por eso i empieza en 1
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] == studentId && row[3] == password) { // Columna ID Estudiante (0), Contraseña (3)
      if (row[4] == 'NO') { // Columna 'Ha Votado' (4)
        return {
          id: row[0],
          nombre: row[1],
          curso: row[2]
        };
      } else {
        return { error: "Ya has votado." };
      }
    }
  }
  return { error: "ID o Contraseña incorrectos." };
}

/**
 * Guarda un voto emitido por un estudiante.
 * @param {string} studentId El ID del estudiante que votó.
 * @param {string} candidateId El ID del candidato por el que votó.
 * @param {string} cargo El cargo al que postula el candidato.
 * @returns {boolean} True si el voto fue guardado exitosamente.
 */
function guardarVoto(studentId, candidateId, cargo) {
  const votosSheet = SS.getSheetByName('Votos');
  const estudiantesSheet = SS.getSheetByName('Estudiantes');

  // Registrar el voto
  const timestamp = new Date();
  votosSheet.appendRow([timestamp.getTime(), studentId, candidateId, cargo, timestamp]);

  // Marcar al estudiante como que ya votó
  const estudiantesData = estudiantesSheet.getDataRange().getValues();
  for (let i = 1; i < estudiantesData.length; i++) {
    if (estudiantesData[i][0] == studentId) { // Columna ID Estudiante (0)
      estudiantesSheet.getRange(i + 1, 5).setValue('SI'); // Columna 'Ha Votado' es la 5ta (índice 4)
      break;
    }
  }
  return true;
}

/**
 * Obtiene la lista de candidatos para la interfaz de votación.
 * @returns {Array<object>} Un array de objetos con los datos de los candidatos.
 */
function getCandidatos() {
  const sheet = SS.getSheetByName('Candidatos');
  const data = sheet.getDataRange().getValues();
  const candidates = [];
  // La primera fila son cabeceras
  for (let i = 1; i < data.length; i++) {
    candidates.push({
      id: data[i][0],
      nombre: data[i][1],
      curso: data[i][2],
      cargo: data[i][3],
      descripcion: data[i][4]
    });
  }
  return candidates;
}

/**
 * Añade un nuevo estudiante a la hoja de 'Estudiantes'.
 * @param {object} studentData Objeto con {id, nombre, curso, password}.
 * @returns {boolean} True si se añadió correctamente, false si ya existe el ID.
 */
function addEstudiante(studentData) {
  const sheet = SS.getSheetByName('Estudiantes');
  const data = sheet.getRange(2, 1, sheet.getLastRow(), 1).getValues(); // Obtener solo los IDs
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] == studentData.id) {
      return false; // El ID ya existe
    }
  }
  sheet.appendRow([studentData.id, studentData.nombre, studentData.curso, studentData.password, 'NO']);
  return true;
}

/**
 * Añade un nuevo candidato a la hoja de 'Candidatos'.
 * Genera un ID simple.
 * @param {object} candidateData Objeto con {nombre, curso, cargo, descripcion}.
 * @returns {boolean} True si se añadió correctamente.
 */
function addCandidato(candidateData) {
  const sheet = SS.getSheetByName('Candidatos');
  const lastRow = sheet.getLastRow();
  const nextId = lastRow > 0 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1; // Simple ID incremental
  sheet.appendRow([nextId, candidateData.nombre, candidateData.curso, candidateData.cargo, candidateData.descripcion]);
  return true;
}

/**
 * Resetea el estado 'Ha Votado' de todos los estudiantes a 'NO'.
 * Útil para reiniciar el proceso de votación.
 */
function resetearVotosEstudiantes() {
  const sheet = SS.getSheetByName('Estudiantes');
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 5, lastRow - 1, 1).setValue('NO'); // Columna 'Ha Votado'
  }
}

/**
 * Borra todos los votos registrados.
 */
function borrarTodosLosVotos() {
  const sheet = SS.getSheetByName('Votos');
  sheet.clearContents(); // Borra todo el contenido
  sheet.appendRow(['ID Voto', 'ID Estudiante', 'ID Candidato Votado', 'Cargo Votado', 'Fecha/Hora']); // Vuelve a poner las cabeceras
}

/**
 * Obtiene los resultados de la votación por cargo.
 * @returns {object} Un objeto donde las claves son los cargos y los valores son objetos con los conteos de votos por candidato.
 */
function obtenerResultados() {
  const votosSheet = SS.getSheetByName('Votos');
  const candidatosSheet = SS.getSheetByName('Candidatos');

  const votos = votosSheet.getDataRange().getValues();
  const candidatos = candidatosSheet.getDataRange().getValues();

  if (votos.length <= 1) { // No hay votos además de las cabeceras
    return {};
  }

  const resultados = {};
  const candidatoMap = new Map(); // Para mapear ID de candidato a nombre

  // Llenar el mapa de candidatos
  for (let i = 1; i < candidatos.length; i++) {
    candidatoMap.set(candidatos[i][0], candidatos[i][1]); // ID -> Nombre
  }

  // Procesar los votos
  for (let i = 1; i < votos.length; i++) {
    const cargo = votos[i][3]; // Columna Cargo Votado
    const candidatoId = votos[i][2]; // Columna ID Candidato Votado
    const candidatoNombre = candidatoMap.get(candidatoId) || 'Desconocido'; // Fallback por si acaso

    if (!resultados[cargo]) {
      resultados[cargo] = {};
    }
    if (!resultados[cargo][candidatoNombre]) {
      resultados[cargo][candidatoNombre] = 0;
    }
    resultados[cargo][candidatoNombre]++;
  }

  return resultados;
}

// --- Menú personalizado en la hoja de cálculo ---

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Elecciones Estudiantiles')
      .addItem('Abrir Panel de Administración', 'abrirMenuAdmin')
      .addSeparator()
      .addItem('Abrir Formulario de Votación', 'abrirFormularioVoto')
      .addToUi();
}