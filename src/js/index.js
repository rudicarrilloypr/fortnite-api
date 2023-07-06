import { getItems/* , getItemLikes */ } from './api.js';
import '../css/style.css';

document.addEventListener('DOMContentLoaded', async () => {
  const items = await getItems();
  // const likes = await getItemLikes();

  const itemsContainer = document.querySelector('#items');

  items.forEach((item) => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('item');
    itemElement.innerHTML = `
      <h2>${item.name}</h2>
      <img src="${item.images.icon}" alt="${item.name}">
      <p>${item.description}</p>
      <button>Comments</button>
    `;

    itemsContainer.appendChild(itemElement);
  });

  // Aquí puedes mostrar los likes en la página. Dependiendo de cómo quieras
  // mostrarlos, puede que necesites hacer algo más que simplemente iterar
  // sobre ellos y añadirlos al DOM.
  // eslint-disable-next-line no-unused-vars
  // likes.forEach((like) => {
  // Código para mostrar likes
  // });
});
