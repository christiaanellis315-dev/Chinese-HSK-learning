// HSK1 Lesson 15 -- Grammar Notes (textbook's own notes section, verbatim; pinyin authored
// for this app), extracted from the former data/grammar-data.js.
Books.registerGrammar('hsk1', '15', [
    {
      num: 1, zh: '"是……的"句：强调时间、地点、方式', zhP: '"shì……de" jù：qiángdiào shíjiān、dìdiǎn、fāngshì',
      en: 'The Structure "是……的": used to emphasize time, place or manner',
      blocks: [
        {
          chinese: '在已经知道事情发生的情况下，可以用"是……的"强调事情发生的时间、地点、方式等。肯定句和疑问句中的"是"字可以省略，否定句中不能省略。',
          english: 'When the occurrence of something is known, "是……的" can be used to emphasize when, where and in which manner it occurred. "是" can be omitted in positive and interrogative sentences, but not in negative sentences.',
          table: {
            headers: ['Subject', '是', 'Time/Place/Manner', 'Verb', '的'],
            rows: [
              ['我', '是', '昨天', '来', '的。'],
              ['这', '是', '在北京', '买', '的。'],
              ['你们', '是', '怎么', '来饭店', '的？'],
            ],
          },
        },
        {
          chinese: '（否定形式）',
          english: 'Negative form:',
          table: {
            headers: ['Subject', '不', '是', 'Time/Place/Manner', 'Verb', '的'],
            rows: [
              ['我', '不', '是', '昨天', '来', '的。'],
              ['这', '不', '是', '在北京', '买', '的。'],
              ['我们', '不', '是', '坐出租车', '来', '的。'],
            ],
          },
        },
      ],
    },
    {
      num: 2, zh: '日期的表达 (2)：年、月、日/号、星期', zhP: 'rìqī de biǎodá (2)：nián、yuè、rì/hào、xīngqī',
      en: 'Expression of a Date (2): year, month, date, day of the week',
      blocks: [
        {
          chinese: '汉语中日期的写法和读法都是从大到小。年要分别读出每个数字，再加上"年"；月、日要读出整个数字，再加上"月"、"日/号"。星期的读法是"星期"加上数字。如"2008年8月8号，星期五"读是"èr líng líng bā nián bā yuè bā hào, xīngqī wǔ"。',
          english: 'Chinese dates are written and read from the bigger unit to the smaller. A year is read digit by digit, followed by the character "年". A month or date is read the whole number followed by "月" and "日/号" respectively. A day of the week is expressed by the word "星期" plus a specific number. For example, "August 8th of 2008, Friday" is read as "èr líng líng bā nián bā yuè bā hào, xīngqī wǔ".',
        },
      ],
    },
  ]);
