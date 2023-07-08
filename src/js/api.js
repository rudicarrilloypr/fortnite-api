export async function getItems() {
  const response = await fetch('https://fortnite-api.com/v2/cosmetics/br/new');
  const data = await response.json();

  // Asegúrate de que los datos existen antes de devolverlos
  if (data && data.data && data.data.items) {
    return data.data.items;
  }
  throw new Error('No se pudieron obtener los items');
}

export async function getItemLikes() {
  let likes;
  try {
    const response = await fetch('https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/4Ra3BPIlZ9RZb5SCWETK/likes');

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response is not empty
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
