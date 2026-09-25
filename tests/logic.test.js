// Pure-logic unit tests — no DOM involved. These cover the functions most likely to have a
// subtle off-by-one (SRS box math, the Sentence Builder correctness check, number conversion)
// without needing a rendered page to exercise them.
(() => {
  const { group, test, assert, assertEqual } = TestRunner;

  // ---- Speech: resolving a saved voice preference back to a real voice ----
  // window.speechSynthesis.getVoices() is not guaranteed to return voices in a stable order
  // across calls — some browsers/OSes reshuffle it (e.g. when `voiceschanged` fires again after
  // more voices finish loading). Storing a raw array index and trusting it forever meant a
  // reshuffle could silently swap in a different voice with a different natural speaking pace,
  // while the person's chosen "speed" (rate) stayed exactly the same — reported as "sometimes it
  // feels a lot faster than it should". resolveVoiceIndex() fixes that by preferring a stable
  // voice *name* match, falling back to the index only for a pref saved before names existed.
  group('Speech — resolveVoiceIndex', () => {
    const voices = [{ name: 'Tingting' }, { name: 'Huihui' }, { name: 'Kangkang' }];

    test('matches by name even if that voice is no longer at the stored index (a reorder happened)', () => {
      const pref = { voiceName: 'Kangkang', index: 0 }; // stale index would point at Tingting
      assertEqual(Speech.resolveVoiceIndex(pref, voices), 2);
    });
    test('a legacy pref with no voiceName yet falls back to the stored index', () => {
      const pref = { index: 1 };
      assertEqual(Speech.resolveVoiceIndex(pref, voices), 1);
    });
    test('an unrecognized name AND an out-of-range index both fall back to voice 0', () => {
      assertEqual(Speech.resolveVoiceIndex({ voiceName: 'NoSuchVoice', index: 99 }, voices), 0);
    });
    test('a completely empty pref falls back to voice 0', () => {
      assertEqual(Speech.resolveVoiceIndex({}, voices), 0);
    });
    test('an empty voice list resolves to -1 (nothing to select)', () => {
      assertEqual(Speech.resolveVoiceIndex({ voiceName: 'Kangkang' }, []), -1);
    });
  });

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

  // ---- ColorsGame: lenient answer checking per data/colors_vocabulary.md ----
  group('ColorsGame — checkColorAnswer', () => {
    const red = { han: '红色', pin: 'hóngsè', answers: ['red'] };
    const gray = { han: '灰色', pin: 'huīsè', answers: ['gray', 'grey'] };
    const cyan = { han: '青色', pin: 'qīngsè', answers: ['cyan', 'turquoise'] };

    test('exact match, case- and spacing-insensitive', () => {
      assert(ColorsGame.checkColorAnswer('Red', red));
      assert(ColorsGame.checkColorAnswer('  red  ', red));
      assert(ColorsGame.checkColorAnswer('RED', red));
    });
    test('both spellings of a color with more than one accepted answer both match', () => {
      assert(ColorsGame.checkColorAnswer('gray', gray));
      assert(ColorsGame.checkColorAnswer('grey', gray));
      assert(ColorsGame.checkColorAnswer('cyan', cyan));
      assert(ColorsGame.checkColorAnswer('turquoise', cyan));
    });
    test('empty input is always wrong', () => {
      assert(!ColorsGame.checkColorAnswer('', red));
      assert(!ColorsGame.checkColorAnswer('   ', red));
    });
    test('unrelated or wrong-color input is wrong', () => {
      assert(!ColorsGame.checkColorAnswer('blue', red));
      assert(!ColorsGame.checkColorAnswer('hello', red));
    });
    test('the live color set has all 14 colors from colors_vocabulary.md, each with a hex and English answer', () => {
      assertEqual(ColorsGame.COLORS.length, 14);
      ColorsGame.COLORS.forEach((c) => {
        assert(/^#[0-9A-Fa-f]{6}$/.test(c.hex), 'expected a 6-digit hex color for ' + c.han);
        assert(Array.isArray(c.answers) && c.answers.length > 0, 'expected at least one accepted answer for ' + c.han);
      });
    });
    test('White is flagged as needing a swatch outline; no other color is', () => {
      const white = ColorsGame.COLORS.find((c) => c.answers[0] === 'white');
      assert(white && white.outline === true, 'White should be flagged outline:true');
      const othersFlagged = ColorsGame.COLORS.filter((c) => c !== white && c.outline);
      assertEqual(othersFlagged.length, 0, 'no color other than White should need the outline treatment');
    });
  });

  // ---- FinalTest: book-scoped word pooling (the actual round-building/scoring logic lives in
  // final-test.js as private, DOM-coupled functions — its data isolation is instead verified as a
  // DOM smoke test in dom-smoke.test.js, alongside its Go-screen/resume/empty-input behavior). ----

  // ---- Free Production: the two lenient checkers, one per input channel ----
  group('Lessons — Free Production checkers (checkProductionHanzi / checkProductionPinyin)', () => {
    // A minimal Sentence Builder-shaped exercise: tiles are the content words that must all
    // appear, in order, for an answer to count.
    const item = { tiles: [{ h: '她', p: 'Tā' }, { h: '是', p: 'shì' }, { h: '我', p: 'wǒ' }, { h: '朋友', p: 'péngyou' }], answer: '她是我朋友。' };

    test('checkProductionHanzi: exact answer matches', () => {
      assert(Lessons.checkProductionHanzi('她是我朋友。', item));
    });
    test('checkProductionHanzi: tolerates extra filler/particles around the content words', () => {
      assert(Lessons.checkProductionHanzi('嗯，她是我的朋友呢', item), 'the four content words still all appear in order');
    });
    test('checkProductionHanzi: scrambled word order fails', () => {
      assert(!Lessons.checkProductionHanzi('我是她朋友', item), 'wrong order should not count as "roughly the right structure"');
    });
    test('checkProductionHanzi: a missing content word fails', () => {
      assert(!Lessons.checkProductionHanzi('她是朋友', item), 'missing 我 entirely should fail');
    });
    test('checkProductionHanzi: empty input is always wrong', () => {
      assert(!Lessons.checkProductionHanzi('', item));
      assert(!Lessons.checkProductionHanzi('   ', item));
    });

    test('checkProductionPinyin: exact pinyin (with tone marks) matches', () => {
      assert(Lessons.checkProductionPinyin('Tā shì wǒ péngyou', item));
    });
    test('checkProductionPinyin: tone marks are ignored entirely', () => {
      assert(Lessons.checkProductionPinyin('ta shi wo pengyou', item));
    });
    test('checkProductionPinyin: spacing/capitalization/punctuation do not matter', () => {
      assert(Lessons.checkProductionPinyin('  TA SHI-WO, PENGYOU!  ', item));
    });
    test('checkProductionPinyin: "v" is accepted in place of ü', () => {
      const withU = { tiles: [{ h: '绿', p: 'lǜ' }] };
      assert(Lessons.checkProductionPinyin('lv', withU));
      assert(Lessons.checkProductionPinyin('lü', withU));
    });
    test('checkProductionPinyin: scrambled order or a missing syllable fails', () => {
      assert(!Lessons.checkProductionPinyin('wo shi ta pengyou', item));
      assert(!Lessons.checkProductionPinyin('ta shi pengyou', item));
    });
    test('checkProductionPinyin: empty input is always wrong', () => {
      assert(!Lessons.checkProductionPinyin('', item));
      assert(!Lessons.checkProductionPinyin('   ', item));
    });
  });

  // ---- Survival Phrases: merge integrity, availability, and weighting ----
  group('SurvivalPhrases — merged data, availability, weight', () => {
    test('no duplicate phrases anywhere across the merged groups', () => {
      const all = SurvivalPhrases.GROUPS.flatMap((g) => g.phrases.map((p) => p.h));
      assertEqual(new Set(all).size, all.length, 'expected every hanzi phrase to be unique across the whole module');
    });
    test('reconciled duplicates: the fuller phrasing is present, the shorter original is gone', () => {
      const all = SurvivalPhrases.GROUPS.flatMap((g) => g.phrases.map((p) => p.h));
      assert(all.includes('这个多少钱？'), 'expected the fuller "这个多少钱？" to be present');
      assert(!all.includes('多少钱？'), 'expected the shorter original to have been replaced, not duplicated');
      assert(all.includes('你好吗？我很好，谢谢，你呢？'), 'expected the fuller greeting exchange to be present');
      assert(!all.includes('你好吗？'), 'expected the shorter original greeting to have been replaced, not duplicated');
    });
    test('"When You\'re Stuck" is the only group weighted above 1, and it pulls from every batch', () => {
      const stuck = SurvivalPhrases.GROUPS.find((g) => g.id === 'stuck');
      assertEqual(stuck.weight, 3);
      SurvivalPhrases.GROUPS.filter((g) => g.id !== 'stuck').forEach((g) => {
        assertEqual(g.weight, 1, g.label + ' should not be weighted above the default');
      });
      const books = new Set(stuck.phrases.map((p) => p.book || 'original'));
      assert(books.has('original') && books.has('hsk2') && books.has('hsk3'), 'expected the Stuck group to include phrases from the original set plus HSK2 and HSK3');
    });
    test('allPhrases(): every phrase in every group is returned — nothing is locked or gated by book', () => {
      SurvivalPhrases.GROUPS.forEach((g) => {
        assertEqual(SurvivalPhrases.allPhrases(g).length, g.phrases.length, g.label + ': every phrase should be available regardless of book/lesson progress');
      });
    });
    test('itemId() is namespaced by group so the same hanzi in two groups never collides', () => {
      assert(SurvivalPhrases.itemId('meeting', '你好') !== SurvivalPhrases.itemId('stuck', '你好'));
    });
    test('dueEntries(): a book-tagged phrase becomes due purely from its own SRS record — no book-progress check blocks it', () => {
      const group = SurvivalPhrases.GROUPS.find((g) => g.id === 'meeting');
      const hsk3Phrase = group.phrases.find((p) => p.book === 'hsk3');
      const id = SurvivalPhrases.itemId(group.id, hsk3Phrase.h);
      const key = 'hsk:srs:survival';
      const shortId = id.slice(id.indexOf(':') + 1);
      const blob = JSON.parse(localStorage.getItem(key) || '{}');
      const prior = blob[shortId];
      blob[shortId] = { box: 2, due: Date.now() - 1000, lastReviewed: Date.now() - 2000 };
      localStorage.setItem(key, JSON.stringify(blob));

      const due = SurvivalPhrases.dueEntries();
      assert(due.some((e) => e.itemId === id), 'expected the hsk3-tagged phrase to be due, with nothing checking book progress');

      const blob2 = JSON.parse(localStorage.getItem(key) || '{}');
      if (prior === undefined) delete blob2[shortId]; else blob2[shortId] = prior;
      localStorage.setItem(key, JSON.stringify(blob2));
    });
  });

  // ---- Storage.recordSrsResult's weight parameter ----
  group('Storage — recordSrsResult weight parameter', () => {
    test('a weight of 3 gives roughly a 3x shorter due interval than the default weight of 1', () => {
      const idA = '__TEST_WEIGHT__:word:1:a';
      const idB = '__TEST_WEIGHT__:word:1:b';
      try { localStorage.removeItem('hsk:srs:__TEST_WEIGHT__'); } catch (e) { /* no-op */ }
      const before = Date.now();
      Storage.recordSrsResult(idA, true); // default weight 1
      Storage.recordSrsResult(idB, true, 3);
      const dueA = Storage.getSrsRecord(idA).due - before;
      const dueB = Storage.getSrsRecord(idB).due - before;
      const ratio = dueA / dueB;
      assert(ratio > 2.9 && ratio < 3.1, `expected roughly a 3x shorter interval, got a ${ratio.toFixed(2)}x ratio`);
      try { localStorage.removeItem('hsk:srs:__TEST_WEIGHT__'); } catch (e) { /* no-op */ }
    });
    test('omitting weight (existing callers) behaves exactly as before — unaffected', () => {
      const id = '__TEST_WEIGHT__:word:1:c';
      try { localStorage.removeItem('hsk:srs:__TEST_WEIGHT__'); } catch (e) { /* no-op */ }
      Storage.recordSrsResult(id, true);
      assertEqual(Storage.getSrsRecord(id).box, 2);
      try { localStorage.removeItem('hsk:srs:__TEST_WEIGHT__'); } catch (e) { /* no-op */ }
    });
  });
})();
