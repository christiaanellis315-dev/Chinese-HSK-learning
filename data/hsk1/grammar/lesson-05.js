// HSK1 Lesson 5 -- Grammar Notes (textbook's own notes section, verbatim; pinyin authored
// for this app), extracted from the former data/grammar-data.js.
Books.registerGrammar('hsk1', '5', [
    {
      num: 1, zh: '疑问代词"几"', zhP: 'yíwèn dàicí "jǐ"',
      en: 'The Interrogative Pronoun "几"',
      blocks: [
        {
          chinese: '疑问代词"几"用来询问数量的多少，一般用于询问10以下的数字。',
          english: 'The interrogative pronoun "几" is used to ask about a number, usually less than 10.',
          examples: [
            { raw: '你有几个汉语老师？', speak: '你有几个汉语老师？', pinyin: 'Nǐ yǒu jǐ ge Hànyǔ lǎoshī?' },
            { raw: '李老师家有几口人？', speak: '李老师家有几口人？', pinyin: 'Lǐ lǎoshī jiā yǒu jǐ kǒu rén?' },
            { raw: '你女儿几岁了？', speak: '你女儿几岁了？', pinyin: 'Nǐ nǚ\'ér jǐ suì le?' },
          ],
        },
      ],
    },
    {
      num: 2, zh: '百以内的数字', zhP: 'bǎi yǐnèi de shùzì',
      en: 'Numbers below 100',
      blocks: [
        {
          chinese: 'Standard construction table for numbers 1–99 (tens + ones), as printed.',
          table: {
            headers: ['', '1 yī', '2 èr', '3 sān', '4 sì', '5 wǔ', '6 liù', '7 qī', '8 bā', '9 jiǔ'],
            rows: [
              ['10 shí', '', '', '', '', '', '', '', '', '19 shíjiǔ'],
              ['20 èrshí', '', '', '23 èrshísān', '', '', '', '', '', ''],
              ['30 sānshí', '', '', '', '', '', '', '', '', ''],
              ['40 sìshí', '', '', '', '', '', '', '', '', ''],
              ['50 wǔshí', '', '', '', '', '', '56 wǔshíliù', '', '', ''],
              ['60 liùshí', '', '', '', '', '', '', '', '', ''],
              ['70 qīshí', '', '', '', '', '', '', '', '', ''],
              ['80 bāshí', '', '', '', '', '', '', '', '88 bāshíbā', ''],
              ['90 jiǔshí', '', '', '', '', '', '', '', '', '99 jiǔshíjiǔ'],
            ],
          },
          note: 'This matches the number-construction logic already implemented in the Numbers drill — tens digit + 十 + ones digit, e.g. 五十六 = wǔshíliù.',
        },
      ],
    },
    {
      num: 3, zh: '"了"表变化', zhP: '"le" biǎo biànhuà',
      en: '"了" Indicating a Change',
      blocks: [
        {
          chinese: '"了"用于句末，表示变化或新情况的出现。',
          english: '"了" is used at the end of a sentence to indicate a change or the occurrence of a new situation.',
          examples: [
            { raw: '李老师今年50岁了。', speak: '李老师今年50岁了。', pinyin: 'Lǐ lǎoshī jīnnián wǔshí suì le.' },
            { raw: '我朋友的女儿今年四岁了。', speak: '我朋友的女儿今年四岁了。', pinyin: 'Wǒ péngyou de nǚ\'ér jīnnián sì suì le.' },
            { raw: '你女儿几岁了？', speak: '你女儿几岁了？', pinyin: 'Nǐ nǚ\'ér jǐ suì le?' },
          ],
        },
      ],
    },
    {
      num: 4, zh: '"多+大"表示疑问', zhP: '"duō + dà" biǎoshì yíwèn',
      en: 'The Interrogative Phrase "多+大"',
      blocks: [
        {
          chinese: '"多"用在形容词前，表示询问程度。"多大"用于询问年龄。',
          english: '"多" is used before an adjective to ask about degree. "多大" is used to ask about age.',
          examples: [
            { raw: '你女儿多大了？', speak: '你女儿多大了？', pinyin: 'Nǐ nǚ\'ér duō dà le?' },
            { raw: '你妈妈今年多大了？', speak: '你妈妈今年多大了？', pinyin: 'Nǐ māma jīnnián duō dà le?' },
            { raw: '李老师多大了？', speak: '李老师多大了？', pinyin: 'Lǐ lǎoshī duō dà le?' },
          ],
        },
      ],
    },
  ]);
