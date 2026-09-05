// Theme module: applies the persisted light/dark choice (Storage.getTheme/setTheme) to the
// document root and the PWA theme-color meta tag. The dark amber "night shift" look is the
// default and needs no stored preference at all; light mode is an explicit opt-in, toggled from
// the Settings screen (see settings.js) and persisted across sessions from there.
const Theme = (() => {
  const DARK_THEME_COLOR = '#14120f';
  const LIGHT_THEME_COLOR = '#faf6ee';

  function apply(theme) {
    const t = theme || Storage.getTheme();
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? LIGHT_THEME_COLOR : DARK_THEME_COLOR);
  }

  function set(theme) {
    Storage.setTheme(theme);
    apply(theme);
  }

  return { apply, set, current: () => Storage.getTheme() };
})();
