// Review screen: unified weak-word queue. Pulls every word marked "still learning" in either
// Flip or Type mode, across all 15 lessons, into one shuffled deck — the main "better than
// Duolingo" piece: weak words resurface regardless of which lesson they came from.
const Review = (() => {
  let root = null;
  let queue = [];
  let flipped = false;
  let sessionReviewed = 0;
  let sessionKnown = 0;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildQueue() {
    const items = [];
    LESSON_ORDER.forEach(lessonId => {
      const flip = Storage.getModeProgress(lessonId, 'flip');
      const type = Storage.getModeProgress(lessonId, 'type');
      LESSONS[lessonId].words.forEach(w => {
        if (flip[w.h] === 'learning' || type[w.h] === 'learning') {
          items.push({ lessonId, word: w });
        }
      });
    });
    return shuffle(items);
  }

  function html() {
    return `
      <div class="lamp"></div>
      <h1>Review weak words</h1>
      <div class="sub">Pulled from every lesson — mark each one as you go</div>
      <div class="progress-row">
        <span id="posLabel"></span>
        <span id="lessonLabel"></span>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
      <div id="cardArea"></div>
    `;
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
          <div class="rs-title">${sessionReviewed > 0 ? 'Queue cleared!' : 'Nothing to review right now'}</div>
          <div class="rs-sub">${sessionReviewed > 0 ? `You reviewed ${sessionReviewed} word${sessionReviewed === 1 ? '' : 's'} this session, ${sessionKnown} now marked known.` : 'Words you mark "still learning" in Flip or Type mode will show up here.'}</div>
        </div>
      `;
      return;
    }
    const { lessonId, word } = queue[0];
    root.querySelector('#posLabel').textContent = (sessionReviewed + 1) + ' of ' + totalStart;
    root.querySelector('#lessonLabel').textContent = 'from Lesson ' + lessonId;
    root.querySelector('#progressFill').style.width = ((sessionReviewed / totalStart) * 100) + '%';

    const cardArea = root.querySelector('#cardArea');
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
            Storage.setWordKnownEverywhere(lessonId, word.h);
            Storage.recordActivity();
            sessionReviewed++; sessionKnown++;
            queue.shift();
            flipped = false;
            renderCurrent();
          };
          root.querySelector('#learnBtn').onclick = (e) => {
            e.stopPropagation();
            Storage.setWordLearningFlip(lessonId, word.h);
            Storage.recordActivity();
            sessionReviewed++;
            const item = queue.shift();
            queue.push(item);
            flipped = false;
            renderCurrent();
          };
        }
      });
    }
  }

  function mount(container) {
    root = container;
    queue = buildQueue();
    flipped = false;
    sessionReviewed = 0;
    sessionKnown = 0;
    root.innerHTML = html();
    renderCurrent();
  }

  return { mount };
})();
