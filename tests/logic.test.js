// Pure-logic unit tests — no DOM involved. These cover the functions most likely to have a
// subtle off-by-one (SRS box math, the Sentence Builder correctness check, number conversion)
// without needing a rendered page to exercise them.
(() => {
  const { group, test, assert, assertEqual } = TestRunner;

  // ---- Storage: spaced repetition ----
  // Storage is backed by real localStorage, which this test page shares with the live app if
  // served from the same origin. Every id here lives under the fake book id "__TEST__", which
  // lands in its own dedicated "hsk:srs:__TEST__" key — never mixed into hsk1/hsk2/hsk3's real
  // data — and that whole key is wiped at the start and end of this group.
  group('Storage — spaced repetition', () => {
    const FAKE_BOOK = '__TEST__';
    function wipeFakeBook() { try { localStorage.removeItem('hsk:srs:' + FAKE_BOOK); } catch (e) { /* no-op */ } }
    wipeFakeBook(); // clean slate, in case a previous run was interrupted
    let counter = 0;
    function tempItemId() { return Storage.wordItemId(FAKE_BOOK, '1', 'w' + (counter++)); }

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
      const w = Storage.wordItemId('hsk1', '5', '你好');
      const l = Storage.listenItemId('hsk1', '5', 0);
      const b = Storage.buildItemId('hsk1', '5', 0);
      assert(w !== l && l !== b && w !== b, 'item ids for different types should never collide');
      assert(w.indexOf(':word:') !== -1, 'wordItemId missing :word: segment');
      assert(l.indexOf(':listen:') !== -1, 'listenItemId missing :listen: segment');
      assert(b.indexOf(':build:') !== -1, 'buildItemId missing :build: segment');
    });

    test('the same lesson number in two different books never collides', () => {
      // Two fake books, not hsk1/hsk2, so this never touches real storage even transiently.
      const bookAWord = Storage.wordItemId('__TEST_A__', '5', '你好');
      const bookBWord = Storage.wordItemId('__TEST_B__', '5', '你好');
      assert(bookAWord !== bookBWord, 'identical lesson+hanzi in different books should still produce different item ids');
      Storage.recordSrsResult(bookAWord, true);
      assert(Storage.getSrsRecord(bookBWord) === null, 'recording a result in one book must not create a record in another');
      try { localStorage.removeItem('hsk:srs:__TEST_A__'); localStorage.removeItem('hsk:srs:__TEST_B__'); } catch (e) { /* no-op */ }
    });

    test('cleanup — no test data left behind in real storage', () => {
      wipeFakeBook();
      const id = Storage.wordItemId(FAKE_BOOK, '1', 'w0');
      assert(Storage.getSrsRecord(id) === null, 'fake-book records should be gone after cleanup');
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

  // ---- NumbersDrill: hanzi/pinyin conversion for 1-999 ----
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
    test('an even hundred uses tone-sandhi "yì" before "bǎi" (matches "一百" elsewhere in this app\'s data)', () => {
      assertEqual(NumbersDrill.numberToHanzi(100), '一百');
      assertEqual(NumbersDrill.numberToPinyin(100), 'yìbǎi');
    });
    test('a hundred with a bare ones digit gets "零" (e.g. 101, not "一百一")', () => {
      assertEqual(NumbersDrill.numberToHanzi(101), '一百零一');
      assertEqual(NumbersDrill.numberToPinyin(101), 'yìbǎilíngyī');
    });
    test('a hundred with "10-19" as the remainder keeps the explicit leading "一" (110, not "一百十")', () => {
      assertEqual(NumbersDrill.numberToHanzi(110), '一百一十');
      assertEqual(NumbersDrill.numberToPinyin(110), 'yìbǎiyīshí');
      assertEqual(NumbersDrill.numberToHanzi(111), '一百一十一');
      assertEqual(NumbersDrill.numberToPinyin(111), 'yìbǎiyīshíyī');
    });
    test('a hundred plus an even multiple of ten (e.g. 120) gets the apostrophe break before "èr"', () => {
      assertEqual(NumbersDrill.numberToHanzi(120), '一百二十');
      assertEqual(NumbersDrill.numberToPinyin(120), "yìbǎi'èrshí");
    });
    test('200 uses "两" instead of "二" for the hundreds digit (两百, not 二百)', () => {
      assertEqual(NumbersDrill.numberToHanzi(200), '两百');
      assertEqual(NumbersDrill.numberToPinyin(200), 'liǎngbǎi');
    });
    test('220 keeps "两" for the hundreds digit but "二" (not "两") for the tens digit', () => {
      assertEqual(NumbersDrill.numberToHanzi(220), '两百二十');
      assertEqual(NumbersDrill.numberToPinyin(220), "liǎngbǎi'èrshí");
    });
    test('a hundred plus a bare "2" ones digit gets both the "零" and the apostrophe break (302)', () => {
      assertEqual(NumbersDrill.numberToHanzi(302), '三百零二');
      assertEqual(NumbersDrill.numberToPinyin(302), "sānbǎilíng'èr");
    });
    test('999 (max of the round pool) builds correctly end to end', () => {
      assertEqual(NumbersDrill.numberToHanzi(999), '九百九十九');
      assertEqual(NumbersDrill.numberToPinyin(999), 'jiǔbǎijiǔshíjiǔ');
    });
  });

  // ---- MahjongGame: lenient answer checking per data/mahjong_vocabulary.md's rules ----
  // checkMahjongAnswer() is generic (just matches against whatever `answers` a tile-shaped object
  // carries) — the eastWind/redDragon fixtures below exercise that generality, they don't imply
  // honor tiles are actually in ALL_TILES. The live game is Sichuan rules (suits only, no honor
  // tiles), see the header comment in js/mahjong.js.
  group('MahjongGame — checkMahjongAnswer', () => {
    const twoBamboo = { han: '二条', pin: 'èr tiáo', answers: ['2 bamboo', 'two bamboo'] };
    const oneDot = { han: '一筒', pin: 'yī tǒng', answers: ['1 dot', 'one dot'] };
    const eastWind = { han: '东风', pin: 'dōngfēng', answers: ['east wind', 'east'] };
    const redDragon = { han: '红中', pin: 'hóngzhōng', answers: ['red dragon', 'red'] };

    test('digit form matches', () => {
      assert(MahjongGame.checkMahjongAnswer('2 Bamboo', twoBamboo));
    });
    test('number-word form matches', () => {
      assert(MahjongGame.checkMahjongAnswer('two bamboo', twoBamboo));
    });
    test('spacing and capitalization do not matter', () => {
      assert(MahjongGame.checkMahjongAnswer('2bamboo', twoBamboo));
      assert(MahjongGame.checkMahjongAnswer('  2   BAMBOO  ', twoBamboo));
    });
    test('"1 Dot" is singular, matching the vocabulary notes', () => {
      assert(MahjongGame.checkMahjongAnswer('1 dot', oneDot));
      assert(!MahjongGame.checkMahjongAnswer('1 dots', oneDot));
    });
    test('a wrong number for the right suit is wrong', () => {
      assert(!MahjongGame.checkMahjongAnswer('3 bamboo', twoBamboo));
    });
    test('a wrong suit for the right number is wrong', () => {
      assert(!MahjongGame.checkMahjongAnswer('2 dot', twoBamboo));
    });
    test('winds: full name and shorthand both match', () => {
      assert(MahjongGame.checkMahjongAnswer('East Wind', eastWind));
      assert(MahjongGame.checkMahjongAnswer('east', eastWind));
    });
    test('dragons: full name and shorthand both match', () => {
      assert(MahjongGame.checkMahjongAnswer('Red Dragon', redDragon));
      assert(MahjongGame.checkMahjongAnswer('red', redDragon));
    });
    test('empty input is always wrong', () => {
      assert(!MahjongGame.checkMahjongAnswer('', twoBamboo));
      assert(!MahjongGame.checkMahjongAnswer('   ', eastWind));
    });
    test('unrelated input is wrong', () => {
      assert(!MahjongGame.checkMahjongAnswer('hello', redDragon));
    });

    // ---- suit-name shorthand (per user request) — exercised against the real ALL_TILES data,
    // since the alias lists live there, not in the ad-hoc fixtures above. ----
    test('Bamboo also accepts the shorthand "bam"', () => {
      const tile = MahjongGame.ALL_TILES.find((t) => t.han === '二条');
      assert(MahjongGame.checkMahjongAnswer('2 bam', tile));
      assert(MahjongGame.checkMahjongAnswer('2bam', tile));
      assert(MahjongGame.checkMahjongAnswer('two bam', tile));
    });
    test('Characters also accepts "character", "char", and "chars"', () => {
      const tile = MahjongGame.ALL_TILES.find((t) => t.han === '五万');
      assert(MahjongGame.checkMahjongAnswer('5 character', tile));
      assert(MahjongGame.checkMahjongAnswer('5 char', tile));
      assert(MahjongGame.checkMahjongAnswer('5 chars', tile));
    });
    test('Dots is left exactly as-is — no extra shorthand accepted', () => {
      const tile = MahjongGame.ALL_TILES.find((t) => t.han === '三筒');
      assert(MahjongGame.checkMahjongAnswer('3 dots', tile));
      assert(!MahjongGame.checkMahjongAnswer('3 dt', tile), 'made-up shorthand should still be rejected for Dots');
    });
    test('shorthand does not loosen suit or number matching — still has to be the right tile', () => {
      const twoBambooReal = MahjongGame.ALL_TILES.find((t) => t.han === '二条');
      assert(!MahjongGame.checkMahjongAnswer('3 bam', twoBambooReal), 'right suit shorthand, wrong number');
      assert(!MahjongGame.checkMahjongAnswer('2 char', twoBambooReal), 'right number, wrong suit shorthand');
    });

    test('the live tile set is Sichuan rules: 27 suit tiles only, no winds or dragons', () => {
      assertEqual(MahjongGame.ALL_TILES.length, 27, 'expected exactly 3 suits x 9 numbers, no honor tiles');
      assert(!MahjongGame.ALL_TILES.some((t) => t.kind === 'wind' || t.kind === 'dragon'), 'no wind/dragon tiles should be in the Sichuan-rules tile set');
      const kinds = MahjongGame.ALL_TILES.reduce((acc, t) => { acc[t.kind] = (acc[t.kind] || 0) + 1; return acc; }, {});
      assertEqual(kinds, { characters: 9, bamboo: 9, dots: 9 });
    });
  });
})();
