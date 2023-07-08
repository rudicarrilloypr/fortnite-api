import {
  getItems, getItemLikes, postLike, postDislike,
} from './api.js';
import '../css/style.css';

document.addEventListener('DOMContentLoaded', async () => {
  const items = await getItems();
  const likes = await getItemLikes();

  const itemsContainer = document.querySelector('#items');
  const itemsCountElement = document.querySelector('#items-count');

  // Actualizar el contador de artículos
  itemsCountElement.textContent = `(${items.length})`;

  items.forEach((item) => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('item');

    const likeCount = likes.find((like) => like.item_id === item.id)?.likes || 0;

    itemElement.innerHTML = `
      <h2>${item.name}</h2>
      <img src="${item.images.icon}" alt="${item.name}">
      <p>${item.description}</p>
      <button>Comments</button>
      <div class="likes">
        <i class="far fa-thumbs-up like-btn" data-id="${item.id}"></i>
        <span class="like-count">${likeCount}</span>
      </div>
    `;

    itemsContainer.appendChild(itemElement);
  });

  itemsContainer.addEventListener('click', async (event) => {
    if (event.target.classList.contains('like-btn')) {
      const btn = event.target;
      const itemId = btn.dataset.id;
      const count = btn.nextElementSibling;

      if (btn.classList.contains('far')) {
        await postLike(itemId);
        btn.classList.remove('far');
        btn.classList.add('fas');
        count.textContent = Number(count.textContent) + 1;
      } else {
        await postDislike(itemId);
        btn.classList.remove('fas');
        btn.classList.add('far');
      }
    }
  });
});
