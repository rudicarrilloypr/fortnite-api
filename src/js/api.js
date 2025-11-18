const FORTNITE_API_URL = 'https://fortniteapi.io/v2/items/upcoming?lang=en';
const FORTNITE_API_KEY = '3441f5c5-c1f6baf9-b16840a7-0c44af1f';

export async function getItems() {
  const response = await fetch(FORTNITE_API_URL, {
    headers: {
      Authorization: FORTNITE_API_KEY,
    },
  });

  if (!response.ok) {
    console.error('Fortnite API error:', response.status, response.statusText);
    throw new Error('No se pudieron obtener los items');
  }

  const data = await response.json();

  // La API nueva devuelve { items: [...] }
  if (data && data.items) {
    return data.items;
  }

  throw new Error('No se pudieron obtener los items');
}

export async function getItemLikes() {
  let likes;
  try {
    const response = await fetch('https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/4Ra3BPIlZ9RZb5SCWETK/likes');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (response.headers.get('content-length') === '0' || response.status === 204) {
      likes = [];
    } else {
      likes = await response.json();
    }
  } catch (error) {
    likes = [];
  }
  return likes;
}

export async function postLike(itemId) {
  const response = await fetch('https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/4Ra3BPIlZ9RZb5SCWETK/likes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ item_id: itemId }),
  });

  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }
}

export async function postDislike(itemId) {
  const response = await fetch('https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/4Ra3BPIlZ9RZb5SCWETK/dislikes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ item_id: itemId }),
  });

  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }
}

export async function postComment(itemId, name, comment) {
  const response = await fetch('https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/4Ra3BPIlZ9RZb5SCWETK/comments', {
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

  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }
}

export async function getComments(itemId) {
  const response = await fetch(`https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/4Ra3BPIlZ9RZb5SCWETK/comments?item_id=${itemId}`);

  if (!response.ok) {
    const message = `An error has occurred: ${response.status}`;
    throw new Error(message);
  }

  const comments = await response.json();
  return comments;
}
