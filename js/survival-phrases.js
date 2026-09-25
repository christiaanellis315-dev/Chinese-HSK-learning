// Survival Phrases: whole practical phrases (not built from grammar rules, meant to be
// memorized as single units) — merged from four source batches into one growing module. See
// data/survival_phrases.md for the merge/reconciliation notes (duplicate handling, which
// phrases moved groups, the two flagged-as-not-verbatim phrases that were checked and kept).
//
// Every phrase is available unconditionally — no book-progress gating. The `book: 'hsk1'|
// 'hsk2'|'hsk3'` tag on some phrases is purely informational (which HSK level introduced it),
// left over from the merge; it plays no role in whether a phrase can be browsed, practiced, or
// pulled into Review. "When You're Stuck" carries weight 3 (see Storage.recordSrsResult's
// weight param) — it comes due roughly 3x more often than everything else, per the source
// files' repeated request that it stay the highest-priority group.
const SurvivalPhrases = (() => {
  const GROUPS = [
    {
      id: 'meeting', label: 'Meeting People', weight: 1, phrases: [
        { h: '你好', p: 'nǐ hǎo', e: 'Hello' },
        { h: '很高兴认识你', p: 'hěn gāoxìng rènshi nǐ', e: 'Nice to meet you' },
        { h: '谢谢', p: 'xièxie', e: 'Thank you' },
        { h: '不客气', p: 'bú kèqi', e: "You're welcome" },
        { h: '对不起', p: 'duìbuqǐ', e: 'Sorry' },
        { h: '没关系', p: 'méi guānxi', e: "It's okay / no worries" },
        { h: '再见', p: 'zàijiàn', e: 'Goodbye' },
        { h: '你叫什么名字？', p: 'Nǐ jiào shénme míngzi?', e: "What's your name?", book: 'hsk1' },
        { h: '我叫……', p: 'Wǒ jiào ……', e: 'My name is……', book: 'hsk1' },
        { h: '你是哪国人？', p: 'Nǐ shì nǎ guó rén?', e: 'Which country are you from?', book: 'hsk1' },
        { h: '我是……人', p: 'Wǒ shì …… rén', e: "I'm from…… (fill in country)", book: 'hsk1' },
        // Reconciled dup: kept over the original set's bare "你好吗？" (fuller version, per the
        // brief), and moved here (Meeting People) since that's where the HSK1 batch filed it.
        { h: '你好吗？我很好，谢谢，你呢？', p: 'Nǐ hǎo ma? Wǒ hěn hǎo, xièxie, nǐ ne?', e: "How are you? I'm good, thanks, and you?", book: 'hsk1' },
        { h: '她姓王', p: 'Tā xìng Wáng', e: "Her family name is Wang", book: 'hsk2' },
        { h: '是去年来的', p: 'Shì qùnián lái de', e: '(She) came here last year', book: 'hsk2' },
        { h: '那个人是谁？', p: 'Nàge rén shì shéi?', e: 'Who is that person?', book: 'hsk3' },
        { h: '希望以后能再见面', p: 'Xīwàng yǐhòu néng zài jiànmiàn', e: 'I hope we can meet again', book: 'hsk3' },
        { h: '快五年了，你几乎没变化', p: 'Kuài wǔ nián le, nǐ jīhū méi biànhuà', e: "It's been almost five years, you've barely changed", book: 'hsk3', recognizeOnly: true },
      ],
    },
    {
      id: 'stuck', label: "When You're Stuck", weight: 3, phrases: [
        { h: '我不知道', p: 'wǒ bù zhīdào', e: "I don't know" },
        { h: '你说什么？', p: 'nǐ shuō shénme?', e: 'What did you say?' },
        { h: '再说一遍', p: 'zài shuō yí biàn', e: 'Say that again' },
        { h: '慢一点说', p: 'màn yìdiǎn shuō', e: 'Please speak a bit slower' },
        { h: '这个怎么说？', p: 'zhège zěnme shuō?', e: 'How do you say this?' },
        { h: '我的汉语不太好', p: 'wǒ de Hànyǔ bú tài hǎo', e: "My Chinese isn't very good" },
        { h: '我在学习中文', p: 'wǒ zài xuéxí Zhōngwén', e: "I'm learning Chinese" },
        { h: '等一下，我想想', p: 'děng yíxià, wǒ xiǎngxiang', e: 'Wait, let me think' },
        { h: '我都不知道是什么意思', p: 'Wǒ dōu bù zhīdào shì shénme yìsi', e: "I really don't know what that means", book: 'hsk2' },
        { h: '你都听懂了吗？', p: 'Nǐ dōu tīngdǒng le ma?', e: 'Did you understand everything?', book: 'hsk2', recognizeOnly: true },
        { h: '让我想想再告诉你', p: 'Ràng wǒ xiǎngxiang zài gàosu nǐ', e: "Let me think about it and I'll tell you later", book: 'hsk2' },
        { h: '你打错了', p: 'Nǐ dǎ cuò le', e: "You've got the wrong number", book: 'hsk2' },
        { h: '没有眼镜，我一个字也看不清楚', p: 'Méiyǒu yǎnjìng, wǒ yí ge zì yě kàn bu qīngchu', e: "Without my glasses I can't see a single character clearly", book: 'hsk3' },
        { h: '电话里讲不明白', p: 'Diànhuà li jiǎng bu míngbai', e: "I can't explain clearly over the phone", book: 'hsk3' },
        { h: '你快过来帮忙啊', p: 'Nǐ kuài guòlai bāngmáng a', e: 'Come here quickly and help', book: 'hsk3' },
        { h: '不用担心，有我呢', p: 'Búyòng dānxīn, yǒu wǒ ne', e: "No need to worry, I'm here", book: 'hsk3', recognizeOnly: true },
        { h: '我对这儿比较了解', p: 'Wǒ duì zhèr bǐjiào liǎojiě', e: 'I know this place fairly well', book: 'hsk3' },
      ],
    },
    {
      id: 'table', label: 'At the Table', weight: 1, phrases: [
        { h: '很好吃', p: 'hěn hǎochī', e: "It's delicious" },
        { h: '我吃饱了', p: 'wǒ chībǎo le', e: "I'm full" },
        { h: '我要一点点', p: 'wǒ yào yìdiǎndiǎn', e: 'Just a little for me' },
        { h: '谢谢，够了', p: 'xièxie, gòu le', e: "Thanks, that's enough" },
        { h: '我想喝茶', p: 'Wǒ xiǎng hē chá', e: "I'd like some tea", book: 'hsk1' },
        { h: '我想喝水', p: 'Wǒ xiǎng hē shuǐ', e: "I'd like some water", book: 'hsk1' },
        { h: '来一点儿面条吧', p: 'Lái yìdiǎnr miàntiáo ba', e: 'Some noodles please', book: 'hsk2' },
        { h: '喝咖啡吗？', p: 'Hē kāfēi ma?', e: 'Would you like some coffee?', book: 'hsk2' },
        { h: '这个很好吃', p: 'Zhège hěn hǎochī', e: 'This is delicious', book: 'hsk2' },
        { h: '这些水果真新鲜', p: 'Zhèxiē shuǐguǒ zhēn xīnxiān', e: 'This fruit is really fresh', book: 'hsk3' },
        // No pinyin was supplied in the source batch for this one — added here (see
        // data/survival_phrases.md): 不 takes its sandhi form bú before the 4th-tone 要.
        { h: '西瓜不甜不要钱', p: 'Xīguā bù tián bú yào qián', e: "If the watermelon isn't sweet, it's free", book: 'hsk3' },
        { h: '喝杯热茶会很舒服', p: 'Hē bēi rè chá huì hěn shūfu', e: 'A cup of hot tea would feel nice', book: 'hsk3' },
        { h: '茶或者咖啡都可以', p: 'Chá huòzhě kāfēi dōu kěyǐ', e: 'Either tea or coffee is fine', book: 'hsk3' },
      ],
    },
    {
      id: 'smalltalk', label: 'Small Talk / Everyday', weight: 1, phrases: [
        { h: '我很累', p: 'wǒ hěn lèi', e: "I'm tired" },
        { h: '我想睡觉', p: 'wǒ xiǎng shuìjiào', e: 'I want to sleep' },
        { h: '你在哪儿工作？', p: 'Nǐ zài nǎr gōngzuò?', e: 'Where do you work?', book: 'hsk1' },
        { h: '我的东西在哪儿？', p: 'Wǒ de dōngxi zài nǎr?', e: 'Where is my stuff?', book: 'hsk1' },
        { h: '今天天气怎么样？', p: 'Jīntiān tiānqì zěnmeyàng?', e: "What's the weather like today?", book: 'hsk1' },
        { h: '明天天气怎么样？', p: 'Míngtiān tiānqì zěnmeyàng?', e: 'What will the weather be like tomorrow?', book: 'hsk1' },
        { h: '你觉得什么时候去最好？', p: 'Nǐ juéde shénme shíhou qù zuì hǎo?', e: 'When do you think is the best time (to go)?', book: 'hsk2' },
        { h: '你喜欢什么运动？', p: 'Nǐ xǐhuan shénme yùndòng?', e: 'What sport do you like?', book: 'hsk2' },
        { h: '你每天几点起床？', p: 'Nǐ měitiān jǐ diǎn qǐchuáng?', e: 'What time do you get up every day?', book: 'hsk2' },
        { h: '现在身体怎么样？', p: 'Xiànzài shēntǐ zěnmeyàng?', e: 'How are you feeling now?', book: 'hsk2' },
        { h: '你在这儿工作多长时间了？', p: 'Nǐ zài zhèr gōngzuò duō cháng shíjiān le?', e: 'How long have you been working here?', book: 'hsk2' },
        { h: '你家离公司远吗？', p: 'Nǐ jiā lí gōngsī yuǎn ma?', e: 'Do you live far from your company?', book: 'hsk2' },
        { h: '周末你有什么打算？', p: 'Zhōumò nǐ yǒu shénme dǎsuàn?', e: 'What are your plans for the weekend?', book: 'hsk3' },
        // Flagged by its source batch as "not verbatim, built from confirmed vocabulary" — checked:
        // 最近 + 怎么样 is a completely standard, idiomatic way to ask this. Kept as-is.
        { h: '你最近怎么样？', p: 'Nǐ zuìjìn zěnmeyàng?', e: 'How have you been lately?', book: 'hsk3' },
        { h: '健康最重要', p: 'Jiànkāng zuì zhòngyào', e: 'Health is most important', book: 'hsk3' },
        { h: '你和马可谁个子高？', p: 'Nǐ hé Mǎkě shéi gèzi gāo?', e: "Who's taller, you or Marco?", book: 'hsk3' },
      ],
    },
    {
      id: 'travel', label: 'Basic Travel', weight: 1, phrases: [
        { h: '洗手间在哪儿？', p: 'xǐshǒujiān zài nǎr?', e: "Where's the bathroom?" },
        // Reconciled dup: kept over the original set's bare "多少钱？" (fuller version, per the
        // brief) — left ungated like the phrase it replaced, since it's a direct upgrade of a
        // foundational day-one phrase rather than new HSK1 material.
        { h: '这个多少钱？', p: 'zhège duōshao qián?', e: 'How much is it?' },
        { h: '可以吗？', p: 'kěyǐ ma?', e: 'Is that okay? / May I?' },
        { h: '我是坐飞机来的', p: 'Wǒ shì zuò fēijī lái de', e: 'I came by plane', book: 'hsk1' },
        { h: '你是怎么来的？', p: 'Nǐ shì zěnme lái de?', e: 'How did you get here?', book: 'hsk1' },
        { h: '这件不错，就买这件吧', p: 'Zhè jiàn búcuò, jiù mǎi zhè jiàn ba', e: "This one is good, let's get this one", book: 'hsk2' },
        { h: '颜色还可以', p: 'Yánsè hái kěyǐ', e: 'The color is alright', book: 'hsk2' },
        { h: '比昨天便宜', p: 'Bǐ zuótiān piányi', e: "It's cheaper than yesterday", book: 'hsk2' },
        { h: '两百块还可以', p: 'Liǎngbǎi kuài hái kěyǐ', e: "Two hundred yuan isn't too bad", book: 'hsk2' },
      ],
    },
    {
      id: 'family', label: 'Age & Family', weight: 1, phrases: [
        { h: '你多大了？', p: 'Nǐ duō dà le?', e: 'How old are you?', book: 'hsk1', recognizeOnly: true },
        { h: '你女儿/儿子几岁了？', p: "Nǐ nǚ'ér/érzi jǐ suì le?", e: 'How old is your daughter/son?', book: 'hsk1' },
        { h: '他比我大三岁', p: 'Tā bǐ wǒ dà sān suì', e: "He's three years older than me", book: 'hsk2' },
      ],
    },
    {
      id: 'ability', label: 'Ability', weight: 1, phrases: [
        { h: '我会说一点儿汉语', p: 'Wǒ huì shuō yìdiǎnr Hànyǔ', e: 'I can speak a little Chinese', book: 'hsk1' },
        { h: '你会说英语吗？', p: 'Nǐ huì shuō Yīngyǔ ma?', e: 'Do you speak English?', book: 'hsk1' },
      ],
    },
    {
      id: 'timedate', label: 'Time & Date', weight: 1, phrases: [
        { h: '今天几号？', p: 'Jīntiān jǐ hào?', e: "What's the date today?", book: 'hsk1' },
        { h: '今天星期几？', p: 'Jīntiān xīngqī jǐ?', e: 'What day is it today?', book: 'hsk1' },
        { h: '现在几点？', p: 'Xiànzài jǐ diǎn?', e: 'What time is it now?', book: 'hsk1' },
      ],
    },
    {
      id: 'manners', label: 'Requests & Manners', weight: 1, phrases: [
        { h: '我能坐这儿吗？', p: 'Wǒ néng zuò zhèr ma?', e: 'Can I sit here?', book: 'hsk1' },
        { h: '请坐', p: 'Qǐng zuò', e: 'Please, sit', book: 'hsk1' },
        { h: '请喝茶', p: 'Qǐng hē chá', e: 'Please, have some tea', book: 'hsk1', recognizeOnly: true },
        { h: '你等我一会儿', p: 'Nǐ děng wǒ yíhuìr', e: 'Wait for me a moment', book: 'hsk3' },
        { h: '我马上回来', p: 'Wǒ mǎshàng huílai', e: "I'll be right back", book: 'hsk3' },
        { h: '我去洗手间', p: 'Wǒ qù xǐshǒujiān', e: "I'm going to the restroom", book: 'hsk3' },
        { h: '坐这儿吧，这儿安静', p: 'Zuò zhèr ba, zhèr ānjìng', e: "Let's sit here, it's quiet", book: 'hsk3' },
      ],
    },
    {
      id: 'phone', label: 'On the Phone', weight: 1, phrases: [
        { h: '喂', p: 'Wéi', e: 'Hello (answering the phone)', book: 'hsk1' },
        { h: '我在学中文呢', p: 'Wǒ zài xué Zhōngwén ne', e: "I'm learning Chinese right now", book: 'hsk1' },
      ],
    },
    {
      id: 'directions', label: 'Directions', weight: 1, phrases: [
        { h: '从这儿一直往前走', p: 'Cóng zhèr yìzhí wǎng qián zǒu', e: 'Walk straight ahead from here', book: 'hsk2' },
        { h: '到了前面的路口再往右走', p: 'Dàole qiánmiàn de lùkǒu zài wǎng yòu zǒu', e: 'Turn right at the next crossing', book: 'hsk2' },
        { h: '走几分钟就到了', p: 'Zǒu jǐ fēnzhōng jiù dào le', e: "It's just a few minutes' walk", book: 'hsk2' },
        { h: '附近有三四个车站', p: 'Fùjìn yǒu sān-sì ge chēzhàn', e: 'There are three or four bus stops nearby', book: 'hsk3' },
        { h: '我去图书馆借本书', p: 'Wǒ qù túshūguǎn jiè běn shū', e: "I'm going to the library to borrow a book", book: 'hsk3' },
      ],
    },
    {
      id: 'newyear', label: 'New Year', weight: 1, phrases: [
        // Flagged by its source batch as "not verbatim, built from confirmed vocabulary" —
        // checked: 新年快乐 is *the* standard Mandarin Happy New Year greeting. Kept as-is.
        { h: '新年快乐', p: 'Xīnnián kuàilè', e: 'Happy New Year', book: 'hsk2' },
        { h: '新年就要到了', p: 'Xīnnián jiù yào dào le', e: 'The New Year is coming', book: 'hsk2' },
      ],
    },
  ];

  // renderFlashcard() (see lessons.js) unconditionally renders word.m as the mnemonic line —
  // these phrases have none, so give every one an empty string rather than leaving it undefined
  // (which would otherwise literally print the word "undefined" on the card).
  GROUPS.forEach((g) => g.phrases.forEach((p) => { p.m = ''; }));

  function itemId(groupId, hanzi) { return 'survival:' + groupId + ':' + hanzi; }

  // Every phrase in the group — nothing is locked, so this is just group.phrases. Kept as a
  // function (rather than reading group.phrases directly at call sites) so there's one place to
  // change if that ever stops being true.
  function allPhrases(group) { return group.phrases; }

  // Every phrase, across every group, whose SRS record is currently due — this is what Review's
  // queue pools (see js/review.js) and what Dashboard's due-count teaser must match.
  function dueEntries() {
    const out = [];
    const now = Date.now();
    GROUPS.forEach((g) => {
      allPhrases(g).forEach((phrase) => {
        const id = itemId(g.id, phrase.h);
        const rec = Storage.getSrsRecord(id);
        if (rec && rec.due <= now) out.push({ group: g, phrase, itemId: id });
      });
    });
    return out;
  }

  // ===== screen (browse by group, Flip & Recall through that group's phrases) =====
  let root = null;
  let goTo = null;
  let currentGroupId = GROUPS[0].id;
  let started = false;
  let roundPhrases = [];
  let idx = 0;
  let flipped = false;
  let completed = false;

  function currentGroup() { return GROUPS.find((g) => g.id === currentGroupId); }

  function html() {
    return `
      <div class="lamp"></div>
      <h1>Survival Phrases</h1>
      <div class="sub">Whole practical phrases, grouped by real-world moment — memorize the chunk, not the grammar</div>
      <div class="tabs" id="spTabs"></div>
      <div class="progress-row">
        <span id="spPosLabel"></span>
        <span></span>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="spProgressFill"></div></div>
      <div id="spCardArea"></div>
      <div class="stats" id="spStatsRow"></div>
    `;
  }

  function buildTabs() {
    const el = root.querySelector('#spTabs');
    el.innerHTML = GROUPS.map((g) => `<div class="tab ${g.id === currentGroupId ? 'active' : ''}" data-id="${g.id}">${g.label}</div>`).join('');
    el.querySelectorAll('.tab').forEach((t) => {
      t.onclick = () => {
        if (t.dataset.id === currentGroupId) return;
        currentGroupId = t.dataset.id;
        started = false; completed = false; idx = 0; flipped = false;
        buildTabs();
        render();
      };
    });
  }

  function sessionKey() { return 'survival:' + currentGroupId; }

  function computeTally(group) {
    let known = 0, learning = 0;
    const phrases = allPhrases(group);
    phrases.forEach((p) => {
      const status = Storage.itemStatus(itemId(group.id, p.h));
      if (status === 'known') known++; else if (status === 'learning') learning++;
    });
    return { known, learning, total: phrases.length };
  }

  function renderGoScreen() {
    const group = currentGroup();
    root.querySelector('#spPosLabel').textContent = '';
    root.querySelector('#spProgressFill').style.width = '0%';
    root.querySelector('#spStatsRow').innerHTML = '';

    const phrases = allPhrases(group);
    const session = Storage.getSession(sessionKey());
    const validSession = session && Number.isInteger(session.idx) && session.idx >= 0 && session.idx < phrases.length;

    const buttonsHtml = phrases.length === 0
      ? `<div class="soon-box">Nothing here yet.</div>`
      : (validSession
        ? `
          <button class="submit-btn" id="spResumeBtn" style="margin-top:22px;">Resume (phrase ${session.idx + 1} of ${phrases.length})</button>
          <button class="reset" id="spStartOverBtn" style="margin-top:14px;">Start over</button>
        `
        : `<button class="submit-btn" id="spGoBtn" style="margin-top:22px;">Go</button>`);

    root.querySelector('#spCardArea').innerHTML = `
      <div class="card" style="cursor:default;">
        <div class="back-english" style="margin-bottom:14px;">${group.label}</div>
        <div class="mnemonic" style="margin-bottom:0;">${phrases.length} phrase${phrases.length === 1 ? '' : 's'} — tap each card to reveal the meaning, then mark yourself "I know this" or "still learning", same as Flip &amp; Recall.</div>
        ${buttonsHtml}
      </div>
    `;

    if (phrases.length === 0) return;
    if (validSession) {
      root.querySelector('#spResumeBtn').onclick = () => { idx = session.idx; flipped = false; completed = false; started = true; render(); };
      root.querySelector('#spStartOverBtn').onclick = () => { Storage.clearSession(sessionKey()); idx = 0; flipped = false; completed = false; started = true; render(); };
    } else {
      root.querySelector('#spGoBtn').onclick = () => { idx = 0; flipped = false; completed = false; started = true; render(); };
    }
  }

  function renderCompletionScreen(group) {
    Storage.clearSession(sessionKey());
    root.querySelector('#spPosLabel').textContent = 'Complete!';
    root.querySelector('#spProgressFill').style.width = '100%';
    root.querySelector('#spStatsRow').innerHTML = '';
    const { known, learning } = computeTally(group);

    root.querySelector('#spCardArea').innerHTML = `
      <div class="card" style="cursor:default;">
        <div class="review-summary" style="padding:10px 0;">
          <div class="rs-emoji">${learning === 0 ? '🎉' : '👍'}</div>
          <div class="rs-title">${known} known · ${learning} still learning</div>
          <div class="rs-sub">${group.label} — come back any time, these resurface in Review as they come due.</div>
        </div>
      </div>
      <div class="controls">
        <button class="nav-btn" id="spTryAgainBtn">Go through again</button>
        <button class="nav-btn" id="spBackBtn">Back to Dashboard</button>
      </div>
    `;
    root.querySelector('#spTryAgainBtn').onclick = () => { idx = 0; flipped = false; completed = false; render(); };
    root.querySelector('#spBackBtn').onclick = () => { if (goTo) goTo('dashboard'); };
  }

  function render() {
    const group = currentGroup();
    if (!started) { renderGoScreen(); return; }
    const phrases = allPhrases(group);
    if (completed || phrases.length === 0) { renderCompletionScreen(group); return; }
    if (idx >= phrases.length) idx = phrases.length - 1;
    Storage.setSession(sessionKey(), { idx });

    root.querySelector('#spPosLabel').textContent = (idx + 1) + ' / ' + phrases.length;
    root.querySelector('#spProgressFill').style.width = (((idx + 1) / phrases.length) * 100) + '%';
    const phrase = phrases[idx];
    const id = itemId(group.id, phrase.h);
    const cardArea = root.querySelector('#spCardArea');

    if (!flipped) {
      Lessons.renderFlashcard(cardArea, phrase, false, {
        onToggle: () => { flipped = true; render(); },
        wireControls: () => {},
      });
    } else {
      const controlsHtml = `
        <div class="controls">
          <button class="nav-btn learning" id="spLearnBtn">still learning</button>
          <button class="nav-btn know" id="spKnowBtn">I know this</button>
        </div>`;
      Lessons.renderFlashcard(cardArea, phrase, true, {
        controlsHtml,
        onToggle: () => { flipped = false; render(); },
        wireControls: () => {
          root.querySelector('#spKnowBtn').onclick = (e) => {
            e.stopPropagation();
            Storage.recordSrsResult(id, true, group.weight);
            advanceRound(phrases.length);
          };
          root.querySelector('#spLearnBtn').onclick = (e) => {
            e.stopPropagation();
            Storage.recordSrsResult(id, false, group.weight);
            advanceRound(phrases.length);
          };
        },
      });
    }
    const tally = computeTally(group);
    root.querySelector('#spStatsRow').innerHTML = `<span><b>${tally.known}</b> known</span><span><b>${tally.learning}</b> still learning</span><span><b>${tally.total}</b> total</span>`;
  }

  function advanceRound(total) {
    flipped = false;
    if (idx < total - 1) idx++; else completed = true;
    render();
  }

  function mount(container, navigate) {
    root = container;
    goTo = navigate || null;
    currentGroupId = GROUPS[0].id; // always start on the first group on a fresh visit
    started = false; completed = false; idx = 0; flipped = false;
    root.innerHTML = html();
    buildTabs();
    render();
  }

  return { mount, GROUPS, itemId, allPhrases, dueEntries };
})();
