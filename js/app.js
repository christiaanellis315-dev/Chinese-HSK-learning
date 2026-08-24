// App shell: router between the six screens, plus the persistent bottom nav. The book selector
// (HSK1/HSK2/HSK3) lives inside Dashboard itself, not here — see dashboard.js.
(function () {
  const NAV_ITEMS = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'lessons', icon: '📖', label: 'Lessons' },
    { id: 'review', icon: '🔁', label: 'Review' },
    { id: 'games', icon: '🎮', label: 'Games' },
    { id: 'grammar', icon: '📝', label: 'Grammar' },
    { id: 'pinyin', icon: '🔤', label: 'Pinyin' },
  ];

  let currentScreen = 'dashboard';
  const screenEl = document.getElementById('screen');
  const navEl = document.getElementById('bottomNav');

  function buildNav() {
    navEl.innerHTML = NAV_ITEMS.map(item => `
      <button class="nav-item ${currentScreen === item.id ? 'active' : ''}" data-id="${item.id}">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
      </button>
    `).join('');
    navEl.querySelectorAll('.nav-item').forEach(btn => {
      btn.onclick = () => navigate(btn.dataset.id);
    });
  }

  function navigate(screen, opts) {
    Recorder.cleanup(); // never carry a mic recording/stream across screens
    currentScreen = screen;
    buildNav();
    window.scrollTo(0, 0);
    if (screen === 'dashboard') Dashboard.mount(screenEl, navigate);
    else if (screen === 'lessons') Lessons.mount(screenEl, opts, navigate);
    else if (screen === 'review') Review.mount(screenEl);
    else if (screen === 'games') Games.mount(screenEl, navigate);
    else if (screen === 'grammar') Grammar.mount(screenEl);
    else if (screen === 'pinyin') Pinyin.mount(screenEl);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
  }

  navigate('dashboard');
})();
