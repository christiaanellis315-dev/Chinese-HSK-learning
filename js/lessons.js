// Lessons screen: flip / type / listen / build engine, generalized to loop over whichever
// lessons the current book (Books.getLessonOrder(currentBook)) actually has. The Numbers 1-99
// drill that used to live here as a mode is now its own top-level screen (see numbers.js) — it's
// a recurring standalone drill, not lesson-specific content, and book-independent besides.
//
// Grading now feeds Storage's shared spaced-repetition schedule (one Leitner box per word/
// listening item, regardless of which mode touched it) instead of a separate known/learning
// flag per mode — getting a word right in Type mode pushes out its next Flip-mode appearance
// too. Also exposes renderFlashcard() and renderListenQuestion() so the Review screen (which
// pulls whatever's due across every lesson) can reuse the exact same card UIs.
const Lessons = (() => {
  let root = null;
  let goTo = null;
  let currentBook = 'hsk1';
  let currentLesson = null;
  let mode = 'flip';
  let idx = 0;
  let flipped = false;
  let typed = false;
  let typedAnswer = '';
  let lastCorrect = null;
  let selectedOpt = null;
  let completed = false;
  let started = false;

  // ---- round presentation order (Flip / Type / Listen only) ----
  // `idx` is the position within the current round (0..N-1, used for the progress bar and
  // prev/next); `roundOrder[idx]` is the *original* index into currentWords()/currentListening()
  // for whatever's actually shown at that position. Generated fresh only when a round actually
  // starts (Go / Start over / Try again) and persisted with the session so Resume continues in
  // the exact order the round began with, never a new shuffle mid-round. Sentence Builder doesn't
  // use this at all — its exercise order stays fixed; only the tile shuffle within one exercise
  // (a separate, already-working feature) applies there.
  let roundOrder = [];

  // ---- Listening option order (A/B/C) ----
  // Keyed by the item's stable origIdx (not round position), so the shuffle stays put if you
  // navigate back to an already-seen item mid-round, but a fresh round (beginSession) gets fresh
  // shuffles — otherwise the correct answer's letter would become memorizable across attempts.
  let listenOptionOrders = {};

  function identityOrder(n) {
    const a = [];
    for (let i = 0; i < n; i++) a.push(i);
    return a;
  }
  function freshOrder() {
    if (mode === 'build') return null;
    return shuffle(identityOrder(modeTotal()));
  }

  // ---- Sentence Builder mode state ----
  // buildBank is the shuffled tile pool (answer tiles + decoys) for the *current* exercise;
  // regenerated only when moving to a new exercise (never on a plain re-render), so tapping a
  // tile doesn't reshuffle the bank out from under the person mid-build.
  let buildBank = [];
  let buildSeq = []; // tile ids tapped so far, in order
  let buildSubmitted = false;
  let buildCorrect = null;
  let buildAutoplayed = false; // has the prompt already auto-played for this exercise?

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function buildTileBank(item) {
    const bank = item.tiles.map((t, i) => ({ id: 'a' + i, h: t.h, p: t.p }))
      .concat(item.decoys.map((t, i) => ({ id: 'd' + i, h: t.h, p: t.p })));
    return shuffle(bank);
  }
  function resetBuildExercise() {
    const items = currentBuilder();
    buildBank = (items && items[idx]) ? buildTileBank(items[idx]) : [];
    buildSeq = [];
    buildSubmitted = false;
    buildCorrect = null;
    buildAutoplayed = false;
  }

  function normalize(s) { return s.toLowerCase().trim().replace(/[.!?]/g, ''); }
  function checkAnswer(input, w) {
    const userN = normalize(input);
    if (!userN) return false;
    const candidates = [w.e].concat(w.alt || []);
    return candidates.some(c => {
      const cN = normalize(c);
      return userN === cN || (cN.includes(userN) && userN.length >= 3) || (userN.includes(cN) && cN.length >= 3);
    });
  }

  // Sentence Builder's correctness check: the tapped tile hanzi, in order, must match the
  // answer tiles' hanzi exactly (decoys can never satisfy this since they're not in answerHanzi).
  // Pulled out as its own pure function so Review's copy of this same check can't drift from
  // Lessons' copy, and so it's directly unit-testable without going through the DOM.
  function checkBuildAnswer(builtHanzi, answerHanzi) {
    return builtHanzi.length === answerHanzi.length && builtHanzi.every((h, i) => h === answerHanzi[i]);
  }

  // ===== shared flashcard component (also used by Review) =====
  function renderFlashcard(cardArea, word, isFlipped, opts) {
    opts = opts || {};
    const controlsHtml = opts.controlsHtml || '';
    Recorder.cleanup(); // previous card's mic session (if any) is done
    if (!isFlipped) {
      cardArea.innerHTML = `
        <div class="card" id="flipCard">
          <div class="hanzi">${word.h}</div>
          <div class="pinyin">${word.p}</div>
          <div class="pos-tag">${word.pos || ''}</div>
          <div class="audio-row">
            <button class="speak-btn" id="speakBtnFront" aria-label="Play pronunciation">&#128266;</button>
            <span id="micAreaFront"></span>
          </div>
          <div class="tap-hint">tap card to reveal meaning</div>
        </div>
        ${controlsHtml}
      `;
      const cardEl = document.getElementById('flipCard');
      cardEl.onclick = () => opts.onToggle && opts.onToggle(true);
      const speakBtn = document.getElementById('speakBtnFront');
      speakBtn.onclick = (e) => { e.stopPropagation(); Speech.speak(word.h, speakBtn); };
      if (opts.autoplay) Speech.speak(word.h, speakBtn);
      Recorder.mountMicButton(document.getElementById('micAreaFront'), word.h);
    } else {
      const exampleHtml = word.ex ? `<div class="example"><div class="ex-row"><div class="ex-h">${word.ex}</div><button class="speak-btn" id="exSpeakBtn" aria-label="Play example sentence">&#128266;</button></div><div class="ex-p">${word.exp}</div><div>${word.exe}</div></div>` : '';
      cardArea.innerHTML = `
        <div class="card" id="flipCard">
          <div class="hanzi" style="font-size:34px;">${word.h} <span class="pinyin" style="font-size:16px;">${word.p}</span></div>
          <div class="audio-row">
            <button class="speak-btn" id="speakBtnBack" aria-label="Play pronunciation">&#128266;</button>
            <span id="micAreaBack"></span>
          </div>
          <div class="back-english">${word.e}</div>
          <div class="mnemonic">${word.m}</div>
          ${exampleHtml}
        </div>
        ${controlsHtml}
      `;
      const cardEl = document.getElementById('flipCard');
      cardEl.onclick = () => opts.onToggle && opts.onToggle(false);
      const speakBtn = document.getElementById('speakBtnBack');
      speakBtn.onclick = (e) => { e.stopPropagation(); Speech.speak(word.h, speakBtn); };
      Recorder.mountMicButton(document.getElementById('micAreaBack'), word.h);
      const exSpeakBtn = document.getElementById('exSpeakBtn');
      if (exSpeakBtn) exSpeakBtn.onclick = (e) => { e.stopPropagation(); Speech.speak(word.ex, exSpeakBtn); };
    }
    if (opts.wireControls) opts.wireControls();
  }

  // ===== screen chrome =====
  function html() {
    return `
      <div class="lamp"></div>
      <h1>Lessons</h1>
      <div class="sub">${Books.bookLabel(currentBook)} Standard Course</div>
      <div class="autoplay-row">
        <span>Auto-play audio</span>
        <div class="switch" id="autoplaySwitch"><div class="knob"></div></div>
      </div>
      <div class="top-row" id="speedRow"></div>
      <div class="tabs" id="tabs"></div>
      <div class="mode-toggle" id="modeToggle"></div>
      <div class="progress-row">
        <span id="posLabel">1 / 1</span>
        <span id="lessonLabel"></span>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
      <div id="cardArea"></div>
      <div class="stats" id="statsRow"></div>
      <button class="reset" id="resetBtn">Reset progress for this lesson</button>
    `;
  }

  function buildAutoplayToggle() {
    const el = root.querySelector('#autoplaySwitch');
    const on = Storage.getAutoplay('lessons');
    el.className = 'switch' + (on ? ' on' : '');
    el.innerHTML = '<div class="knob"></div>';
    el.onclick = () => { Storage.setAutoplay('lessons', !Storage.getAutoplay('lessons')); buildAutoplayToggle(); };
  }

  function buildTabs() {
    const el = root.querySelector('#tabs');
    el.innerHTML = '';
    Books.getLessonOrder(currentBook).forEach(key => {
      const b = document.createElement('div');
      b.className = 'tab' + (key === currentLesson ? ' active' : '');
      b.textContent = 'L' + key;
      b.onclick = () => switchLesson(key);
      el.appendChild(b);
    });
  }

  function buildModeToggle() {
    const el = root.querySelector('#modeToggle');
    el.innerHTML = `
      <div class="mode-btn ${mode === 'flip' ? 'active' : ''}" id="flipModeBtn">Flip &amp; recall</div>
      <div class="mode-btn ${mode === 'type' ? 'active' : ''}" id="typeModeBtn">Type the answer</div>
      <div class="mode-btn ${mode === 'listen' ? 'active' : ''}" id="listenModeBtn">Listening (A/B/C)</div>
      <div class="mode-btn ${mode === 'build' ? 'active' : ''}" id="buildModeBtn">Sentence Builder</div>
    `;
    root.querySelector('#flipModeBtn').onclick = () => switchMode('flip');
    root.querySelector('#typeModeBtn').onclick = () => switchMode('type');
    root.querySelector('#listenModeBtn').onclick = () => switchMode('listen');
    root.querySelector('#buildModeBtn').onclick = () => switchMode('build');
  }

  function switchMode(m) {
    mode = m; idx = 0; roundOrder = []; flipped = false; typed = false; lastCorrect = null; selectedOpt = null; completed = false; started = false;
    resetBuildExercise();
    buildModeToggle();
    saveLastPosition();
    render();
  }
  function switchLesson(key) {
    currentLesson = key; idx = 0; roundOrder = []; flipped = false; typed = false; lastCorrect = null; selectedOpt = null; completed = false; started = false;
    resetBuildExercise();
    saveLastPosition();
    Storage.setCurrentLesson(currentBook, currentLesson);
    buildTabs();
    render();
  }
  function saveLastPosition() {
    Storage.setLastPosition({ book: currentBook, lesson: currentLesson, mode });
  }

  // ---- in-progress session (backs the Go screen's Resume option) ----
  // One slot per book+lesson+mode combination, so leaving Flip mid-Lesson-4 and Type mid-
  // Lesson-7 (or the same lesson number in a different book) don't clobber each other.
  function sessionKey() { return 'lessons:' + currentBook + ':' + currentLesson + ':' + mode; }
  function saveSession() {
    const session = { idx };
    if (mode !== 'build') session.order = roundOrder;
    Storage.setSession(sessionKey(), session);
  }
  function clearSession() { Storage.clearSession(sessionKey()); }
  function clearAllModeSessions(bookId, lessonId) {
    ['flip', 'type', 'listen', 'build'].forEach((m) => Storage.clearSession('lessons:' + bookId + ':' + lessonId + ':' + m));
  }

  function currentWords() { return Books.getLesson(currentBook, currentLesson).words; }
  function currentListening() { return Books.getLesson(currentBook, currentLesson).listening || null; }
  function currentBuilder() { return Books.getLesson(currentBook, currentLesson).sentenceBuilder || null; }

  const MODE_TITLE = { flip: 'Flip & Recall', type: 'Type the Answer', listen: 'Listening', build: 'Sentence Builder' };
  const MODE_BLURB = {
    flip: 'Flip through this lesson’s words — tap each card to reveal the meaning, then mark yourself “I know this” or “still learning.”',
    type: 'Type the English meaning for each word in this lesson, then check your answer.',
    listen: 'Listen to a sentence, then pick the correct answer from three options.',
    build: 'Tap the tiles in order to build the answer to each question — a couple of decoy words are mixed in, so read carefully.',
  };

  function modeTotal() {
    if (mode === 'listen') { const items = currentListening(); return items ? items.length : 0; }
    if (mode === 'build') { const items = currentBuilder(); return items ? items.length : 0; }
    return currentWords().length;
  }

  function beginSession(startIdx, order) {
    idx = startIdx;
    roundOrder = order || identityOrder(modeTotal());
    flipped = false; typed = false; lastCorrect = null; selectedOpt = null; completed = false;
    listenOptionOrders = {};
    resetBuildExercise();
    started = true;
    render();
  }

  // Returns a copy of a listening item with options/optionsP/correct permuted for display, so
  // the correct answer doesn't always land on the same letter. The permutation is generated once
  // per origIdx and cached, so it stays fixed across the unanswered -> answered re-render of the
  // same item (only a fresh round regenerates it).
  function shuffledListenItem(item, origIdx) {
    if (!listenOptionOrders[origIdx]) {
      listenOptionOrders[origIdx] = shuffle(identityOrder(item.options.length));
    }
    const order = listenOptionOrders[origIdx];
    return Object.assign({}, item, {
      options: order.map((i) => item.options[i]),
      optionsP: order.map((i) => item.optionsP[i]),
      correct: order.indexOf(item.correct),
    });
  }

  function renderGoScreen() {
    root.querySelector('#posLabel').textContent = '';
    root.querySelector('#progressFill').style.width = '0%';
    root.querySelector('#statsRow').innerHTML = '';

    const total = modeTotal();
    const session = Storage.getSession(sessionKey());
    // A session saved before round-order shuffling shipped (or a build-mode session, which never
    // carries one) has no `order` field at all — that's fine, still resumable, beginSession()
    // falls back to the textbook's original order for the rest of that round. Only reject a
    // session whose order array exists but doesn't match the round's actual length.
    const orderOk = !session || !session.order || (Array.isArray(session.order) && session.order.length === total);
    const validSession = session && Number.isInteger(session.idx) && session.idx >= 0 && session.idx < total && orderOk;

    const buttonsHtml = validSession
      ? `
        <button class="submit-btn" id="resumeBtn" style="margin-top:22px;">Resume (card ${session.idx + 1} of ${total})</button>
        <button class="reset" id="startOverBtn" style="margin-top:14px;">Start over</button>
      `
      : `<button class="submit-btn" id="goBtn" style="margin-top:22px;">Go</button>`;

    root.querySelector('#cardArea').innerHTML = `
      <div class="card" style="cursor:default;">
        <div class="back-english" style="margin-bottom:14px;">${MODE_TITLE[mode]}</div>
        <div class="mnemonic" style="margin-bottom:0;">${MODE_BLURB[mode]}</div>
        ${buttonsHtml}
      </div>
    `;

    if (validSession) {
      root.querySelector('#resumeBtn').onclick = () => beginSession(session.idx, session.order);
      root.querySelector('#startOverBtn').onclick = () => { clearSession(); beginSession(0, freshOrder()); };
    } else {
      root.querySelector('#goBtn').onclick = () => beginSession(0, freshOrder());
    }
  }

  function render() {
    const titleParts = lessonTitleParts(currentBook, currentLesson);
    root.querySelector('#lessonLabel').textContent = `${titleParts.hanzi} ${titleParts.pinyin} ${titleParts.english}`;

    if (!started) { renderGoScreen(); return; }
    if (completed) { renderCompletionScreen(); return; }
    saveSession();

    if (mode === 'flip') {
      const words = currentWords();
      if (idx >= words.length) idx = words.length - 1;
      setProgressBar(idx, words.length);
      renderFlipMode(words[roundOrder[idx]], words.length);
      renderStats();
    } else if (mode === 'type') {
      const words = currentWords();
      if (idx >= words.length) idx = words.length - 1;
      setProgressBar(idx, words.length);
      renderTypeMode(words[roundOrder[idx]], words.length);
      renderStats();
    } else if (mode === 'listen') {
      const items = currentListening();
      if (!items) {
        root.querySelector('#progressFill').style.width = '0%';
        root.querySelector('#posLabel').textContent = '';
        root.querySelector('#cardArea').innerHTML = '<div class="soon-box">Listening drills for this lesson are not built yet.<br>Try Flip &amp; recall or Type the answer instead.</div>';
        root.querySelector('#statsRow').innerHTML = '';
        return;
      }
      if (idx >= items.length) idx = items.length - 1;
      setProgressBar(idx, items.length);
      renderListenMode(items[roundOrder[idx]], items.length, roundOrder[idx]);
      renderStats();
    } else if (mode === 'build') {
      const items = currentBuilder();
      if (!items) {
        root.querySelector('#progressFill').style.width = '0%';
        root.querySelector('#posLabel').textContent = '';
        root.querySelector('#cardArea').innerHTML = '<div class="soon-box">Sentence Builder starts at Lesson 3 — lessons 1 and 2 are fixed greetings with no sentence structure to build.<br>Try Flip &amp; recall or Type the answer instead.</div>';
        root.querySelector('#statsRow').innerHTML = '';
        return;
      }
      if (idx >= items.length) idx = items.length - 1;
      setProgressBar(idx, items.length);
      renderBuildMode(items[idx], items.length);
      renderStats();
    }
  }

  function setProgressBar(i, total) {
    root.querySelector('#posLabel').textContent = (i + 1) + ' / ' + total;
    root.querySelector('#progressFill').style.width = (((i + 1) / total) * 100) + '%';
  }

  function renderFlipMode(w, total) {
    const cardArea = root.querySelector('#cardArea');
    if (!flipped) {
      const controlsHtml = `
        <div class="controls">
          <button class="nav-btn" id="prevBtn" ${idx === 0 ? 'disabled style="opacity:0.3"' : ''}>&larr; back</button>
          <button class="nav-btn" id="nextBtn" ${idx === total - 1 ? 'disabled style="opacity:0.3"' : ''}>next &rarr;</button>
        </div>`;
      renderFlashcard(cardArea, w, false, {
        controlsHtml,
        autoplay: Storage.getAutoplay('lessons'),
        onToggle: () => { flipped = true; render(); },
        wireControls: () => {
          const prevBtn = root.querySelector('#prevBtn'), nextBtn = root.querySelector('#nextBtn');
          if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); if (idx > 0) { idx--; flipped = false; render(); } };
          if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); if (idx < total - 1) { idx++; flipped = false; render(); } };
        }
      });
    } else {
      const controlsHtml = `
        <div class="controls">
          <button class="nav-btn learning" id="learnBtn">still learning</button>
          <button class="nav-btn know" id="knowBtn">I know this</button>
        </div>`;
      renderFlashcard(cardArea, w, true, {
        controlsHtml,
        onToggle: () => { flipped = false; render(); },
        wireControls: () => {
          root.querySelector('#knowBtn').onclick = (e) => { e.stopPropagation(); Storage.recordSrsResult(Storage.wordItemId(currentBook, currentLesson, w.h), true); advanceFlip(total); };
          root.querySelector('#learnBtn').onclick = (e) => { e.stopPropagation(); Storage.recordSrsResult(Storage.wordItemId(currentBook, currentLesson, w.h), false); advanceFlip(total); };
        }
      });
    }
  }
  function advanceFlip(total) {
    flipped = false;
    if (idx < total - 1) idx++; else completed = true;
    render();
  }

  function renderTypeMode(w, total) {
    const cardArea = root.querySelector('#cardArea');
    if (!typed) {
      cardArea.innerHTML = `
        <div class="card" style="cursor:default;">
          <div class="hanzi">${w.h}</div>
          <div class="pinyin">${w.p}</div>
          <button class="speak-btn" id="speakBtnFront" aria-label="Play pronunciation">&#128266;</button>
          <input type="text" class="type-input" id="typeInput" placeholder="type the English meaning" autocomplete="off">
          <div class="error-text" id="errorText"></div>
          <button class="submit-btn" id="submitBtn" disabled>Check</button>
        </div>
        <div class="controls">
          <button class="nav-btn" id="prevBtn" ${idx === 0 ? 'disabled style="opacity:0.3"' : ''}>&larr; back</button>
          <button class="nav-btn" id="nextBtn" ${idx === total - 1 ? 'disabled style="opacity:0.3"' : ''}>next &rarr;</button>
        </div>
      `;
      const speakBtn = root.querySelector('#speakBtnFront');
      speakBtn.onclick = (e) => { e.stopPropagation(); Speech.speak(w.h, speakBtn); };
      if (Storage.getAutoplay('lessons')) Speech.speak(w.h, speakBtn);
      const input = root.querySelector('#typeInput');
      const submitBtn = root.querySelector('#submitBtn');
      const doSubmit = () => {
        const val = input.value;
        // Belt-and-suspenders: submitBtn is disabled whenever the trimmed value is empty, but
        // even if that's somehow bypassed, checkAnswer() also returns false for an empty/
        // whitespace-only input on its own — an empty answer can never be recorded as correct.
        if (!val.trim()) { root.querySelector('#errorText').textContent = 'Type an answer first.'; input.classList.add('wrong-input'); return; }
        lastCorrect = checkAnswer(val, w);
        Storage.recordSrsResult(Storage.wordItemId(currentBook, currentLesson, w.h), lastCorrect);
        typedAnswer = val; typed = true; render();
      };
      submitBtn.onclick = doSubmit;
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !submitBtn.disabled) doSubmit(); });
      input.addEventListener('input', () => {
        input.classList.remove('wrong-input');
        root.querySelector('#errorText').textContent = '';
        submitBtn.disabled = !input.value.trim();
      });
      input.focus();
      const prevBtn = root.querySelector('#prevBtn'), nextBtn = root.querySelector('#nextBtn');
      if (prevBtn) prevBtn.onclick = () => { if (idx > 0) { idx--; typed = false; render(); } };
      if (nextBtn) nextBtn.onclick = () => { if (idx < total - 1) { idx++; typed = false; render(); } };
    } else {
      cardArea.innerHTML = `
        <div class="card" style="cursor:default;">
          <div class="feedback-badge ${lastCorrect ? 'correct' : 'wrong'}">${lastCorrect ? 'Correct!' : 'Not quite'}</div>
          <div class="hanzi" style="font-size:34px;">${w.h} <span class="pinyin" style="font-size:16px;">${w.p}</span></div>
          <button class="speak-btn" id="speakBtnBack" aria-label="Play pronunciation">&#128266;</button>
          <div class="your-answer">You typed: "${typedAnswer}"</div>
          <div class="back-english">${w.e}</div>
          <div class="mnemonic">${w.m}</div>
        </div>
        <div class="controls">
          <button class="nav-btn" id="nextTypeBtn">${idx < total - 1 ? 'next word →' : 'lesson complete →'}</button>
        </div>
      `;
      const speakBtn = root.querySelector('#speakBtnBack');
      speakBtn.onclick = (e) => { e.stopPropagation(); Speech.speak(w.h, speakBtn); };
      root.querySelector('#nextTypeBtn').onclick = () => {
        typed = false;
        if (idx < total - 1) idx++; else completed = true;
        render();
      };
    }
  }

  // ===== shared listening-question component (also used by Review) =====
  function renderListenQuestion(cardArea, item, selectedIdx, opts) {
    opts = opts || {};
    const controlsHtml = opts.controlsHtml || '';
    const letters = ['A', 'B', 'C'];
    if (selectedIdx === null) {
      cardArea.innerHTML = `
        <div class="card" style="cursor:default; min-height:auto; padding:36px 24px;">
          <button class="listen-play" id="playBtn" aria-label="Play sentence">&#9658;</button>
          <div class="listen-hint">tap to hear the full sentence</div>
          <div class="question-text">${item.questionP}</div>
          <div class="question-hanzi">${item.question}</div>
          <div id="optionsWrap" style="width:100%; display:flex; flex-direction:column; align-items:center;"></div>
        </div>
        ${controlsHtml}
      `;
      const optsWrap = cardArea.querySelector('#optionsWrap');
      item.options.forEach((opt, i) => {
        const b = document.createElement('button');
        b.className = 'option-btn';
        b.innerHTML = `<span class="opt-letter">${letters[i]}</span><span class="opt-text"><span class="opt-pinyin">${item.optionsP[i]}</span><span class="opt-hanzi">${opt}</span></span>`;
        b.onclick = () => opts.onSelect && opts.onSelect(i);
        optsWrap.appendChild(b);
      });
      const playBtn = cardArea.querySelector('#playBtn');
      playBtn.onclick = () => Speech.speak(item.sentence, playBtn);
      if (opts.autoplay) Speech.speak(item.sentence, playBtn);
    } else {
      const isCorrect = selectedIdx === item.correct;
      let optsHtml = '';
      item.options.forEach((opt, i) => {
        let cls = 'option-btn';
        if (i === item.correct) cls += ' correct-opt'; else if (i === selectedIdx) cls += ' wrong-opt';
        optsHtml += `<div class="${cls}"><span class="opt-letter">${letters[i]}</span><span class="opt-text"><span class="opt-pinyin">${item.optionsP[i]}</span><span class="opt-hanzi">${opt}</span></span></div>`;
      });
      cardArea.innerHTML = `
        <div class="card" style="cursor:default; min-height:auto; padding:36px 24px;">
          <div class="feedback-badge ${isCorrect ? 'correct' : 'wrong'}">${isCorrect ? 'Correct!' : 'Not quite'}</div>
          <button class="speak-btn" id="replayBtn" aria-label="Replay sentence" style="margin-bottom:14px;">&#128266;</button>
          <div class="question-text">${item.questionP}</div>
          <div class="question-hanzi${item.questionE ? ' has-english' : ''}">${item.question}</div>
          ${item.questionE ? `<div class="question-english">${item.questionE}</div>` : ''}
          <div style="width:100%; display:flex; flex-direction:column; align-items:center;">${optsHtml}</div>
          <div class="example" style="margin-top:14px;"><div class="ex-p">${item.sentenceP}</div><div class="ex-h">${item.sentence}</div><div>${item.sentenceE || ''}</div></div>
        </div>
        ${controlsHtml}
      `;
      const replayBtn = cardArea.querySelector('#replayBtn');
      replayBtn.onclick = () => Speech.speak(item.sentence, replayBtn);
    }
    if (opts.wireControls) opts.wireControls();
  }

  // ===== shared sentence-builder component (also used by Review) =====
  // `state.bankTiles` is the shuffled tile pool (answer tiles + decoys) for this exercise;
  // `state.builtIds` is the subset of those tile ids tapped so far, in order. The caller owns
  // both — this function just renders them and reports taps back via opts callbacks, same
  // division of responsibility as renderListenQuestion's selectedIdx.
  function renderBuildQuestion(cardArea, item, state, opts) {
    opts = opts || {};
    const controlsHtml = opts.controlsHtml || '';
    const bankTiles = state.bankTiles;
    const builtIds = state.builtIds;
    if (!state.submitted) {
      const availableTiles = bankTiles.filter(t => builtIds.indexOf(t.id) === -1);
      const builtTiles = builtIds.map(id => bankTiles.find(t => t.id === id));
      const builtHtml = builtTiles.length
        ? builtTiles.map((t, pos) => `<button class="built-tile" data-pos="${pos}"><span class="tile-h">${t.h}</span><span class="tile-p">${t.p}</span></button>`).join('')
        : `<span class="built-placeholder">tap tiles below to build your answer</span>`;
      const bankHtml = availableTiles.map(t => `<button class="tile-btn" data-id="${t.id}"><span class="tile-h">${t.h}</span><span class="tile-p">${t.p}</span></button>`).join('');
      cardArea.innerHTML = `
        <div class="card" style="cursor:default; min-height:auto; padding:36px 24px;">
          <button class="listen-play" id="sbPlayBtn" aria-label="Play question" style="width:56px; height:56px; font-size:22px;">&#9658;</button>
          <div class="listen-hint">tap to hear the question</div>
          <div class="sb-prompt-hanzi">${item.prompt}</div>
          <div class="sb-prompt-pinyin">${item.promptP}</div>
          <div class="built-row" id="builtRow">${builtHtml}</div>
          <div class="tile-bank" id="tileBank">${bankHtml}</div>
          <div class="error-text" id="sbError"></div>
          <button class="submit-btn" id="sbSubmitBtn" ${builtIds.length === 0 ? 'disabled' : ''}>Check</button>
        </div>
        ${controlsHtml}
      `;
      const playBtn = cardArea.querySelector('#sbPlayBtn');
      playBtn.onclick = () => Speech.speak(item.prompt, playBtn);
      if (opts.autoplay) Speech.speak(item.prompt, playBtn);
      cardArea.querySelectorAll('#tileBank .tile-btn').forEach(btn => {
        const tileId = btn.getAttribute('data-id');
        btn.onclick = () => {
          const tile = bankTiles.find(t => t.id === tileId);
          if (tile) Speech.speak(tile.h, btn);
          opts.onTapTile && opts.onTapTile(tileId);
        };
      });
      cardArea.querySelectorAll('#builtRow .built-tile').forEach(btn => {
        btn.onclick = () => opts.onRemoveBuilt && opts.onRemoveBuilt(parseInt(btn.getAttribute('data-pos'), 10));
      });
      cardArea.querySelector('#sbSubmitBtn').onclick = () => {
        if (builtIds.length === 0) { cardArea.querySelector('#sbError').textContent = 'Build an answer first.'; return; }
        opts.onSubmit && opts.onSubmit();
      };
    } else {
      // Reconstruct what was actually tapped, in order — builtIds/bankTiles are still the same
      // ones from the unanswered view (never cleared on submit), so this is exactly what the
      // person built, decoys and all. Only shown when wrong: when correct it's identical to the
      // answer already shown below, so repeating it would just be noise.
      const builtTiles = builtIds.map(id => bankTiles.find(t => t.id === id));
      const yourAnswerHtml = !state.correct
        ? `<div class="your-answer">You built: "${builtTiles.map(t => t.h).join('')}" <span style="opacity:0.8;">(${builtTiles.map(t => t.p).join(' ')})</span></div>`
        : '';
      cardArea.innerHTML = `
        <div class="card" style="cursor:default; min-height:auto; padding:36px 24px;">
          <div class="feedback-badge ${state.correct ? 'correct' : 'wrong'}">${state.correct ? 'Correct!' : 'Not quite'}</div>
          <div class="sb-prompt-hanzi">${item.prompt}</div>
          <div class="sb-prompt-pinyin">${item.promptP}</div>
          <div class="sb-prompt-english">${item.promptE}</div>
          ${yourAnswerHtml}
          <div class="example" style="margin-top:14px;">
            <div class="ex-row"><div class="ex-h">${item.answer}</div><button class="speak-btn" id="sbAnswerSpeakBtn" aria-label="Play answer sentence">&#128266;</button></div>
            <div class="ex-p">${item.answerP}</div>
            <div>${item.answerE}</div>
          </div>
        </div>
        ${controlsHtml}
      `;
      const speakBtn = cardArea.querySelector('#sbAnswerSpeakBtn');
      speakBtn.onclick = () => Speech.speak(item.answer, speakBtn);
    }
    if (opts.wireControls) opts.wireControls();
  }

  function renderBuildMode(item, total) {
    const cardArea = root.querySelector('#cardArea');
    const itemId = Storage.buildItemId(currentBook, currentLesson, idx);
    if (!buildSubmitted) {
      const controlsHtml = `
        <div class="controls">
          <button class="nav-btn" id="prevBtn" ${idx === 0 ? 'disabled style="opacity:0.3"' : ''}>&larr; back</button>
          <button class="nav-btn" id="nextBtn" ${idx === total - 1 ? 'disabled style="opacity:0.3"' : ''}>next &rarr;</button>
        </div>`;
      // Autoplay should fire once when this exercise is first shown, not on every re-render
      // triggered by tapping/un-tapping a tile — otherwise the prompt would replay itself
      // after every single tap.
      const shouldAutoplay = Storage.getAutoplay('lessons') && !buildAutoplayed;
      if (shouldAutoplay) buildAutoplayed = true;
      renderBuildQuestion(cardArea, item, { bankTiles: buildBank, builtIds: buildSeq, submitted: false }, {
        controlsHtml,
        autoplay: shouldAutoplay,
        onTapTile: (id) => { buildSeq.push(id); render(); },
        onRemoveBuilt: (pos) => { buildSeq.splice(pos, 1); render(); },
        onSubmit: () => {
          const builtHanzi = buildSeq.map(id => buildBank.find(t => t.id === id).h);
          const answerHanzi = item.tiles.map(t => t.h);
          buildCorrect = checkBuildAnswer(builtHanzi, answerHanzi);
          Storage.recordSrsResult(itemId, buildCorrect);
          buildSubmitted = true;
          render();
        },
        wireControls: () => {
          const prevBtn = root.querySelector('#prevBtn'), nextBtn = root.querySelector('#nextBtn');
          if (prevBtn) prevBtn.onclick = () => { if (idx > 0) { idx--; resetBuildExercise(); render(); } };
          if (nextBtn) nextBtn.onclick = () => { if (idx < total - 1) { idx++; resetBuildExercise(); render(); } };
        }
      });
    } else {
      const controlsHtml = `
        <div class="controls">
          <button class="nav-btn" id="nextBuildBtn">${idx < total - 1 ? 'next question →' : 'lesson complete →'}</button>
        </div>`;
      renderBuildQuestion(cardArea, item, { bankTiles: buildBank, builtIds: buildSeq, submitted: true, correct: buildCorrect }, {
        controlsHtml,
        wireControls: () => {
          root.querySelector('#nextBuildBtn').onclick = () => {
            if (idx < total - 1) { idx++; resetBuildExercise(); } else { completed = true; }
            render();
          };
        }
      });
    }
  }

  function renderListenMode(item, total, origIdx) {
    const cardArea = root.querySelector('#cardArea');
    // origIdx (the item's stable position in currentListening(), not its shuffled round
    // position) keeps this item's SRS identity fixed across rounds regardless of shuffle order.
    const itemId = Storage.listenItemId(currentBook, currentLesson, origIdx);
    const displayItem = shuffledListenItem(item, origIdx);
    if (selectedOpt === null) {
      const controlsHtml = `
        <div class="controls">
          <button class="nav-btn" id="prevBtn" ${idx === 0 ? 'disabled style="opacity:0.3"' : ''}>&larr; back</button>
          <button class="nav-btn" id="nextBtn" ${idx === total - 1 ? 'disabled style="opacity:0.3"' : ''}>next &rarr;</button>
        </div>`;
      renderListenQuestion(cardArea, displayItem, null, {
        controlsHtml,
        autoplay: Storage.getAutoplay('lessons'),
        onSelect: (i) => {
          selectedOpt = i;
          lastCorrect = (i === displayItem.correct);
          Storage.recordSrsResult(itemId, lastCorrect);
          render();
        },
        wireControls: () => {
          const prevBtn = root.querySelector('#prevBtn'), nextBtn = root.querySelector('#nextBtn');
          if (prevBtn) prevBtn.onclick = () => { if (idx > 0) { idx--; selectedOpt = null; render(); } };
          if (nextBtn) nextBtn.onclick = () => { if (idx < total - 1) { idx++; selectedOpt = null; render(); } };
        }
      });
    } else {
      const controlsHtml = `
        <div class="controls">
          <button class="nav-btn" id="nextListenBtn">${idx < total - 1 ? 'next question →' : 'lesson complete →'}</button>
        </div>`;
      renderListenQuestion(cardArea, displayItem, selectedOpt, {
        controlsHtml,
        wireControls: () => {
          root.querySelector('#nextListenBtn').onclick = () => {
            selectedOpt = null;
            if (idx < total - 1) idx++; else completed = true;
            render();
          };
        }
      });
    }
  }

  // Tally of known/learning items for the current lesson — shared by the in-progress stats row
  // and the end-of-lesson completion screen so both report the same numbers. Reads the shared
  // SRS schedule, so a word answered correctly in a different mode already counts as known here.
  function computeTally() {
    let known = 0, learning = 0, total;
    if (mode === 'listen') {
      const items = currentListening();
      total = items ? items.length : 0;
      (items || []).forEach((it, i) => {
        const status = Storage.itemStatus(Storage.listenItemId(currentBook, currentLesson, i));
        if (status === 'known') known++; else if (status === 'learning') learning++;
      });
    } else if (mode === 'build') {
      const items = currentBuilder();
      total = items ? items.length : 0;
      (items || []).forEach((it, i) => {
        const status = Storage.itemStatus(Storage.buildItemId(currentBook, currentLesson, i));
        if (status === 'known') known++; else if (status === 'learning') learning++;
      });
    } else {
      const words = currentWords();
      total = words.length;
      words.forEach(w => {
        const status = Storage.itemStatus(Storage.wordItemId(currentBook, currentLesson, w.h));
        if (status === 'known') known++; else if (status === 'learning') learning++;
      });
    }
    return { known, learning, total };
  }

  function renderStats() {
    const { known, learning, total } = computeTally();
    const label = (mode === 'listen' || mode === 'build') ? ['correct', 'missed', 'not attempted'] : ['known', 'still learning', 'not reviewed'];
    root.querySelector('#statsRow').innerHTML = `<span><b>${known}</b> ${label[0]}</span><span><b>${learning}</b> ${label[1]}</span><span><b>${total - known - learning}</b> ${label[2]}</span>`;
  }

  function completionTone(known, total) {
    if (total === 0) return { emoji: '👍', message: 'Lesson complete.' };
    const ratio = known / total;
    if (ratio === 1) return { emoji: '🎉', message: 'Perfect! You’ve got this lesson down.' };
    if (ratio >= 0.7) return { emoji: '✨', message: 'Well done!' };
    if (ratio >= 0.4) return { emoji: '👍', message: 'Nice work — a few more reviews and you’ll have it.' };
    return { emoji: '💪', message: 'Good effort! This one might need another pass.' };
  }

  function renderCompletionScreen() {
    clearSession();
    const { known, learning, total } = computeTally();
    root.querySelector('#posLabel').textContent = 'Complete!';
    root.querySelector('#progressFill').style.width = '100%';
    root.querySelector('#statsRow').innerHTML = '';

    const scoreText = mode === 'flip'
      ? `${known} known · ${learning} still learning`
      : `${known} out of ${total} correct`;
    const tone = completionTone(known, total);

    root.querySelector('#cardArea').innerHTML = `
      <div class="card" style="cursor:default;">
        <div class="review-summary" style="padding:10px 0;">
          <div class="rs-emoji">${tone.emoji}</div>
          <div class="rs-title">${scoreText}</div>
          <div class="rs-sub">${tone.message}</div>
        </div>
      </div>
      <div class="controls">
        <button class="nav-btn" id="tryAgainBtn">Try again</button>
        <button class="nav-btn" id="backToListBtn">Back to lesson list</button>
      </div>
    `;
    root.querySelector('#tryAgainBtn').onclick = () => beginSession(0, freshOrder());
    root.querySelector('#backToListBtn').onclick = () => { if (goTo) goTo('dashboard'); };
  }

  // Shown instead of the normal lesson UI when the current book has no lesson content yet
  // (HSK2/HSK3 today) — tabs/mode-toggle/Go-screen all assume at least one lesson exists
  // (e.g. Books.getLessonOrder(currentBook)[0] as the default lesson), so this has to be an
  // early exit, not something those pieces individually guard against.
  function renderEmptyBook() {
    root.innerHTML = `
      <div class="lamp"></div>
      <h1>Lessons</h1>
      <div class="sub">${Books.bookLabel(currentBook)} — no lesson content yet</div>
      <div class="soon-box">${Books.bookLabel(currentBook)} lessons haven't been added yet.<br>Switch books above to keep studying in the meantime.</div>
    `;
  }

  function mount(container, initial, navigate) {
    root = container;
    goTo = navigate || null;
    currentBook = (initial && initial.book) || Storage.getCurrentBook();
    Storage.setCurrentBook(currentBook); // keep the book selector in sync if we arrived via "Continue"

    if (!Books.hasContent(currentBook)) {
      currentLesson = null;
      renderEmptyBook();
      return;
    }

    // Prefer an explicit lesson (e.g. tapped on Dashboard's mastery grid — a deliberate pick,
    // always persisted); otherwise pick up whatever lesson was last selected anywhere in the
    // app for this book — Grammar, Lessons itself, etc. — so the two stay in sync. Falls back
    // to the book's first lesson only when neither is available. That fallback is persisted as
    // the new shared choice only when nothing had been chosen yet (rememberedLesson === null) —
    // a lesson that's merely invalid *here* (doesn't happen today since every book's lessons
    // and grammar share one numbering space, but keeps this screen from clobbering a choice
    // that's still valid elsewhere) shouldn't overwrite the person's real last choice.
    const rememberedLesson = Storage.getCurrentLesson(currentBook);
    const lessonOrder = Books.getLessonOrder(currentBook);
    const rememberedValid = rememberedLesson && lessonOrder.indexOf(rememberedLesson) !== -1;
    if (initial && initial.lesson) {
      currentLesson = initial.lesson;
      Storage.setCurrentLesson(currentBook, currentLesson);
    } else if (rememberedValid) {
      currentLesson = rememberedLesson;
    } else {
      currentLesson = lessonOrder[0];
      if (!rememberedLesson) Storage.setCurrentLesson(currentBook, currentLesson);
    }
    if (initial && initial.mode) mode = initial.mode;
    idx = 0; roundOrder = []; flipped = false; typed = false; lastCorrect = null; selectedOpt = null; completed = false; started = false;
    resetBuildExercise();
    root.innerHTML = html();
    buildAutoplayToggle();
    Speech.buildSpeedControl(root.querySelector('#speedRow'));
    buildTabs();
    buildModeToggle();
    saveLastPosition();
    render();
    root.querySelector('#resetBtn').onclick = () => {
      Storage.clearLessonSrs(currentBook, currentLesson);
      clearAllModeSessions(currentBook, currentLesson);
      completed = false;
      started = false;
      render();
    };
  }

  return { mount, renderFlashcard, renderListenQuestion, renderBuildQuestion, checkAnswer, checkBuildAnswer };
})();
