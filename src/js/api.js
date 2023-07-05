export async function getItems() {
  const response = await fetch('https://fortnite-api.com/v2/cosmetics/br');
  const data = await response.json();
  return data.data;
}

export async function getItemLikes() {
  const response = await fetch('https://us-central1-involvement-api.cloudfunctions.net/capstoneApi/apps/{e81cf926-7848-4d1c-8186-e0289c745093}/likes');
  const data = await response.json();
  return data;
}
