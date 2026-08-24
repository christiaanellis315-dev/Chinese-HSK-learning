// HSK1 Lesson 9 -- Grammar Notes (textbook's own notes section, verbatim; pinyin authored
// for this app), extracted from the former data/grammar-data.js.
Books.registerGrammar('hsk1', '9', [
    {
      num: 1, zh: '动词"在"', zhP: 'dòngcí "zài"',
      en: 'The Verb "在"',
      blocks: [
        {
          chinese: '"在"是动词，后边加上表示位置的词语做句子的谓语，用于指示人或者事物的位置。',
          english: '"在" is a verb. When it is followed by a word of locality and acts as the predicate of a sentence, it indicates the location of somebody or something.',
          table: {
            headers: ['Subject', '在', 'Word of Locality/Direction'],
            rows: [
              ['我朋友', '在', '学校。'],
              ['我妈妈', '在', '家。'],
              ['小狗', '在', '椅子下面。'],
            ],
          },
        },
      ],
    },
    {
      num: 2, zh: '疑问代词"哪儿"', zhP: 'yíwèn dàicí "nǎr"',
      en: 'The Interrogative Pronoun "哪儿"',
      blocks: [
        {
          chinese: '疑问代词"哪儿"用于疑问句中，询问人或事物的位置。',
          english: 'The interrogative pronoun "哪儿" is used to ask about the location of somebody or something.',
          examples: [
            { raw: '我的杯子在哪儿？', speak: '我的杯子在哪儿？', pinyin: 'Wǒ de bēizi zài nǎr?', en: 'Where is my cup?' },
            { raw: '你的中国朋友在哪儿？', speak: '你的中国朋友在哪儿？', pinyin: 'Nǐ de Zhōngguó péngyou zài nǎr?', en: 'Where is your Chinese friend?' },
            { raw: '小猫在哪儿？', speak: '小猫在哪儿？', pinyin: 'Xiǎo māo zài nǎr?', en: 'Where is the kitty?' },
          ],
        },
      ],
    },
    {
      num: 3, zh: '介词"在"', zhP: 'jiècí "zài"',
      en: 'The Preposition "在"',
      blocks: [
        {
          chinese: '"在"也是介词，后边加上表示位置的词语，用于介绍动作行为发生的位置。',
          english: '"在" can also act as a preposition, used before a word of locality to introduce the place where an action or behavior takes place.',
          table: {
            headers: ['Subject', '在', 'Word of Locality/Direction', 'Verb'],
            rows: [
              ['我', '在', '朋友家', '喝茶。'],
              ['他们', '在', '学校', '看书。'],
              ['我儿子', '在', '医院', '工作。'],
            ],
          },
        },
      ],
    },
    {
      num: 4, zh: '疑问助词"呢" (2)', zhP: 'yíwèn zhùcí "ne" (2)',
      en: 'The Interrogative Particle "呢" (2)',
      blocks: [
        {
          chinese: '疑问助词"呢"用在句末，表示疑问，用于询问人或事物的位置。',
          english: 'Used at the end of a sentence, the interrogative particle "呢" asks about the location of somebody or something.',
          examples: [
            { raw: '我的小猫呢？', speak: '我的小猫呢？', pinyin: 'Wǒ de xiǎo māo ne?', en: "Where's my kitty?" },
            { raw: '我的杯子呢？', speak: '我的杯子呢？', pinyin: 'Wǒ de bēizi ne?', en: "Where's my cup?" },
            { raw: '他在哪儿呢？', speak: '他在哪儿呢？', pinyin: 'Tā zài nǎr ne?', en: 'Where is he?' },
          ],
        },
      ],
    },
  ]);
