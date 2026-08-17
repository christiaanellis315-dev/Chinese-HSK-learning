// Lessons screen: flip / type / listen engine, adapted from the original hsk1_lessons_*.html
// files and generalized to loop over all of LESSON_ORDER (1-15). The Numbers 1-99 drill that
// used to live here as a fourth mode is now its own top-level screen (see numbers.js) — it's a
// recurring standalone drill, not lesson-specific content.
// Also exposes renderFlashcard() so the Review screen can reuse the exact same flip-card UI.
const Lessons = (() => {
  let root = null;
  let goTo = null;
  let currentLesson = LESSON_ORDER[0];
  let mode = 'flip';
  let idx = 0;
  let flipped = false;
  let typed = false;
  let typedAnswer = '';
  let lastCorrect = null;
  let selectedOpt = null;
  let completed = false;

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
      const exampleHtml = word.ex ? `<div class="example"><div class="ex-h">${word.ex}</div><div class="ex-p">${word.exp}</div><div>${word.exe}</div></div>` : '';
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
    }
    if (opts.wireControls) opts.wireControls();
  }

  // ===== screen chrome =====
  function html() {
    return `
      <div class="lamp"></div>
      <h1>Lessons</h1>
      <div class="sub">HSK1 Standard Course — Lessons 1 through 15</div>
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
      <button class="reset" id="resetBtn">Reset progress for this lesson &amp; mode</button>
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
    LESSON_ORDER.forEach(key => {
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
    `;
    root.querySelector('#flipModeBtn').onclick = () => switchMode('flip');
    root.querySelector('#typeModeBtn').onclick = () => switchMode('type');
    root.querySelector('#listenModeBtn').onclick = () => switchMode('listen');
  }

  function switchMode(m) {
    mode = m; idx = 0; flipped = false; typed = false; lastCorrect = null; selectedOpt = null; completed = false;
    buildModeToggle();
    saveLastPosition();
    render();
  }
  function switchLesson(key) {
    currentLesson = key; idx = 0; flipped = false; typed = false; lastCorrect = null; selectedOpt = null; completed = false;
    saveLastPosition();
    buildTabs();
    render();
  }
  function saveLastPosition() {
    Storage.setLastPosition({ lesson: currentLesson, mode });
  }

  function currentWords() { return LESSONS[currentLesson].words; }
  function currentListening() { return LESSONS[currentLesson].listening || null; }

  function render() {
    const titleParts = lessonTitleParts(currentLesson);
    root.querySelector('#lessonLabel').textContent = `${titleParts.hanzi} ${titleParts.pinyin} ${titleParts.english}`;

    if (completed) { renderCompletionScreen(); return; }

    if (mode === 'flip') {
      const words = currentWords();
      if (idx >= words.length) idx = words.length - 1;
      setProgressBar(idx, words.length);
      renderFlipMode(words[idx], words.length);
      renderStats();
    } else if (mode === 'type') {
      const words = currentWords();
      if (idx >= words.length) idx = words.length - 1;
      setProgressBar(idx, words.length);
      renderTypeMode(words[idx], words.length);
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
      renderListenMode(items[idx], items.length);
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
          root.querySelector('#knowBtn').onclick = (e) => { e.stopPropagation(); Storage.setItemStatus(currentLesson, 'flip', w.h, 'known'); advanceFlip(total); };
          root.querySelector('#learnBtn').onclick = (e) => { e.stopPropagation(); Storage.setItemStatus(currentLesson, 'flip', w.h, 'learning'); advanceFlip(total); };
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
          <button class="submit-btn" id="submitBtn">Check</button>
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
      const doSubmit = () => {
        const val = input.value;
        if (!val.trim()) { root.querySelector('#errorText').textContent = 'Type an answer first.'; input.classList.add('wrong-input'); return; }
        lastCorrect = checkAnswer(val, w);
        Storage.setItemStatus(currentLesson, 'type', w.h, lastCorrect ? 'known' : 'learning');
        typedAnswer = val; typed = true; render();
      };
      root.querySelector('#submitBtn').onclick = doSubmit;
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSubmit(); });
      input.addEventListener('input', () => { input.classList.remove('wrong-input'); root.querySelector('#errorText').textContent = ''; });
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

  function renderListenMode(item, total) {
    const cardArea = root.querySelector('#cardArea');
    const key = currentLesson + '-' + idx;
    const letters = ['A', 'B', 'C'];
    if (selectedOpt === null) {
      cardArea.innerHTML = `
        <div class="card" style="cursor:default; min-height:auto; padding:36px 24px;">
          <button class="listen-play" id="playBtn" aria-label="Play sentence">&#9658;</button>
          <div class="listen-hint">tap to hear the full sentence</div>
          <div class="question-text">${item.questionP}</div>
          <div class="question-hanzi">${item.question}</div>
          <div id="optionsWrap" style="width:100%; display:flex; flex-direction:column; align-items:center;"></div>
        </div>
        <div class="controls">
          <button class="nav-btn" id="prevBtn" ${idx === 0 ? 'disabled style="opacity:0.3"' : ''}>&larr; back</button>
          <button class="nav-btn" id="nextBtn" ${idx === total - 1 ? 'disabled style="opacity:0.3"' : ''}>next &rarr;</button>
        </div>
      `;
      const optsWrap = root.querySelector('#optionsWrap');
      item.options.forEach((opt, i) => {
        const b = document.createElement('button');
        b.className = 'option-btn';
        b.innerHTML = `<span class="opt-letter">${letters[i]}</span><span class="opt-text"><span class="opt-pinyin">${item.optionsP[i]}</span><span class="opt-hanzi">${opt}</span></span>`;
        b.onclick = () => {
          selectedOpt = i; lastCorrect = (i === item.correct);
          Storage.setItemStatus(currentLesson, 'listen', key, lastCorrect ? 'known' : 'learning');
          render();
        };
        optsWrap.appendChild(b);
      });
      const playBtn = root.querySelector('#playBtn');
      playBtn.onclick = () => Speech.speak(item.sentence, playBtn);
      if (Storage.getAutoplay('lessons')) Speech.speak(item.sentence, playBtn);
      const prevBtn = root.querySelector('#prevBtn'), nextBtn = root.querySelector('#nextBtn');
      if (prevBtn) prevBtn.onclick = () => { if (idx > 0) { idx--; selectedOpt = null; render(); } };
      if (nextBtn) nextBtn.onclick = () => { if (idx < total - 1) { idx++; selectedOpt = null; render(); } };
    } else {
      let optsHtml = '';
      item.options.forEach((opt, i) => {
        let cls = 'option-btn';
        if (i === item.correct) cls += ' correct-opt'; else if (i === selectedOpt) cls += ' wrong-opt';
        optsHtml += `<div class="${cls}"><span class="opt-letter">${letters[i]}</span><span class="opt-text"><span class="opt-pinyin">${item.optionsP[i]}</span><span class="opt-hanzi">${opt}</span></span></div>`;
      });
      cardArea.innerHTML = `
        <div class="card" style="cursor:default; min-height:auto; padding:36px 24px;">
          <div class="feedback-badge ${lastCorrect ? 'correct' : 'wrong'}">${lastCorrect ? 'Correct!' : 'Not quite'}</div>
          <button class="speak-btn" id="replayBtn" aria-label="Replay sentence" style="margin-bottom:14px;">&#128266;</button>
          <div class="question-text">${item.questionP}</div>
          <div class="question-hanzi">${item.question}</div>
          <div style="width:100%; display:flex; flex-direction:column; align-items:center;">${optsHtml}</div>
          <div class="example" style="margin-top:14px;"><div class="ex-p">${item.sentenceP}</div><div class="ex-h">${item.sentence}</div></div>
        </div>
        <div class="controls">
          <button class="nav-btn" id="nextListenBtn">${idx < total - 1 ? 'next question →' : 'lesson complete →'}</button>
        </div>
      `;
      const replayBtn = root.querySelector('#replayBtn');
      replayBtn.onclick = () => Speech.speak(item.sentence, replayBtn);
      root.querySelector('#nextListenBtn').onclick = () => {
        selectedOpt = null;
        if (idx < total - 1) idx++; else completed = true;
        render();
      };
    }
  }

  // Tally of known/learning items for the current lesson+mode — shared by the in-progress
  // stats row and the end-of-lesson completion screen so both report the same numbers.
  function computeTally() {
    let known = 0, learning = 0, total;
    if (mode === 'listen') {
      const items = currentListening();
      total = items ? items.length : 0;
      const progress = Storage.getModeProgress(currentLesson, 'listen');
      (items || []).forEach((it, i) => {
        const key = currentLesson + '-' + i;
        if (progress[key] === 'known') known++; else if (progress[key] === 'learning') learning++;
      });
    } else {
      const words = currentWords();
      total = words.length;
      const progress = Storage.getModeProgress(currentLesson, mode);
      words.forEach(w => { if (progress[w.h] === 'known') known++; else if (progress[w.h] === 'learning') learning++; });
    }
    return { known, learning, total };
  }

  function renderStats() {
    const { known, learning, total } = computeTally();
    const label = mode === 'listen' ? ['correct', 'missed', 'not attempted'] : ['known', 'still learning', 'not reviewed'];
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
    root.querySelector('#tryAgainBtn').onclick = () => {
      completed = false; idx = 0; flipped = false; typed = false; lastCorrect = null; selectedOpt = null;
      render();
    };
    root.querySelector('#backToListBtn').onclick = () => { if (goTo) goTo('dashboard'); };
  }

  function mount(container, initial, navigate) {
    root = container;
    goTo = navigate || null;
    if (initial && initial.lesson) currentLesson = initial.lesson;
    if (initial && initial.mode) mode = initial.mode;
    idx = 0; flipped = false; typed = false; lastCorrect = null; selectedOpt = null; completed = false;
    root.innerHTML = html();
    buildAutoplayToggle();
    Speech.buildSpeedControl(root.querySelector('#speedRow'));
    buildTabs();
    buildModeToggle();
    saveLastPosition();
    render();
    root.querySelector('#resetBtn').onclick = () => {
      Storage.clearModeProgress(currentLesson, mode);
      completed = false;
      render();
    };
  }

  return { mount, renderFlashcard };
})();
