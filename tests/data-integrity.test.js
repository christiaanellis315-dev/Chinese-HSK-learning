// Data integrity checks. These replace the manual "count the words, grep the file" verification
// that used to happen by hand once per data-authoring change — now it runs every time this page
// loads instead of relying on remembering to redo it.
(() => {
  const { group, test, assert, assertEqual } = TestRunner;

  const EXPECTED_WORD_COUNTS = {
    '1': 6, '2': 4, '3': 12, '4': 10, '5': 10, '6': 12, '7': 12,
    '8': 15, '9': 13, '10': 14, '11': 12, '12': 13, '13': 11, '14': 17, '15': 9,
  };
  const LESSONS_WITH_LISTENING = ['4','5','6','7','8','9','10','11','12','13','14','15'];
  const SENTENCE_BUILDER_LESSONS = ['3','4','5','6','7','8','9','10','11','12','13','14','15'];

  group('Lessons data', () => {
    test('LESSON_ORDER has all 15 lessons, in order', () => {
      assertEqual(LESSON_ORDER, ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15']);
    });

    test('every lesson has a title, titleP, and words array', () => {
      LESSON_ORDER.forEach((id) => {
        const lesson = LESSONS[id];
        assert(lesson, `lesson ${id} missing`);
        assert(typeof lesson.title === 'string' && lesson.title.length > 0, `lesson ${id} missing title`);
        assert(typeof lesson.titleP === 'string' && lesson.titleP.length > 0, `lesson ${id} missing titleP`);
        assert(Array.isArray(lesson.words), `lesson ${id} words is not an array`);
      });
    });

    test('word counts per lesson match the textbook (170 total)', () => {
      let total = 0;
      LESSON_ORDER.forEach((id) => {
        const count = LESSONS[id].words.length;
        total += count;
        assertEqual(count, EXPECTED_WORD_COUNTS[id], `lesson ${id} word count`);
      });
      assertEqual(total, 170, 'total word count across all lessons');
    });

    test('every word has the required fields, and hanzi always has pinyin alongside it', () => {
      LESSON_ORDER.forEach((id) => {
        LESSONS[id].words.forEach((w) => {
          assert(w.h, `lesson ${id} has a word with no hanzi`);
          assert(w.p, `${w.h} (lesson ${id}) missing pinyin`);
          assert(w.e, `${w.h} (lesson ${id}) missing English gloss`);
          assert(w.m, `${w.h} (lesson ${id}) missing mnemonic`);
        });
      });
    });

    test('every word has an example sentence, with hanzi + pinyin + English all present together', () => {
      let withExample = 0;
      LESSON_ORDER.forEach((id) => {
        LESSONS[id].words.forEach((w) => {
          const hasAny = w.ex || w.exp || w.exe;
          const hasAll = w.ex && w.exp && w.exe;
          if (hasAny) {
            assert(hasAll, `${w.h} (lesson ${id}) has a partial example sentence — ex/exp/exe must all be present together`);
            withExample++;
          }
        });
      });
      assertEqual(withExample, 170, 'words with an example sentence');
    });
  });

  group('Listening data', () => {
    test('lessons 1-3 have no listening data, lessons 4-15 do', () => {
      LESSON_ORDER.forEach((id) => {
        const listening = LESSONS[id].listening;
        if (LESSONS_WITH_LISTENING.indexOf(id) === -1) {
          assert(!listening, `lesson ${id} should not have listening data yet`);
        } else {
          assert(Array.isArray(listening) && listening.length > 0, `lesson ${id} missing listening data`);
        }
      });
    });

    test('every listening item has 3 options, a valid correct index, and an English translation', () => {
      LESSONS_WITH_LISTENING.forEach((id) => {
        LESSONS[id].listening.forEach((it, i) => {
          assert(it.sentence && it.sentenceP && it.sentenceE, `lesson ${id} item ${i} missing sentence/pinyin/English`);
          assert(it.question && it.questionP, `lesson ${id} item ${i} missing question/pinyin`);
          assertEqual(it.options.length, 3, `lesson ${id} item ${i} option count`);
          assertEqual(it.optionsP.length, 3, `lesson ${id} item ${i} optionsP count`);
          assert(Number.isInteger(it.correct) && it.correct >= 0 && it.correct <= 2, `lesson ${id} item ${i} correct index out of range`);
        });
      });
    });
  });

  group('Sentence Builder data', () => {
    test('lessons 3-15 have exactly 2 exercises each, lessons 1-2 have none', () => {
      LESSON_ORDER.forEach((id) => {
        const sb = LESSONS[id].sentenceBuilder;
        if (SENTENCE_BUILDER_LESSONS.indexOf(id) === -1) {
          assert(!sb, `lesson ${id} should not have Sentence Builder data yet`);
        } else {
          assertEqual(sb.length, 2, `lesson ${id} exercise count`);
        }
      });
    });

    test('every exercise has exactly 2 decoys, at least 1 answer tile, and prompt/answer text', () => {
      SENTENCE_BUILDER_LESSONS.forEach((id) => {
        LESSONS[id].sentenceBuilder.forEach((ex, i) => {
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

    test('answer tiles reconstruct the full answer sentence (minus trailing punctuation)', () => {
      SENTENCE_BUILDER_LESSONS.forEach((id) => {
        LESSONS[id].sentenceBuilder.forEach((ex, i) => {
          const reconstructed = ex.tiles.map((t) => t.h).join('');
          const stripped = ex.answer.replace(/[。？！]+$/, '');
          assertEqual(reconstructed, stripped, `lesson ${id} ex ${i} tiles don't reconstruct the answer sentence`);
        });
      });
    });
  });

  group('Grammar data', () => {
    test('GRAMMAR_LESSON_ORDER covers lessons 3-15', () => {
      assertEqual(GRAMMAR_LESSON_ORDER, ['3','4','5','6','7','8','9','10','11','12','13','14','15']);
    });

    test('45 grammar points total, each with zh/zhP/en and at least one block', () => {
      let total = 0;
      GRAMMAR_LESSON_ORDER.forEach((id) => {
        const points = GRAMMAR[id];
        assert(Array.isArray(points) && points.length > 0, `lesson ${id} has no grammar points`);
        points.forEach((pt) => {
          assert(pt.zh && pt.zhP && pt.en, `a grammar point in lesson ${id} is missing zh/zhP/en`);
          assert(Array.isArray(pt.blocks) && pt.blocks.length > 0, `a grammar point in lesson ${id} has no blocks`);
          total++;
        });
      });
      assertEqual(total, 45, 'total grammar point count');
    });
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
