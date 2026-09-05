// Settings screen: currently just the appearance (light/dark) toggle. The dark amber "night
// shift" theme is deliberately the default (chosen for low eye strain), so this only ever offers
// light as an explicit, persisted opt-in — never an automatic switch based on system preference.
// Applying the choice is Theme.apply()'s job (see theme.js); this screen just calls Theme.set()
// and re-renders to reflect the new selection immediately, no reload needed.
const Settings = (() => {
  let root = null;

  function html() {
    return `
      <div class="lamp"></div>
      <h1>Settings</h1>
      <div class="sub">App preferences</div>
      <div class="mastery-list-title">Appearance</div>
      <div class="theme-options" id="themeOptions"></div>
    `;
  }

  function buildThemeOptions() {
    const current = Theme.current();
    const el = root.querySelector('#themeOptions');
    el.innerHTML = `
      <div class="theme-option ${current === 'dark' ? 'active' : ''}" id="darkOption">
        <div class="to-swatch" style="background: linear-gradient(135deg, #14120f, #23201a);"></div>
        &#127769; Dark <span style="display:block;">(Night Shift)</span>
      </div>
      <div class="theme-option ${current === 'light' ? 'active' : ''}" id="lightOption">
        <div class="to-swatch" style="background: linear-gradient(135deg, #faf6ee, #ffffff);"></div>
        &#9728;&#65039; Light
      </div>
    `;
    root.querySelector('#darkOption').onclick = () => { Theme.set('dark'); buildThemeOptions(); };
    root.querySelector('#lightOption').onclick = () => { Theme.set('light'); buildThemeOptions(); };
  }

  function mount(container) {
    root = container;
    root.innerHTML = html();
    buildThemeOptions();
  }

  return { mount };
})();
