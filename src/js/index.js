import {
  getItems, getItemLikes, postLike, postDislike, postComment, getComments,
} from './api.js';
import '../css/style.css';
import { toggleMenuDisplay, toggleMenuIcon } from './mobile.js';

const menuButton = document.querySelector('#menu-btn');

if (menuButton) { // solo agregar los event listeners si el botón existe
  menuButton.addEventListener('click', toggleMenuDisplay);
  menuButton.addEventListener('click', toggleMenuIcon);
}

const comments = {};

document.addEventListener('DOMContentLoaded', async () => {
  const items = await getItems();
  const likes = await getItemLikes();

  const itemsContainer = document.querySelector('#items');
  const itemsCountElement = document.querySelector('#items-count');

  itemsCountElement.textContent = `(${items.length})`;

  items.forEach((item) => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('item');

    const likeCount = likes.find((like) => like.item_id === item.id)?.likes || 0;

    itemElement.innerHTML = `
      <h2>${item.name}</h2>
      <img src="${item.images.icon}" alt="${item.name}">
      <p>${item.description}</p>
      <button class="item-btn" data-id="${item.id}">I want it!</button>
      <div class="likes">
        <i class="far fa-thumbs-up like-btn" data-id="${item.id}"></i>
        <span class="like-count">${likeCount}</span>
      </div>
    `;

    itemsContainer.appendChild(itemElement);
  });

  const modal = document.getElementById('myModal');
  const span = document.getElementsByClassName('close')[0];
  const commentForm = document.getElementById('comment-form');
  const commentsContainer = document.getElementById('comments');

  let modalItemImage = null;

  const closeModal = () => {
    modal.classList.remove('show');
    commentsContainer.innerHTML = '';
    if (modalItemImage) {
      modalItemImage.remove();
    }
  };

  const closeModalOnOutsideClick = (event) => {
    if (event.target === modal) {
      closeModal();
    }
  };

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
        count.textContent = Number(count.textContent) - 1;
      }
    }

    if (event.target.classList.contains('item-btn')) {
      const button = event.target;
      // Aquí cambiamos la forma de obtener la imagen.
      const itemImage = button.parentElement.querySelector('img').src;

      modalItemImage = document.createElement('img');
      modalItemImage.id = 'item-image';
      modalItemImage.src = itemImage;
      modalItemImage.className = 'modal-image';

      commentForm.parentElement.insertBefore(modalItemImage, commentForm);

      const itemId = button.dataset.id;

      // Limpiamos el contenedor de comentarios.
      commentsContainer.innerHTML = '';

      let itemComments = [];
      try {
        itemComments = await getComments(itemId);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error fetching comments: ${error}`);
      }

      itemComments.forEach((comment) => {
        const commentElement = document.createElement('p');
        commentElement.textContent = `${comment.username}: ${comment.comment}`;
        commentsContainer.appendChild(commentElement);
      });

      modal.classList.add('show');

      span.onclick = closeModal;

      window.onclick = closeModalOnOutsideClick;

      commentForm.onsubmit = async (event) => {
        event.preventDefault();

        const nameElement = document.getElementById('name');
        const commentElement = document.getElementById('comment');

        const name = nameElement.value;
        const comment = commentElement.value;

        try {
          await postComment(itemId, name, comment);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Error posting comment: ${error}`);
        }

        if (!comments[itemId]) {
          comments[itemId] = [];
        }
        comments[itemId].push({
          username: name,
          comment,
        });

        const newCommentElement = document.createElement('p');
        newCommentElement.textContent = `${name}: ${comment}`;
        commentsContainer.appendChild(newCommentElement);

        nameElement.value = '';
        commentElement.value = '';
      };
    }
  });
});
