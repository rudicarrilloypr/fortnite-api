import { getItems, getItemLikes } from './api.js';
import '../css/style.css';

document.addEventListener('DOMContentLoaded', async () => {
  // eslint-disable-next-line no-unused-vars
  const items = await getItems();
  // eslint-disable-next-line no-unused-vars
  const likes = await getItemLikes();

  // Aquí deberías mostrar los items y los likes en la página.
});

// src/js/index.js
