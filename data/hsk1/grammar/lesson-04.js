// HSK1 Lesson 4 -- Grammar Notes (textbook's own notes section, verbatim; pinyin authored
// for this app), extracted from the former data/grammar-data.js.
Books.registerGrammar('hsk1', '4', [
    {
      num: 1, zh: '疑问代词"谁"、"哪"', zhP: 'yíwèn dàicí "shéi"、"nǎ"',
      en: 'The Interrogative Pronouns "谁" and "哪"',
      blocks: [
        {
          chinese: '疑问代词"谁"在疑问句中用来询问人。',
          english: 'The interrogative pronoun "谁" is used to ask about the name or identity of a person.',
          table: {
            headers: ['Subject', 'Verb', 'Object'],
            rows: [
              ['谁', '是', '李月？'],
              ['她', '是', '谁？'],
              ['他', '是', '谁？'],
            ],
          },
        },
        {
          chinese: '疑问代词"哪"用在疑问句中的结构形式为：哪+量词/名词+名词。',
          english: 'When the interrogative pronoun "哪" is used in a question, the structure is "哪 + measure word/noun + noun".',
          examples: [
            { raw: '哪本 (běn, a measure word for books) 书 (shū, book)？', speak: '哪本书？', pinyin: 'Nǎ běn shū?' },
            { raw: '哪个 (gè, a general measure word) 人？', speak: '哪个人？', pinyin: 'Nǎge rén?' },
            { raw: '你是哪国人？', speak: '你是哪国人？', pinyin: 'Nǐ shì nǎ guó rén?' },
          ],
        },
      ],
    },
    {
      num: 2, zh: '结构助词"的"', zhP: 'jiégòu zhùcí "de"',
      en: 'The Structural Particle "的"',
      blocks: [
        {
          chinese: '名词/代词+的+名词，表达一种所属关系。当"的"后的名词是亲属称谓或者指人的名词时，"的"可以省略。',
          english: 'The structure "noun/pronoun + 的 + noun" indicates possession. When the noun following "的" is a term of kinship or indicates a person, "的" can be omitted.',
          examples: [
            { raw: '李月是我的老师。', speak: '李月是我的老师。', pinyin: 'Lǐ Yuè shì wǒ de lǎoshī.' },
            { raw: '这 (zhè, this) 是我的书 (shū, book)。', speak: '这是我的书。', pinyin: 'Zhè shì wǒ de shū.' },
            { raw: '她不是我同学，她是我朋友。', speak: '她不是我同学，她是我朋友。', pinyin: 'Tā bú shì wǒ tóngxué, tā shì wǒ péngyou.' },
          ],
        },
      ],
    },
    {
      num: 3, zh: '疑问助词"呢" (1)', zhP: 'yíwèn zhùcí "ne" (1)',
      en: 'The Interrogative Particle "呢" (1)',
      blocks: [
        {
          chinese: '疑问助词"呢"用在名词或代词后构成疑问句，用于询问上文提到的情况。常用的句式是：A……。B呢？',
          english: 'The interrogative particle "呢" is used after a noun or pronoun, forming a question about the situation mentioned previously. The commonly used sentence pattern is "A……。B呢？" (A…. What about B?).',
          examples: [
            { raw: '我不是老师，我是学生。你呢？', speak: '我不是老师，我是学生。你呢？', pinyin: 'Wǒ bú shì lǎoshī, wǒ shì xuésheng. Nǐ ne?' },
            { raw: '她叫李月。他呢？', speak: '她叫李月。他呢？', pinyin: 'Tā jiào Lǐ Yuè. Tā ne?' },
            { raw: '我是美国人。你呢？', speak: '我是美国人。你呢？', pinyin: 'Wǒ shì Měiguó rén. Nǐ ne?' },
          ],
        },
      ],
    },
  ]);
