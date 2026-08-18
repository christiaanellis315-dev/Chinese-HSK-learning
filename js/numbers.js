// Numbers 1-99 screen: a standalone, recurring drill (moved out of Lesson 5, since it's a
// tool people come back to regardless of which lesson they're on, not one-time lesson content).
// Runs as a fixed 20-number round (20 unique numbers, no repeats) with a completion screen at
// the end, matching the pattern used by the Lessons screen's Flip/Type/Listen modes. Also offers
// the same practice-pronunciation mic (record / playback / compare) as Flip & Recall.
const NumbersDrill = (() => {
  const ROUND_LENGTH = 20;
  let root = null;
  let goTo = null;
  let started = false;
  let roundNumbers = [];
  let roundIndex = 0;
  let correctCount = 0;
  let answered = false;
  let correct = null;
  let completed = false;

  const digitsHan = ['','一','二','三','四','五','六','七','八','九'];
  function numberToHanzi(n) {
    if (n < 10) return digitsHan[n];
    if (n === 10) return '十';
    if (n < 20) return '十' + digitsHan[n - 10];
    const tens = Math.floor(n / 10), ones = n % 10;
    if (ones === 0) return digitsHan[tens] + '十';
    return digitsHan[tens] + '十' + digitsHan[ones];
  }
  function numberToPinyin(n) {
    const pin = { 1:'yī',2:'èr',3:'sān',4:'sì',5:'wǔ',6:'liù',7:'qī',8:'bā',9:'jiǔ' };
    if (n < 10) return pin[n];
    if (n === 10) return 'shí';
    if (n < 20) { const ones = n - 10; return 'shí' + (ones === 2 ? "'" : '') + pin[ones]; }
    const tens = Math.floor(n / 10), ones = n % 10;
    let s = pin[tens] + 'shí';
    if (ones === 0) return s;
    return s + (ones === 2 ? "'" : '') + pin[ones];
  }

  function newRound() {
    const pool = [];
    for (let i = 1; i <= 99; i++) pool.push(i);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    roundNumbers = pool.slice(0, ROUND_LENGTH);
    roundIndex = 0;
    correctCount = 0;
    answered = false;
    correct = null;
    completed = false;
  }

  function currentNumber() { return roundNumbers[roundIndex]; }

  function html() {
    return `
      <div class="lamp"></div>
      <h1>Numbers 1-99</h1>
      <div class="sub">Listen and type the number you hear — a 20-number round, independent of any lesson</div>
      <div class="autoplay-row">
        <span>Auto-play audio</span>
        <div class="switch" id="autoplaySwitch"><div class="knob"></div></div>
      </div>
      <div class="top-row" id="speedRow"></div>
      <div class="progress-row">
        <span id="posLabel"></span>
        <span></span>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
      <div id="cardArea"></div>
      <div class="stats" id="statsRow"></div>
      <button class="reset" id="resetBtn">Start a new round</button>
    `;
  }

  function buildAutoplayToggle() {
    const el = root.querySelector('#autoplaySwitch');
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
    return { emoji: '💪', message: 'Good effort! Numbers take practice — try another round.' };
  }

  const SESSION_KEY = 'numbers';
  function validSession(session) {
    return !!session
      && Array.isArray(session.roundNumbers) && session.roundNumbers.length === ROUND_LENGTH
      && Number.isInteger(session.roundIndex) && session.roundIndex >= 0 && session.roundIndex < ROUND_LENGTH
      && Number.isInteger(session.correctCount);
  }

  function renderStart() {
    root.querySelector('#posLabel').textContent = '';
    root.querySelector('#progressFill').style.width = '0%';
    root.querySelector('#statsRow').innerHTML = '';

    const session = Storage.getSession(SESSION_KEY);
    const hasSession = validSession(session);

    const buttonsHtml = hasSession
      ? `
        <button class="submit-btn" id="numResumeBtn" style="margin-top:22px;">Resume (number ${session.roundIndex + 1} of ${ROUND_LENGTH}, ${session.correctCount} correct so far)</button>
        <button class="reset" id="numStartOverBtn" style="margin-top:14px;">Start over</button>
      `
      : `<button class="submit-btn" id="numGoBtn" style="margin-top:22px;">Go</button>`;

    root.querySelector('#cardArea').innerHTML = `
      <div class="card" style="cursor:default;">
        <div class="back-english" style="margin-bottom:14px;">Numbers 1-99</div>
        <div class="mnemonic" style="margin-bottom:0;">You'll hear 20 random numbers between 1 and 99, one at a time — type each one as a digit (e.g. "23"). Get through all 20 to see your score.</div>
        ${buttonsHtml}
      </div>
    `;

    if (hasSession) {
      root.querySelector('#numResumeBtn').onclick = () => {
        roundNumbers = session.roundNumbers;
        roundIndex = session.roundIndex;
        correctCount = session.correctCount;
        answered = false; correct = null; completed = false;
        started = true;
        render();
      };
      root.querySelector('#numStartOverBtn').onclick = () => {
        Storage.clearSession(SESSION_KEY);
        started = true; newRound(); render();
      };
    } else {
      root.querySelector('#numGoBtn').onclick = () => { started = true; newRound(); render(); };
    }
  }

  function renderCompletionScreen() {
    Storage.clearSession(SESSION_KEY);
    root.querySelector('#posLabel').textContent = 'Round complete!';
    root.querySelector('#progressFill').style.width = '100%';
    root.querySelector('#statsRow').innerHTML = '';
    const tone = completionTone(correctCount, ROUND_LENGTH);

    root.querySelector('#cardArea').innerHTML = `
      <div class="card" style="cursor:default;">
        <div class="review-summary" style="padding:10px 0;">
          <div class="rs-emoji">${tone.emoji}</div>
          <div class="rs-title">${correctCount} out of ${ROUND_LENGTH} correct</div>
          <div class="rs-sub">${tone.message}</div>
        </div>
      </div>
      <div class="controls">
        <button class="nav-btn" id="tryAgainBtn">Try again</button>
        <button class="nav-btn" id="backBtn">Back to Dashboard</button>
      </div>
    `;
    root.querySelector('#tryAgainBtn').onclick = () => { newRound(); render(); };
    root.querySelector('#backBtn').onclick = () => { if (goTo) goTo('dashboard'); };
  }

  function advanceRound() {
    Recorder.cleanup();
    if (roundIndex < ROUND_LENGTH - 1) {
      roundIndex++;
      answered = false;
      correct = null;
      render();
    } else {
      completed = true;
      render();
    }
  }

  function render() {
    if (!started) { renderStart(); return; }
    if (completed) { renderCompletionScreen(); return; }
    Storage.setSession(SESSION_KEY, { roundNumbers, roundIndex, correctCount });

    root.querySelector('#posLabel').textContent = (roundIndex + 1) + ' / ' + ROUND_LENGTH;
    root.querySelector('#progressFill').style.width = (((roundIndex + 1) / ROUND_LENGTH) * 100) + '%';
    const num = currentNumber();
    const cardArea = root.querySelector('#cardArea');
    const isLast = roundIndex === ROUND_LENGTH - 1;

    if (!answered) {
      Recorder.cleanup();
      cardArea.innerHTML = `
        <div class="card" style="cursor:default;">
          <div class="num-big">${numberToPinyin(num)}</div>
          <div class="num-hint">listen and type the number</div>
          <div class="audio-row">
            <button class="speak-btn" id="speakNumBtn" aria-label="Play number">&#128266;</button>
            <span id="micAreaNum"></span>
          </div>
          <input type="text" class="type-input" id="numInput" placeholder="e.g. 23" autocomplete="off" inputmode="numeric">
          <div class="error-text" id="numError"></div>
          <button class="submit-btn" id="numSubmitBtn">Check</button>
        </div>
        <div class="controls"><button class="nav-btn" id="numSkipBtn">skip &rarr;</button></div>
      `;
      const speakBtn = root.querySelector('#speakNumBtn');
      speakBtn.onclick = () => Speech.speak(numberToHanzi(num), speakBtn);
      if (Storage.getAutoplay('lessons')) Speech.speak(numberToHanzi(num), speakBtn);
      Recorder.mountMicButton(root.querySelector('#micAreaNum'), numberToHanzi(num));
      const input = root.querySelector('#numInput');
      const doSubmit = () => {
        const val = input.value.trim();
        if (!val) { root.querySelector('#numError').textContent = 'Type a number first.'; input.classList.add('wrong-input'); return; }
        correct = (parseInt(val, 10) === num);
        if (correct) correctCount++;
        Storage.recordActivity();
        answered = true; render();
      };
      root.querySelector('#numSubmitBtn').onclick = doSubmit;
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSubmit(); });
      input.addEventListener('input', () => { input.classList.remove('wrong-input'); root.querySelector('#numError').textContent = ''; });
      input.focus();
      root.querySelector('#numSkipBtn').onclick = () => advanceRound();
    } else {
      Recorder.cleanup();
      cardArea.innerHTML = `
        <div class="card" style="cursor:default;">
          <div class="feedback-badge ${correct ? 'correct' : 'wrong'}">${correct ? 'Correct!' : 'Not quite'}</div>
          <div class="num-big">${numberToPinyin(num)}</div>
          <div class="audio-row">
            <button class="speak-btn" id="speakNumBtn2" aria-label="Play number">&#128266;</button>
            <span id="micAreaNum2"></span>
          </div>
          <div class="back-english">${num} &nbsp;&mdash;&nbsp; ${numberToHanzi(num)}</div>
        </div>
        <div class="controls"><button class="nav-btn" id="numNextBtn">${isLast ? 'see results →' : 'next number →'}</button></div>
      `;
      const speakBtn2 = root.querySelector('#speakNumBtn2');
      speakBtn2.onclick = () => Speech.speak(numberToHanzi(num), speakBtn2);
      Recorder.mountMicButton(root.querySelector('#micAreaNum2'), numberToHanzi(num));
      root.querySelector('#numNextBtn').onclick = () => advanceRound();
    }

    const missed = (roundIndex + (answered ? 1 : 0)) - correctCount;
    root.querySelector('#statsRow').innerHTML = `<span><b>${correctCount}</b> correct</span><span><b>${missed}</b> missed</span><span><b>${ROUND_LENGTH}</b> total</span>`;
  }

  function mount(container, navigate) {
    root = container;
    goTo = navigate || null;
    started = false;
    root.innerHTML = html();
    buildAutoplayToggle();
    Speech.buildSpeedControl(root.querySelector('#speedRow'));
    render();
    root.querySelector('#resetBtn').onclick = () => { newRound(); render(); };
  }

  return { mount };
})();
