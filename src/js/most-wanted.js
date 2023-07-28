import { getItems, getComments, postComment } from './api.js';
import '../css/style.css';
import { toggleMenuDisplay, toggleMenuIcon } from './mobile.js';

const menuButton = document.querySelector('#menu-btn');

if (menuButton) { // solo agregar los event listeners si el botón existe
  menuButton.addEventListener('click', toggleMenuDisplay);
  menuButton.addEventListener('click', toggleMenuIcon);
}

const comments = {};

async function getMostCommentedItems() {
  const items = await getItems();
  const itemsCountElement = document.querySelector('#items-count');
  itemsCountElement.textContent = `(${items.length})`;

  await Promise.all(items.map(async (item) => {
    try {
      const itemComments = await getComments(item.id);
      item.numComments = itemComments.length;
    } catch (error) {
      if (error.message === 'Item not found or has no comments.') {
        item.numComments = 0;
      } else {
        // eslint-disable-next-line no-console
        console.error(`Error fetching comments for item ${item.id}: ${error}`);
        item.numComments = 0;
      }
    }
  }));

  const top5 = items.sort((a, b) => b.numComments - a.numComments).slice(0, 5);
  return top5;
}

window.addEventListener('DOMContentLoaded', async () => {
  const mostWantedContainer = document.querySelector('#most-wanted-items');
  const mostCommentedItems = await getMostCommentedItems();

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

  mostCommentedItems.forEach((item) => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('item');

    itemElement.innerHTML = `
      <img src="${item.images.icon}" alt="${item.name}">
      <p>${item.name}</p>
      <p>${item.numComments} comments</p>
    `;

    itemElement.addEventListener('click', async () => {
      const itemImage = itemElement.querySelector('img').src;

      modalItemImage = document.createElement('img');
      modalItemImage.id = 'item-image';
      modalItemImage.src = itemImage;
      modalItemImage.className = 'modal-image';

      commentForm.parentElement.insertBefore(modalItemImage, commentForm);

      const itemId = item.id;

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
    });

    mostWantedContainer.appendChild(itemElement);
  });
});
