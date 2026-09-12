// Colors game: the fourth game under the Games screen (see games.js), drilling the standard set
// of basic Mandarin colors — see data/colors_vocabulary.md for the source vocabulary and hex
// values. Same recall-first, no-multiple-choice pattern as the other games: each color is shown
// as hanzi + pinyin with a speaker button, the person types the English name back, and only AFTER
// answering (right or wrong) does a swatch of the actual color reveal — showing it beforehand
// would give the answer away before the recall attempt. Not tied to any HSK book, same as
// Numbers/Date & Weekday/Mahjong Tiles.
const ColorsGame = (() => {
  const ROUND_LENGTH = 10;
  let root = null;
  let goTo = null;
  let started = false;
  let roundColors = [];
  let roundIndex = 0;
  let correctCount = 0;
  let answered = false;
  let correct = null;
  let typedAnswer = '';
  let completed = false;

  // Every name follows [color character] + 色 (sè, "color") — e.g. 红(red) + 色 = 红色 — called
  // out on the Go screen since it's a real recognizable pattern, not 14 words to memorize cold.
  // `outline` marks the one swatch (White) that needs a visible border so it doesn't disappear
  // against a light background (flagged in colors_vocabulary.md).
  const COLORS = [
    { han: '红色', pin: 'hóngsè', hex: '#E63946', answers: ['red'] },
    { han: '橙色', pin: 'chéngsè', hex: '#FF8C00', answers: ['orange'] },
    { han: '黄色', pin: 'huángsè', hex: '#FFD700', answers: ['yellow'] },
    { han: '绿色', pin: 'lǜsè', hex: '#2ECC71', answers: ['green'] },
    { han: '蓝色', pin: 'lánsè', hex: '#3498DB', answers: ['blue'] },
    { han: '紫色', pin: 'zǐsè', hex: '#9B59B6', answers: ['purple'] },
    { han: '粉色', pin: 'fěnsè', hex: '#FFB6C1', answers: ['pink'] },
    { han: '棕色', pin: 'zōngsè', hex: '#8B4513', answers: ['brown'] },
    { han: '黑色', pin: 'hēisè', hex: '#1C1C1C', answers: ['black'] },
    { han: '白色', pin: 'báisè', hex: '#FFFFFF', answers: ['white'], outline: true },
    { han: '灰色', pin: 'huīsè', hex: '#808080', answers: ['gray', 'grey'] },
    { han: '金色', pin: 'jīnsè', hex: '#D4AF37', answers: ['gold'] },
    { han: '银色', pin: 'yínsè', hex: '#C0C0C0', answers: ['silver'] },
    { han: '青色', pin: 'qīngsè', hex: '#00CED1', answers: ['cyan', 'turquoise'] },
  ];

  function displayName(color) {
    const s = color.answers[0];
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Same lenient normalize-then-exact-match approach as MahjongGame.checkMahjongAnswer: strip
  // everything but letters/digits and lowercase, so case/spacing/punctuation cost nothing, without
  // being so loose that an unrelated word would count.
  function normalize(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function checkColorAnswer(input, color) {
    const userN = normalize(input);
    if (!userN) return false;
    return color.answers.some((a) => normalize(a) === userN);
  }

  function newRound() {
    const pool = COLORS.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    roundColors = pool.slice(0, ROUND_LENGTH);
    roundIndex = 0;
    correctCount = 0;
    answered = false;
    correct = null;
    completed = false;
  }

  function currentColor() { return roundColors[roundIndex]; }

  function html() {
    return `
      <div class="autoplay-row">
        <span>Auto-play audio</span>
        <div class="switch" id="colAutoplaySwitch"><div class="knob"></div></div>
      </div>
      <div class="top-row" id="colSpeedRow"></div>
      <div class="progress-row">
        <span id="colPosLabel"></span>
        <span></span>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="colProgressFill"></div></div>
      <div id="colCardArea"></div>
      <div class="stats" id="colStatsRow"></div>
      <button class="reset" id="colResetBtn">Start a new round</button>
    `;
  }

  function buildAutoplayToggle() {
    const el = root.querySelector('#colAutoplaySwitch');
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
    return { emoji: '💪', message: 'Good effort! Try another round.' };
  }

  const SESSION_KEY = 'colors';
  function validSession(session) {
    return !!session
      && Array.isArray(session.roundColors) && session.roundColors.length === ROUND_LENGTH
      && Number.isInteger(session.roundIndex) && session.roundIndex >= 0 && session.roundIndex < ROUND_LENGTH
      && Number.isInteger(session.correctCount);
  }

  function renderStart() {
    root.querySelector('#colPosLabel').textContent = '';
    root.querySelector('#colProgressFill').style.width = '0%';
    root.querySelector('#colStatsRow').innerHTML = '';

    const session = Storage.getSession(SESSION_KEY);
    const hasSession = validSession(session);

    const buttonsHtml = hasSession
      ? `
        <button class="submit-btn" id="colResumeBtn" style="margin-top:22px;">Resume (color ${session.roundIndex + 1} of ${ROUND_LENGTH}, ${session.correctCount} correct so far)</button>
        <button class="reset" id="colStartOverBtn" style="margin-top:14px;">Start over</button>
      `
      : `<button class="submit-btn" id="colGoBtn" style="margin-top:22px;">Go</button>`;

    root.querySelector('#colCardArea').innerHTML = `
      <div class="card" style="cursor:default;">
        <div class="back-english" style="margin-bottom:14px;">Colors</div>
        <div class="mnemonic" style="margin-bottom:0;">You'll see 10 colors written in Chinese, one at a time — type the English name, e.g. "Blue" or "Red". Every color name follows the same pattern: a color character + 色 (sè, "color") — e.g. 红(red) + 色 = 红色. The actual color reveals after you answer, not before.</div>
        ${buttonsHtml}
      </div>
    `;

    if (hasSession) {
      root.querySelector('#colResumeBtn').onclick = () => {
        roundColors = session.roundColors;
        roundIndex = session.roundIndex;
        correctCount = session.correctCount;
        answered = false; correct = null; completed = false;
        started = true;
        render();
      };
      root.querySelector('#colStartOverBtn').onclick = () => {
        Storage.clearSession(SESSION_KEY);
        started = true; newRound(); render();
      };
    } else {
      root.querySelector('#colGoBtn').onclick = () => { started = true; newRound(); render(); };
    }
  }

  function renderCompletionScreen() {
    Storage.clearSession(SESSION_KEY);
    root.querySelector('#colPosLabel').textContent = 'Round complete!';
    root.querySelector('#colProgressFill').style.width = '100%';
    root.querySelector('#colStatsRow').innerHTML = '';
    const tone = completionTone(correctCount, ROUND_LENGTH);

    root.querySelector('#colCardArea').innerHTML = `
      <div class="card" style="cursor:default;">
        <div class="review-summary" style="padding:10px 0;">
          <div class="rs-emoji">${tone.emoji}</div>
          <div class="rs-title">${correctCount} out of ${ROUND_LENGTH} correct</div>
          <div class="rs-sub">${tone.message}</div>
        </div>
      </div>
      <div class="controls">
        <button class="nav-btn" id="colTryAgainBtn">Try again</button>
        <button class="nav-btn" id="colBackBtn">Back to Dashboard</button>
      </div>
    `;
    root.querySelector('#colTryAgainBtn').onclick = () => { newRound(); render(); };
    root.querySelector('#colBackBtn').onclick = () => { if (goTo) goTo('dashboard'); };
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

  // Toggles the Check button's disabled state to match the input's current (trimmed) content —
  // called on every keystroke so an empty box can never be submitted via click, on top of the
  // "do nothing + show an error" guard doSubmit() also carries as a second line of defense.
  function syncSubmitEnabled(input, btn) {
    btn.disabled = !input.value.trim();
  }

  function render() {
    if (!started) { renderStart(); return; }
    if (completed) { renderCompletionScreen(); return; }
    Storage.setSession(SESSION_KEY, { roundColors, roundIndex, correctCount });

    root.querySelector('#colPosLabel').textContent = (roundIndex + 1) + ' / ' + ROUND_LENGTH;
    root.querySelector('#colProgressFill').style.width = (((roundIndex + 1) / ROUND_LENGTH) * 100) + '%';
    const color = currentColor();
    const cardArea = root.querySelector('#colCardArea');
    const isLast = roundIndex === ROUND_LENGTH - 1;

    if (!answered) {
      Recorder.cleanup();
      cardArea.innerHTML = `
        <div class="card" style="cursor:default;">
          <div class="hanzi">${color.han}</div>
          <div class="pinyin">${color.pin}</div>
          <div class="audio-row"><button class="speak-btn" id="colSpeakBtn" aria-label="Play color name">&#128266;</button><span id="colMicArea"></span></div>
          <input type="text" class="type-input" id="colInput" placeholder='e.g. "Blue"' autocomplete="off">
          <div class="error-text" id="colError"></div>
          <button class="submit-btn" id="colSubmitBtn" disabled>Check</button>
        </div>
        <div class="controls"><button class="nav-btn" id="colSkipBtn">skip &rarr;</button></div>
      `;
      const speakBtn = root.querySelector('#colSpeakBtn');
      speakBtn.onclick = () => Speech.speak(color.han, speakBtn);
      if (Storage.getAutoplay('lessons')) Speech.speak(color.han, speakBtn);
      Recorder.mountMicButton(root.querySelector('#colMicArea'), color.han);
      const input = root.querySelector('#colInput');
      const submitBtn = root.querySelector('#colSubmitBtn');
      const doSubmit = () => {
        const val = input.value.trim();
        if (!val) { root.querySelector('#colError').textContent = 'Type an answer first.'; input.classList.add('wrong-input'); return; }
        correct = checkColorAnswer(val, color);
        if (correct) correctCount++;
        Storage.recordActivity();
        typedAnswer = val; answered = true; render();
      };
      submitBtn.onclick = doSubmit;
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !submitBtn.disabled) doSubmit(); });
      input.addEventListener('input', () => {
        input.classList.remove('wrong-input');
        root.querySelector('#colError').textContent = '';
        syncSubmitEnabled(input, submitBtn);
      });
      input.focus();
      root.querySelector('#colSkipBtn').onclick = () => advanceRound();
    } else {
      Recorder.cleanup();
      cardArea.innerHTML = `
        <div class="card" style="cursor:default;">
          <div class="feedback-badge ${correct ? 'correct' : 'wrong'}">${correct ? 'Correct!' : 'Not quite'}</div>
          <div class="hanzi">${color.han}</div>
          <div class="pinyin">${color.pin}</div>
          <div class="color-swatch${color.outline ? ' needs-outline' : ''}" style="background:${color.hex};"></div>
          <div class="audio-row"><button class="speak-btn" id="colSpeakBtn2" aria-label="Play color name">&#128266;</button><span id="colMicArea2"></span></div>
          <div class="your-answer">You typed: "${typedAnswer}"</div>
          <div class="back-english">${displayName(color)}</div>
        </div>
        <div class="controls"><button class="nav-btn" id="colNextBtn">${isLast ? 'see results →' : 'next color →'}</button></div>
      `;
      const speakBtn2 = root.querySelector('#colSpeakBtn2');
      speakBtn2.onclick = () => Speech.speak(color.han, speakBtn2);
      Recorder.mountMicButton(root.querySelector('#colMicArea2'), color.han);
      root.querySelector('#colNextBtn').onclick = () => advanceRound();
    }

    const missed = (roundIndex + (answered ? 1 : 0)) - correctCount;
    root.querySelector('#colStatsRow').innerHTML = `<span><b>${correctCount}</b> correct</span><span><b>${missed}</b> missed</span><span><b>${ROUND_LENGTH}</b> total</span>`;
  }

  function mount(container, navigate) {
    root = container;
    goTo = navigate || null;
    started = false;
    root.innerHTML = html();
    buildAutoplayToggle();
    Speech.buildSpeedControl(root.querySelector('#colSpeedRow'));
    render();
    root.querySelector('#colResetBtn').onclick = () => { newRound(); render(); };
  }

  return { mount, checkColorAnswer, COLORS };
})();
