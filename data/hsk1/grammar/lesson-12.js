// HSK1 Lesson 12 -- Grammar Notes (textbook's own notes section, verbatim; pinyin authored
// for this app), extracted from the former data/grammar-data.js.
Books.registerGrammar('hsk1', '12', [
    {
      num: 1, zh: '疑问代词"怎么样"', zhP: 'yíwèn dàicí "zěnmeyàng"',
      en: 'The Interrogative Pronoun "怎么样"',
      blocks: [
        {
          chinese: '"怎么样"用来询问状况。',
          english: '"怎么样" is used to ask about the condition of something or someone.',
          examples: [
            { raw: '你的汉语怎么样？', speak: '你的汉语怎么样？', pinyin: 'Nǐ de Hànyǔ zěnmeyàng?' },
            { raw: '你妈妈身体怎么样？', speak: '你妈妈身体怎么样？', pinyin: 'Nǐ māma shēntǐ zěnmeyàng?' },
            { raw: '明天天气怎么样？', speak: '明天天气怎么样？', pinyin: 'Míngtiān tiānqì zěnmeyàng?' },
          ],
        },
      ],
    },
    {
      num: 2, zh: '主谓谓语句', zhP: 'zhǔ-wèi wèiyǔ jù',
      en: 'Sentences with a Subject-Predicate Phrase as the Predicate',
      blocks: [
        {
          chinese: '主谓谓语句中的谓语是一个主谓结构的短语，它的格式是：全句主语+全句谓语（主语+谓语）。',
          english: 'In Chinese, there is such a kind of sentence in which the predicate is a subject-predicate phrase. The structure is: Subject of the Sentence + Predicate of the Sentence (Subject + Predicate).',
          table: {
            headers: ['Subject', 'Predicate: Subject', 'Predicate: Predicate'],
            rows: [
              ['我', '身体', '不太好。'],
              ['明天', '天气', '很好。'],
              ['你', '身体', '怎么样？'],
            ],
          },
          note: 'The subject in the subject-predicate phrase is usually part of the subject of the sentence or related to it.',
        },
      ],
    },
    {
      num: 3, zh: '程度副词"太"', zhP: 'chéngdù fùcí "tài"',
      en: 'The Adverb "太"',
      blocks: [
        {
          chinese: '副词"太"表示程度深的意义。用"太"的句尾常带"了"。否定句不用"了"。',
          english: 'The adverb "太" indicates a high degree. "了" is often used at the end of the sentences with "太", but not in negative sentences.',
          examples: [
            { raw: '太热了。', speak: '太热了。', pinyin: 'Tài rè le.' },
            { raw: '天气太冷了。', speak: '天气太冷了。', pinyin: 'Tiānqì tài lěng le.' },
            { raw: '我身体不太好。', speak: '我身体不太好。', pinyin: 'Wǒ shēntǐ bú tài hǎo.' },
          ],
        },
      ],
    },
    {
      num: 4, zh: '能愿动词"会" (2)', zhP: 'néngyuàn dòngcí "huì" (2)',
      en: 'The Modal Verb "会" (2)',
      blocks: [
        {
          chinese: '"会"在句中表示所说的情况有可能实现。',
          english: '"会" indicates the possibility of the situation mentioned.',
          examples: [
            { raw: 'A: 爸爸八点前会回家吗？ B: 会。', speak: '爸爸八点前会回家吗？会。', pinyin: 'A: Bàba bā diǎn qián huì huí jiā ma? B: Huì.' },
            { raw: 'A: 明天她会来吗？ B: 她会来。', speak: '明天她会来吗？她会来。', pinyin: 'A: Míngtiān tā huì lái ma? B: Tā huì lái.' },
            { raw: 'A: 今天会下雨吗？ B: 今天不会下雨。', speak: '今天会下雨吗？今天不会下雨。', pinyin: 'A: Jīntiān huì xià yǔ ma? B: Jīntiān bú huì xià yǔ.' },
          ],
        },
      ],
    },
  ]);
