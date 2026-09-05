// Mahjong Tiles game: the third game under the Games screen (see games.js), drilling recall of
// the Sichuan (Blood Battle / 血战到底) tile set — the three suits, 1-9, 27 tile types — which,
// unlike the "standard"/Cantonese 34-type set, plays with NO honor tiles at all: no winds
// (东南西北), no dragons (中发白), no flowers. That's a deliberate, well-documented rules
// difference (see e.g. https://mahjongpros.com/blogs/mahjong-rules-and-scoring-tables/official-
// sichuan-sbr-mahjong-rules), not an oversight — the winds/dragons this file used to include have
// been removed rather than just hidden, since they'd never come up at a Sichuan table. See
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
  const NUM_HAN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  // Full English name is answers[0] (shown on the answer-reveal screen, so `aliasesForOne`/
  // `aliasesForOther` must list the full formal suit name FIRST) — every entry in `answers` is an
  // accepted spelling, matched leniently (see checkMahjongAnswer): spacing, case, and digit-vs-
  // word numerals all fall out for free there, so the alias lists only need to spell out genuinely
  // distinct wordings for the suit name itself (full name vs. common shorthand like "bam"/"char").
  // `kind` + `num` (added here, not derived from `han`/`pin` later) drive the SVG tile-face
  // artwork below — keeping them explicit avoids parsing meaning back out of display strings.
  function suitTiles(kind, hanChar, pinSuit, aliasesForOne, aliasesForOther) {
    const tiles = [];
    for (let n = 1; n <= 9; n++) {
      const word = NUMBER_WORDS[n];
      const suitWords = n === 1 ? aliasesForOne : aliasesForOther;
      const answers = [];
      suitWords.forEach((suitWord) => { answers.push(n + ' ' + suitWord, word + ' ' + suitWord); });
      tiles.push({ kind, num: n, han: NUM_HAN[n] + hanChar, pin: pinSuit[n], answers });
    }
    return tiles;
  }

  const CHAR_PINYIN = ['', 'yī wàn', 'èr wàn', 'sān wàn', 'sì wàn', 'wǔ wàn', 'liù wàn', 'qī wàn', 'bā wàn', 'jiǔ wàn'];
  const BAMBOO_PINYIN = ['', 'yī tiáo', 'èr tiáo', 'sān tiáo', 'sì tiáo', 'wǔ tiáo', 'liù tiáo', 'qī tiáo', 'bā tiáo', 'jiǔ tiáo'];
  const DOT_PINYIN = ['', 'yī tǒng', 'èr tǒng', 'sān tǒng', 'sì tǒng', 'wǔ tǒng', 'liù tǒng', 'qī tǒng', 'bā tǒng', 'jiǔ tǒng'];

  // No HONOR_TILES here on purpose — Sichuan mahjong doesn't use winds or dragons at all (see the
  // file header), so the full tile set is just the three numbered suits: 27 types.
  const ALL_TILES = []
    .concat(suitTiles('characters', '万', CHAR_PINYIN, ['characters', 'character', 'char', 'chars'], ['characters', 'character', 'char', 'chars']))
    .concat(suitTiles('bamboo', '条', BAMBOO_PINYIN, ['bamboo', 'bam'], ['bamboo', 'bam']))
    .concat(suitTiles('dots', '筒', DOT_PINYIN, ['dot'], ['dots']));

  // ===== Tile face artwork (SVG) =====
  // Renders a stylized ivory tile face resembling the real physical tile — shown ALONGSIDE the
  // existing hanzi+pinyin text below it, never replacing it. Colors are fixed (not the app's
  // --amber/--text theme variables): a mahjong tile looks the same regardless of the app's
  // light/dark mode, same as it would on a real table.
  const TILE_W = 96, TILE_H = 144;
  const HANZI_FONT = "'PingFang SC','Microsoft YaHei','Heiti SC','Segoe UI',sans-serif";
  const DOT_COLORS = ['#1c4fa0', '#1f7d32', '#b3231c']; // blue, green, red — traditional alternation
  let svgIdCounter = 0;

  // Pip positions for counts 1-9, normalized [0,1] within the pip drawing area, shared by the
  // Bamboo and Dots suits (same physical layout, different icon drawn at each spot). 1-6 match
  // the layouts real tiles use (diagonal 2/3, corners+center for 4/5, a 2x3 grid for 6); 7-9 are
  // a reasonable simplification (still grid-based and recognizable) rather than the full ornate
  // traditional arrangement, per the brief's allowance for the higher counts.
  const PIP_LAYOUTS = {
    1: [[0.5, 0.5]],
    2: [[0.22, 0.2], [0.78, 0.8]],
    3: [[0.2, 0.15], [0.5, 0.5], [0.8, 0.85]],
    4: [[0.22, 0.22], [0.78, 0.22], [0.22, 0.82], [0.78, 0.82]],
    5: [[0.22, 0.2], [0.78, 0.2], [0.5, 0.5], [0.22, 0.82], [0.78, 0.82]],
    6: [[0.28, 0.12], [0.72, 0.12], [0.28, 0.5], [0.72, 0.5], [0.28, 0.88], [0.72, 0.88]],
    7: [[0.5, 0.08], [0.28, 0.42], [0.5, 0.42], [0.72, 0.42], [0.28, 0.78], [0.5, 0.78], [0.72, 0.78]],
    8: [[0.28, 0.1], [0.72, 0.1], [0.28, 0.37], [0.72, 0.37], [0.28, 0.64], [0.72, 0.64], [0.28, 0.91], [0.72, 0.91]],
    9: [[0.22, 0.12], [0.5, 0.12], [0.78, 0.12], [0.22, 0.5], [0.5, 0.5], [0.78, 0.5], [0.22, 0.88], [0.5, 0.88], [0.78, 0.88]],
  };
  const PIP_BOX = { x: 15, y: 15, w: 66, h: 114 };
  function pipXY([nx, ny]) { return [PIP_BOX.x + nx * PIP_BOX.w, PIP_BOX.y + ny * PIP_BOX.h]; }

  function tileFrame(inner) {
    const id = svgIdCounter++;
    return `
      <svg viewBox="0 0 ${TILE_W} ${TILE_H}" width="${TILE_W}" height="${TILE_H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
        <defs>
          <filter id="mjShadow${id}" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#000" flood-opacity="0.4"/>
          </filter>
          <linearGradient id="mjFaceGrad${id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fffdf7"/>
            <stop offset="100%" stop-color="#ece1c4"/>
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="${TILE_W - 6}" height="${TILE_H - 6}" rx="9" ry="9"
          fill="url(#mjFaceGrad${id})" stroke="#28211a" stroke-width="2.5" filter="url(#mjShadow${id})"/>
        <rect x="7.5" y="7.5" width="${TILE_W - 15}" height="${TILE_H - 15}" rx="6" ry="6"
          fill="none" stroke="#cabb95" stroke-width="1"/>
        ${inner}
      </svg>
    `;
  }

  function bambooStickSVG(cx, cy, s) {
    const w = 9 * s, h = 24 * s;
    const x = cx - w / 2, y = cy - h / 2;
    return `<g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="#2f7d32" stroke="#1c4d1e" stroke-width="0.7"/>
      <line x1="${x + 1}" y1="${y + h * 0.33}" x2="${x + w - 1}" y2="${y + h * 0.33}" stroke="#1c4d1e" stroke-width="0.7"/>
      <line x1="${x + 1}" y1="${y + h * 0.66}" x2="${x + w - 1}" y2="${y + h * 0.66}" stroke="#1c4d1e" stroke-width="0.7"/>
    </g>`;
  }

  // Simplified, colorful sparrow silhouette — the 1-Bamboo tile's traditional bird motif,
  // replacing what would otherwise be the odd one out (every other suit tile is a pip pattern).
  function birdSVG(cx, cy, scale) {
    return `<g transform="translate(${cx},${cy}) scale(${scale})">
      <path d="M 12 6 L 24 -3 L 22 4 L 28 2 L 18 9 Z" fill="#2f6fb3"/>
      <ellipse cx="0" cy="1" rx="13" ry="9.5" fill="#2f7d32"/>
      <path d="M -3 -3 Q 7 -10 14 -2 Q 6 1 -3 -3 Z" fill="#b3231c"/>
      <circle cx="-13" cy="-8" r="6.5" fill="#256b2b"/>
      <path d="M -19 -8 L -26 -6 L -19 -4 Z" fill="#d9a422"/>
      <circle cx="-14.5" cy="-9" r="1.1" fill="#111"/>
      <line x1="-3" y1="11" x2="-5" y2="18" stroke="#3a2a18" stroke-width="1.4"/>
      <line x1="3" y1="11" x2="5" y2="18" stroke="#3a2a18" stroke-width="1.4"/>
    </g>`;
  }

  function dotSVG(cx, cy, r, color) {
    return `<g>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="#00000055" stroke-width="0.6"/>
      <circle cx="${cx - r * 0.3}" cy="${cy - r * 0.3}" r="${r * 0.28}" fill="#ffffff" opacity="0.35"/>
    </g>`;
  }

  // 1-Dot's traditional ornate/coin-like design, standing in for a plain single pip.
  function bigDotSVG(cx, cy, rOuter) {
    return `<g>
      <circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="#1c4fa0" stroke="#0d2c5c" stroke-width="1"/>
      <circle cx="${cx}" cy="${cy}" r="${rOuter * 0.68}" fill="#b3231c"/>
      <circle cx="${cx}" cy="${cy}" r="${rOuter * 0.36}" fill="#1f7d32"/>
      <circle cx="${cx - rOuter * 0.2}" cy="${cy - rOuter * 0.2}" r="${rOuter * 0.12}" fill="#ffffff" opacity="0.4"/>
    </g>`;
  }

  function charactersFace(num) {
    return `
      <text x="${TILE_W / 2}" y="50" text-anchor="middle" font-family="${HANZI_FONT}" font-size="32" fill="#1a1a1a" font-weight="600">${NUM_HAN[num]}</text>
      <text x="${TILE_W / 2}" y="102" text-anchor="middle" font-family="${HANZI_FONT}" font-size="38" fill="#b3231c" font-weight="600">万</text>
    `;
  }

  function bambooFace(num) {
    if (num === 1) return birdSVG(TILE_W / 2, TILE_H / 2 - 4, 1.15);
    const scale = num <= 3 ? 1.15 : num <= 6 ? 0.95 : 0.8;
    return PIP_LAYOUTS[num].map((p) => { const [cx, cy] = pipXY(p); return bambooStickSVG(cx, cy, scale); }).join('');
  }

  function dotsFace(num) {
    if (num === 1) return bigDotSVG(TILE_W / 2, TILE_H / 2, 25);
    const r = num <= 3 ? 10.5 : num <= 6 ? 8.5 : 7;
    return PIP_LAYOUTS[num].map((p, i) => { const [cx, cy] = pipXY(p); return dotSVG(cx, cy, r, DOT_COLORS[i % DOT_COLORS.length]); }).join('');
  }

  function tileFaceInner(tile) {
    if (tile.kind === 'characters') return charactersFace(tile.num);
    if (tile.kind === 'bamboo') return bambooFace(tile.num);
    if (tile.kind === 'dots') return dotsFace(tile.num);
    return '';
  }

  function tileArtSVG(tile) { return tileFrame(tileFaceInner(tile)); }

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
    return { emoji: '💪', message: 'Good effort! 27 tiles take practice — try another round.' };
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
        <div class="mnemonic" style="margin-bottom:0;">Sichuan-style — just the three suits (万/条/筒), no winds or dragons. You'll see 10 mahjong tiles written in Chinese, one at a time — type the English name back, e.g. "2 Bamboo" or "5 Dots" (shorthand works too, like "2 bam" or "5 char"). Numerals or number words both work, and spacing/capitalization don't matter.</div>
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
          <div class="mj-tile-art">${tileArtSVG(tile)}</div>
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
          <div class="mj-tile-art">${tileArtSVG(tile)}</div>
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

  return { mount, checkMahjongAnswer, ALL_TILES };
})();
