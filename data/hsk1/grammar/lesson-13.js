// HSK1 Lesson 13 -- Grammar Notes (textbook's own notes section, verbatim; pinyin authored
// for this app), extracted from the former data/grammar-data.js.
Books.registerGrammar('hsk1', '13', [
    {
      num: 1, zh: '叹词"喂"', zhP: 'tàncí "wéi"',
      en: 'The Interjection "喂"',
      blocks: [
        {
          chinese: '给某人打电话或者接听别人电话开头时的常用语。',
          english: 'The word is often used when calling someone or answering a phone call.',
          examples: [
            { raw: 'A: 喂，李老师在家吗？ B: 她不在家，去学校了。', speak: '喂，李老师在家吗？她不在家，去学校了。', pinyin: "A: Wéi, Lǐ lǎoshī zài jiā ma? B: Tā bú zài jiā, qù xuéxiào le.", en: "Hello, is Teacher Li home? She's not home, she's gone to school." },
            { raw: 'A: 喂，你是张小姐吗？ B: 对，您是？', speak: '喂，你是张小姐吗？对，您是？', pinyin: 'A: Wéi, nǐ shì Zhāng xiǎojiě ma? B: Duì, nín shì?', en: 'Hello, is that Miss Zhang? Yes, and you are?' },
            { raw: 'A: 喂，你在做什么呢？ B: 我在看书呢。', speak: '喂，你在做什么呢？我在看书呢。', pinyin: 'A: Wéi, nǐ zài zuò shénme ne? B: Wǒ zài kàn shū ne.', en: "Hello, what are you doing? I'm reading." },
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
            { raw: 'A: 这儿没有人，请坐吧。 B: 谢谢。', speak: '这儿没有人，请坐吧。谢谢。', pinyin: 'A: Zhèr méiyǒu rén, qǐng zuò ba. B: Xièxie.', en: "No one's here, please sit. Thanks." },
            { raw: 'A: 今天我们在家吃饭吧。 B: 好。', speak: '今天我们在家吃饭吧。好。', pinyin: 'A: Jīntiān wǒmen zài jiā chī fàn ba. B: Hǎo.', en: "Let's eat at home today. OK." },
            { raw: 'A: 我现在给她打电话。 B: 她在工作呢，你下午打吧。', speak: '我现在给她打电话。她在工作呢，你下午打吧。', pinyin: 'A: Wǒ xiànzài gěi tā dǎ diànhuà. B: Tā zài gōngzuò ne, nǐ xiàwǔ dǎ ba.', en: "I'll call her now. She's working, call her in the afternoon." },
          ],
        },
      ],
    },
  ]);
