// HSK1 Lesson 10 -- Grammar Notes (textbook's own notes section, verbatim; pinyin authored
// for this app), extracted from the former data/grammar-data.js.
Books.registerGrammar('hsk1', '10', [
    {
      num: 1, zh: '"有"字句：表示存在', zhP: '"yǒu" zì jù：biǎoshì cúnzài',
      en: 'The "有" Sentence: indicating existence',
      blocks: [
        {
          chinese: '动词"有"可以用于表示存在的句子中，表示某个处所或者位置存在什么。',
          english: 'The verb "有" can be used in an existential sentence to indicate a person or thing exists somewhere.',
          table: {
            headers: ['Word of Locality', '有', 'Person/Thing Existing'],
            rows: [
              ['椅子下面', '有', '一只小狗。'],
              ['学校里', '有', '一个商店。'],
              ['桌子上', '有', '一个电脑和一本书。'],
            ],
          },
        },
        {
          chinese: '"有"字句的否定形式是"没有"，同时宾语前不能带数量定语。',
          english: 'In the negative form of a "有" sentence, "没有" is used without a numeral classifier before the object.',
          examples: [
            { raw: '椅子下面没有小狗。', speak: '椅子下面没有小狗。', pinyin: 'Yǐzi xiàmiàn méiyǒu xiǎo gǒu.', en: "There's no dog under the chair." },
            { raw: '学校里没有商店。', speak: '学校里没有商店。', pinyin: 'Xuéxiào lǐ méiyǒu shāngdiàn.', en: "There's no shop in the school." },
            { raw: '桌子上没有电脑和书。', speak: '桌子上没有电脑和书。', pinyin: 'Zhuōzi shàng méiyǒu diànnǎo hé shū.', en: "There's no computer or book on the desk." },
          ],
        },
      ],
    },
    {
      num: 2, zh: '连词"和"', zhP: 'liáncí "hé"',
      en: 'The Conjunction "和"',
      blocks: [
        {
          chinese: '连词"和"用于连接两个或者两个以上并列的成分，表示一种并列关系。',
          english: 'The conjunction "和" is used to connect two or more elements, indicating a parallel relationship.',
          examples: [
            { raw: '我有一个中国朋友和一个美国朋友。', speak: '我有一个中国朋友和一个美国朋友。', pinyin: 'Wǒ yǒu yí gè Zhōngguó péngyou hé yí gè Měiguó péngyou.', en: 'I have a Chinese friend and an American friend.' },
            { raw: '我家有三口人，爸爸、妈妈和我。', speak: '我家有三口人，爸爸、妈妈和我。', pinyin: 'Wǒ jiā yǒu sān kǒu rén, bàba, māma hé wǒ.', en: 'There are three people in my family: dad, mom and me.' },
            { raw: '桌子上有一个电脑和一本书。', speak: '桌子上有一个电脑和一本书。', pinyin: 'Zhuōzi shàng yǒu yí gè diànnǎo hé yì běn shū.', en: "There's a computer and a book on the desk." },
          ],
        },
      ],
    },
    {
      num: 3, zh: '能愿动词"能"', zhP: 'néngyuàn dòngcí "néng"',
      en: 'The Modal Verb "能"',
      blocks: [
        {
          chinese: '能愿动词"能"一般用在动词前，与动词整体做谓语，表示一种能力或者可能。"能"还常用于疑问句式"能……吗？"中，表示请求、希望获得许可。',
          english: 'The modal verb "能" is usually used before a verb to form the predicate indicating an ability or a possibility. The interrogative sentence structure "能……吗？" is often used to indicate a request or hope for permission.',
          examples: [
            { raw: '明天下午我能去商店。', speak: '明天下午我能去商店。', pinyin: 'Míngtiān xiàwǔ wǒ néng qù shāngdiàn.', en: 'I can go to the store tomorrow afternoon.' },
            { raw: '你能在这儿写你的名字吗？', speak: '你能在这儿写你的名字吗？', pinyin: 'Nǐ néng zài zhèr xiě nǐ de míngzi ma?', en: 'Can you write your name here?' },
            { raw: '我能坐这儿吗？', speak: '我能坐这儿吗？', pinyin: 'Wǒ néng zuò zhèr ma?', en: 'Can I sit here?' },
          ],
        },
      ],
    },
    {
      num: 4, zh: '用"请"的祈使句', zhP: 'yòng "qǐng" de qǐshǐ jù',
      en: 'Imperative Sentences with "请"',
      blocks: [
        {
          chinese: '动词"请"后加其他动词可以构成一种祈使句，委婉地表示建议、希望对方做某事。',
          english: 'When the verb "请" is used before another verb, an imperative sentence is formed, indicating a polite suggestion or hope.',
          examples: [
            { raw: '请写您的名字。', speak: '请写您的名字。', pinyin: 'Qǐng xiě nín de míngzi.', en: 'Please write your name.' },
            { raw: '请喝茶。', speak: '请喝茶。', pinyin: 'Qǐng hē chá.', en: 'Please have some tea.' },
            { raw: '请坐。', speak: '请坐。', pinyin: 'Qǐng zuò.', en: 'Please sit.' },
          ],
        },
      ],
    },
  ]);
