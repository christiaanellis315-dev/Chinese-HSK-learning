// HSK1 Lesson 7 -- Grammar Notes (textbook's own notes section, verbatim; pinyin authored
// for this app), extracted from the former data/grammar-data.js.
Books.registerGrammar('hsk1', '7', [
    {
      num: 1, zh: '日期的表达 (1)：月、日/号、星期', zhP: 'rìqī de biǎodá (1)：yuè、rì/hào、xīngqī',
      en: "Expression of a Date (1): month, date, day of the week",
      blocks: [
        {
          chinese: '汉语的日期表达方式遵循由大到小的原则，先说"月"，然后说"日/号"，最后说"星期"。口语一般常用"号"。',
          english: 'The way to say a date in Chinese observes the principle of "the bigger unit coming before the smaller one". The month is said first, then the date and finally the day of the week. In spoken Chinese, "号" is often used instead of "日" to express the date.',
          examples: [
            { raw: '9月1号，星期三。', speak: '9月1号，星期三。', pinyin: 'Jiǔ yuè yī hào, xīngqīsān.', en: 'September 1st, Wednesday.' },
            { raw: '9月2号，星期四。', speak: '9月2号，星期四。', pinyin: 'Jiǔ yuè èr hào, xīngqīsì.', en: 'September 2nd, Thursday.' },
            { raw: '8月31号，星期二。', speak: '8月31号，星期二。', pinyin: 'Bā yuè sānshíyī hào, xīngqī\'èr.', en: 'August 31st, Tuesday.' },
          ],
        },
      ],
    },
    {
      num: 2, zh: '名词谓语句', zhP: 'míngcí wèiyǔ jù',
      en: 'Sentences with a Nominal Predicate',
      blocks: [
        {
          chinese: '名词谓语句是谓语部分由名词性成分充当的句子，一般用于表达年龄、时间、日期等。',
          english: 'A sentence with a nominal predicate is a sentence whose predicate is a nominal element. It is usually used to indicate age, time, date and so on.',
          table: {
            headers: ['Subject', 'Predicate'],
            rows: [
              ['我的汉语老师', '33岁。'],
              ['明天', '星期三。'],
              ['今天', '9月1号。'],
            ],
          },
        },
      ],
    },
    {
      num: 3, zh: '连动句 (1)：去+地方+做什么', zhP: 'liándòng jù (1)：qù + dìfang + zuò shénme',
      en: 'Sentences with a Serial Verb Construction (1): 去 + place + to do sth.',
      blocks: [
        {
          chinese: '连动句的谓语部分由两个或者两个以上动词构成，后一个动作可以表示前一个动作的目的。第一个动词后表示地点的宾语有时可以省略。',
          english: 'The predicate of a sentence with a serial verb construction consists of two or more verbs. The latter verb can be the purpose of the former. The object of the first verb, i.e. the place, can sometimes be omitted.',
          table: {
            headers: ['Subject', 'Verb1 (去)', '(place)', 'Verb2 (to do sth.)'],
            rows: [
              ['我', '去', '（中国）', '学习汉语。'],
              ['我们', '去', '（中国饭馆儿）', '吃中国菜。'],
              ['我', '去', '（学校）', '看书。'],
            ],
          },
        },
      ],
    },
  ]);
