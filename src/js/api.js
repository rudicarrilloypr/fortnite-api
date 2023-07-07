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
  const response = await fetch('https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/{4Ra3BPIlZ9RZb5SCWETK}/likes');
  const data = await response.json();
  return data;
}
