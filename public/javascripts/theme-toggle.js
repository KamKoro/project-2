function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function updateToggleButton(theme) {
  const button = document.getElementById('theme-toggle');
  if (!button) return;

  const isDark = theme === 'dark';
  button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  button.setAttribute('aria-pressed', String(!isDark));

  const sunIcon = button.querySelector('.theme-toggle-icon--sun');
  const moonIcon = button.querySelector('.theme-toggle-icon--moon');
  if (sunIcon) sunIcon.hidden = !isDark;
  if (moonIcon) moonIcon.hidden = isDark;
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('scene-it-theme', theme);
  document.documentElement.style.colorScheme = theme;
  updateToggleButton(theme);
}

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('theme-toggle');
  applyTheme(getTheme());

  button?.addEventListener('click', () => {
    applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });
});
