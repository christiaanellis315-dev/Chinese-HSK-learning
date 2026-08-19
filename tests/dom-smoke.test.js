// DOM smoke tests: mount every screen module for real and confirm nothing throws and the basic
// shell renders. This formalizes the manual "click through every mode/lesson in the Browser
// tool" pass that used to happen once per feature, by hand, and then never again.
//
// These are NOT interaction tests — they never click Submit/Check, so they never touch the SRS
// schedule, daily goal, or streak. They intentionally stay shallow; correctness of *answers* is
// covered by the pure-logic tests in logic.test.js instead.
(() => {
  const { group, test, assert } = TestRunner;

  // Several screens write to real localStorage just from being mounted (last position, in-
  // progress sessions, etc.) — this test page can share an origin with the live app, so snapshot
  // everything now, before any test runs, and restore it in the last test below. If localStorage
  // isn't accessible at all, there's nothing to protect.
  let storageSnapshot = null;
  try {
    storageSnapshot = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      storageSnapshot[k] = localStorage.getItem(k);
    }
  } catch (e) { storageSnapshot = null; }

  const sandbox = document.getElementById('testSandbox');
  function freshContainer() {
    // Must stay attached to the live document (not a detached node) — renderFlashcard() and
    // friends look elements up with document.getElementById, which can't see detached DOM.
    sandbox.innerHTML = '';
    const div = document.createElement('div');
    sandbox.appendChild(div);
    return div;
  }
  const noopNavigate = () => {};

  group('Screen mounts (smoke)', () => {
    test('Dashboard mounts without throwing', () => {
      const c = freshContainer();
      Dashboard.mount(c, noopNavigate);
      assert(c.querySelector('.lamp'), 'missing .lamp marker');
    });

    test('Lessons mounts with its default lesson/mode without throwing', () => {
      const c = freshContainer();
      Lessons.mount(c, null, noopNavigate);
      assert(c.querySelector('.lamp'), 'missing .lamp marker');
      assert(c.querySelector('#buildModeBtn'), 'Sentence Builder mode button missing from mode toggle');
    });

    test('Lessons — Sentence Builder renders real tiles for a lesson that has data (L3)', () => {
      const c = freshContainer();
      Lessons.mount(c, { lesson: '3', mode: 'build' }, noopNavigate);
      // The Go screen shows "Resume" instead of "Go" if a session is already in progress for
      // this lesson+mode (e.g. left over from manual testing) — both are valid entry points,
      // so accept either rather than assuming a clean slate.
      const entryBtn = c.querySelector('#goBtn') || c.querySelector('#resumeBtn');
      assert(entryBtn, 'expected a Go or Resume button on the entry screen');
      entryBtn.click();
      const tiles = c.querySelectorAll('#tileBank .tile-btn');
      assert(tiles.length > 0, 'expected the tile bank to render at least one tile');
    });

    test('Lessons — Sentence Builder shows the "not built yet" fallback for L1', () => {
      const c = freshContainer();
      Lessons.mount(c, { lesson: '1', mode: 'build' }, noopNavigate);
      const entryBtn = c.querySelector('#goBtn') || c.querySelector('#resumeBtn');
      entryBtn.click();
      assert(c.querySelector('.soon-box'), 'expected the not-built-yet fallback message');
    });

    test('Review mounts without throwing', () => {
      const c = freshContainer();
      Review.mount(c);
      assert(c.querySelector('.lamp'), 'missing .lamp marker');
    });

    test('NumbersDrill mounts without throwing', () => {
      const c = freshContainer();
      NumbersDrill.mount(c, noopNavigate);
      assert(c.querySelector('.lamp'), 'missing .lamp marker');
    });

    test('Grammar mounts without throwing', () => {
      const c = freshContainer();
      Grammar.mount(c);
      assert(c.querySelector('.lamp'), 'missing .lamp marker');
    });

    test('Pinyin mounts without throwing', () => {
      const c = freshContainer();
      Pinyin.mount(c);
      assert(c.querySelector('.lamp'), 'missing .lamp marker');
    });

    test('cleanup — restore real localStorage to its pre-test state', () => {
      sandbox.innerHTML = '';
      if (!storageSnapshot) return; // localStorage wasn't accessible, nothing was touched
      localStorage.clear();
      Object.keys(storageSnapshot).forEach((k) => localStorage.setItem(k, storageSnapshot[k]));
    });
  });
})();
