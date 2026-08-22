// HSK1 Lesson 14 -- Grammar Notes (textbook's own notes section, verbatim; pinyin authored
// for this app), extracted from the former data/grammar-data.js.
Books.registerGrammar('hsk1', '14', [
    {
      num: 1, zh: '"了"表发生或完成', zhP: '"le" biǎo fāshēng huò wánchéng',
      en: '"了" Indicating Occurrence or Completion',
      blocks: [
        {
          chinese: '"了"用于句尾。',
          english: '"了" can be used at the end of a sentence.',
          table: {
            headers: ['Subject', 'Predicate', '了'],
            rows: [
              ['我', '去商店', '了。'],
              ['他', '去学开车', '了。'],
              ['你', '买什么', '了？'],
            ],
          },
        },
        {
          chinese: '"了"用于动词后带宾语。动词后的宾语前面一般要有定语，如数量词或形容词、代词等。',
          english: '"了" can also be used between a verb and its object. There is usually a modifier before the object of the verb, such as a numeral classifier, an adjective or a pronoun, etc.',
          table: {
            headers: ['Subject', 'Verb', '了', 'Number-Measure Word/Adjective/Pronoun', 'Object'],
            rows: [
              ['她', '买', '了', '一点儿', '苹果。'],
              ['我', '买', '了', '不少', '衣服。'],
              ['你', '看见', '了', '几个', '人？'],
            ],
          },
        },
        {
          chinese: '上述两种用法的"了"的否定形式是：没+动词（+宾语），"了"要去掉。',
          english: 'The negative form of "了" in both cases above is "没 + verb + (object)". In the negative form, "了" should be omitted.',
          table: {
            headers: ['Subject', '没', 'Predicate'],
            rows: [
              ['她', '没', '去商店。'],
              ['我', '没', '买。'],
              ['我', '没', '看见张先生。'],
            ],
          },
        },
      ],
    },
    {
      num: 2, zh: '名词"后"', zhP: 'míngcí "hòu"',
      en: 'The Noun "后"',
      blocks: [
        {
          chinese: '名词"后"表示现在或者所说的某个时间以后的时间。',
          english: 'The noun "后" indicates a period after the present time or the time being mentioned.',
          examples: [
            { raw: '五点后，40分钟后，星期三后', speak: '五点后，40分钟后，星期三后', pinyin: 'wǔ diǎn hòu, sìshí fēnzhōng hòu, xīngqīsān hòu' },
            { raw: 'A: 你几点去工作？ B: 八点后。', speak: '你几点去工作？八点后。', pinyin: 'A: Nǐ jǐ diǎn qù gōngzuò? B: Bā diǎn hòu.' },
            { raw: 'A: 你什么时候回家？ B: 五点后。', speak: '你什么时候回家？五点后。', pinyin: 'A: Nǐ shénme shíhou huí jiā? B: Wǔ diǎn hòu.' },
            { raw: 'A: 他什么时候能回来？ B: 40分钟后回来。', speak: '他什么时候能回来？40分钟后回来。', pinyin: 'A: Tā shénme shíhou néng huílai? B: Sìshí fēnzhōng hòu huílai.' },
          ],
        },
      ],
    },
    {
      num: 3, zh: '语气助词"啊"', zhP: 'yǔqì zhùcí "a"',
      en: 'The Modal Particle "啊"',
      blocks: [
        {
          chinese: '语气词"啊"用在陈述句末，使句子带上一层感情色彩。"啊"常受到前一字尾音的影响而发生不同的变音，书面上有时按变音写成不同的字。',
          english: 'The modal particle "啊" is used at the end of a declarative sentence to set the mood. The pronunciation of "啊" varies with the finals of the syllables before it, and in written Chinese, the variants are represented by different characters sometimes.',
          table: {
            headers: ['The Final of the Syllable before It', 'The Pronunciation of "啊"'],
            rows: [
              ['a, e, i, o, ü', 'a → ia'],
              ['u, ao, ou', 'a → ua'],
              ['-n', 'a → na'],
              ['-ng', 'a → nga'],
              ['-i (zi, ci, si)', 'a → za'],
              ['-i (zhi, chi, shi, ri)', 'a → ra'],
            ],
          },
          examples: [
            { raw: 'A: 你是王小姐吗？ B: 是啊。', speak: '你是王小姐吗？是啊。', pinyin: 'A: Nǐ shì Wáng xiǎojiě ma? B: Shì a.' },
            { raw: 'A: 你想去吃中国菜吗？ B: 好啊。', speak: '你想去吃中国菜吗？好啊。', pinyin: 'A: Nǐ xiǎng qù chī Zhōngguó cài ma? B: Hǎo a.' },
            { raw: 'A: 王方的衣服太漂亮了！ B: 是啊，她买了不少衣服。', speak: '王方的衣服太漂亮了！是啊，她买了不少衣服。', pinyin: 'A: Wáng Fāng de yīfu tài piàoliang le! B: Shì a, tā mǎile bùshǎo yīfu.' },
          ],
        },
      ],
    },
    {
      num: 4, zh: '副词"都"', zhP: 'fùcí "dōu"',
      en: 'The Adverb "都"',
      blocks: [
        {
          chinese: '"都"表示总括全部，所总括的对象必须放在"都"的前面。',
          english: '"都" means "both/all". The people or objects included are put before "都".',
          examples: [
            { raw: '我们都是中国人。', speak: '我们都是中国人。', pinyin: 'Wǒmen dōu shì Zhōngguó rén.' },
            { raw: '他们都喜欢喝茶。', speak: '他们都喜欢喝茶。', pinyin: 'Tāmen dōu xǐhuan hē chá.' },
            { raw: '这些都是王方的东西。', speak: '这些都是王方的东西。', pinyin: 'Zhèxiē dōu shì Wáng Fāng de dōngxi.' },
          ],
        },
      ],
    },
  ]);
