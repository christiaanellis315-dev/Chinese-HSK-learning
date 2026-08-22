// Review screen: the daily spaced-repetition entry point. Pulls every word AND listening item,
// across all 15 lessons, whose shared SRS schedule says it's due right now — not "pick a lesson
// and start from card 1," but "here's what you should practice today." Getting an item right
// pushes its next appearance further out; getting it wrong drops it back to a 1-day box, so it
// resurfaces here again tomorrow.
const Review = (() => {
  let root = null;
  let currentBook = 'hsk1';
  let queue = [];
  let flipped = false; // word items: card face
  let selectedOpt = null; // listen items: chosen option, or null if unanswered
  let buildBank = []; // build items: shuffled tile pool for the current item
  let builtIds = []; // build items: tile ids tapped so far, in order
  let buildSubmitted = false;
  let buildCorrect = null;
  let buildAutoplayed = false; // has the prompt already auto-played for this item?
  let sessionReviewed = 0;
  let sessionKnown = 0;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function newBuildBank(item) {
    const bank = item.tiles.map((t, i) => ({ id: 'a' + i, h: t.h, p: t.p }))
      .concat(item.decoys.map((t, i) => ({ id: 'd' + i, h: t.h, p: t.p })));
    return shuffle(bank);
  }

  // Resets the tile-builder state for whatever is now at the front of the queue — called
  // whenever the current item changes (initial mount, or after advance() shifts the queue).
  function prepBuildState() {
    builtIds = []; buildSubmitted = false; buildCorrect = null; buildAutoplayed = false;
    const current = queue[0];
    buildBank = (current && current.type === 'build') ? newBuildBank(current.item) : [];
  }

  // Empty for a book with no lessons yet (HSK2/HSK3 today) — Books.getLessonOrder just returns
  // [], so this naturally yields an empty queue and the existing "Nothing due right now" state
  // handles it with no extra code.
  function buildQueue() {
    const items = [];
    const now = Date.now();
    Books.getLessonOrder(currentBook).forEach((lessonId) => {
      const lesson = Books.getLesson(currentBook, lessonId);
      lesson.words.forEach((w) => {
        const itemId = Storage.wordItemId(currentBook, lessonId, w.h);
        const rec = Storage.getSrsRecord(itemId);
        if (rec && rec.due <= now) items.push({ type: 'word', lessonId, word: w, itemId });
      });
      (lesson.listening || []).forEach((it, idx) => {
        const itemId = Storage.listenItemId(currentBook, lessonId, idx);
        const rec = Storage.getSrsRecord(itemId);
        if (rec && rec.due <= now) items.push({ type: 'listen', lessonId, item: it, itemId });
      });
      (lesson.sentenceBuilder || []).forEach((it, idx) => {
        const itemId = Storage.buildItemId(currentBook, lessonId, idx);
        const rec = Storage.getSrsRecord(itemId);
        if (rec && rec.due <= now) items.push({ type: 'build', lessonId, item: it, itemId });
      });
    });
    return shuffle(items);
  }

  function html() {
    return `
      <div class="lamp"></div>
      <h1>Review</h1>
      <div class="sub">Everything due for review right now, pulled from every ${Books.bookLabel(currentBook)} lesson</div>
      <div class="progress-row">
        <span id="posLabel"></span>
        <span id="lessonLabel"></span>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
      <div id="cardArea"></div>
    `;
  }

  function advance() {
    queue.shift();
    flipped = false;
    selectedOpt = null;
    prepBuildState();
    renderCurrent();
  }

  function renderWordItem(cardArea, current) {
    const { word, itemId } = current;
    if (!flipped) {
      Lessons.renderFlashcard(cardArea, word, false, {
        onToggle: () => { flipped = true; renderCurrent(); },
        wireControls: () => {}
      });
    } else {
      const controlsHtml = `
        <div class="controls">
          <button class="nav-btn learning" id="learnBtn">still learning</button>
          <button class="nav-btn know" id="knowBtn">I know this</button>
        </div>`;
      Lessons.renderFlashcard(cardArea, word, true, {
        controlsHtml,
        onToggle: () => { flipped = false; renderCurrent(); },
        wireControls: () => {
          root.querySelector('#knowBtn').onclick = (e) => {
            e.stopPropagation();
            Storage.recordSrsResult(itemId, true);
            sessionReviewed++; sessionKnown++;
            advance();
          };
          root.querySelector('#learnBtn').onclick = (e) => {
            e.stopPropagation();
            Storage.recordSrsResult(itemId, false);
            sessionReviewed++;
            advance();
          };
        }
      });
    }
  }

  function renderListenItem(cardArea, current) {
    const { item, itemId } = current;
    if (selectedOpt === null) {
      Lessons.renderListenQuestion(cardArea, item, null, {
        autoplay: Storage.getAutoplay('lessons'),
        onSelect: (i) => {
          const correct = i === item.correct;
          Storage.recordSrsResult(itemId, correct);
          selectedOpt = i;
          sessionReviewed++; if (correct) sessionKnown++;
          renderCurrent();
        },
        wireControls: () => {}
      });
    } else {
      const controlsHtml = `<div class="controls"><button class="nav-btn" id="nextReviewBtn">next &rarr;</button></div>`;
      Lessons.renderListenQuestion(cardArea, item, selectedOpt, {
        controlsHtml,
        wireControls: () => {
          root.querySelector('#nextReviewBtn').onclick = () => advance();
        }
      });
    }
  }

  function renderBuildItem(cardArea, current) {
    const { item, itemId } = current;
    if (!buildSubmitted) {
      const shouldAutoplay = Storage.getAutoplay('lessons') && !buildAutoplayed;
      if (shouldAutoplay) buildAutoplayed = true;
      Lessons.renderBuildQuestion(cardArea, item, { bankTiles: buildBank, builtIds, submitted: false }, {
        autoplay: shouldAutoplay,
        onTapTile: (id) => { builtIds.push(id); renderCurrent(); },
        onRemoveBuilt: (pos) => { builtIds.splice(pos, 1); renderCurrent(); },
        onSubmit: () => {
          const builtHanzi = builtIds.map((id) => buildBank.find((t) => t.id === id).h);
          const answerHanzi = item.tiles.map((t) => t.h);
          const correct = Lessons.checkBuildAnswer(builtHanzi, answerHanzi);
          Storage.recordSrsResult(itemId, correct);
          buildCorrect = correct;
          buildSubmitted = true;
          sessionReviewed++; if (correct) sessionKnown++;
          renderCurrent();
        },
        wireControls: () => {}
      });
    } else {
      const controlsHtml = `<div class="controls"><button class="nav-btn" id="nextReviewBtn">next &rarr;</button></div>`;
      Lessons.renderBuildQuestion(cardArea, item, { bankTiles: buildBank, builtIds, submitted: true, correct: buildCorrect }, {
        controlsHtml,
        wireControls: () => {
          root.querySelector('#nextReviewBtn').onclick = () => advance();
        }
      });
    }
  }

  function renderCurrent() {
    const totalStart = queue.length + sessionReviewed;
    if (queue.length === 0) {
      root.querySelector('#posLabel').textContent = '';
      root.querySelector('#lessonLabel').textContent = '';
      root.querySelector('#progressFill').style.width = '100%';
      root.querySelector('#cardArea').innerHTML = `
        <div class="review-summary">
          <div class="rs-emoji">${sessionReviewed > 0 ? '✨' : '👍'}</div>
          <div class="rs-title">${sessionReviewed > 0 ? 'All caught up!' : 'Nothing due right now'}</div>
          <div class="rs-sub">${sessionReviewed > 0
            ? `You reviewed ${sessionReviewed} item${sessionReviewed === 1 ? '' : 's'} this session, ${sessionKnown} correct.`
            : 'Words and listening questions land here as they come due. Study a lesson to get things into the schedule, then come back.'}</div>
        </div>
      `;
      return;
    }
    const current = queue[0];
    const typeLabel = { listen: 'Listening · Lesson ', build: 'Sentence Builder · Lesson ' };
    root.querySelector('#posLabel').textContent = (sessionReviewed + 1) + ' of ' + totalStart;
    root.querySelector('#lessonLabel').textContent = (typeLabel[current.type] || 'Vocabulary · Lesson ') + current.lessonId;
    root.querySelector('#progressFill').style.width = ((sessionReviewed / totalStart) * 100) + '%';

    const cardArea = root.querySelector('#cardArea');
    if (current.type === 'word') renderWordItem(cardArea, current);
    else if (current.type === 'listen') renderListenItem(cardArea, current);
    else renderBuildItem(cardArea, current);
  }

  function mount(container) {
    root = container;
    currentBook = Storage.getCurrentBook();
    queue = buildQueue();
    flipped = false;
    selectedOpt = null;
    sessionReviewed = 0;
    sessionKnown = 0;
    prepBuildState();
    root.innerHTML = html();
    renderCurrent();
  }

  return { mount };
})();
