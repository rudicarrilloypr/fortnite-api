import { getItems } from './api.js';
import '../css/style.css';

async function getComments(itemId) {
  const response = await fetch(`https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/4Ra3BPIlZ9RZb5SCWETK/comments?item_id=${itemId}`);

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('Item not found or has no comments.');
    }
    throw new Error(`An error has occurred: ${response.status}`);
  }

  return response.json();
}

async function getMostCommentedItems() {
  const items = await getItems();

  // Update the navigation bar with the number of items
  const itemsCountElement = document.querySelector('#items-count');
  itemsCountElement.textContent = `(${items.length})`;

  // Para cada item, obtén sus comentarios y añade el número de comentarios al item.
  await Promise.all(items.map(async (item) => {
    try {
      const comments = await getComments(item.id);
      item.numComments = comments.length;
    } catch (error) {
      if (error.message === 'Item not found or has no comments.') {
        // eslint-disable-next-line max-len
        item.numComments = 0; // Asumimos que no hay comentarios si el item no existe o no tiene comentarios.
      } else {
        // eslint-disable-next-line no-console
        console.error(`Error fetching comments for item ${item.id}: ${error}`);
        item.numComments = 0; // Asumimos que no hay comentarios si hay un error.
      }
    }
  }));

  // eslint-disable-next-line max-len
  // Ordena los items de acuerdo con el número de comentarios en orden descendente y selecciona los 5 primeros.
  const top5 = items.sort((a, b) => b.numComments - a.numComments).slice(0, 5);

  return top5;
}

window.addEventListener('DOMContentLoaded', async () => {
  const mostWantedContainer = document.querySelector('#most-wanted-items');

  const mostCommentedItems = await getMostCommentedItems();

  mostCommentedItems.forEach((item) => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('item');

    itemElement.innerHTML = `
      <img src="${item.images.icon}" alt="${item.name}">
      <p>${item.name}</p>
      <p>${item.numComments} comments</p>
    `;

    mostWantedContainer.appendChild(itemElement);
  });
});
