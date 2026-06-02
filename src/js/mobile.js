const getMenuElements = () => ({
  button: document.querySelector('#menu-btn'),
  icon: document.querySelector('#menu-btn i'),
  nav: document.querySelector('#nav'),
});

export function toggleMenuDisplay() {
  const { nav } = getMenuElements();
  if (nav) nav.classList.toggle('open');
}

export function toggleMenuIcon() {
  const { icon } = getMenuElements();
  if (!icon) return;

  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-times');
}

export function setupMobileMenu() {
  const { button } = getMenuElements();
  if (!button) return;

  button.addEventListener('click', () => {
    toggleMenuDisplay();
    toggleMenuIcon();
  });
}
