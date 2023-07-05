import { getItems, getItemLikes } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const items = await getItems();
  const likes = await getItemLikes();

  // Aquí deberías mostrar los items y los likes en la página.
});

// src/js/index.js

import '../css/style.css';
