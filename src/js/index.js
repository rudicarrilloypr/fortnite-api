import {
  getNewCosmetics,
  getShopItems,
  getItemLikes,
  postLike,
  postComment,
  getComments,
} from './api.js';
import '../css/style.css';
import { setupMobileMenu } from './mobile.js';

const likedStorageKey = 'fortnite-liked-items';
const localLikesStorageKey = 'fortnite-local-like-counts';

const state = {
  activeView: 'shop',
  newItems: [],
  shopItems: [],
  likes: [],
  search: '',
  type: 'all',
  likedItems: new Set(JSON.parse(localStorage.getItem(likedStorageKey) || '[]')),
  localLikes: JSON.parse(localStorage.getItem(localLikesStorageKey) || '{}'),
};

const elements = {};

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
}[character]));

const formatDate = (date) => {
  if (!date) return '';

  return new Intl.DateTimeFormat('es-419', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
};

const getLikeCount = (itemId) => {
  const apiLikes = state.likes.find((like) => like.item_id === itemId)?.likes || 0;
  const localLikes = state.localLikes[itemId] || 0;

  return apiLikes + localLikes;
};

const getAllItems = () => [...state.newItems, ...state.shopItems];

const findItemById = (itemId) => getAllItems().find((item) => item.id === itemId);

const getFilteredItems = (items) => items.filter((item) => {
  const searchableText = `${item.name} ${item.description} ${item.type} ${item.rarity} ${item.section || ''}`.toLowerCase();
  const matchesSearch = searchableText.includes(state.search.toLowerCase());
  const matchesType = state.type === 'all' || item.type === state.type;

  return matchesSearch && matchesType;
});

const saveLikedItems = () => {
  localStorage.setItem(likedStorageKey, JSON.stringify([...state.likedItems]));
};

const saveLocalLikes = () => {
  localStorage.setItem(localLikesStorageKey, JSON.stringify(state.localLikes));
};

const getViewFromHash = () => {
  if (window.location.hash === '#new-section') return 'new';
  return 'shop';
};

const updateHashForView = (view) => {
  const nextHash = view === 'new' ? '#new-section' : '#shop-section';

  if (window.location.hash !== nextHash) {
    window.history.replaceState(null, '', nextHash);
  }
};

const renderLoading = (container) => {
  container.innerHTML = Array.from({ length: 8 }, () => `
    <article class="item skeleton-card">
      <div class="skeleton-media"></div>
      <div class="skeleton-line wide"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </article>
  `).join('');
};

const renderEmpty = (container, message) => {
  container.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-search"></i>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
};

const createItemCard = (item) => {
  const liked = state.likedItems.has(item.id);
  const price = item.price ? `
    <span class="price-pill">
      <img src="https://fortnite-api.com/images/vbuck.png" alt="" aria-hidden="true">
      ${item.price}
    </span>
  ` : '';
  const outDate = item.outDate ? `<span class="date-pill">Sale ${escapeHtml(formatDate(item.outDate))}</span>` : '';

  return `
    <article class="item" data-id="${escapeHtml(item.id)}">
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
        <div class="item-badges">
          ${price}
          ${outDate}
          ${item.section ? `<span>${escapeHtml(item.section)}</span>` : ''}
        </div>
        <div class="button-row">
          <button class="item-btn" type="button" data-action="details" data-id="${escapeHtml(item.id)}">
            <i class="fas fa-info-circle" aria-hidden="true"></i>
            Detalles
          </button>
          <button class="like-btn ${liked ? 'is-liked' : ''}" type="button" data-action="like" data-id="${escapeHtml(item.id)}" aria-pressed="${liked}">
            <i class="${liked ? 'fas' : 'far'} fa-thumbs-up" aria-hidden="true"></i>
            <span>${getLikeCount(item.id)}</span>
          </button>
        </div>
      </div>
    </article>
  `;
};

const renderTypeOptions = () => {
  const selectedType = state.type;
  const types = [...new Set(getAllItems().map((item) => item.type).filter(Boolean))].sort();

  elements.typeFilter.innerHTML = [
    '<option value="all">Todos los tipos</option>',
    ...types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`),
  ].join('');

  elements.typeFilter.value = types.includes(selectedType) ? selectedType : 'all';
  state.type = elements.typeFilter.value;
};

const renderList = () => {
  const activeItems = state.activeView === 'shop' ? state.shopItems : state.newItems;
  const target = state.activeView === 'shop' ? elements.shopGrid : elements.itemsGrid;
  const filteredItems = getFilteredItems(activeItems);

  elements.newSection.hidden = state.activeView !== 'new';
  elements.shopSection.hidden = state.activeView !== 'shop';
  elements.visibleCount.textContent = filteredItems.length;

  elements.tabs.forEach((tab) => {
    const isActive = tab.dataset.view === state.activeView;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', isActive);
  });

  if (!filteredItems.length) {
    renderEmpty(target, 'No hay cosmeticos con esos filtros.');
    return;
  }

  target.innerHTML = filteredItems.map(createItemCard).join('');
};

const setActiveView = (view, shouldUpdateHash = true) => {
  state.activeView = view;
  if (shouldUpdateHash) updateHashForView(view);
  renderList();
};

const renderStats = () => {
  elements.itemsCount.textContent = `(${state.newItems.length})`;
  elements.newCount.textContent = state.newItems.length;
  elements.shopCount.textContent = state.shopItems.length;
};

const renderDashboard = () => {
  renderTypeOptions();
  renderStats();
  renderList();
};

const renderError = (message) => {
  const errorMessage = message || 'No se pudo conectar con la API de Fortnite.';

  renderEmpty(elements.itemsGrid, errorMessage);
  renderEmpty(elements.shopGrid, errorMessage);
  elements.visibleCount.textContent = 0;
};

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
      <div class="modal-facts">
        ${item.set ? `<span>${escapeHtml(item.set)}</span>` : ''}
        ${item.introduction ? `<span>${escapeHtml(item.introduction)}</span>` : ''}
        ${item.price ? `<span>${item.price} V-Bucks</span>` : ''}
      </div>
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

const handleLike = async (button) => {
  const itemId = button.dataset.id;
  const count = button.querySelector('span');
  const icon = button.querySelector('i');
  const currentCount = Number(count.textContent);

  if (state.likedItems.has(itemId)) {
    state.likedItems.delete(itemId);
    saveLikedItems();

    if (state.localLikes[itemId]) {
      state.localLikes[itemId] -= 1;

      if (state.localLikes[itemId] <= 0) {
        delete state.localLikes[itemId];
      }

      saveLocalLikes();
    }

    count.textContent = Math.max(currentCount - 1, 0);
    button.classList.remove('is-liked');
    button.setAttribute('aria-pressed', 'false');
    icon.classList.remove('fas');
    icon.classList.add('far');
    return;
  }

  button.disabled = true;

  try {
    await postLike(itemId);
  } catch (error) {
    state.localLikes[itemId] = (state.localLikes[itemId] || 0) + 1;
    saveLocalLikes();
  } finally {
    state.likedItems.add(itemId);
    saveLikedItems();

    count.textContent = currentCount + 1;
    button.classList.add('is-liked');
    button.setAttribute('aria-pressed', 'true');
    icon.classList.remove('far');
    icon.classList.add('fas');
    button.disabled = false;
  }
};

const handleMainClick = async (event) => {
  const detailsButton = event.target.closest('[data-action="details"]');
  const likeButton = event.target.closest('[data-action="like"]');

  if (detailsButton) {
    const item = findItemById(detailsButton.dataset.id);
    if (item) await openModal(item);
    return;
  }

  if (likeButton) {
    await handleLike(likeButton);
  }
};

const handleCommentSubmit = async (event) => {
  event.preventDefault();

  const { itemId } = elements.commentForm.dataset;
  const name = elements.nameInput.value.trim();
  const comment = elements.commentInput.value.trim();

  if (!itemId || !name || !comment) {
    return;
  }

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
  elements.main = document.querySelector('main');
  elements.itemsGrid = document.querySelector('#items');
  elements.shopGrid = document.querySelector('#shop-items');
  elements.itemsCount = document.querySelector('#items-count');
  elements.newCount = document.querySelector('#new-count');
  elements.shopCount = document.querySelector('#shop-count');
  elements.visibleCount = document.querySelector('#visible-count');
  elements.searchInput = document.querySelector('#search-input');
  elements.typeFilter = document.querySelector('#type-filter');
  elements.tabs = [...document.querySelectorAll('[data-view]')];
  elements.newSection = document.querySelector('#new-section');
  elements.shopSection = document.querySelector('#shop-section');
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
  elements.main.addEventListener('click', handleMainClick);
  elements.searchInput.addEventListener('input', (event) => {
    state.search = event.target.value.trim();
    renderList();
  });
  elements.typeFilter.addEventListener('change', (event) => {
    state.type = event.target.value;
    renderList();
  });
  elements.tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setActiveView(tab.dataset.view);
    });
  });
  window.addEventListener('hashchange', () => {
    setActiveView(getViewFromHash(), false);
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

const loadDashboard = async () => {
  renderLoading(elements.itemsGrid);
  renderLoading(elements.shopGrid);

  try {
    const [newItems, shopItems, likes] = await Promise.all([
      getNewCosmetics(),
      getShopItems(),
      getItemLikes(),
    ]);

    state.newItems = newItems;
    state.shopItems = shopItems;
    state.likes = likes;
    renderDashboard();
  } catch (error) {
    renderError(error.message);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  cacheElements();
  setupMobileMenu();
  bindEvents();
  state.activeView = getViewFromHash();
  await loadDashboard();
});
