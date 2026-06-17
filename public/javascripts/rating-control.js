const RATING_LABELS = {
  1: 'Awful',
  2: 'Bad',
  3: 'Poor',
  4: 'Watchable',
  5: 'Okay',
  6: 'Good',
  7: 'Very Good',
  8: 'Great',
  9: 'Excellent',
  10: 'Masterpiece',
};

function getStepColorClass(score) {
  if (score >= 8) return 'high';
  if (score >= 5) return 'mid';
  if (score > 0) return 'low';
  return '';
}

function getBadgeColor(score) {
  if (score >= 8) return '#16a34a';
  if (score >= 5) return '#c9a227';
  if (score > 0) return '#c62828';
  return '';
}

function initRatingControl(container) {
  const steps = Array.from(container.querySelectorAll('.rating-step'));
  const badge = container.querySelector('.rating-badge');
  const label = container.querySelector('.rating-label');
  const input = container.querySelector('input[name="rating"]');

  if (!steps.length || !badge || !label || !input) return;

  let currentScore = parseInt(input.value, 10) || 0;

  function setTabstops(selectedScore) {
    steps.forEach((step) => {
      const stepScore = parseInt(step.dataset.score, 10);
      step.tabIndex = stepScore === (selectedScore || 1) ? 0 : -1;
    });
  }

  function updateRating(score) {
    currentScore = score;
    input.value = score;
    badge.textContent = score > 0 ? score : '–';
    label.textContent = score > 0
      ? `Selected score: ${score} out of 10, ${RATING_LABELS[score]}`
      : 'Select a score from 1 to 10';

    const colorClass = getStepColorClass(score);
    badge.classList.remove('low', 'mid', 'high');
    if (score > 0) badge.classList.add(colorClass);

    const badgeColor = getBadgeColor(score);
    if (badgeColor) {
      badge.style.backgroundColor = badgeColor;
      badge.style.color = score >= 5 && score < 8 ? '#111827' : '#ffffff';
    } else {
      badge.style.backgroundColor = '';
      badge.style.color = '';
    }

    steps.forEach((step) => {
      const stepScore = parseInt(step.dataset.score, 10);
      const isActive = stepScore <= score;
      const isSelected = stepScore === score;
      step.classList.toggle('active', isActive);
      step.classList.remove('low', 'mid', 'high');
      if (isActive) step.classList.add(colorClass);
      step.setAttribute('aria-checked', String(isSelected));
    });

    setTabstops(score);
  }

  function previewRating(score) {
    badge.textContent = score;
    label.textContent = `Preview: ${score} out of 10, ${RATING_LABELS[score]}`;
    const colorClass = getStepColorClass(score);
    steps.forEach((step) => {
      const stepScore = parseInt(step.dataset.score, 10);
      const isActive = stepScore <= score;
      step.classList.toggle('active', isActive);
      step.classList.remove('low', 'mid', 'high');
      if (isActive) step.classList.add(colorClass);
    });
  }

  steps.forEach((step) => {
    step.addEventListener('click', () => {
      updateRating(parseInt(step.dataset.score, 10));
    });

    step.addEventListener('mouseenter', () => {
      previewRating(parseInt(step.dataset.score, 10));
    });

    step.addEventListener('mouseleave', () => {
      updateRating(currentScore);
    });

    step.addEventListener('keydown', (event) => {
      const stepScore = parseInt(step.dataset.score, 10);
      let nextScore = stepScore;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          nextScore = Math.min(10, stepScore + 1);
          event.preventDefault();
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          nextScore = Math.max(1, stepScore - 1);
          event.preventDefault();
          break;
        case 'Home':
          nextScore = 1;
          event.preventDefault();
          break;
        case 'End':
          nextScore = 10;
          event.preventDefault();
          break;
        case ' ':
        case 'Enter':
          updateRating(stepScore);
          event.preventDefault();
          return;
        default:
          return;
      }

      const nextStep = steps.find((item) => parseInt(item.dataset.score, 10) === nextScore);
      if (nextStep) {
        nextStep.focus();
        updateRating(nextScore);
      }
    });
  });

  updateRating(currentScore);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-rating-control]').forEach(initRatingControl);
});
