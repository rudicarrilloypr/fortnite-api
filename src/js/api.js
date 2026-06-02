const FORTNITE_API_BASE_URL = 'https://fortnite-api.com/v2';
const DEFAULT_LANGUAGE = 'es-419';
const INVOLVEMENT_API_BASE_URL = 'https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/4Ra3BPIlZ9RZb5SCWETK';
const REQUEST_TIMEOUT = 18000;

const fetchJson = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      let apiMessage = response.statusText;

      try {
        const error = await response.json();
        apiMessage = error.error || error.message || apiMessage;
      } catch (parseError) {
        apiMessage = response.statusText;
      }

      throw new Error(apiMessage || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    const text = await response.text();

    if (!text) {
      return null;
    }

    return JSON.parse(text);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('La API tardo demasiado en responder.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const fortniteUrl = (path) => `${FORTNITE_API_BASE_URL}${path}?language=${DEFAULT_LANGUAGE}`;

const readImage = (item) => {
  if (!item) return '';

  return item.images?.featured
    || item.images?.icon
    || item.images?.smallIcon
    || item.images?.large
    || item.images?.small
    || item.albumArt
    || '';
};

const readType = (item) => {
  if (item?.artist) return 'Jam Track';
  return item?.type?.displayValue || item?.type?.value || 'Cosmetico';
};

const readRarity = (item) => item?.series?.value
  || item?.rarity?.displayValue
  || item?.rarity?.value
  || 'Especial';

const normalizeCosmetic = (item, source = 'new') => ({
  id: item.id || item.vehicleId || `${item.name || item.title}-${item.added || source}`,
  name: item.name || item.title || 'Cosmetico sin nombre',
  description: item.description || (item.artist ? `${item.artist}${item.releaseYear ? ` (${item.releaseYear})` : ''}` : 'Cosmetico de Fortnite.'),
  image: readImage(item),
  type: readType(item),
  rarity: readRarity(item),
  set: item.set?.value || '',
  introduction: item.introduction?.text || '',
  added: item.added || '',
  source,
  raw: item,
});

const flattenNewCosmetics = (itemsByCategory = {}) => Object.entries(itemsByCategory)
  .flatMap(([category, items]) => (Array.isArray(items) ? items : [])
    .map((item) => ({
      ...normalizeCosmetic(item, 'new'),
      category,
    })))
  .filter((item) => item.id && item.name && item.image);

const getFirstEntryItem = (entry) => {
  const collections = [
    entry.brItems,
    entry.tracks,
    entry.instruments,
    entry.cars,
    entry.lego,
    entry.legoKits,
    entry.beans,
  ];

  const firstCollection = collections
    .find((collection) => Array.isArray(collection) && collection.length);

  return firstCollection?.[0] || null;
};

const getEntryImage = (entry, item) => {
  const displayAsset = entry.newDisplayAsset?.renderImages
    ?.find((image) => image.image);
  const displayAssetImage = displayAsset?.image;

  return displayAssetImage || readImage(item);
};

const normalizeShopEntry = (entry) => {
  const item = getFirstEntryItem(entry);
  const normalized = normalizeCosmetic(item || {}, 'shop');

  return {
    ...normalized,
    id: item?.id || item?.vehicleId || entry.offerId,
    name: normalized.name === 'Cosmetico sin nombre' ? entry.devName || 'Oferta de tienda' : normalized.name,
    image: getEntryImage(entry, item),
    price: entry.finalPrice,
    regularPrice: entry.regularPrice,
    section: entry.layout?.name || 'Tienda',
    inDate: entry.inDate || '',
    outDate: entry.outDate || '',
    offerId: entry.offerId,
  };
};

export async function getNewCosmetics() {
  const response = await fetchJson(fortniteUrl('/cosmetics/new'));
  const items = flattenNewCosmetics(response?.data?.items);

  return items.sort((a, b) => new Date(b.added) - new Date(a.added));
}

export async function getShopItems() {
  const response = await fetchJson(fortniteUrl('/shop'));
  const entries = response?.data?.entries || [];

  return entries
    .map(normalizeShopEntry)
    .filter((item) => item.id && item.name && item.image);
}

export async function getItems() {
  return getNewCosmetics();
}

export async function getItemLikes() {
  try {
    const likes = await fetchJson(`${INVOLVEMENT_API_BASE_URL}/likes`);
    return Array.isArray(likes) ? likes : [];
  } catch (error) {
    return [];
  }
}

export async function postLike(itemId) {
  await fetchJson(`${INVOLVEMENT_API_BASE_URL}/likes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ item_id: itemId }),
  });
}

export async function postComment(itemId, name, comment) {
  await fetchJson(`${INVOLVEMENT_API_BASE_URL}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      item_id: itemId,
      username: name,
      comment,
    }),
  });
}

export async function getComments(itemId) {
  try {
    const comments = await fetchJson(`${INVOLVEMENT_API_BASE_URL}/comments?item_id=${encodeURIComponent(itemId)}`);
    return Array.isArray(comments) ? comments : [];
  } catch (error) {
    if (/not found|no comments|400/i.test(error.message)) {
      return [];
    }

    throw error;
  }
}
