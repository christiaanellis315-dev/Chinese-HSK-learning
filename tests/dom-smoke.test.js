// DOM smoke tests: mount every screen module for real and confirm nothing throws and the basic
// shell renders. This formalizes the manual "click through every mode/lesson in the Browser
// tool" pass that used to happen once per feature, by hand, and then never again.
//
// These are NOT interaction tests — they never click Submit/Check, so they never touch the SRS
// schedule, daily goal, or streak. They intentionally stay shallow; correctness of *answers* is
// covered by the pure-logic tests in logic.test.js instead.
(() => {
  const { group, test, assert, assertEqual } = TestRunner;

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

    test('Dashboard renders the book selector (HSK1/HSK2/HSK3), and picking a book actually switches it', () => {
      const c = freshContainer();
      Dashboard.mount(c, noopNavigate);
      const tabs = Array.from(c.querySelectorAll('#bookRow .tab'));
      assertEqual(tabs.map((t) => t.textContent), ['HSK1', 'HSK2', 'HSK3']);
      assert(tabs[0].className.indexOf('active') !== -1, 'HSK1 should start active');

      tabs[1].click(); // HSK2 — mount() re-runs itself, refreshing c's contents in place
      assertEqual(Storage.getCurrentBook(), 'hsk2');
      assert(c.querySelector('#masteryGrid'), 'HSK2 has real content — switching to it should show the mastery grid, not an empty state');

      c.querySelector('#bookRow .tab').click(); // back to HSK1 (first tab)
      assertEqual(Storage.getCurrentBook(), 'hsk1');
      assert(c.querySelector('#masteryGrid'), 'switching back to HSK1 should restore the mastery grid');
    });

    test('Lessons mounts with its default lesson/mode without throwing', () => {
      const c = freshContainer();
      Lessons.mount(c, null, noopNavigate);
      assert(c.querySelector('.lamp'), 'missing .lamp marker');
      assert(c.querySelector('#buildModeBtn'), 'Sentence Builder mode button missing from mode toggle');
    });

    // ---- Round-order shuffling (Flip/Type/Listen): a fresh round each shuffles which order
    // items appear in, but Resume must continue in the exact order+position the round started
    // with, never a new shuffle mid-round. Sentence Builder is deliberately untouched — its own
    // exercise order (tested separately below) always stays fixed. ----
    test('Flip round order is shuffled fresh each time, not the fixed textbook order every round', () => {
      const c = freshContainer();
      const firstWords = [];
      for (let i = 0; i < 10; i++) {
        Storage.clearSession('lessons:hsk1:14:flip'); // L14 has 17 words, room for real variation
        Lessons.mount(c, { book: 'hsk1', lesson: '14', mode: 'flip' }, noopNavigate);
        c.querySelector('#goBtn').click();
        firstWords.push(c.querySelector('.hanzi').textContent);
      }
      assert(new Set(firstWords).size > 1, `expected more than one distinct first word across 10 fresh rounds, got: ${firstWords.join(',')}`);
    });

    test('Resuming a round continues in the exact same shuffled order and position', () => {
      const c = freshContainer();
      Storage.clearSession('lessons:hsk1:14:flip');
      Lessons.mount(c, { book: 'hsk1', lesson: '14', mode: 'flip' }, noopNavigate);
      c.querySelector('#goBtn').click();
      for (let i = 0; i < 3; i++) {
        c.querySelector('#flipCard').click();
        c.querySelector('#knowBtn').click();
      }
      const wordBeforeLeaving = c.querySelector('.hanzi').textContent;

      Lessons.mount(c, { book: 'hsk1', lesson: '14', mode: 'flip' }, noopNavigate); // simulates navigating away and back
      const resumeBtn = c.querySelector('#resumeBtn');
      assert(resumeBtn, 'expected a Resume option after leaving mid-round');
      resumeBtn.click();
      assertEqual(c.querySelector('.hanzi').textContent, wordBeforeLeaving, 'resume should show the same word at the same position, not a new shuffle');
      Storage.clearSession('lessons:hsk1:14:flip');
    });

    test('Sentence Builder exercise order stays fixed across rounds (unaffected by the new shuffle)', () => {
      const c = freshContainer();
      const sequences = [];
      for (let i = 0; i < 4; i++) {
        Storage.clearSession('lessons:hsk1:6:build');
        Lessons.mount(c, { book: 'hsk1', lesson: '6', mode: 'build' }, noopNavigate);
        c.querySelector('#goBtn').click();
        const prompt1 = c.querySelector('.sb-prompt-hanzi').textContent;
        c.querySelector('#nextBtn').click();
        const prompt2 = c.querySelector('.sb-prompt-hanzi').textContent;
        sequences.push(prompt1 + '|' + prompt2);
      }
      assertEqual(new Set(sequences).size, 1, `expected the exact same exercise order every round, got: ${sequences.join(' / ')}`);
    });

    test('Lessons — Sentence Builder renders real tiles for a lesson that has data (HSK1 L3)', () => {
      const c = freshContainer();
      Lessons.mount(c, { book: 'hsk1', lesson: '3', mode: 'build' }, noopNavigate);
      // The Go screen shows "Resume" instead of "Go" if a session is already in progress for
      // this lesson+mode (e.g. left over from manual testing) — both are valid entry points,
      // so accept either rather than assuming a clean slate.
      const entryBtn = c.querySelector('#goBtn') || c.querySelector('#resumeBtn');
      assert(entryBtn, 'expected a Go or Resume button on the entry screen');
      entryBtn.click();
      const tiles = c.querySelectorAll('#tileBank .tile-btn');
      assert(tiles.length > 0, 'expected the tile bank to render at least one tile');
    });

    test('Lessons — Sentence Builder shows the "not built yet" fallback for HSK1 L1', () => {
      const c = freshContainer();
      Lessons.mount(c, { book: 'hsk1', lesson: '1', mode: 'build' }, noopNavigate);
      const entryBtn = c.querySelector('#goBtn') || c.querySelector('#resumeBtn');
      entryBtn.click();
      assert(c.querySelector('.soon-box'), 'expected the not-built-yet fallback message');
    });

    // ---- HSK2 has real content now — confirm every mode actually renders it, not just that
    // HSK1 still works. Sentence Builder covers all 15 HSK2 lessons (unlike HSK1's 3-15), and
    // Lesson 8 is a deliberate listening-data gap (see hsk2_listening.md), so both get their own
    // check the same way HSK1's L1 "not built yet" fallback does. ----
    test('Lessons — HSK2 L1 renders real vocabulary (Flip & Recall)', () => {
      const c = freshContainer();
      Lessons.mount(c, { book: 'hsk2', lesson: '1', mode: 'flip' }, noopNavigate);
      const entryBtn = c.querySelector('#goBtn') || c.querySelector('#resumeBtn');
      entryBtn.click();
      const hanzi = c.querySelector('.hanzi');
      assert(hanzi && hanzi.textContent.trim().length > 0, 'expected a real HSK2 word on the flashcard');
    });

    test('Lessons — HSK2 Sentence Builder renders real tiles for L15 (last lesson, unlike HSK1 it has data)', () => {
      const c = freshContainer();
      Lessons.mount(c, { book: 'hsk2', lesson: '15', mode: 'build' }, noopNavigate);
      const entryBtn = c.querySelector('#goBtn') || c.querySelector('#resumeBtn');
      entryBtn.click();
      const tiles = c.querySelectorAll('#tileBank .tile-btn');
      assert(tiles.length > 0, 'expected the tile bank to render at least one tile');
    });

    test('Lessons — HSK2 L8 shows the listening fallback (the file\'s one documented source gap)', () => {
      const c = freshContainer();
      Lessons.mount(c, { book: 'hsk2', lesson: '8', mode: 'listen' }, noopNavigate);
      const entryBtn = c.querySelector('#goBtn') || c.querySelector('#resumeBtn');
      entryBtn.click();
      assert(c.querySelector('.soon-box'), 'expected the not-built-yet fallback message for HSK2 L8 listening');
    });

    test('Grammar — HSK2 renders 15 lesson tabs (all 15 lessons have notes, unlike HSK1\'s 3-15)', () => {
      const c = freshContainer();
      Storage.setCurrentBook('hsk2'); // Grammar.mount takes no book param — reads Storage directly
      Grammar.mount(c);
      Storage.setCurrentBook('hsk1');
      const tabCount = c.querySelectorAll('#tabs .tab').length;
      assertEqual(tabCount, 15, 'HSK2 grammar should have one tab per lesson');
      assert(c.querySelectorAll('.grammar-card').length > 0, 'expected at least one grammar point card rendered');
    });

    // ---- Book selector: HSK3 has no content yet, and every book-aware screen needs to show a
    // plain empty state instead of crashing (e.g. today's code would otherwise do
    // Books.getLessonOrder('hsk3')[0] and get undefined). This is what actually proves the
    // "switch to an empty book, no crash" checklist item, rather than a one-off manual click. ----
    test('Dashboard shows an empty state for HSK3 (no crash, no mastery grid)', () => {
      const c = freshContainer();
      Storage.setCurrentBook('hsk3'); // Dashboard.mount takes no book param — reads Storage directly
      Dashboard.mount(c, noopNavigate);
      Storage.setCurrentBook('hsk1');
      assert(c.querySelector('.lamp'), 'missing .lamp marker');
      assert(!c.querySelector('#masteryGrid'), 'should not render a mastery grid for a book with no lessons');
    });

    test('Lessons shows an empty state for HSK3 (no crash, no tabs/mode-toggle)', () => {
      const c = freshContainer();
      Lessons.mount(c, { book: 'hsk3' }, noopNavigate);
      assert(c.querySelector('.lamp'), 'missing .lamp marker');
      assert(!c.querySelector('#modeToggle'), 'should not render the mode toggle for a book with no lessons');
      assert(c.textContent.indexOf('HSK3') !== -1, 'empty state should name the book');
    });

    test('Grammar shows an empty state for HSK3 (no crash, no tabs)', () => {
      const c = freshContainer();
      Storage.setCurrentBook('hsk3'); // Grammar.mount takes no book param — reads Storage directly
      Grammar.mount(c);
      Storage.setCurrentBook('hsk1');
      assert(c.querySelector('.lamp'), 'missing .lamp marker');
      assert(!c.querySelector('#tabs') || c.querySelector('#tabs').children.length === 0, 'should render no grammar tabs for a book with no content');
    });

    test('switching back to HSK1 still works after visiting an empty book', () => {
      const c = freshContainer();
      Lessons.mount(c, { book: 'hsk1' }, noopNavigate);
      assert(c.querySelector('#buildModeBtn'), 'HSK1 should render its normal mode toggle again');
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
