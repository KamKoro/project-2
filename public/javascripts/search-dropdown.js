const DEBOUNCE_MS = 250;

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function initSearchDropdown(container) {
  const input = container.querySelector('input[type="search"]');
  const panel = container.querySelector('.search-dropdown-panel');
  const mode = container.dataset.searchMode || 'all';
  const formAction = container.dataset.searchAction || '';

  if (!input || !panel) return;

  let activeIndex = -1;
  let currentItems = [];

  function closePanel() {
    panel.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
    currentItems = [];
  }

  function openPanel() {
    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function renderResults(data) {
    const groups = data.groups || [];
    currentItems = [];

    if (!groups.length) {
      panel.innerHTML = '<p class="search-dropdown-empty">No results found</p>';
      openPanel();
      return;
    }

    panel.innerHTML = groups.map((group) => {
      const itemsHtml = group.items.map((item) => {
        const index = currentItems.length;
        currentItems.push(item);
        return `
          <a
            href="${escapeHtml(item.url)}"
            class="search-dropdown-item"
            role="option"
            data-index="${index}"
          >
            <span class="search-dropdown-item-title">${escapeHtml(item.title)}</span>
            ${item.meta ? `<span class="search-dropdown-item-meta">${escapeHtml(item.meta)}</span>` : ''}
          </a>
        `;
      }).join('');

      return `
        <div class="search-dropdown-group">
          <p class="search-dropdown-group-label">${escapeHtml(group.label)}</p>
          ${itemsHtml}
        </div>
      `;
    }).join('');

    openPanel();
    highlightItem(-1);
  }

  function highlightItem(index) {
    activeIndex = index;
    panel.querySelectorAll('.search-dropdown-item').forEach((el, i) => {
      el.classList.toggle('is-active', i === index);
    });
  }

  const fetchResults = debounce(async (query) => {
    if (query.trim().length < 2) {
      closePanel();
      panel.innerHTML = '';
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&mode=${encodeURIComponent(mode)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      renderResults(data);
    } catch (err) {
      panel.innerHTML = '<p class="search-dropdown-empty">Search unavailable</p>';
      openPanel();
    }
  }, DEBOUNCE_MS);

  input.addEventListener('input', () => {
    fetchResults(input.value);
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 2) {
      fetchResults(input.value);
    }
  });

  input.addEventListener('keydown', (event) => {
    if (panel.hidden) return;

    const items = panel.querySelectorAll('.search-dropdown-item');
    if (!items.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlightItem(Math.min(activeIndex + 1, items.length - 1));
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlightItem(Math.max(activeIndex - 1, 0));
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      window.location.href = currentItems[activeIndex].url;
    } else if (event.key === 'Escape') {
      closePanel();
    }
  });

  panel.addEventListener('mousemove', (event) => {
    const item = event.target.closest('.search-dropdown-item');
    if (!item) return;
    highlightItem(Number(item.dataset.index));
  });

  document.addEventListener('click', (event) => {
    if (!container.contains(event.target)) {
      closePanel();
    }
  });

  const form = container.closest('form');
  if (form && formAction) {
    form.addEventListener('submit', (event) => {
      if (activeIndex >= 0 && currentItems[activeIndex]) {
        event.preventDefault();
        window.location.href = currentItems[activeIndex].url;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-search-dropdown]').forEach(initSearchDropdown);
});
