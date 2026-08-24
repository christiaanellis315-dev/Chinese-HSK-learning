// HSK1 Lesson 6 -- Grammar Notes (textbook's own notes section, verbatim; pinyin authored
// for this app), extracted from the former data/grammar-data.js.
Books.registerGrammar('hsk1', '6', [
    {
      num: 1, zh: '能愿动词"会" (1)', zhP: 'néngyuàn dòngcí "huì" (1)',
      en: 'The Modal Verb "会" (1)',
      blocks: [
        {
          chinese: '能愿动词"会"用在动词前表示通过学习而获得某种能力，它的否定式是"不会"。',
          english: 'The modal verb "会" is used before a verb, indicating acquiring an ability through learning. Its negative form is "不会".',
          table: {
            headers: ['Subject', '（不）会', 'Verb'],
            rows: [
              ['我', '会', '写汉字。'],
              ['我', '不会', '做中国菜。'],
              ['你妈妈', '会', '说汉语吗？'],
            ],
          },
        },
      ],
    },
    {
      num: 2, zh: '形容词谓语句', zhP: 'xíngróngcí wèiyǔ jù',
      en: 'Sentences with an Adjectival Predicate',
      blocks: [
        {
          chinese: '形容词可以用在"主语+程度副词+形容词"这个结构中，描述人或事物的性质或状态，程度副词经常用"很"。否定形式为"主语+不+形容词"。',
          english: 'Used in the structure "subject + adverb of degree + adjective", the adjective describes the nature or state of somebody or something, usually following the adverb of degree "很". The negative form is "subject + 不 + adjective".',
          table: {
            headers: ['Subject', 'Adverb of Degree/不', 'Adjective'],
            rows: [
              ['我', '很', '好。'],
              ['我妈妈的汉语', '不', '好。'],
              ['中国菜', '很', '好吃。'],
            ],
          },
        },
      ],
    },
    {
      num: 3, zh: '疑问代词"怎么" (1)', zhP: 'yíwèn dàicí "zěnme" (1)',
      en: 'The Interrogative Pronoun "怎么" (1)',
      blocks: [
        {
          chinese: '疑问代词"怎么"用在动词前，询问动作的方式。',
          english: 'The interrogative pronoun "怎么" is used before a verb to ask about the manner of an action.',
          examples: [
            { raw: '这个汉字怎么读？', speak: '这个汉字怎么读？', pinyin: 'Zhège Hànzì zěnme dú?', en: 'How do you read this character?' },
            { raw: '你的汉语名字怎么写？', speak: '你的汉语名字怎么写？', pinyin: 'Nǐ de Hànyǔ míngzi zěnme xiě?', en: 'How do you write your Chinese name?' },
            { raw: '这个字怎么写？', speak: '这个字怎么写？', pinyin: 'Zhège zì zěnme xiě?', en: 'How do you write this character?' },
          ],
        },
      ],
    },
  ]);
