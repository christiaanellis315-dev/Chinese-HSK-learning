// HSK1 Lesson 11 -- Grammar Notes (textbook's own notes section, verbatim; pinyin authored
// for this app), extracted from the former data/grammar-data.js.
Books.registerGrammar('hsk1', '11', [
    {
      num: 1, zh: '时间的表达', zhP: 'shíjiān de biǎodá',
      en: 'Expression of Time',
      blocks: [
        {
          chinese: '汉语表达时间的时候要用"点"、"分"，遵循由大到小的顺序。用"点"来表示整点。',
          english: '"点" and "分" are used to express time in Chinese, observing the principle of "the bigger unit preceding the smaller one". "点" means "o\'clock", indicating a whole hour.',
          examples: [
            { raw: '9:00 → 九点', speak: '九点', pinyin: 'jiǔ diǎn', en: 'nine o\'clock' },
            { raw: '11:00 → 十一点', speak: '十一点', pinyin: 'shíyī diǎn', en: 'eleven o\'clock' },
            { raw: '2:00 → 两点 (liǎng diǎn)', speak: '两点', pinyin: 'liǎng diǎn', en: 'two o\'clock' },
          ],
          note: 'The counterpart of 2 o\'clock in Chinese is "两点 (liǎng diǎn)" instead of "二点 (èr diǎn)".',
        },
        {
          chinese: '当不是整点的时候要用到"分"，格式是"……点……分"。',
          english: 'If it is not a "whole-hour" time, "分" is used. The pattern is "……点……分".',
          examples: [
            { raw: '5:30 → 五点三十分', speak: '五点三十分', pinyin: 'wǔ diǎn sānshí fēn', en: 'five thirty' },
            { raw: '11:10 → 十一点十分', speak: '十一点十分', pinyin: 'shíyī diǎn shí fēn', en: 'eleven ten' },
            { raw: '2:05 → 两点零 (líng, zero) 五分', speak: '两点零五分', pinyin: 'liǎng diǎn líng wǔ fēn', en: 'two oh five' },
          ],
        },
        {
          chinese: '如果区分上午或者下午，一般格式是"上午……点（……分），下午……点（……分）"。',
          english: 'To distinguish a time before noon from one after, the pattern "上午(morning)……点（……分）" or "下午（afternoon）……点（……分）" is used.',
          examples: [
            { raw: '8:00 am → 上午八点', speak: '上午八点', pinyin: 'shàngwǔ bā diǎn', en: 'eight in the morning' },
            { raw: '3:10 pm → 下午三点十分', speak: '下午三点十分', pinyin: 'xiàwǔ sān diǎn shí fēn', en: 'three ten in the afternoon' },
            { raw: '5:25 pm → 下午五点二十五分', speak: '下午五点二十五分', pinyin: 'xiàwǔ wǔ diǎn èrshíwǔ fēn', en: 'five twenty-five in the afternoon' },
          ],
        },
      ],
    },
    {
      num: 2, zh: '名词"前"', zhP: 'míngcí "qián"',
      en: 'The Noun "前"',
      blocks: [
        {
          chinese: '名词"前"可以表示在所说的某个时间点之前的时间，语意为提前。',
          english: 'The noun "前" can be used to indicate the time before some point of time being mentioned.',
          examples: [
            { raw: '三天前，一个星期前，星期五前', speak: '三天前，一个星期前，星期五前', pinyin: 'sān tiān qián, yí gè xīngqī qián, xīngqīwǔ qián', en: 'three days ago, a week ago, before Friday' },
            { raw: '你什么时候来学校？我八点前来。', speak: '你什么时候来学校？我八点前来。', pinyin: 'Nǐ shénme shíhou lái xuéxiào? Wǒ bā diǎn qián lái.', en: "When are you coming to school? I'll come before eight." },
            { raw: '你能几点来？我八点前来。', speak: '你能几点来？我八点前来。', pinyin: 'Nǐ néng jǐ diǎn lái? Wǒ bā diǎn qián lái.', en: "What time can you come? I'll come before eight." },
            { raw: '你（在）几点前能来？我八点。', speak: '你在几点前能来？我八点。', pinyin: 'Nǐ (zài) jǐ diǎn qián néng lái? Wǒ bā diǎn.', en: 'By what time can you come? Eight.' },
          ],
        },
      ],
    },
    {
      num: 3, zh: '时间词做状语', zhP: 'shíjiāncí zuò zhuàngyǔ',
      en: 'Time Word Used as an Adverbial',
      blocks: [
        {
          chinese: '时间词在句子中做状语，经常出现在主语后边，也可以在主语前边。',
          english: 'When a time word serves as an adverbial modifier in a sentence, it often follows the subject. Sometimes it can be used before the subject.',
          table: {
            headers: ['Subject', 'Time (adverbial)', 'Predicate'],
            rows: [
              ['妈妈', '六点', '做饭。'],
              ['李老师', '上午八点', '去学校。'],
              ['我', '星期一', '去北京。'],
            ],
          },
        },
      ],
    },
  ]);
