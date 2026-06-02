import { getNewCosmetics, getComments, postComment } from './api.js';
import '../css/style.css';
import { setupMobileMenu } from './mobile.js';

const state = {
  items: [],
};

const elements = {};

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
}[character]));

const renderLoading = () => {
  elements.container.innerHTML = Array.from({ length: 5 }, () => `
    <article class="item skeleton-card">
      <div class="skeleton-media"></div>
      <div class="skeleton-line wide"></div>
      <div class="skeleton-line"></div>
    </article>
  `).join('');
};

const renderEmpty = (message) => {
  elements.container.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-comments"></i>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
};

const getMostCommentedItems = async () => {
  const items = await getNewCosmetics();

  const withComments = await Promise.all(items.map(async (item) => {
    try {
      const itemComments = await getComments(item.id);
      return {
        ...item,
        commentsCount: itemComments.length,
      };
    } catch (error) {
      return {
        ...item,
        commentsCount: 0,
      };
    }
  }));

  return withComments
    .sort((a, b) => b.commentsCount - a.commentsCount)
    .slice(0, 8);
};

const renderItems = () => {
  if (!state.items.length) {
    renderEmpty('Todavia no hay cosmeticos comentados.');
    return;
  }

  elements.container.innerHTML = state.items.map((item, index) => `
    <article class="item wanted-card" data-id="${escapeHtml(item.id)}">
      <span class="rank-badge">#${index + 1}</span>
      <div class="item-art">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">
      </div>
      <div class="item-copy">
        <div class="item-meta">
          <span>${escapeHtml(item.type)}</span>
          <span>${escapeHtml(item.rarity)}</span>
        </div>
        <h2>${escapeHtml(item.name)}</h2>
        <p>${escapeHtml(item.description)}</p>
      </div>
      <div class="item-actions">
        <span class="comments-count">
          <i class="fas fa-comments" aria-hidden="true"></i>
          ${item.commentsCount}
        </span>
        <button class="item-btn" type="button" data-action="details" data-id="${escapeHtml(item.id)}">
          <i class="fas fa-info-circle" aria-hidden="true"></i>
          Detalles
        </button>
      </div>
    </article>
  `).join('');
};

const findItemById = (itemId) => state.items.find((item) => item.id === itemId);

const openModal = async (item) => {
  elements.modalBody.innerHTML = `
    <div class="modal-item-art">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
    </div>
    <div class="modal-item-copy">
      <div class="item-meta">
        <span>${escapeHtml(item.type)}</span>
        <span>${escapeHtml(item.rarity)}</span>
      </div>
      <h2 id="modal-title">${escapeHtml(item.name)}</h2>
      <p>${escapeHtml(item.description)}</p>
    </div>
  `;
  elements.commentForm.dataset.itemId = item.id;
  elements.comments.innerHTML = '<p class="muted">Cargando comentarios...</p>';
  elements.modal.classList.add('show');
  elements.modal.setAttribute('aria-hidden', 'false');

  try {
    const comments = await getComments(item.id);

    if (!comments.length) {
      elements.comments.innerHTML = '<p class="muted">Sin comentarios todavia.</p>';
      return;
    }

    elements.comments.innerHTML = comments.map((comment) => `
      <p><strong>${escapeHtml(comment.username)}:</strong> ${escapeHtml(comment.comment)}</p>
    `).join('');
  } catch (error) {
    elements.comments.innerHTML = '<p class="muted">No se pudieron cargar los comentarios.</p>';
  }
};

const closeModal = () => {
  elements.modal.classList.remove('show');
  elements.modal.setAttribute('aria-hidden', 'true');
  elements.modalBody.innerHTML = '';
  elements.comments.innerHTML = '';
  elements.commentForm.reset();
};

const handleCommentSubmit = async (event) => {
  event.preventDefault();

  const { itemId } = elements.commentForm.dataset;
  const name = elements.nameInput.value.trim();
  const comment = elements.commentInput.value.trim();

  if (!itemId || !name || !comment) return;

  elements.submitComment.disabled = true;

  try {
    await postComment(itemId, name, comment);

    const emptyMessage = elements.comments.querySelector('.muted');
    if (emptyMessage) emptyMessage.remove();

    const newComment = document.createElement('p');
    const author = document.createElement('strong');

    author.textContent = `${name}:`;
    newComment.appendChild(author);
    newComment.append(` ${comment}`);
    elements.comments.appendChild(newComment);
    elements.commentForm.reset();
  } finally {
    elements.submitComment.disabled = false;
  }
};

const cacheElements = () => {
  elements.container = document.querySelector('#most-wanted-items');
  elements.itemsCount = document.querySelector('#items-count');
  elements.modal = document.querySelector('#myModal');
  elements.modalBody = document.querySelector('#modal-body');
  elements.comments = document.querySelector('#comments');
  elements.closeModal = document.querySelector('.close');
  elements.commentForm = document.querySelector('#comment-form');
  elements.nameInput = document.querySelector('#name');
  elements.commentInput = document.querySelector('#comment');
  elements.submitComment = document.querySelector('#submit-comment');
};

const bindEvents = () => {
  elements.container.addEventListener('click', async (event) => {
    const detailsButton = event.target.closest('[data-action="details"]');
    if (!detailsButton) return;

    const item = findItemById(detailsButton.dataset.id);
    if (item) await openModal(item);
  });
  elements.closeModal.addEventListener('click', closeModal);
  elements.modal.addEventListener('click', (event) => {
    if (event.target === elements.modal) closeModal();
  });
  elements.commentForm.addEventListener('submit', handleCommentSubmit);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && elements.modal.classList.contains('show')) {
      closeModal();
    }
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  cacheElements();
  setupMobileMenu();
  bindEvents();
  renderLoading();

  try {
    state.items = await getMostCommentedItems();
    elements.itemsCount.textContent = `(${state.items.length})`;
    renderItems();
  } catch (error) {
    renderEmpty('No se pudo conectar con la API de Fortnite.');
  }
});
