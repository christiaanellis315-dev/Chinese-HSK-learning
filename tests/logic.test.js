// Pure-logic unit tests — no DOM involved. These cover the functions most likely to have a
// subtle off-by-one (SRS box math, the Sentence Builder correctness check, number conversion)
// without needing a rendered page to exercise them.
(() => {
  const { group, test, assert, assertEqual } = TestRunner;

  // ---- Storage: spaced repetition ----
  // Storage is backed by real localStorage, which this test page shares with the live app if
  // served from the same origin. Every id here lives under the fake lesson id "__TEST__", which
  // never collides with a real lesson ("1".."15") — cleared at the start and end of this group
  // so the suite never leaves residue in real app data.
  group('Storage — spaced repetition', () => {
    const FAKE_LESSON = '__TEST__';
    Storage.clearLessonSrs(FAKE_LESSON); // clean slate, in case a previous run was interrupted
    let counter = 0;
    function tempItemId() { return Storage.wordItemId(FAKE_LESSON, 'w' + (counter++)); }

    test('a fresh item has no SRS record and status "new"', () => {
      const id = tempItemId();
      assert(Storage.getSrsRecord(id) === null, 'fresh item should have no record');
      assertEqual(Storage.itemStatus(id), 'new');
    });

    test('first correct answer promotes to box 2 ("known")', () => {
      const id = tempItemId();
      Storage.recordSrsResult(id, true);
      assertEqual(Storage.getSrsRecord(id).box, 2);
      assertEqual(Storage.itemStatus(id), 'known');
    });

    test('a wrong answer resets to box 1 ("learning"), even after prior progress', () => {
      const id = tempItemId();
      Storage.recordSrsResult(id, true);
      Storage.recordSrsResult(id, true);
      assert(Storage.getSrsRecord(id).box >= 3, 'sanity check: should have progressed past box 2');
      Storage.recordSrsResult(id, false);
      assertEqual(Storage.getSrsRecord(id).box, 1);
      assertEqual(Storage.itemStatus(id), 'learning');
    });

    test('box never exceeds 5, however many correct answers in a row', () => {
      const id = tempItemId();
      for (let i = 0; i < 8; i++) Storage.recordSrsResult(id, true);
      assertEqual(Storage.getSrsRecord(id).box, 5);
    });

    test('due date moves further into the future as the box increases', () => {
      const id = tempItemId();
      Storage.recordSrsResult(id, true); // box 2
      const due2 = Storage.getSrsRecord(id).due;
      Storage.recordSrsResult(id, true); // box 3
      const due3 = Storage.getSrsRecord(id).due;
      assert(due3 > due2, 'box 3 should be due further out than box 2');
    });

    test('wordItemId / listenItemId / buildItemId are namespaced and never collide', () => {
      const w = Storage.wordItemId('5', '你好');
      const l = Storage.listenItemId('5', 0);
      const b = Storage.buildItemId('5', 0);
      assert(w !== l && l !== b && w !== b, 'item ids for different types should never collide');
      assert(w.indexOf(':word:') !== -1, 'wordItemId missing :word: segment');
      assert(l.indexOf(':listen:') !== -1, 'listenItemId missing :listen: segment');
      assert(b.indexOf(':build:') !== -1, 'buildItemId missing :build: segment');
    });

    test('cleanup — no test data left behind in real storage', () => {
      Storage.clearLessonSrs(FAKE_LESSON);
      const id = Storage.wordItemId(FAKE_LESSON, 'w0');
      assert(Storage.getSrsRecord(id) === null, 'fake-lesson records should be gone after cleanup');
    });
  });

  // ---- Lessons: Type mode's fuzzy answer check ----
  group('Lessons — checkAnswer (Type the Answer)', () => {
    const w = { e: 'you', alt: ['you (informal)'] };

    test('exact match, case- and whitespace-insensitive', () => {
      assert(Lessons.checkAnswer('You', w));
      assert(Lessons.checkAnswer('  you  ', w));
    });
    test('trailing punctuation is ignored', () => {
      assert(Lessons.checkAnswer('you!', w));
    });
    test('an alt answer counts as correct', () => {
      assert(Lessons.checkAnswer('you (informal)', w));
    });
    test('empty input is always wrong', () => {
      assert(!Lessons.checkAnswer('', w));
      assert(!Lessons.checkAnswer('   ', w));
    });
    test('unrelated input is wrong', () => {
      assert(!Lessons.checkAnswer('hello', w));
    });
    test('a substring shorter than 3 characters does not count as a fuzzy match', () => {
      assert(!Lessons.checkAnswer('yo', w)); // "yo" is a substring of "you" but under the floor
    });
  });

  // ---- Lessons: Sentence Builder's tile-sequence correctness check ----
  group('Lessons — checkBuildAnswer (Sentence Builder)', () => {
    test('exact match passes', () => {
      assert(Lessons.checkBuildAnswer(['我', '是', '学生'], ['我', '是', '学生']));
    });
    test('right tiles, wrong order fails', () => {
      assert(!Lessons.checkBuildAnswer(['是', '我', '学生'], ['我', '是', '学生']));
    });
    test('a missing tile fails', () => {
      assert(!Lessons.checkBuildAnswer(['我', '是'], ['我', '是', '学生']));
    });
    test('an extra tile (e.g. a decoy tapped in) fails, even if the rest is right and in order', () => {
      assert(!Lessons.checkBuildAnswer(['我', '是', '学生', '老师'], ['我', '是', '学生']));
    });
    test('an empty submission against a non-empty answer fails', () => {
      assert(!Lessons.checkBuildAnswer([], ['我', '是', '学生']));
    });
  });

  // ---- NumbersDrill: hanzi/pinyin conversion for 1-99 ----
  group('NumbersDrill — number/hanzi/pinyin conversion', () => {
    test('single digits', () => {
      assertEqual(NumbersDrill.numberToHanzi(5), '五');
      assertEqual(NumbersDrill.numberToPinyin(5), 'wǔ');
    });
    test('ten', () => {
      assertEqual(NumbersDrill.numberToHanzi(10), '十');
      assertEqual(NumbersDrill.numberToPinyin(10), 'shí');
    });
    test('teens', () => {
      assertEqual(NumbersDrill.numberToHanzi(15), '十五');
      assertEqual(NumbersDrill.numberToPinyin(15), 'shíwǔ');
    });
    test('twelve gets the apostrophe break before "er"', () => {
      assertEqual(NumbersDrill.numberToPinyin(12), "shí'èr");
    });
    test('even tens (20, 90)', () => {
      assertEqual(NumbersDrill.numberToHanzi(20), '二十');
      assertEqual(NumbersDrill.numberToHanzi(90), '九十');
      assertEqual(NumbersDrill.numberToPinyin(30), 'sānshí');
    });
    test('compound tens with no apostrophe when the ones digit isn\'t 2', () => {
      assertEqual(NumbersDrill.numberToHanzi(23), '二十三');
      assertEqual(NumbersDrill.numberToPinyin(23), 'èrshísān');
      assertEqual(NumbersDrill.numberToHanzi(99), '九十九');
      assertEqual(NumbersDrill.numberToPinyin(99), 'jiǔshíjiǔ');
    });
    test('compound tens ending in 2 get the apostrophe break', () => {
      assertEqual(NumbersDrill.numberToHanzi(22), '二十二');
      assertEqual(NumbersDrill.numberToPinyin(22), "èrshí'èr");
    });
  });
})();
