document.querySelectorAll('.password-toggle').forEach((button) => {
  const input = document.getElementById(button.dataset.target);
  if (!input) return;

  const showIcon = button.querySelector('.password-toggle-icon--show');
  const hideIcon = button.querySelector('.password-toggle-icon--hide');

  const toggle = () => {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    button.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    button.setAttribute('aria-pressed', String(isHidden));
    showIcon.hidden = isHidden;
    hideIcon.hidden = !isHidden;
  };

  button.addEventListener('click', toggle);
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  });
});
