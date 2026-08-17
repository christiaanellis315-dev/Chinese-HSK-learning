// Grammar Notes data — transcribed from the HSK1 Standard Course textbook's own "注释/Notes"
// sections (see hsk1_grammar_notes.md), lessons 3-15 (1-2 have no Notes section). Chinese
// explanations, English translations, structure tables and example sentences are reproduced
// verbatim from that source — nothing reworded, summarized, or invented.
//
// Pinyin for each grammar-point term (zhP) and for every hanzi example sentence (pinyin/speak)
// was NOT in the source file and was authored for this app, following the same romanization
// already used throughout data/lessons-data.js for shared vocabulary. Structure tables are
// reproduced as printed, without added pinyin — they're pattern scaffolding (isolated word/
// phrase fragments in a grid), not example sentences, so they sit outside this app's
// hanzi-needs-pinyin rule the way the Pinyin Finals table's "reference" tiles do.
const GRAMMAR_LESSON_ORDER = ['3','4','5','6','7','8','9','10','11','12','13','14','15'];

const GRAMMAR = {
  '3': [
    {
      num: 1, zh: '疑问代词"什么"', zhP: 'yíwèn dàicí "shénme"',
      en: 'The Interrogative Pronoun "什么"',
      blocks: [
        {
          chinese: '疑问代词"什么"表示疑问，用在指代人或事物的疑问句中，作宾语或与名词性成分连用作定语。',
          english: 'The interrogative pronoun "什么" is used in interrogative sentences, serving as the object by itself or together with a nominal element following it.',
          examples: [
            { raw: '你叫什么名字？(Nǐ jiào shénme míngzi?)', speak: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?' },
            { raw: '这(zhè, this)是什么(shénme)?', speak: '这是什么?', pinyin: 'Zhè shì shénme?' },
            { raw: '那(nà, this)是什么(shū, book)?', speak: '那是什么?', pinyin: 'Nà shì shénme?' },
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
  ],

  '4': [
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
  ],

  '5': [
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
          note: 'This matches the number-construction logic already implemented in the Numbers 1-99 drill — tens digit + 十 + ones digit, e.g. 五十六 = wǔshíliù.',
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
  ],

  '6': [
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
            { raw: '这个汉字怎么读？', speak: '这个汉字怎么读？', pinyin: 'Zhège Hànzì zěnme dú?' },
            { raw: '你的汉语名字怎么写？', speak: '你的汉语名字怎么写？', pinyin: 'Nǐ de Hànyǔ míngzi zěnme xiě?' },
            { raw: '这个字怎么写？', speak: '这个字怎么写？', pinyin: 'Zhège zì zěnme xiě?' },
          ],
        },
      ],
    },
  ],

  '7': [
    {
      num: 1, zh: '日期的表达 (1)：月、日/号、星期', zhP: 'rìqī de biǎodá (1)：yuè、rì/hào、xīngqī',
      en: "Expression of a Date (1): month, date, day of the week",
      blocks: [
        {
          chinese: '汉语的日期表达方式遵循由大到小的原则，先说"月"，然后说"日/号"，最后说"星期"。口语一般常用"号"。',
          english: 'The way to say a date in Chinese observes the principle of "the bigger unit coming before the smaller one". The month is said first, then the date and finally the day of the week. In spoken Chinese, "号" is often used instead of "日" to express the date.',
          examples: [
            { raw: '9月1号，星期三。', speak: '9月1号，星期三。', pinyin: 'Jiǔ yuè yī hào, xīngqīsān.' },
            { raw: '9月2号，星期四。', speak: '9月2号，星期四。', pinyin: 'Jiǔ yuè èr hào, xīngqīsì.' },
            { raw: '8月31号，星期二。', speak: '8月31号，星期二。', pinyin: 'Bā yuè sānshíyī hào, xīngqī\'èr.' },
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
  ],

  '8': [
    {
      num: 1, zh: '能愿动词"想"', zhP: 'néngyuàn dòngcí "xiǎng"',
      en: 'The Modal Verb "想"',
      blocks: [
        {
          chinese: '能愿动词"想"一般用在动词前表示一种希望或者打算。',
          english: 'The modal verb "想" is usually used before a verb to express a hope or plan.',
          examples: [
            { raw: '我想学汉语。', speak: '我想学汉语。', pinyin: 'Wǒ xiǎng xué Hànyǔ.' },
            { raw: '明天我想去学校看书。', speak: '明天我想去学校看书。', pinyin: 'Míngtiān wǒ xiǎng qù xuéxiào kàn shū.' },
            { raw: '我想买一个杯子。', speak: '我想买一个杯子。', pinyin: 'Wǒ xiǎng mǎi yí gè bēizi.' },
          ],
        },
      ],
    },
    {
      num: 2, zh: '疑问代词"多少"', zhP: 'yíwèn dàicí "duōshao"',
      en: 'The Interrogative Pronoun "多少"',
      blocks: [
        {
          chinese: '疑问代词"多少"用于询问十以上的数量，"多少"后边的量词可以省略。"多少"还用于询问价格，常用表达方式是"……多少钱？"。',
          english: 'The interrogative pronoun "多少" is used to ask about numbers larger than 10. The measure word following it can be omitted. "多少" can also be used to inquire about prices, usually in the sentence pattern "……多少钱?".',
          examples: [
            { raw: '你们学校有多少（个）学生？', speak: '你们学校有多少（个）学生？', pinyin: 'Nǐmen xuéxiào yǒu duōshao (gè) xuésheng?' },
            { raw: '你有多少（个）汉语老师？', speak: '你有多少（个）汉语老师？', pinyin: 'Nǐ yǒu duōshao (gè) Hànyǔ lǎoshī?' },
            { raw: '这个杯子多少钱？', speak: '这个杯子多少钱？', pinyin: 'Zhège bēizi duōshao qián?' },
          ],
        },
      ],
    },
    {
      num: 3, zh: '量词"个"、"口"', zhP: 'liàngcí "gè"、"kǒu"',
      en: 'The Measure Words "个" and "口"',
      blocks: [
        {
          chinese: '"个"是汉语中最常见的一个量词，一般用于没有专用量词的名词前。',
          english: '"个" is the most common measure word in Chinese, usually used before a noun without a specific measure word of its own.',
          examples: [
            { raw: '三个老师', speak: '三个老师', pinyin: 'sān gè lǎoshī' },
            { raw: '五个学生', speak: '五个学生', pinyin: 'wǔ gè xuésheng' },
            { raw: '一个杯子', speak: '一个杯子', pinyin: 'yí gè bēizi' },
          ],
        },
        {
          chinese: '"口"也是一个量词，一般用于描述家庭成员的人数（见第5课）。',
          english: '"口" is a measure word, too, usually used for members of a family (see Lesson 5).',
          examples: [
            { raw: '李老师家有六口人。', speak: '李老师家有六口人。', pinyin: 'Lǐ lǎoshī jiā yǒu liù kǒu rén.' },
            { raw: '你家有几口人？', speak: '你家有几口人？', pinyin: 'Nǐ jiā yǒu jǐ kǒu rén?' },
            { raw: '我家有三口人。', speak: '我家有三口人。', pinyin: 'Wǒ jiā yǒu sān kǒu rén.' },
          ],
        },
      ],
    },
    {
      num: 4, zh: '钱数的表达', zhP: 'qiánshù de biǎodá',
      en: 'Expression of the Amount of Money',
      blocks: [
        {
          chinese: '人民币的基本单位是"元"，口语中读作"块"。',
          english: 'The basic unit of Renminbi (Chinese currency) is "元", usually replaced by "块" in spoken Chinese.',
          examples: [
            { raw: '一元（块）— one yuan/kuai', speak: '一元（块）', pinyin: 'yì yuán (kuài)' },
            { raw: '五元（块）— five yuan/kuai', speak: '五元（块）', pinyin: 'wǔ yuán (kuài)' },
            { raw: '十元（块）— ten yuan/kuai', speak: '十元（块）', pinyin: 'shí yuán (kuài)' },
            { raw: '五十元（块）— fifty yuan/kuai', speak: '五十元（块）', pinyin: 'wǔshí yuán (kuài)' },
            { raw: '一百元（块）— one hundred yuan/kuai', speak: '一百元（块）', pinyin: 'yìbǎi yuán (kuài)' },
          ],
        },
      ],
    },
  ],

  '9': [
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
            { raw: '我的杯子在哪儿？', speak: '我的杯子在哪儿？', pinyin: 'Wǒ de bēizi zài nǎr?' },
            { raw: '你的中国朋友在哪儿？', speak: '你的中国朋友在哪儿？', pinyin: 'Nǐ de Zhōngguó péngyou zài nǎr?' },
            { raw: '小猫在哪儿？', speak: '小猫在哪儿？', pinyin: 'Xiǎo māo zài nǎr?' },
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
            { raw: '我的小猫呢？', speak: '我的小猫呢？', pinyin: 'Wǒ de xiǎo māo ne?' },
            { raw: '我的杯子呢？', speak: '我的杯子呢？', pinyin: 'Wǒ de bēizi ne?' },
            { raw: '他在哪儿呢？', speak: '他在哪儿呢？', pinyin: 'Tā zài nǎr ne?' },
          ],
        },
      ],
    },
  ],

  '10': [
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
            { raw: '椅子下面没有小狗。', speak: '椅子下面没有小狗。', pinyin: 'Yǐzi xiàmiàn méiyǒu xiǎo gǒu.' },
            { raw: '学校里没有商店。', speak: '学校里没有商店。', pinyin: 'Xuéxiào lǐ méiyǒu shāngdiàn.' },
            { raw: '桌子上没有电脑和书。', speak: '桌子上没有电脑和书。', pinyin: 'Zhuōzi shàng méiyǒu diànnǎo hé shū.' },
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
            { raw: '我有一个中国朋友和一个美国朋友。', speak: '我有一个中国朋友和一个美国朋友。', pinyin: 'Wǒ yǒu yí gè Zhōngguó péngyou hé yí gè Měiguó péngyou.' },
            { raw: '我家有三口人，爸爸、妈妈和我。', speak: '我家有三口人，爸爸、妈妈和我。', pinyin: 'Wǒ jiā yǒu sān kǒu rén, bàba, māma hé wǒ.' },
            { raw: '桌子上有一个电脑和一本书。', speak: '桌子上有一个电脑和一本书。', pinyin: 'Zhuōzi shàng yǒu yí gè diànnǎo hé yì běn shū.' },
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
            { raw: '明天下午我能去商店。', speak: '明天下午我能去商店。', pinyin: 'Míngtiān xiàwǔ wǒ néng qù shāngdiàn.' },
            { raw: '你能在这儿写你的名字吗？', speak: '你能在这儿写你的名字吗？', pinyin: 'Nǐ néng zài zhèr xiě nǐ de míngzi ma?' },
            { raw: '我能坐这儿吗？', speak: '我能坐这儿吗？', pinyin: 'Wǒ néng zuò zhèr ma?' },
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
            { raw: '请写您的名字。', speak: '请写您的名字。', pinyin: 'Qǐng xiě nín de míngzi.' },
            { raw: '请喝茶。', speak: '请喝茶。', pinyin: 'Qǐng hē chá.' },
            { raw: '请坐。', speak: '请坐。', pinyin: 'Qǐng zuò.' },
          ],
        },
      ],
    },
  ],

  '11': [
    {
      num: 1, zh: '时间的表达', zhP: 'shíjiān de biǎodá',
      en: 'Expression of Time',
      blocks: [
        {
          chinese: '汉语表达时间的时候要用"点"、"分"，遵循由大到小的顺序。用"点"来表示整点。',
          english: '"点" and "分" are used to express time in Chinese, observing the principle of "the bigger unit preceding the smaller one". "点" means "o\'clock", indicating a whole hour.',
          examples: [
            { raw: '9:00 → 九点', speak: '九点', pinyin: 'jiǔ diǎn' },
            { raw: '11:00 → 十一点', speak: '十一点', pinyin: 'shíyī diǎn' },
            { raw: '2:00 → 两点 (liǎng diǎn)', speak: '两点', pinyin: 'liǎng diǎn' },
          ],
          note: 'The counterpart of 2 o\'clock in Chinese is "两点 (liǎng diǎn)" instead of "二点 (èr diǎn)".',
        },
        {
          chinese: '当不是整点的时候要用到"分"，格式是"……点……分"。',
          english: 'If it is not a "whole-hour" time, "分" is used. The pattern is "……点……分".',
          examples: [
            { raw: '5:30 → 五点三十分', speak: '五点三十分', pinyin: 'wǔ diǎn sānshí fēn' },
            { raw: '11:10 → 十一点十分', speak: '十一点十分', pinyin: 'shíyī diǎn shí fēn' },
            { raw: '2:05 → 两点零 (líng, zero) 五分', speak: '两点零五分', pinyin: 'liǎng diǎn líng wǔ fēn' },
          ],
        },
        {
          chinese: '如果区分上午或者下午，一般格式是"上午……点（……分），下午……点（……分）"。',
          english: 'To distinguish a time before noon from one after, the pattern "上午(morning)……点（……分）" or "下午（afternoon）……点（……分）" is used.',
          examples: [
            { raw: '8:00 am → 上午八点', speak: '上午八点', pinyin: 'shàngwǔ bā diǎn' },
            { raw: '3:10 pm → 下午三点十分', speak: '下午三点十分', pinyin: 'xiàwǔ sān diǎn shí fēn' },
            { raw: '5:25 pm → 下午五点二十五分', speak: '下午五点二十五分', pinyin: 'xiàwǔ wǔ diǎn èrshíwǔ fēn' },
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
            { raw: '三天前，一个星期前，星期五前', speak: '三天前，一个星期前，星期五前', pinyin: 'sān tiān qián, yí gè xīngqī qián, xīngqīwǔ qián' },
            { raw: '你什么时候来学校？我八点前来。', speak: '你什么时候来学校？我八点前来。', pinyin: 'Nǐ shénme shíhou lái xuéxiào? Wǒ bā diǎn qián lái.' },
            { raw: '你能几点来？我八点前来。', speak: '你能几点来？我八点前来。', pinyin: 'Nǐ néng jǐ diǎn lái? Wǒ bā diǎn qián lái.' },
            { raw: '你（在）几点前能来？我八点。', speak: '你在几点前能来？我八点。', pinyin: 'Nǐ (zài) jǐ diǎn qián néng lái? Wǒ bā diǎn.' },
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
  ],

  '12': [
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
  ],

  '13': [
    {
      num: 1, zh: '叹词"喂"', zhP: 'tàncí "wéi"',
      en: 'The Interjection "喂"',
      blocks: [
        {
          chinese: '给某人打电话或者接听别人电话开头时的常用语。',
          english: 'The word is often used when calling someone or answering a phone call.',
          examples: [
            { raw: 'A: 喂，李老师在家吗？ B: 她不在家，去学校了。', speak: '喂，李老师在家吗？她不在家，去学校了。', pinyin: "A: Wéi, Lǐ lǎoshī zài jiā ma? B: Tā bú zài jiā, qù xuéxiào le." },
            { raw: 'A: 喂，你是张小姐吗？ B: 对，您是？', speak: '喂，你是张小姐吗？对，您是？', pinyin: 'A: Wéi, nǐ shì Zhāng xiǎojiě ma? B: Duì, nín shì?' },
            { raw: 'A: 喂，你在做什么呢？ B: 我在看书呢。', speak: '喂，你在做什么呢？我在看书呢。', pinyin: 'A: Wéi, nǐ zài zuò shénme ne? B: Wǒ zài kàn shū ne.' },
          ],
        },
      ],
    },
    {
      num: 2, zh: '"在……呢"表示动作正在进行', zhP: '"zài……ne" biǎoshì dòngzuò zhèngzài jìnxíng',
      en: '"在……呢" Used to Indicate an Action in Progress',
      blocks: [
        {
          chinese: '动词前边加上副词"在"，或者句末用语气助词"呢"表示动作正在进行。',
          english: 'An action in progress can be expressed by adding the adverb "在" before a verb or by using the modal particle "呢" at the end of a sentence.',
          table: {
            headers: ['Subject', '在', 'Verb+Object', '（呢）'],
            rows: [
              ['我', '在', '睡觉', '呢。'],
              ['你', '在', '做什么', '呢？'],
              ['小王', '在', '学习汉语。', ''],
            ],
          },
        },
        {
          chinese: '没（在）+动词/动词词组表示否定，句尾不能用"呢"。',
          english: 'The negative form is "没（在）+ Verb/Verb Phrase", without "呢" at the end of the sentence.',
          table: {
            headers: ['Subject', '没（在）', 'Verb / Verb Phrase'],
            rows: [
              ['我', '没在', '看电视。'],
              ['他们', '没在', '工作。'],
              ['他', '没', '看书。'],
            ],
          },
        },
      ],
    },
    {
      num: 3, zh: '电话号码的表达', zhP: 'diànhuà hàomǎ de biǎodá',
      en: 'Expression of Telephone Numbers',
      blocks: [
        {
          chinese: '电话号码的读法与一般数字的读法有所不同。电话号码要一位一位地读。号码中的数字"1"要读成"yāo"。',
          english: 'Telephone numbers are read in a different way than general numbers. They are read digit by digit. The number "1" in a telephone number is read "yāo".',
          examples: [
            { raw: '8069478 → bā líng liù jiǔ sì qī bā' },
            { raw: '13851897623 → yāo sān bā wǔ yāo bā jiǔ qī liù èr sān' },
            { raw: '82304156 → bā èr sān líng sì yāo wǔ liù' },
          ],
        },
      ],
    },
    {
      num: 4, zh: '语气助词"吧"', zhP: 'yǔqì zhùcí "ba"',
      en: 'The Modal Particle "吧"',
      blocks: [
        {
          chinese: '语气助词"吧"用在祈使句末尾，表示建议或者命令别人，使语气缓和。',
          english: 'When used at the end of an imperative sentence, the modal particle "吧" indicates a suggestion or command with a softened mood.',
          examples: [
            { raw: 'A: 这儿没有人，请坐吧。 B: 谢谢。', speak: '这儿没有人，请坐吧。谢谢。', pinyin: 'A: Zhèr méiyǒu rén, qǐng zuò ba. B: Xièxie.' },
            { raw: 'A: 今天我们在家吃饭吧。 B: 好。', speak: '今天我们在家吃饭吧。好。', pinyin: 'A: Jīntiān wǒmen zài jiā chī fàn ba. B: Hǎo.' },
            { raw: 'A: 我现在给她打电话。 B: 她在工作呢，你下午打吧。', speak: '我现在给她打电话。她在工作呢，你下午打吧。', pinyin: 'A: Wǒ xiànzài gěi tā dǎ diànhuà. B: Tā zài gōngzuò ne, nǐ xiàwǔ dǎ ba.' },
          ],
        },
      ],
    },
  ],

  '14': [
    {
      num: 1, zh: '"了"表发生或完成', zhP: '"le" biǎo fāshēng huò wánchéng',
      en: '"了" Indicating Occurrence or Completion',
      blocks: [
        {
          chinese: '"了"用于句尾。',
          english: '"了" can be used at the end of a sentence.',
          table: {
            headers: ['Subject', 'Predicate', '了'],
            rows: [
              ['我', '去商店', '了。'],
              ['他', '去学开车', '了。'],
              ['你', '买什么', '了？'],
            ],
          },
        },
        {
          chinese: '"了"用于动词后带宾语。动词后的宾语前面一般要有定语，如数量词或形容词、代词等。',
          english: '"了" can also be used between a verb and its object. There is usually a modifier before the object of the verb, such as a numeral classifier, an adjective or a pronoun, etc.',
          table: {
            headers: ['Subject', 'Verb', '了', 'Number-Measure Word/Adjective/Pronoun', 'Object'],
            rows: [
              ['她', '买', '了', '一点儿', '苹果。'],
              ['我', '买', '了', '不少', '衣服。'],
              ['你', '看见', '了', '几个', '人？'],
            ],
          },
        },
        {
          chinese: '上述两种用法的"了"的否定形式是：没+动词（+宾语），"了"要去掉。',
          english: 'The negative form of "了" in both cases above is "没 + verb + (object)". In the negative form, "了" should be omitted.',
          table: {
            headers: ['Subject', '没', 'Predicate'],
            rows: [
              ['她', '没', '去商店。'],
              ['我', '没', '买。'],
              ['我', '没', '看见张先生。'],
            ],
          },
        },
      ],
    },
    {
      num: 2, zh: '名词"后"', zhP: 'míngcí "hòu"',
      en: 'The Noun "后"',
      blocks: [
        {
          chinese: '名词"后"表示现在或者所说的某个时间以后的时间。',
          english: 'The noun "后" indicates a period after the present time or the time being mentioned.',
          examples: [
            { raw: '五点后，40分钟后，星期三后', speak: '五点后，40分钟后，星期三后', pinyin: 'wǔ diǎn hòu, sìshí fēnzhōng hòu, xīngqīsān hòu' },
            { raw: 'A: 你几点去工作？ B: 八点后。', speak: '你几点去工作？八点后。', pinyin: 'A: Nǐ jǐ diǎn qù gōngzuò? B: Bā diǎn hòu.' },
            { raw: 'A: 你什么时候回家？ B: 五点后。', speak: '你什么时候回家？五点后。', pinyin: 'A: Nǐ shénme shíhou huí jiā? B: Wǔ diǎn hòu.' },
            { raw: 'A: 他什么时候能回来？ B: 40分钟后回来。', speak: '他什么时候能回来？40分钟后回来。', pinyin: 'A: Tā shénme shíhou néng huílai? B: Sìshí fēnzhōng hòu huílai.' },
          ],
        },
      ],
    },
    {
      num: 3, zh: '语气助词"啊"', zhP: 'yǔqì zhùcí "a"',
      en: 'The Modal Particle "啊"',
      blocks: [
        {
          chinese: '语气词"啊"用在陈述句末，使句子带上一层感情色彩。"啊"常受到前一字尾音的影响而发生不同的变音，书面上有时按变音写成不同的字。',
          english: 'The modal particle "啊" is used at the end of a declarative sentence to set the mood. The pronunciation of "啊" varies with the finals of the syllables before it, and in written Chinese, the variants are represented by different characters sometimes.',
          table: {
            headers: ['The Final of the Syllable before It', 'The Pronunciation of "啊"'],
            rows: [
              ['a, e, i, o, ü', 'a → ia'],
              ['u, ao, ou', 'a → ua'],
              ['-n', 'a → na'],
              ['-ng', 'a → nga'],
              ['-i (zi, ci, si)', 'a → za'],
              ['-i (zhi, chi, shi, ri)', 'a → ra'],
            ],
          },
          examples: [
            { raw: 'A: 你是王小姐吗？ B: 是啊。', speak: '你是王小姐吗？是啊。', pinyin: 'A: Nǐ shì Wáng xiǎojiě ma? B: Shì a.' },
            { raw: 'A: 你想去吃中国菜吗？ B: 好啊。', speak: '你想去吃中国菜吗？好啊。', pinyin: 'A: Nǐ xiǎng qù chī Zhōngguó cài ma? B: Hǎo a.' },
            { raw: 'A: 王方的衣服太漂亮了！ B: 是啊，她买了不少衣服。', speak: '王方的衣服太漂亮了！是啊，她买了不少衣服。', pinyin: 'A: Wáng Fāng de yīfu tài piàoliang le! B: Shì a, tā mǎile bùshǎo yīfu.' },
          ],
        },
      ],
    },
    {
      num: 4, zh: '副词"都"', zhP: 'fùcí "dōu"',
      en: 'The Adverb "都"',
      blocks: [
        {
          chinese: '"都"表示总括全部，所总括的对象必须放在"都"的前面。',
          english: '"都" means "both/all". The people or objects included are put before "都".',
          examples: [
            { raw: '我们都是中国人。', speak: '我们都是中国人。', pinyin: 'Wǒmen dōu shì Zhōngguó rén.' },
            { raw: '他们都喜欢喝茶。', speak: '他们都喜欢喝茶。', pinyin: 'Tāmen dōu xǐhuan hē chá.' },
            { raw: '这些都是王方的东西。', speak: '这些都是王方的东西。', pinyin: 'Zhèxiē dōu shì Wáng Fāng de dōngxi.' },
          ],
        },
      ],
    },
  ],

  '15': [
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
  ],
};
