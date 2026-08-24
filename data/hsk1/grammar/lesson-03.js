// HSK1 Lesson 3 -- Grammar Notes (textbook's own notes section, verbatim; pinyin authored
// for this app), extracted from the former data/grammar-data.js.
Books.registerGrammar('hsk1', '3', [
    {
      num: 1, zh: '疑问代词"什么"', zhP: 'yíwèn dàicí "shénme"',
      en: 'The Interrogative Pronoun "什么"',
      blocks: [
        {
          chinese: '疑问代词"什么"表示疑问，用在指代人或事物的疑问句中，作宾语或与名词性成分连用作定语。',
          english: 'The interrogative pronoun "什么" is used in interrogative sentences, serving as the object by itself or together with a nominal element following it.',
          examples: [
            { raw: '你叫什么名字？(Nǐ jiào shénme míngzi?)', speak: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?', en: "What's your name?" },
            { raw: '这(zhè, this)是什么(shénme)?', speak: '这是什么?', pinyin: 'Zhè shì shénme?', en: 'What is this?' },
            { raw: '那(nà, this)是什么书(shū, book)?', speak: '那是什么书?', pinyin: 'Nà shì shénme shū?', en: 'What book is that?' },
          ],
        },
      ],
    },
    {
      num: 2, zh: '"是"字句', zhP: '"shì" zì jù',
      en: 'The "是" Sentence',
      blocks: [
        {
          chinese: '"是"字句是用"是"构成的句子，用于表示某人或某物属于某一类，或者两者是同一事物。否定形式是在"是"前加副词"不"。',
          english: 'The "是" sentence is formed with the pattern "是", used to indicate that a person or thing belongs to a certain category, or that two things are equivalent or belong to the same category. The negative sentence is formed by adding the adverb "不" before "是".',
          table: {
            headers: ['Subject', '（不）是', 'Noun/Noun Phrase'],
            rows: [
              ['我', '是', '老师。'],
              ['我', '不是', '老师。'],
            ],
          },
        },
      ],
    },
    {
      num: 3, zh: '用"吗"的疑问句', zhP: 'yòng "ma" de yíwèn jù',
      en: 'Interrogative Sentences with "吗"',
      blocks: [
        {
          chinese: '语气助词"吗"表示疑问，用于陈述句末尾，把陈述句变成疑问句。',
          english: 'The particle "吗" indicates an interrogative sentence, added at the end of a declarative sentence; the declarative sentence turns into a question.',
          table: {
            headers: ['Subject', 'Verb', 'Noun/Noun Phrase', '吗'],
            rows: [
              ['你', '是', '老师', '吗？'],
              ['你', '不是', '老师', '吗？'],
            ],
          },
        },
      ],
    },
  ]);
