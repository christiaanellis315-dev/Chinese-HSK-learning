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

      tabs[2].click(); // HSK3
      assertEqual(Storage.getCurrentBook(), 'hsk3');
      assert(c.querySelector('#masteryGrid'), 'HSK3 has real content (vocab+grammar) — switching to it should show the mastery grid, not an empty state');

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

    test('Lessons — Sentence Builder shows what was built plus the correct answer when wrong, and omits it when right', () => {
      const c = freshContainer();
      Storage.clearSession('lessons:hsk1:4:build');
      Lessons.mount(c, { book: 'hsk1', lesson: '4', mode: 'build' }, noopNavigate);
      (c.querySelector('#goBtn') || c.querySelector('#resumeBtn')).click();

      // Tap two arbitrary bank tiles — not the real answer sequence — to force a wrong submission.
      const bankBtns = Array.from(c.querySelectorAll('#tileBank .tile-btn'));
      bankBtns.slice(0, 2).forEach((b) => b.click());
      c.querySelector('#sbSubmitBtn').click();
      assert(c.querySelector('.feedback-badge').className.indexOf('wrong') !== -1, 'expected this submission to be wrong');
      const yourAnswer = c.querySelector('.your-answer');
      assert(yourAnswer && /You built:/.test(yourAnswer.textContent), 'expected a "You built" line showing what was tapped');
      assert(c.querySelector('.ex-h'), 'expected the correct answer to still be shown alongside it');
      Storage.clearSession('lessons:hsk1:4:build');

      // Now build the actual correct sequence — "You built" should be omitted since it would only
      // repeat what the correct-answer line right below it already says.
      Lessons.mount(c, { book: 'hsk1', lesson: '4', mode: 'build' }, noopNavigate);
      (c.querySelector('#goBtn') || c.querySelector('#resumeBtn')).click();
      const item = Books.getLesson('hsk1', '4').sentenceBuilder[0];
      item.tiles.forEach((t) => {
        const btn = Array.from(c.querySelectorAll('#tileBank .tile-btn')).find((b) => b.querySelector('.tile-h').textContent === t.h);
        btn.click();
      });
      c.querySelector('#sbSubmitBtn').click();
      assert(c.querySelector('.feedback-badge').className.indexOf('correct') !== -1, 'expected this submission to be correct');
      assert(!c.querySelector('.your-answer'), '"You built" should be omitted for a correct answer');
      Storage.clearSession('lessons:hsk1:4:build');
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

    // ---- HSK3 is now a complete book — all four content types (Vocabulary, Grammar Notes,
    // Listening, Sentence Builder) populated for all 20 lessons. Confirm every mode actually
    // renders real content, the same way the HSK2 checks above do (Books.getLessonOrder('hsk3')[0]
    // used to be undefined before this data existed — this proves that gap is closed the right
    // way, not just closed). Listening also gets its own item-count check, since HSK3's workbook
    // gives 10 items per lesson (Part III + Part IV) instead of the usual 5 — see hsk3_listening.md. ----
    test('Lessons — HSK3 L1 renders real vocabulary (Flip & Recall)', () => {
      const c = freshContainer();
      Lessons.mount(c, { book: 'hsk3', lesson: '1', mode: 'flip' }, noopNavigate);
      const entryBtn = c.querySelector('#goBtn') || c.querySelector('#resumeBtn');
      entryBtn.click();
      const hanzi = c.querySelector('.hanzi');
      assert(hanzi && hanzi.textContent.trim().length > 0, 'expected a real HSK3 word on the flashcard');
    });

    test('Lessons — HSK3 L20 (last lesson) renders real vocabulary, confirming all 20 lessons are wired up', () => {
      const c = freshContainer();
      Lessons.mount(c, { book: 'hsk3', lesson: '20', mode: 'flip' }, noopNavigate);
      const entryBtn = c.querySelector('#goBtn') || c.querySelector('#resumeBtn');
      entryBtn.click();
      const hanzi = c.querySelector('.hanzi');
      assert(hanzi && hanzi.textContent.trim().length > 0, 'expected a real HSK3 word on the flashcard');
    });

    test('Lessons — HSK3 Listening renders a real question with 3 options, and all 10 items are reachable', () => {
      const c = freshContainer();
      Storage.clearSession('lessons:hsk3:1:listen');
      Lessons.mount(c, { book: 'hsk3', lesson: '1', mode: 'listen' }, noopNavigate);
      const entryBtn = c.querySelector('#goBtn') || c.querySelector('#resumeBtn');
      entryBtn.click();
      assert(c.querySelectorAll('.option-btn').length === 3, 'expected 3 answer options on the listening question');
      assert(c.querySelector('#posLabel').textContent.indexOf('10') !== -1, `expected a 10-item round (Part III + Part IV combined), got: ${c.querySelector('#posLabel').textContent}`);
      Storage.clearSession('lessons:hsk3:1:listen');
    });

    test('Lessons — HSK3 Sentence Builder renders real tiles for L1', () => {
      const c = freshContainer();
      Lessons.mount(c, { book: 'hsk3', lesson: '1', mode: 'build' }, noopNavigate);
      const entryBtn = c.querySelector('#goBtn') || c.querySelector('#resumeBtn');
      entryBtn.click();
      const tiles = c.querySelectorAll('#tileBank .tile-btn');
      assert(tiles.length > 0, 'expected the tile bank to render at least one tile');
    });

    test('Grammar — HSK3 renders 20 lesson tabs (all 20 lessons have notes)', () => {
      const c = freshContainer();
      Storage.setCurrentBook('hsk3'); // Grammar.mount takes no book param — reads Storage directly
      Grammar.mount(c);
      Storage.setCurrentBook('hsk1');
      const tabCount = c.querySelectorAll('#tabs .tab').length;
      assertEqual(tabCount, 20, 'HSK3 grammar should have one tab per lesson');
      assert(c.querySelectorAll('.grammar-card').length > 0, 'expected at least one grammar point card rendered');
    });

    // ---- Book selector: an unregistered book still needs every book-aware screen to show a
    // plain empty state instead of crashing (e.g. today's code would otherwise do
    // Books.getLessonOrder('__no_such_book__')[0] and get undefined). Now that HSK1/HSK2/HSK3 all
    // have real content, this uses a fake book id to keep exercising that code path. ----
    test('Dashboard shows an empty state for an unregistered book (no crash, no mastery grid)', () => {
      const c = freshContainer();
      Storage.setCurrentBook('__no_such_book__'); // Dashboard.mount takes no book param — reads Storage directly
      Dashboard.mount(c, noopNavigate);
      Storage.setCurrentBook('hsk1');
      assert(c.querySelector('.lamp'), 'missing .lamp marker');
      assert(!c.querySelector('#masteryGrid'), 'should not render a mastery grid for a book with no lessons');
    });

    test('Lessons shows an empty state for an unregistered book (no crash, no tabs/mode-toggle)', () => {
      const c = freshContainer();
      Lessons.mount(c, { book: '__no_such_book__' }, noopNavigate);
      assert(c.querySelector('.lamp'), 'missing .lamp marker');
      assert(!c.querySelector('#modeToggle'), 'should not render the mode toggle for a book with no lessons');
    });

    test('Grammar shows an empty state for an unregistered book (no crash, no tabs)', () => {
      const c = freshContainer();
      Storage.setCurrentBook('__no_such_book__'); // Grammar.mount takes no book param — reads Storage directly
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

    test('Review pools due items across ALL books at once, regardless of which book is currently selected', () => {
      const savedBook = Storage.getCurrentBook();
      function forceDue(book, hanzi) {
        const key = 'hsk:srs:' + book;
        const blob = JSON.parse(localStorage.getItem(key) || '{}');
        blob['word:5:' + hanzi] = { box: 2, due: Date.now() - 1000, lastReviewed: Date.now() - 2000 };
        localStorage.setItem(key, JSON.stringify(blob));
      }
      function wipe(book, hanzi) {
        const key = 'hsk:srs:' + book;
        const blob = JSON.parse(localStorage.getItem(key) || '{}');
        delete blob['word:5:' + hanzi];
        localStorage.setItem(key, JSON.stringify(blob));
      }
      const w1 = Books.getLesson('hsk1', '5').words[0];
      const w2 = Books.getLesson('hsk2', '5').words[0];
      forceDue('hsk1', w1.h);
      forceDue('hsk2', w2.h);

      // With HSK1 selected as the "current" book, Review should still show both due items, not
      // just HSK1's — this is the multi-book pooling fix (previously it only ever showed the
      // currently-selected book's due items, so HSK2's due word would have been invisible here).
      Storage.setCurrentBook('hsk1');
      const c = freshContainer();
      Review.mount(c);
      assertEqual(c.querySelector('#posLabel').textContent, '1 of 2', 'expected both books\' due items pooled into one queue of 2');

      wipe('hsk1', w1.h); wipe('hsk2', w2.h);
      Storage.setCurrentBook(savedBook);
    });

    test('Dashboard\'s "due for review" count matches Review\'s pooled total, not just the current book\'s', () => {
      const savedBook = Storage.getCurrentBook();
      function forceDue(book, hanzi) {
        const key = 'hsk:srs:' + book;
        const blob = JSON.parse(localStorage.getItem(key) || '{}');
        blob['word:5:' + hanzi] = { box: 2, due: Date.now() - 1000, lastReviewed: Date.now() - 2000 };
        localStorage.setItem(key, JSON.stringify(blob));
      }
      function wipe(book, hanzi) {
        const key = 'hsk:srs:' + book;
        const blob = JSON.parse(localStorage.getItem(key) || '{}');
        delete blob['word:5:' + hanzi];
        localStorage.setItem(key, JSON.stringify(blob));
      }
      const w2 = Books.getLesson('hsk2', '5').words[0];
      // Due item lives only in HSK2, but HSK1 is the currently-selected book on Dashboard.
      forceDue('hsk2', w2.h);
      Storage.setCurrentBook('hsk1');

      const c = freshContainer();
      Dashboard.mount(c, noopNavigate);
      assert(c.querySelector('#reviewCta').textContent.indexOf('1 due for review') !== -1, 'Dashboard should surface HSK2\'s due item even while HSK1 is selected');
      assert(c.querySelector('#reviewCta').className.indexOf('empty') === -1, 'the review CTA should not render as empty/unclickable when another book has a due item');

      wipe('hsk2', w2.h);
      Storage.setCurrentBook(savedBook);
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

    test('Games mounts without throwing, defaulting to Numbers', () => {
      const c = freshContainer();
      Games.mount(c, noopNavigate);
      assert(c.querySelector('.lamp'), 'missing .lamp marker');
      assert(c.querySelector('#numbersGameBtn').className.indexOf('active') !== -1, 'Numbers should be the default game');
    });

    test('Games — switching to Mahjong Tiles renders its Go screen', () => {
      const c = freshContainer();
      Storage.clearSession('mahjong');
      Games.mount(c, noopNavigate);
      c.querySelector('#mahjongGameBtn').click();
      assert(c.querySelector('#mjGoBtn') || c.querySelector('#mjResumeBtn'), 'expected a Go or Resume button for Mahjong Tiles');
    });

    test('Mahjong Tiles — a round shows a real tile with a disabled Check button until something is typed', () => {
      const c = freshContainer();
      Storage.clearSession('mahjong');
      MahjongGame.mount(c, noopNavigate);
      const entryBtn = c.querySelector('#mjGoBtn') || c.querySelector('#mjResumeBtn');
      entryBtn.click();
      const hanzi = c.querySelector('.hanzi');
      assert(hanzi && hanzi.textContent.trim().length > 0, 'expected a real tile hanzi on the card');
      const submitBtn = c.querySelector('#mjSubmitBtn');
      assert(submitBtn.disabled, 'Check should start disabled with an empty input');
      const input = c.querySelector('#mjInput');
      input.value = 'x';
      input.dispatchEvent(new Event('input'));
      assert(!submitBtn.disabled, 'Check should enable once something is typed');
      input.value = '';
      input.dispatchEvent(new Event('input'));
      assert(submitBtn.disabled, 'Check should re-disable if the input is cleared back to empty');
      Storage.clearSession('mahjong');
    });

    test('Settings mounts without throwing and shows both theme options', () => {
      const c = freshContainer();
      Settings.mount(c);
      assert(c.querySelector('.lamp'), 'missing .lamp marker');
      assert(c.querySelector('#darkOption') && c.querySelector('#lightOption'), 'expected both Dark and Light theme options');
    });

    test('Settings — picking Light applies data-theme="light" and persists; switching back to Dark clears it', () => {
      const c = freshContainer();
      Settings.mount(c);
      c.querySelector('#lightOption').click();
      assertEqual(document.documentElement.getAttribute('data-theme'), 'light');
      assertEqual(Storage.getTheme(), 'light');
      c.querySelector('#darkOption').click();
      assert(!document.documentElement.getAttribute('data-theme'), 'dark (default) should clear the data-theme attribute');
      assertEqual(Storage.getTheme(), 'dark');
    });

    test('cleanup — restore real localStorage to its pre-test state', () => {
      sandbox.innerHTML = '';
      if (!storageSnapshot) return; // localStorage wasn't accessible, nothing was touched
      localStorage.clear();
      Object.keys(storageSnapshot).forEach((k) => localStorage.setItem(k, storageSnapshot[k]));
    });
  });
})();
