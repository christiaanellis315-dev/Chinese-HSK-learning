// Data integrity checks. These replace the manual "count the words, grep the file" verification
// that used to happen by hand once per data-authoring change — now it runs every time this page
// loads instead of relying on remembering to redo it. Runs the same suite of checks against every
// book that actually has content (HSK1, HSK2), parameterized by that book's own expected counts —
// see runBookChecks() below.
(() => {
  const { group, test, assert, assertEqual } = TestRunner;

  group('Book registry', () => {
    test('lists exactly HSK1, HSK2, HSK3', () => {
      assertEqual(Books.listBooks().map((b) => b.id), ['hsk1', 'hsk2', 'hsk3']);
    });
    test('HSK1 and HSK2 have content; HSK3 does not yet', () => {
      assert(Books.hasContent('hsk1'), 'hsk1 should have lesson content');
      assert(Books.hasContent('hsk2'), 'hsk2 should have lesson content');
      assert(!Books.hasContent('hsk3'), 'hsk3 should have no lesson content yet');
    });
    test('an unregistered book returns empty arrays, not throwing', () => {
      assertEqual(Books.getLessonOrder('hsk3'), []);
      assertEqual(Books.getGrammarOrder('hsk3'), []);
    });
  });

  // One parameterized suite, run once per book with real content — keeps HSK1 and HSK2 (and
  // whatever comes after) checked by the exact same logic instead of two hand-maintained copies
  // that could quietly drift apart.
  function runBookChecks(book) {
    const BOOK = book.id;

    group(`${book.label} — Lessons data`, () => {
      test('lesson order has all 15 lessons, in order', () => {
        assertEqual(Books.getLessonOrder(BOOK), ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15']);
      });

      test('every lesson has a title, titleP, and words array', () => {
        Books.getLessonOrder(BOOK).forEach((id) => {
          const lesson = Books.getLesson(BOOK, id);
          assert(lesson, `lesson ${id} missing`);
          assert(typeof lesson.title === 'string' && lesson.title.length > 0, `lesson ${id} missing title`);
          assert(typeof lesson.titleP === 'string' && lesson.titleP.length > 0, `lesson ${id} missing titleP`);
          assert(Array.isArray(lesson.words), `lesson ${id} words is not an array`);
        });
      });

      test(`word counts per lesson match the textbook (${book.totalWords} total)`, () => {
        let total = 0;
        Books.getLessonOrder(BOOK).forEach((id) => {
          const count = Books.getLesson(BOOK, id).words.length;
          total += count;
          assertEqual(count, book.expectedWordCounts[id], `lesson ${id} word count`);
        });
        assertEqual(total, book.totalWords, 'total word count across all lessons');
      });

      test('every word has the required fields, and hanzi always has pinyin alongside it', () => {
        Books.getLessonOrder(BOOK).forEach((id) => {
          Books.getLesson(BOOK, id).words.forEach((w) => {
            assert(w.h, `lesson ${id} has a word with no hanzi`);
            assert(w.p, `${w.h} (lesson ${id}) missing pinyin`);
            assert(w.e, `${w.h} (lesson ${id}) missing English gloss`);
            assert(w.m, `${w.h} (lesson ${id}) missing mnemonic`);
          });
        });
      });

      test(`every word has an example sentence, with hanzi + pinyin + English all present together (${book.totalWords} total)`, () => {
        let withExample = 0;
        Books.getLessonOrder(BOOK).forEach((id) => {
          Books.getLesson(BOOK, id).words.forEach((w) => {
            const hasAny = w.ex || w.exp || w.exe;
            const hasAll = w.ex && w.exp && w.exe;
            if (hasAny) {
              assert(hasAll, `${w.h} (lesson ${id}) has a partial example sentence — ex/exp/exe must all be present together`);
              withExample++;
            }
          });
        });
        assertEqual(withExample, book.totalWords, 'words with an example sentence');
      });
    });

    group(`${book.label} — Listening data`, () => {
      test('lessons with no listening data are exactly the expected gap, all others have items', () => {
        Books.getLessonOrder(BOOK).forEach((id) => {
          const listening = Books.getLesson(BOOK, id).listening;
          if (book.listeningLessons.indexOf(id) === -1) {
            assert(!listening, `lesson ${id} should not have listening data`);
          } else {
            assert(Array.isArray(listening) && listening.length > 0, `lesson ${id} missing listening data`);
          }
        });
      });

      test('every listening item has 3 options, a valid correct index, and an English translation', () => {
        book.listeningLessons.forEach((id) => {
          Books.getLesson(BOOK, id).listening.forEach((it, i) => {
            assert(it.sentence && it.sentenceP && it.sentenceE, `lesson ${id} item ${i} missing sentence/pinyin/English`);
            assert(it.question && it.questionP, `lesson ${id} item ${i} missing question/pinyin`);
            assertEqual(it.options.length, 3, `lesson ${id} item ${i} option count`);
            assertEqual(it.optionsP.length, 3, `lesson ${id} item ${i} optionsP count`);
            assert(Number.isInteger(it.correct) && it.correct >= 0 && it.correct <= 2, `lesson ${id} item ${i} correct index out of range`);
          });
        });
      });
    });

    group(`${book.label} — Sentence Builder data`, () => {
      test('sentence-builder lessons have exactly 2 exercises each, others have none', () => {
        Books.getLessonOrder(BOOK).forEach((id) => {
          const sb = Books.getLesson(BOOK, id).sentenceBuilder;
          if (book.sentenceBuilderLessons.indexOf(id) === -1) {
            assert(!sb, `lesson ${id} should not have Sentence Builder data`);
          } else {
            assertEqual(sb.length, 2, `lesson ${id} exercise count`);
          }
        });
      });

      test('every exercise has exactly 2 decoys, at least 1 answer tile, and prompt/answer text', () => {
        book.sentenceBuilderLessons.forEach((id) => {
          Books.getLesson(BOOK, id).sentenceBuilder.forEach((ex, i) => {
            assert(ex.prompt && ex.promptP && ex.promptE, `lesson ${id} ex ${i} missing prompt fields`);
            assert(ex.answer && ex.answerP && ex.answerE, `lesson ${id} ex ${i} missing answer fields`);
            assert(Array.isArray(ex.tiles) && ex.tiles.length >= 1, `lesson ${id} ex ${i} needs at least 1 answer tile`);
            assertEqual((ex.decoys || []).length, 2, `lesson ${id} ex ${i} decoy count`);
            ex.tiles.concat(ex.decoys).forEach((t) => {
              assert(t.h && t.p, `lesson ${id} ex ${i} has a tile with no hanzi/pinyin`);
            });
          });
        });
      });

      test('answer tiles reconstruct the full answer sentence (punctuation-insensitive)', () => {
        // Multi-clause answers ("A，B。") carry a mid-sentence comma that belongs to neither tile —
        // it's part of the answer's own display punctuation, not a word — so this strips all
        // 。？！， rather than just a trailing mark before comparing.
        book.sentenceBuilderLessons.forEach((id) => {
          Books.getLesson(BOOK, id).sentenceBuilder.forEach((ex, i) => {
            const reconstructed = ex.tiles.map((t) => t.h).join('');
            const stripped = ex.answer.replace(/[。？！，]/g, '');
            assertEqual(reconstructed, stripped, `lesson ${id} ex ${i} tiles don't reconstruct the answer sentence`);
          });
        });
      });
    });

    group(`${book.label} — Grammar data`, () => {
      test('grammar order covers the expected lessons', () => {
        assertEqual(Books.getGrammarOrder(BOOK), book.grammarLessons);
      });

      test(`${book.totalGrammarPoints} grammar points total, each with zh/zhP/en and at least one block`, () => {
        let total = 0;
        Books.getGrammarOrder(BOOK).forEach((id) => {
          const points = Books.getGrammar(BOOK, id);
          assert(Array.isArray(points) && points.length > 0, `lesson ${id} has no grammar points`);
          points.forEach((pt) => {
            assert(pt.zh && pt.zhP && pt.en, `a grammar point in lesson ${id} is missing zh/zhP/en`);
            assert(Array.isArray(pt.blocks) && pt.blocks.length > 0, `a grammar point in lesson ${id} has no blocks`);
            total++;
          });
        });
        assertEqual(total, book.totalGrammarPoints, 'total grammar point count');
      });
    });
  }

  runBookChecks({
    id: 'hsk1', label: 'HSK1',
    expectedWordCounts: { '1':6,'2':4,'3':12,'4':10,'5':10,'6':12,'7':12,'8':15,'9':13,'10':14,'11':12,'12':13,'13':11,'14':17,'15':9 },
    totalWords: 170,
    listeningLessons: ['4','5','6','7','8','9','10','11','12','13','14','15'],
    sentenceBuilderLessons: ['3','4','5','6','7','8','9','10','11','12','13','14','15'],
    grammarLessons: ['3','4','5','6','7','8','9','10','11','12','13','14','15'],
    totalGrammarPoints: 45,
  });

  runBookChecks({
    id: 'hsk2', label: 'HSK2',
    expectedWordCounts: { '1':12,'2':15,'3':16,'4':13,'5':14,'6':13,'7':13,'8':10,'9':11,'10':9,'11':11,'12':9,'13':11,'14':7,'15':8 },
    totalWords: 172,
    listeningLessons: ['1','2','3','4','5','6','7','9','10','11','12','13','14','15'], // 8 is a known source gap
    sentenceBuilderLessons: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15'],
    grammarLessons: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15'],
    totalGrammarPoints: 44,
  });

  group('Pinyin reference data', () => {
    test('TONES, INITIALS, and FINALS are all present', () => {
      // 4 tones + the neutral tone
      assert(TONES && Object.keys(TONES).length === 5, 'TONES should have 5 entries (4 tones + neutral)');
      assert(Array.isArray(INITIALS) && INITIALS.length > 0, 'INITIALS should be a non-empty array');
      assert(FINALS && Object.keys(FINALS).length > 0, 'FINALS should have entries');
    });
  });
})();
