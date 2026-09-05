// Date & Weekday game: the second game under the Games screen (see games.js), reinforcing HSK1
// Lesson 7's date grammar note (month -> date -> weekday, big-to-small) and its 月/号/星期
// vocabulary. Each round is 10 freshly-random dates (not calendar-accurate — the weekday doesn't
// need to actually match the date, this is language recall, not calendar math), shown as hanzi +
// pinyin with a speaker button; the person types the English date back, checked leniently against
// word presence rather than an exact string match, so formatting/order/case/abbreviations don't
// cost a "wrong". Same Go-screen/resume/completion-screen pattern as NumbersDrill and Lessons.
// Mounts into Games' own game-area container, not a full screen of its own.
const DateWeekdayGame = (() => {
  const ROUND_LENGTH = 10;
  let root = null;
  let goTo = null;
  let started = false;
  let roundQuestions = [];
  let roundIndex = 0;
  let correctCount = 0;
  let answered = false;
  let correct = null;
  let typedAnswer = '';
  let completed = false;

  // Index 0 unused — months/weekdays are naturally 1-based, matches how the rest of the app
  // (and the textbook) numbers them ("9月" not "month 8").
  const MONTHS = [
    null,
    { han: '一月', pin: 'Yī yuè', en: 'january', abbr: ['jan'] },
    { han: '二月', pin: 'Èr yuè', en: 'february', abbr: ['feb'] },
    { han: '三月', pin: 'Sān yuè', en: 'march', abbr: ['mar'] },
    { han: '四月', pin: 'Sì yuè', en: 'april', abbr: ['apr'] },
    { han: '五月', pin: 'Wǔ yuè', en: 'may', abbr: [] },
    { han: '六月', pin: 'Liù yuè', en: 'june', abbr: ['jun'] },
    { han: '七月', pin: 'Qī yuè', en: 'july', abbr: ['jul'] },
    { han: '八月', pin: 'Bā yuè', en: 'august', abbr: ['aug'] },
    { han: '九月', pin: 'Jiǔ yuè', en: 'september', abbr: ['sep', 'sept'] },
    { han: '十月', pin: 'Shí yuè', en: 'october', abbr: ['oct'] },
    { han: '十一月', pin: 'Shíyī yuè', en: 'november', abbr: ['nov'] },
    { han: '十二月', pin: "Shí'èr yuè", en: 'december', abbr: ['dec'] },
  ];
  const DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // 1 = Monday ... 7 = Sunday, matching how the grammar note and the rest of the app write
  // 星期 (星期天, not 星期日, for Sunday — see HSK2 L2/L6 vocab).
  const WEEKDAYS = [
    null,
    { han: '星期一', pin: 'xīngqīyī', en: 'monday', abbr: ['mon'] },
    { han: '星期二', pin: "xīngqī'èr", en: 'tuesday', abbr: ['tue', 'tues'] },
    { han: '星期三', pin: 'xīngqīsān', en: 'wednesday', abbr: ['wed'] },
    { han: '星期四', pin: 'xīngqīsì', en: 'thursday', abbr: ['thu', 'thur', 'thurs'] },
    { han: '星期五', pin: 'xīngqīwǔ', en: 'friday', abbr: ['fri'] },
    { han: '星期六', pin: 'xīngqīliù', en: 'saturday', abbr: ['sat'] },
    { han: '星期天', pin: 'xīngqītiān', en: 'sunday', abbr: ['sun'] },
  ];

  function randomQuestion() {
    const month = 1 + Math.floor(Math.random() * 12);
    const date = 1 + Math.floor(Math.random() * DAYS_IN_MONTH[month]);
    const weekday = 1 + Math.floor(Math.random() * 7);
    return { month, date, weekday };
  }

  // Big-to-small order (月 -> 号 -> 星期), per HSK1 L7's grammar note. Date-of-month digits reuse
  // NumbersDrill's number-to-hanzi/pinyin conversion (1-31 falls entirely within its <100 branch)
  // rather than duplicating that logic here.
  function hanziPhrase(q) { return MONTHS[q.month].han + NumbersDrill.numberToHanzi(q.date) + '号，' + WEEKDAYS[q.weekday].han + '。'; }
  function pinyinPhrase(q) { return MONTHS[q.month].pin + ' ' + NumbersDrill.numberToPinyin(q.date) + ' hào, ' + WEEKDAYS[q.weekday].pin + '.'; }
  function englishAnswer(q) { return capitalize(MONTHS[q.month].en) + ' ' + q.date + ', ' + capitalize(WEEKDAYS[q.weekday].en); }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // Lenient check: strip ordinal suffixes ("1st" -> "1") and punctuation, then just confirm the
  // month, the date number, and the weekday all appear somewhere in the typed answer — comma
  // placement, capitalization, word order and common abbreviations ("sept", "mon") all fall out
  // for free, since this never compares the input to one exact expected string.
  function normalizeTokens(s) {
    return s.toLowerCase()
      .replace(/(\d+)(st|nd|rd|th)\b/g, '$1')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }
  function checkDateAnswer(input, q) {
    const tokens = normalizeTokens(input);
    if (!tokens.length) return false;
    const month = MONTHS[q.month], weekday = WEEKDAYS[q.weekday];
    const hasMonth = tokens.some((t) => t === month.en || month.abbr.indexOf(t) !== -1);
    const hasWeekday = tokens.some((t) => t === weekday.en || weekday.abbr.indexOf(t) !== -1);
    const hasDate = tokens.some((t) => t === String(q.date));
    return hasMonth && hasWeekday && hasDate;
  }

  function newRound() {
    roundQuestions = [];
    for (let i = 0; i < ROUND_LENGTH; i++) roundQuestions.push(randomQuestion());
    roundIndex = 0;
    correctCount = 0;
    answered = false;
    correct = null;
    completed = false;
  }

  function currentQuestion() { return roundQuestions[roundIndex]; }

  function html() {
    return `
      <div class="autoplay-row">
        <span>Auto-play audio</span>
        <div class="switch" id="dwAutoplaySwitch"><div class="knob"></div></div>
      </div>
      <div class="top-row" id="dwSpeedRow"></div>
      <div class="progress-row">
        <span id="dwPosLabel"></span>
        <span></span>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="dwProgressFill"></div></div>
      <div id="dwCardArea"></div>
      <div class="stats" id="dwStatsRow"></div>
      <button class="reset" id="dwResetBtn">Start a new round</button>
    `;
  }

  function buildAutoplayToggle() {
    const el = root.querySelector('#dwAutoplaySwitch');
    const on = Storage.getAutoplay('lessons');
    el.className = 'switch' + (on ? ' on' : '');
    el.innerHTML = '<div class="knob"></div>';
    el.onclick = () => { Storage.setAutoplay('lessons', !Storage.getAutoplay('lessons')); buildAutoplayToggle(); };
  }

  function completionTone(correctN, total) {
    if (total === 0) return { emoji: '👍', message: 'Round complete.' };
    const ratio = correctN / total;
    if (ratio === 1) return { emoji: '🎉', message: 'Perfect round!' };
    if (ratio >= 0.7) return { emoji: '✨', message: 'Well done!' };
    if (ratio >= 0.4) return { emoji: '👍', message: 'Nice work — a few more rounds and you’ll have it.' };
    return { emoji: '💪', message: 'Good effort! Dates take practice — try another round.' };
  }

  const SESSION_KEY = 'dateWeekday';
  function validSession(session) {
    return !!session
      && Array.isArray(session.roundQuestions) && session.roundQuestions.length === ROUND_LENGTH
      && Number.isInteger(session.roundIndex) && session.roundIndex >= 0 && session.roundIndex < ROUND_LENGTH
      && Number.isInteger(session.correctCount);
  }

  function renderStart() {
    root.querySelector('#dwPosLabel').textContent = '';
    root.querySelector('#dwProgressFill').style.width = '0%';
    root.querySelector('#dwStatsRow').innerHTML = '';

    const session = Storage.getSession(SESSION_KEY);
    const hasSession = validSession(session);

    const buttonsHtml = hasSession
      ? `
        <button class="submit-btn" id="dwResumeBtn" style="margin-top:22px;">Resume (question ${session.roundIndex + 1} of ${ROUND_LENGTH}, ${session.correctCount} correct so far)</button>
        <button class="reset" id="dwStartOverBtn" style="margin-top:14px;">Start over</button>
      `
      : `<button class="submit-btn" id="dwGoBtn" style="margin-top:22px;">Go</button>`;

    root.querySelector('#dwCardArea').innerHTML = `
      <div class="card" style="cursor:default;">
        <div class="back-english" style="margin-bottom:14px;">Date &amp; Weekday</div>
        <div class="mnemonic" style="margin-bottom:0;">You'll see 10 dates written in Chinese (month, date, day of the week — big to small, just like the grammar note) and type each one back in English, e.g. "September 1, Monday". The weekday doesn't need to match the real calendar — this is about reading the date, not doing calendar math.</div>
        ${buttonsHtml}
      </div>
    `;

    if (hasSession) {
      root.querySelector('#dwResumeBtn').onclick = () => {
        roundQuestions = session.roundQuestions;
        roundIndex = session.roundIndex;
        correctCount = session.correctCount;
        answered = false; correct = null; completed = false;
        started = true;
        render();
      };
      root.querySelector('#dwStartOverBtn').onclick = () => {
        Storage.clearSession(SESSION_KEY);
        started = true; newRound(); render();
      };
    } else {
      root.querySelector('#dwGoBtn').onclick = () => { started = true; newRound(); render(); };
    }
  }

  function renderCompletionScreen() {
    Storage.clearSession(SESSION_KEY);
    root.querySelector('#dwPosLabel').textContent = 'Round complete!';
    root.querySelector('#dwProgressFill').style.width = '100%';
    root.querySelector('#dwStatsRow').innerHTML = '';
    const tone = completionTone(correctCount, ROUND_LENGTH);

    root.querySelector('#dwCardArea').innerHTML = `
      <div class="card" style="cursor:default;">
        <div class="review-summary" style="padding:10px 0;">
          <div class="rs-emoji">${tone.emoji}</div>
          <div class="rs-title">${correctCount} out of ${ROUND_LENGTH} correct</div>
          <div class="rs-sub">${tone.message}</div>
        </div>
      </div>
      <div class="controls">
        <button class="nav-btn" id="dwTryAgainBtn">Try again</button>
        <button class="nav-btn" id="dwBackBtn">Back to Dashboard</button>
      </div>
    `;
    root.querySelector('#dwTryAgainBtn').onclick = () => { newRound(); render(); };
    root.querySelector('#dwBackBtn').onclick = () => { if (goTo) goTo('dashboard'); };
  }

  function advanceRound() {
    Recorder.cleanup();
    if (roundIndex < ROUND_LENGTH - 1) {
      roundIndex++;
      answered = false;
      correct = null;
      typedAnswer = '';
      render();
    } else {
      completed = true;
      render();
    }
  }

  function render() {
    if (!started) { renderStart(); return; }
    if (completed) { renderCompletionScreen(); return; }
    Storage.setSession(SESSION_KEY, { roundQuestions, roundIndex, correctCount });

    root.querySelector('#dwPosLabel').textContent = (roundIndex + 1) + ' / ' + ROUND_LENGTH;
    root.querySelector('#dwProgressFill').style.width = (((roundIndex + 1) / ROUND_LENGTH) * 100) + '%';
    const q = currentQuestion();
    const cardArea = root.querySelector('#dwCardArea');
    const isLast = roundIndex === ROUND_LENGTH - 1;
    const speak = hanziPhrase(q);

    if (!answered) {
      Recorder.cleanup();
      cardArea.innerHTML = `
        <div class="card" style="cursor:default;">
          <div class="sb-prompt-hanzi">${hanziPhrase(q)}</div>
          <div class="sb-prompt-pinyin">${pinyinPhrase(q)}</div>
          <div class="audio-row"><button class="speak-btn" id="dwSpeakBtn" aria-label="Play date">&#128266;</button></div>
          <input type="text" class="type-input" id="dwInput" placeholder='e.g. &quot;September 1, Monday&quot;' autocomplete="off">
          <div class="error-text" id="dwError"></div>
          <button class="submit-btn" id="dwSubmitBtn" disabled>Check</button>
        </div>
        <div class="controls"><button class="nav-btn" id="dwSkipBtn">skip &rarr;</button></div>
      `;
      const speakBtn = root.querySelector('#dwSpeakBtn');
      speakBtn.onclick = () => Speech.speak(speak, speakBtn);
      if (Storage.getAutoplay('lessons')) Speech.speak(speak, speakBtn);
      const input = root.querySelector('#dwInput');
      const submitBtn = root.querySelector('#dwSubmitBtn');
      const doSubmit = () => {
        const val = input.value.trim();
        // Belt-and-suspenders: submitBtn is disabled whenever val is empty, but even if that's
        // somehow bypassed, checkDateAnswer('', q) still returns false (normalizeTokens('') is
        // an empty array), so an empty submission still can't be scored correct.
        if (!val) { root.querySelector('#dwError').textContent = 'Type a date first.'; input.classList.add('wrong-input'); return; }
        correct = checkDateAnswer(val, q);
        if (correct) correctCount++;
        Storage.recordActivity();
        typedAnswer = val; answered = true; render();
      };
      submitBtn.onclick = doSubmit;
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !submitBtn.disabled) doSubmit(); });
      input.addEventListener('input', () => {
        input.classList.remove('wrong-input');
        root.querySelector('#dwError').textContent = '';
        submitBtn.disabled = !input.value.trim();
      });
      input.focus();
      root.querySelector('#dwSkipBtn').onclick = () => advanceRound();
    } else {
      Recorder.cleanup();
      cardArea.innerHTML = `
        <div class="card" style="cursor:default;">
          <div class="feedback-badge ${correct ? 'correct' : 'wrong'}">${correct ? 'Correct!' : 'Not quite'}</div>
          <div class="sb-prompt-hanzi">${hanziPhrase(q)}</div>
          <div class="sb-prompt-pinyin">${pinyinPhrase(q)}</div>
          <div class="audio-row"><button class="speak-btn" id="dwSpeakBtn2" aria-label="Play date">&#128266;</button></div>
          <div class="your-answer">You typed: "${typedAnswer}"</div>
          <div class="back-english">${englishAnswer(q)}</div>
        </div>
        <div class="controls"><button class="nav-btn" id="dwNextBtn">${isLast ? 'see results →' : 'next date →'}</button></div>
      `;
      const speakBtn2 = root.querySelector('#dwSpeakBtn2');
      speakBtn2.onclick = () => Speech.speak(speak, speakBtn2);
      root.querySelector('#dwNextBtn').onclick = () => advanceRound();
    }

    const missed = (roundIndex + (answered ? 1 : 0)) - correctCount;
    root.querySelector('#dwStatsRow').innerHTML = `<span><b>${correctCount}</b> correct</span><span><b>${missed}</b> missed</span><span><b>${ROUND_LENGTH}</b> total</span>`;
  }

  function mount(container, navigate) {
    root = container;
    goTo = navigate || null;
    started = false;
    root.innerHTML = html();
    buildAutoplayToggle();
    Speech.buildSpeedControl(root.querySelector('#dwSpeedRow'));
    render();
    root.querySelector('#dwResetBtn').onclick = () => { newRound(); render(); };
  }

  return { mount, checkDateAnswer };
})();
