// Numbers 1-99 screen: a standalone, recurring drill (moved out of Lesson 5, since it's a
// tool people come back to regardless of which lesson they're on, not one-time lesson content).
// Logic is unchanged from the original Lesson 5 "Numbers 1-99" mode: random number 1-99, pinyin
// shown, audio plays the hanzi, the user types the digit answer, correct/missed is tracked.
const NumbersDrill = (() => {
  let root = null;
  let currentNumber = null;
  let answered = false;
  let correct = null;
  let score = { correct: 0, total: 0 };

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
  function newNumber() { currentNumber = 1 + Math.floor(Math.random() * 99); answered = false; correct = null; }

  function html() {
    return `
      <div class="lamp"></div>
      <h1>Numbers 1-99</h1>
      <div class="sub">Listen and type the number you hear — a recurring drill, independent of any lesson</div>
      <div class="autoplay-row">
        <span>Auto-play audio</span>
        <div class="switch" id="autoplaySwitch"><div class="knob"></div></div>
      </div>
      <div class="top-row" id="speedRow"></div>
      <div class="progress-row">
        <span id="posLabel"></span>
        <span></span>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="progressFill" style="width:100%"></div></div>
      <div id="cardArea"></div>
      <div class="stats" id="statsRow"></div>
      <button class="reset" id="resetBtn">Reset score</button>
    `;
  }

  function buildAutoplayToggle() {
    const el = root.querySelector('#autoplaySwitch');
    const on = Storage.getAutoplay('lessons');
    el.className = 'switch' + (on ? ' on' : '');
    el.innerHTML = '<div class="knob"></div>';
    el.onclick = () => { Storage.setAutoplay('lessons', !Storage.getAutoplay('lessons')); buildAutoplayToggle(); };
  }

  function render() {
    if (currentNumber === null) newNumber();
    root.querySelector('#posLabel').textContent = score.total + ' answered';
    const cardArea = root.querySelector('#cardArea');
    if (!answered) {
      cardArea.innerHTML = `
        <div class="card" style="cursor:default;">
          <div class="num-big">${numberToPinyin(currentNumber)}</div>
          <div class="num-hint">listen and type the number</div>
          <button class="speak-btn" id="speakNumBtn" aria-label="Play number">&#128266;</button>
          <input type="text" class="type-input" id="numInput" placeholder="e.g. 23" autocomplete="off" inputmode="numeric">
          <div class="error-text" id="numError"></div>
          <button class="submit-btn" id="numSubmitBtn">Check</button>
        </div>
        <div class="controls"><button class="nav-btn" id="numSkipBtn">skip &rarr;</button></div>
      `;
      const speakBtn = root.querySelector('#speakNumBtn');
      speakBtn.onclick = () => Speech.speak(numberToHanzi(currentNumber), speakBtn);
      if (Storage.getAutoplay('lessons')) Speech.speak(numberToHanzi(currentNumber), speakBtn);
      const input = root.querySelector('#numInput');
      const doSubmit = () => {
        const val = input.value.trim();
        if (!val) { root.querySelector('#numError').textContent = 'Type a number first.'; input.classList.add('wrong-input'); return; }
        correct = (parseInt(val, 10) === currentNumber);
        score.total++; if (correct) score.correct++;
        Storage.recordActivity();
        answered = true; render();
      };
      root.querySelector('#numSubmitBtn').onclick = doSubmit;
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSubmit(); });
      input.addEventListener('input', () => { input.classList.remove('wrong-input'); root.querySelector('#numError').textContent = ''; });
      input.focus();
      root.querySelector('#numSkipBtn').onclick = () => { newNumber(); render(); };
    } else {
      cardArea.innerHTML = `
        <div class="card" style="cursor:default;">
          <div class="feedback-badge ${correct ? 'correct' : 'wrong'}">${correct ? 'Correct!' : 'Not quite'}</div>
          <div class="num-big">${numberToPinyin(currentNumber)}</div>
          <button class="speak-btn" id="speakNumBtn2" aria-label="Play number">&#128266;</button>
          <div class="back-english">${currentNumber} &nbsp;&mdash;&nbsp; ${numberToHanzi(currentNumber)}</div>
        </div>
        <div class="controls"><button class="nav-btn" id="numNextBtn">next number &rarr;</button></div>
      `;
      const speakBtn2 = root.querySelector('#speakNumBtn2');
      speakBtn2.onclick = () => Speech.speak(numberToHanzi(currentNumber), speakBtn2);
      root.querySelector('#numNextBtn').onclick = () => { newNumber(); render(); };
    }
    root.querySelector('#statsRow').innerHTML = `<span><b>${score.correct}</b> correct</span><span><b>${score.total - score.correct}</b> missed</span><span><b>${score.total}</b> total</span>`;
  }

  function mount(container) {
    root = container;
    root.innerHTML = html();
    buildAutoplayToggle();
    Speech.buildSpeedControl(root.querySelector('#speedRow'));
    render();
    root.querySelector('#resetBtn').onclick = () => { score = { correct: 0, total: 0 }; newNumber(); render(); };
  }

  return { mount };
})();
