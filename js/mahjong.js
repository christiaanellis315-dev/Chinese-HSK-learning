// Mahjong Tiles game: the third game under the Games screen (see games.js), drilling recall of
// the standard 34-tile set (three suits x 1-9, four winds, three dragons) — see
// data/mahjong_vocabulary.md for the source vocabulary, mnemonics and the answer-leniency notes
// this file's checkMahjongAnswer() implements. Same recall-first, no-multiple-choice pattern as
// NumbersDrill and DateWeekdayGame: each tile is shown as hanzi + pinyin with a speaker button,
// the person types the English name back, and a round is 10 freshly-shuffled *distinct* tiles
// (matching NumbersDrill's no-repeats-within-a-round approach, since the tile set is small enough
// that repeats within one round would feel redundant rather than genuinely random). Mounts into
// Games' own game-area container, not a full screen of its own.
const MahjongGame = (() => {
  const ROUND_LENGTH = 10;
  let root = null;
  let goTo = null;
  let started = false;
  let roundTiles = [];
  let roundIndex = 0;
  let correctCount = 0;
  let answered = false;
  let correct = null;
  let typedAnswer = '';
  let completed = false;

  const NUMBER_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

  // Full English name is answers[0] (shown on the answer-reveal screen); every entry in
  // `answers` is an accepted spelling, matched leniently (see checkMahjongAnswer) — spacing,
  // case, and digit-vs-word numerals all fall out for free there, so this list only needs to
  // spell out genuinely distinct wordings (the full name vs. the at-the-table shorthand).
  function suitTiles(hanChar, pinSuit, label, pluralLabel) {
    const tiles = [];
    for (let n = 1; n <= 9; n++) {
      const numHan = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'][n];
      const word = NUMBER_WORDS[n];
      const suitWord = n === 1 && label ? label : pluralLabel;
      tiles.push({
        han: numHan + hanChar,
        pin: pinSuit[n],
        answers: [n + ' ' + suitWord, word + ' ' + suitWord],
      });
    }
    return tiles;
  }

  const CHAR_PINYIN = ['', 'yī wàn', 'èr wàn', 'sān wàn', 'sì wàn', 'wǔ wàn', 'liù wàn', 'qī wàn', 'bā wàn', 'jiǔ wàn'];
  const BAMBOO_PINYIN = ['', 'yī tiáo', 'èr tiáo', 'sān tiáo', 'sì tiáo', 'wǔ tiáo', 'liù tiáo', 'qī tiáo', 'bā tiáo', 'jiǔ tiáo'];
  const DOT_PINYIN = ['', 'yī tǒng', 'èr tǒng', 'sān tǒng', 'sì tǒng', 'wǔ tǒng', 'liù tǒng', 'qī tǒng', 'bā tǒng', 'jiǔ tǒng'];

  const HONOR_TILES = [
    { han: '东风', pin: 'dōngfēng', answers: ['east wind', 'east'] },
    { han: '南风', pin: 'nánfēng', answers: ['south wind', 'south'] },
    { han: '西风', pin: 'xīfēng', answers: ['west wind', 'west'] },
    { han: '北风', pin: 'běifēng', answers: ['north wind', 'north'] },
    { han: '红中', pin: 'hóngzhōng', answers: ['red dragon', 'red'] },
    { han: '发财', pin: 'fācái', answers: ['green dragon', 'green'] },
    { han: '白板', pin: 'báibǎn', answers: ['white dragon', 'white'] },
  ];

  const ALL_TILES = []
    .concat(suitTiles('万', CHAR_PINYIN, 'characters', 'characters'))
    .concat(suitTiles('条', BAMBOO_PINYIN, 'bamboo', 'bamboo'))
    .concat(suitTiles('筒', DOT_PINYIN, 'dot', 'dots'))
    .concat(HONOR_TILES);

  function displayName(tile) {
    return tile.answers[0].split(' ').map((w) => /^\d+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // Lenient check per data/mahjong_vocabulary.md's suggested rules: strip everything but
  // letters/digits (so case, spacing, and "2bamboo" vs "2 bamboo" all collapse together), then
  // require an exact match against one of the tile's accepted spellings — same digit-or-word and
  // shorthand-or-full-name leniency the vocabulary notes ask for, without going so loose that a
  // bare number or bare suit name alone would count.
  function normalize(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function checkMahjongAnswer(input, tile) {
    const userN = normalize(input);
    if (!userN) return false;
    return tile.answers.some((a) => normalize(a) === userN);
  }

  function newRound() {
    const pool = ALL_TILES.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    roundTiles = pool.slice(0, ROUND_LENGTH);
    roundIndex = 0;
    correctCount = 0;
    answered = false;
    correct = null;
    completed = false;
  }

  function currentTile() { return roundTiles[roundIndex]; }

  function html() {
    return `
      <div class="top-row" id="mjSpeedRow"></div>
      <div class="progress-row">
        <span id="mjPosLabel"></span>
        <span></span>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="mjProgressFill"></div></div>
      <div id="mjCardArea"></div>
      <div class="stats" id="mjStatsRow"></div>
      <button class="reset" id="mjResetBtn">Start a new round</button>
    `;
  }

  function completionTone(correctN, total) {
    if (total === 0) return { emoji: '👍', message: 'Round complete.' };
    const ratio = correctN / total;
    if (ratio === 1) return { emoji: '🎉', message: 'Perfect round!' };
    if (ratio >= 0.7) return { emoji: '✨', message: 'Well done!' };
    if (ratio >= 0.4) return { emoji: '👍', message: 'Nice work — a few more rounds and you’ll have it.' };
    return { emoji: '💪', message: 'Good effort! 34 tiles take practice — try another round.' };
  }

  const SESSION_KEY = 'mahjong';
  function validSession(session) {
    return !!session
      && Array.isArray(session.roundTiles) && session.roundTiles.length === ROUND_LENGTH
      && Number.isInteger(session.roundIndex) && session.roundIndex >= 0 && session.roundIndex < ROUND_LENGTH
      && Number.isInteger(session.correctCount);
  }

  function renderStart() {
    root.querySelector('#mjPosLabel').textContent = '';
    root.querySelector('#mjProgressFill').style.width = '0%';
    root.querySelector('#mjStatsRow').innerHTML = '';

    const session = Storage.getSession(SESSION_KEY);
    const hasSession = validSession(session);

    const buttonsHtml = hasSession
      ? `
        <button class="submit-btn" id="mjResumeBtn" style="margin-top:22px;">Resume (tile ${session.roundIndex + 1} of ${ROUND_LENGTH}, ${session.correctCount} correct so far)</button>
        <button class="reset" id="mjStartOverBtn" style="margin-top:14px;">Start over</button>
      `
      : `<button class="submit-btn" id="mjGoBtn" style="margin-top:22px;">Go</button>`;

    root.querySelector('#mjCardArea').innerHTML = `
      <div class="card" style="cursor:default;">
        <div class="back-english" style="margin-bottom:14px;">Mahjong Tiles</div>
        <div class="mnemonic" style="margin-bottom:0;">You'll see 10 mahjong tiles (the three suits, winds, and dragons) written in Chinese, one at a time — type the English name, e.g. "2 Bamboo", "East Wind", or just "Red" for a dragon. Numerals or number words both work, and spacing/capitalization don't matter.</div>
        ${buttonsHtml}
      </div>
    `;

    if (hasSession) {
      root.querySelector('#mjResumeBtn').onclick = () => {
        roundTiles = session.roundTiles;
        roundIndex = session.roundIndex;
        correctCount = session.correctCount;
        answered = false; correct = null; completed = false;
        started = true;
        render();
      };
      root.querySelector('#mjStartOverBtn').onclick = () => {
        Storage.clearSession(SESSION_KEY);
        started = true; newRound(); render();
      };
    } else {
      root.querySelector('#mjGoBtn').onclick = () => { started = true; newRound(); render(); };
    }
  }

  function renderCompletionScreen() {
    Storage.clearSession(SESSION_KEY);
    root.querySelector('#mjPosLabel').textContent = 'Round complete!';
    root.querySelector('#mjProgressFill').style.width = '100%';
    root.querySelector('#mjStatsRow').innerHTML = '';
    const tone = completionTone(correctCount, ROUND_LENGTH);

    root.querySelector('#mjCardArea').innerHTML = `
      <div class="card" style="cursor:default;">
        <div class="review-summary" style="padding:10px 0;">
          <div class="rs-emoji">${tone.emoji}</div>
          <div class="rs-title">${correctCount} out of ${ROUND_LENGTH} correct</div>
          <div class="rs-sub">${tone.message}</div>
        </div>
      </div>
      <div class="controls">
        <button class="nav-btn" id="mjTryAgainBtn">Try again</button>
        <button class="nav-btn" id="mjBackBtn">Back to Dashboard</button>
      </div>
    `;
    root.querySelector('#mjTryAgainBtn').onclick = () => { newRound(); render(); };
    root.querySelector('#mjBackBtn').onclick = () => { if (goTo) goTo('dashboard'); };
  }

  function advanceRound() {
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
    Storage.setSession(SESSION_KEY, { roundTiles, roundIndex, correctCount });

    root.querySelector('#mjPosLabel').textContent = (roundIndex + 1) + ' / ' + ROUND_LENGTH;
    root.querySelector('#mjProgressFill').style.width = (((roundIndex + 1) / ROUND_LENGTH) * 100) + '%';
    const tile = currentTile();
    const cardArea = root.querySelector('#mjCardArea');
    const isLast = roundIndex === ROUND_LENGTH - 1;

    if (!answered) {
      cardArea.innerHTML = `
        <div class="card" style="cursor:default;">
          <div class="hanzi">${tile.han}</div>
          <div class="pinyin">${tile.pin}</div>
          <div class="audio-row"><button class="speak-btn" id="mjSpeakBtn" aria-label="Play tile name">&#128266;</button></div>
          <input type="text" class="type-input" id="mjInput" placeholder='e.g. "2 Bamboo"' autocomplete="off">
          <div class="error-text" id="mjError"></div>
          <button class="submit-btn" id="mjSubmitBtn" disabled>Check</button>
        </div>
        <div class="controls"><button class="nav-btn" id="mjSkipBtn">skip &rarr;</button></div>
      `;
      const speakBtn = root.querySelector('#mjSpeakBtn');
      speakBtn.onclick = () => Speech.speak(tile.han, speakBtn);
      if (Storage.getAutoplay('lessons')) Speech.speak(tile.han, speakBtn);
      const input = root.querySelector('#mjInput');
      const submitBtn = root.querySelector('#mjSubmitBtn');
      const doSubmit = () => {
        const val = input.value.trim();
        if (!val) { root.querySelector('#mjError').textContent = 'Type an answer first.'; input.classList.add('wrong-input'); return; }
        correct = checkMahjongAnswer(val, tile);
        if (correct) correctCount++;
        Storage.recordActivity();
        typedAnswer = val; answered = true; render();
      };
      submitBtn.onclick = doSubmit;
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !submitBtn.disabled) doSubmit(); });
      input.addEventListener('input', () => {
        input.classList.remove('wrong-input');
        root.querySelector('#mjError').textContent = '';
        syncSubmitEnabled(input, submitBtn);
      });
      input.focus();
      root.querySelector('#mjSkipBtn').onclick = () => advanceRound();
    } else {
      cardArea.innerHTML = `
        <div class="card" style="cursor:default;">
          <div class="feedback-badge ${correct ? 'correct' : 'wrong'}">${correct ? 'Correct!' : 'Not quite'}</div>
          <div class="hanzi">${tile.han}</div>
          <div class="pinyin">${tile.pin}</div>
          <div class="audio-row"><button class="speak-btn" id="mjSpeakBtn2" aria-label="Play tile name">&#128266;</button></div>
          <div class="your-answer">You typed: "${typedAnswer}"</div>
          <div class="back-english">${displayName(tile)}</div>
        </div>
        <div class="controls"><button class="nav-btn" id="mjNextBtn">${isLast ? 'see results →' : 'next tile →'}</button></div>
      `;
      const speakBtn2 = root.querySelector('#mjSpeakBtn2');
      speakBtn2.onclick = () => Speech.speak(tile.han, speakBtn2);
      root.querySelector('#mjNextBtn').onclick = () => advanceRound();
    }

    const missed = (roundIndex + (answered ? 1 : 0)) - correctCount;
    root.querySelector('#mjStatsRow').innerHTML = `<span><b>${correctCount}</b> correct</span><span><b>${missed}</b> missed</span><span><b>${ROUND_LENGTH}</b> total</span>`;
  }

  function mount(container, navigate) {
    root = container;
    goTo = navigate || null;
    started = false;
    root.innerHTML = html();
    Speech.buildSpeedControl(root.querySelector('#mjSpeedRow'));
    render();
    root.querySelector('#mjResetBtn').onclick = () => { newRound(); render(); };
  }

  return { mount, checkMahjongAnswer };
})();
