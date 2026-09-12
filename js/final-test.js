// Final Test: an end-of-book vocabulary test, reached via the "Final Test" pill at the end of
// Dashboard's lesson list (see dashboard.js) — not a bottom-nav screen of its own. Pools every
// vocabulary word from every lesson in whichever book it's opened for (via Books.getLessonOrder/
// getLesson, same as everywhere else book-aware — no hardcoded per-book lists, so a future book
// gets a correctly-scoped Final Test automatically) and draws 30 at random, using the exact same
// Type-the-Answer format, checkAnswer() leniency, and SRS scoring as Lessons' own Type mode
// (Lessons.checkAnswer is reused directly, not re-implemented, so the two can never drift apart).
// Same recall-first pattern as the Games-tab games: Go screen, resume, randomized order each
// attempt, empty-input protection, mic pronunciation practice, and a completion screen — which
// here also lists every missed word (wrong or skipped), grouped by lesson, so a 30-question test
// doubles as a "what to go review" report instead of just a number.
const FinalTest = (() => {
  const ROUND_LENGTH = 30;
  let root = null;
  let goTo = null;
  let book = null;
  let started = false;
  let roundItems = []; // { lessonId, word }
  let roundIndex = 0;
  let correctCount = 0;
  let missed = []; // { lessonId, word } — wrong OR skipped, for the completion screen's review list
  let answered = false;
  let correct = null;
  let typedAnswer = '';
  let completed = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildPool() {
    const pool = [];
    Books.getLessonOrder(book).forEach((lessonId) => {
      Books.getLesson(book, lessonId).words.forEach((word) => pool.push({ lessonId, word }));
    });
    return pool;
  }

  function sessionKey() { return 'finalTest:' + book; }

  function roundLengthFor(poolSize) { return Math.min(ROUND_LENGTH, poolSize); }

  function newRound() {
    const pool = shuffle(buildPool());
    roundItems = pool.slice(0, roundLengthFor(pool.length));
    roundIndex = 0;
    correctCount = 0;
    missed = [];
    answered = false;
    correct = null;
    completed = false;
  }

  function currentItem() { return roundItems[roundIndex]; }

  function html() {
    return `
      <div class="lamp"></div>
      <h1>${Books.bookLabel(book)} Final Test</h1>
      <div class="sub">30 random words from every lesson — type the English meaning</div>
      <div class="autoplay-row">
        <span>Auto-play audio</span>
        <div class="switch" id="ftAutoplaySwitch"><div class="knob"></div></div>
      </div>
      <div class="top-row" id="ftSpeedRow"></div>
      <div class="progress-row">
        <span id="ftPosLabel"></span>
        <span></span>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="ftProgressFill"></div></div>
      <div id="ftCardArea"></div>
      <div class="stats" id="ftStatsRow"></div>
      <button class="reset" id="ftResetBtn">Start a new test</button>
    `;
  }

  function buildAutoplayToggle() {
    const el = root.querySelector('#ftAutoplaySwitch');
    const on = Storage.getAutoplay('lessons');
    el.className = 'switch' + (on ? ' on' : '');
    el.innerHTML = '<div class="knob"></div>';
    el.onclick = () => { Storage.setAutoplay('lessons', !Storage.getAutoplay('lessons')); buildAutoplayToggle(); };
  }

  function completionTone(correctN, total) {
    if (total === 0) return { emoji: '👍', message: 'Test complete.' };
    const ratio = correctN / total;
    if (ratio === 1) return { emoji: '🎉', message: 'Perfect! You know this book cold.' };
    if (ratio >= 0.8) return { emoji: '✨', message: 'Excellent work.' };
    if (ratio >= 0.5) return { emoji: '👍', message: 'Solid — review the missed words below and try again.' };
    return { emoji: '💪', message: 'A tough round. The words below are worth another pass.' };
  }

  function validSession(session) {
    return !!session
      && Array.isArray(session.roundItems) && session.roundItems.length > 0
      && Number.isInteger(session.roundIndex) && session.roundIndex >= 0 && session.roundIndex < session.roundItems.length
      && Number.isInteger(session.correctCount)
      && Array.isArray(session.missed);
  }

  function renderStart() {
    root.querySelector('#ftPosLabel').textContent = '';
    root.querySelector('#ftProgressFill').style.width = '0%';
    root.querySelector('#ftStatsRow').innerHTML = '';

    const totalWords = buildPool().length;
    if (totalWords === 0) {
      root.querySelector('#ftCardArea').innerHTML = `
        <div class="soon-box">${Books.bookLabel(book)} has no vocabulary yet to test.</div>
      `;
      return;
    }

    const session = Storage.getSession(sessionKey());
    const hasSession = validSession(session);

    const buttonsHtml = hasSession
      ? `
        <button class="submit-btn" id="ftResumeBtn" style="margin-top:22px;">Resume (word ${session.roundIndex + 1} of ${session.roundItems.length}, ${session.correctCount} correct so far)</button>
        <button class="reset" id="ftStartOverBtn" style="margin-top:14px;">Start over</button>
      `
      : `<button class="submit-btn" id="ftGoBtn" style="margin-top:22px;">Go</button>`;

    root.querySelector('#ftCardArea').innerHTML = `
      <div class="card" style="cursor:default;">
        <div class="back-english" style="margin-bottom:14px;">${Books.bookLabel(book)} Final Test</div>
        <div class="mnemonic" style="margin-bottom:0;">${roundLengthFor(totalWords)} words, drawn at random from all ${totalWords} words across every ${Books.bookLabel(book)} lesson — a fresh mix every attempt. Type the English meaning for each, same as Type the Answer. Missed words are listed at the end so you know exactly what to review.</div>
        ${buttonsHtml}
      </div>
    `;

    if (hasSession) {
      root.querySelector('#ftResumeBtn').onclick = () => {
        roundItems = session.roundItems;
        roundIndex = session.roundIndex;
        correctCount = session.correctCount;
        missed = session.missed;
        answered = false; correct = null; completed = false;
        started = true;
        render();
      };
      root.querySelector('#ftStartOverBtn').onclick = () => {
        Storage.clearSession(sessionKey());
        started = true; newRound(); render();
      };
    } else {
      root.querySelector('#ftGoBtn').onclick = () => { started = true; newRound(); render(); };
    }
  }

  function renderCompletionScreen() {
    Storage.clearSession(sessionKey());
    root.querySelector('#ftPosLabel').textContent = 'Test complete!';
    root.querySelector('#ftProgressFill').style.width = '100%';
    root.querySelector('#ftStatsRow').innerHTML = '';
    const total = roundItems.length;
    const tone = completionTone(correctCount, total);

    // Group missed words by lesson so the review list reads as "go look at these lessons again",
    // not just a flat pile of words.
    const byLesson = {};
    missed.forEach(({ lessonId, word }) => {
      if (!byLesson[lessonId]) byLesson[lessonId] = [];
      byLesson[lessonId].push(word);
    });
    const missedLessonIds = Object.keys(byLesson).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const missedHtml = missedLessonIds.length
      ? `
        <div class="mastery-list-title" style="margin-top:26px;">Missed words (tap to hear)</div>
        <div class="missed-list">
          ${missedLessonIds.map((lessonId) => `
            <div class="missed-lesson-label">Lesson ${lessonId}</div>
            ${byLesson[lessonId].map((w) => `
              <div class="missed-word" data-hanzi="${w.h}">
                <span class="mw-hanzi">${w.h} <span class="mw-pinyin">${w.p}</span></span>
                <span class="mw-en">${w.e}</span>
              </div>
            `).join('')}
          `).join('')}
        </div>
      `
      : '';

    root.querySelector('#ftCardArea').innerHTML = `
      <div class="card" style="cursor:default;">
        <div class="review-summary" style="padding:10px 0;">
          <div class="rs-emoji">${tone.emoji}</div>
          <div class="rs-title">${correctCount} out of ${total} correct</div>
          <div class="rs-sub">${tone.message}</div>
        </div>
      </div>
      ${missedHtml}
      <div class="controls" style="margin-top:18px;">
        <button class="nav-btn" id="ftTryAgainBtn">Try again</button>
        <button class="nav-btn" id="ftBackBtn">Back to Dashboard</button>
      </div>
    `;
    root.querySelectorAll('.missed-word').forEach((row) => {
      row.onclick = () => Speech.speak(row.dataset.hanzi, row);
    });
    root.querySelector('#ftTryAgainBtn').onclick = () => { newRound(); render(); };
    root.querySelector('#ftBackBtn').onclick = () => { if (goTo) goTo('dashboard'); };
  }

  function advanceRound() {
    Recorder.cleanup();
    if (roundIndex < roundItems.length - 1) {
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

  // Mirrors the disable-while-empty pattern used everywhere else a Check button submits text —
  // see Lessons/Numbers/DateWeekdayGame/MahjongGame for the same guard.
  function syncSubmitEnabled(input, btn) {
    btn.disabled = !input.value.trim();
  }

  function render() {
    if (!started) { renderStart(); return; }
    if (completed) { renderCompletionScreen(); return; }
    Storage.setSession(sessionKey(), { roundItems, roundIndex, correctCount, missed });

    const total = roundItems.length;
    root.querySelector('#ftPosLabel').textContent = (roundIndex + 1) + ' / ' + total;
    root.querySelector('#ftProgressFill').style.width = (((roundIndex + 1) / total) * 100) + '%';
    const { lessonId, word: w } = currentItem();
    const itemId = Storage.wordItemId(book, lessonId, w.h);
    const cardArea = root.querySelector('#ftCardArea');
    const isLast = roundIndex === total - 1;

    if (!answered) {
      Recorder.cleanup();
      cardArea.innerHTML = `
        <div class="card" style="cursor:default;">
          <div class="hanzi">${w.h}</div>
          <div class="pinyin">${w.p}</div>
          <div class="audio-row"><button class="speak-btn" id="ftSpeakBtn" aria-label="Play pronunciation">&#128266;</button><span id="ftMicArea"></span></div>
          <input type="text" class="type-input" id="ftInput" placeholder="type the English meaning" autocomplete="off">
          <div class="error-text" id="ftError"></div>
          <button class="submit-btn" id="ftSubmitBtn" disabled>Check</button>
        </div>
        <div class="controls"><button class="nav-btn" id="ftSkipBtn">skip &rarr;</button></div>
      `;
      const speakBtn = root.querySelector('#ftSpeakBtn');
      speakBtn.onclick = () => Speech.speak(w.h, speakBtn);
      if (Storage.getAutoplay('lessons')) Speech.speak(w.h, speakBtn);
      Recorder.mountMicButton(root.querySelector('#ftMicArea'), w.h);
      const input = root.querySelector('#ftInput');
      const submitBtn = root.querySelector('#ftSubmitBtn');
      const doSubmit = () => {
        const val = input.value;
        // Belt-and-suspenders: submitBtn is disabled whenever the trimmed value is empty, but
        // even if that's somehow bypassed, Lessons.checkAnswer() also rejects empty input on its
        // own — an empty answer can never be recorded as correct here either.
        if (!val.trim()) { root.querySelector('#ftError').textContent = 'Type an answer first.'; input.classList.add('wrong-input'); return; }
        correct = Lessons.checkAnswer(val, w);
        Storage.recordSrsResult(itemId, correct);
        Storage.recordActivity();
        if (correct) correctCount++; else missed.push({ lessonId, word: w });
        typedAnswer = val; answered = true; render();
      };
      submitBtn.onclick = doSubmit;
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !submitBtn.disabled) doSubmit(); });
      input.addEventListener('input', () => {
        input.classList.remove('wrong-input');
        root.querySelector('#ftError').textContent = '';
        syncSubmitEnabled(input, submitBtn);
      });
      input.focus();
      // A skipped word never got a chance to prove itself either — count it as missed for the
      // review list (but, same as every other game's skip, it doesn't touch the SRS schedule:
      // no attempt means nothing to grade).
      root.querySelector('#ftSkipBtn').onclick = () => { missed.push({ lessonId, word: w }); advanceRound(); };
    } else {
      Recorder.cleanup();
      cardArea.innerHTML = `
        <div class="card" style="cursor:default;">
          <div class="feedback-badge ${correct ? 'correct' : 'wrong'}">${correct ? 'Correct!' : 'Not quite'}</div>
          <div class="hanzi" style="font-size:34px;">${w.h} <span class="pinyin" style="font-size:16px;">${w.p}</span></div>
          <div class="audio-row"><button class="speak-btn" id="ftSpeakBtn2" aria-label="Play pronunciation">&#128266;</button><span id="ftMicArea2"></span></div>
          <div class="your-answer">You typed: "${typedAnswer}"</div>
          <div class="back-english">${w.e}</div>
          <div class="mnemonic">${w.m}</div>
        </div>
        <div class="controls"><button class="nav-btn" id="ftNextBtn">${isLast ? 'see results →' : 'next word →'}</button></div>
      `;
      const speakBtn2 = root.querySelector('#ftSpeakBtn2');
      speakBtn2.onclick = () => Speech.speak(w.h, speakBtn2);
      Recorder.mountMicButton(root.querySelector('#ftMicArea2'), w.h);
      root.querySelector('#ftNextBtn').onclick = () => advanceRound();
    }

    const missedSoFar = (roundIndex + (answered ? 1 : 0)) - correctCount;
    root.querySelector('#ftStatsRow').innerHTML = `<span><b>${correctCount}</b> correct</span><span><b>${missedSoFar}</b> missed</span><span><b>${total}</b> total</span>`;
  }

  function mount(container, forBook, navigate) {
    root = container;
    goTo = navigate || null;
    book = forBook || Storage.getCurrentBook();
    started = false;
    root.innerHTML = html();
    buildAutoplayToggle();
    Speech.buildSpeedControl(root.querySelector('#ftSpeedRow'));
    render();
    root.querySelector('#ftResetBtn').onclick = () => { newRound(); render(); };
  }

  return { mount };
})();
