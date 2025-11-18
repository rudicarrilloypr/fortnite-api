import { getItems } from './api.js';

let items = [];

export const fetchItems = async () => {
  items = await getItems();
};

export const handleItemClick = (event) => {
  let itemElement = event.target;
  while (itemElement && !itemElement.classList.contains('item')) {
    itemElement = itemElement.parentElement;
  }

  if (itemElement) {
    const itemId = itemElement.dataset.id;
    const item = items.find((i) => i.id === itemId);

    const itemModal = document.getElementById('itemModal');

    itemModal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <img src="${item.images.icon}" alt="${item.name}">
        <h2>${item.name}</h2>
        <p>${item.description}</p>
        <p>Type: ${item.type.displayValue}</p>
        <p>Rarity: ${item.rarity.displayValue}</p>
        <p>Introduced in: Chapter ${item.introduction.chapter}, Season ${item.introduction.season}</p>
      </div>
    `;

    itemModal.classList.add('show');
    const span = itemModal.getElementsByClassName('close')[0];

    span.onclick = () => {
      itemModal.classList.remove('show');
    };

    window.onclick = (event) => {
      if (event.target === itemModal) {
        itemModal.classList.remove('show');
      }
    };
  }
};
