// Selecciona los elementos necesarios
const menuBtn = document.querySelector('#menu-btn i');
const nav = document.querySelector('#nav');

// Función para alternar el menú
function toggleMenu() {
  nav.classList.toggle('open');
  menuBtn.classList.toggle('fa-bars');
  menuBtn.classList.toggle('fa-times');
}

// Añade el evento click al botón del menú
document.querySelector('#menu-btn').addEventListener('click', toggleMenu);
