// Array con todas las imágenes disponibles
const imagenes = [
    'img/WhatsApp Image 2025-05-30 at 9.55.51 PM.jpeg',
    'img/WhatsApp Image 2025-05-29 at 3.12.33 PM.jpeg',
    'img/WhatsApp Image 2025-05-29 at 2.10.21 PM (1).jpeg',
    'img/484920120_1109994687598951_1454196919513403672_n.jpg',
    'img/487213600_1116581196940300_475245014934970545_n.jpg',
    'img/493043208_1139546097977143_1269361847322877635_n.jpg',
    'img/WhatsApp Image 2025-05-28 at 10.59.33 PM (1).jpeg',
    'img/WhatsApp Image 2025-05-28 at 10.48.26 PM (2).jpeg',
    'img/WhatsApp Image 2025-05-28 at 10.48.25 PM (1).jpeg',
    'img/WhatsApp Image 2025-05-22 at 8.53.02 AM (1).jpeg'
];

let indiceActual = 0;
const carruselImg = document.getElementById('carrusel-img');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Función para obtener un índice aleatorio diferente al actual
function obtenerIndiceAleatorio() {
    let nuevoIndice;
    do {
        nuevoIndice = Math.floor(Math.random() * imagenes.length);
    } while (nuevoIndice === indiceActual);
    return nuevoIndice;
}

// Función para cambiar la imagen con efecto de fade
function cambiarImagen(nuevoIndice) {
    carruselImg.style.opacity = '0';
    
    setTimeout(() => {
        indiceActual = nuevoIndice;
        carruselImg.src = imagenes[indiceActual];
        carruselImg.style.opacity = '1';
    }, 500);
}

// Función para ir a la imagen anterior
function imagenAnterior() {
    const nuevoIndice = indiceActual === 0 ? imagenes.length - 1 : indiceActual - 1;
    cambiarImagen(nuevoIndice);
}

// Función para ir a la siguiente imagen
function imagenSiguiente() {
    const nuevoIndice = obtenerIndiceAleatorio();
    cambiarImagen(nuevoIndice);
}

// Event listeners para los botones
prevBtn.addEventListener('click', imagenAnterior);
nextBtn.addEventListener('click', imagenSiguiente);

// Cambio automático de imagen cada 5 segundos
setInterval(imagenSiguiente, 5000);

// Precargar las imágenes
imagenes.forEach(src => {
    const img = new Image();
    img.src = src;
}); 