// Dashboard screen: streak, daily goal, per-lesson mastery, continue shortcut,
// and the entry point into the spaced-repetition Review queue.
const Dashboard = (() => {
  let root = null;
  let goTo = null;

  function lessonMastery(lessonId) {
    const words = LESSONS[lessonId].words;
    let known = 0;
    words.forEach(w => { if (Storage.itemStatus(Storage.wordItemId(lessonId, w.h)) === 'known') known++; });
    return { known, total: words.length };
  }

  // How many words + listening items have an SRS due date that's already passed — this is
  // exactly what the Review screen's queue will contain, shown here so the schedule feels
  // visible rather than a black box deciding things behind the scenes.
  function countDueItems() {
    let n = 0;
    const now = Date.now();
    LESSON_ORDER.forEach(lessonId => {
      LESSONS[lessonId].words.forEach(w => {
        const rec = Storage.getSrsRecord(Storage.wordItemId(lessonId, w.h));
        if (rec && rec.due <= now) n++;
      });
      (LESSONS[lessonId].listening || []).forEach((it, idx) => {
        const rec = Storage.getSrsRecord(Storage.listenItemId(lessonId, idx));
        if (rec && rec.due <= now) n++;
      });
      (LESSONS[lessonId].sentenceBuilder || []).forEach((it, idx) => {
        const rec = Storage.getSrsRecord(Storage.buildItemId(lessonId, idx));
        if (rec && rec.due <= now) n++;
      });
    });
    return n;
  }

  function html() {
    const streak = Storage.getStreak();
    const goal = Storage.getDailyGoal();
    const goalPct = Math.min(100, Math.round((goal.completedToday / goal.target) * 100));
    const dueCount = countDueItems();
    const last = Storage.getLastPosition();

    const modeLabel = { flip: 'Flip & recall', type: 'Type the answer', listen: 'Listening (A/B/C)', build: 'Sentence Builder' };

    return `
      <div class="lamp"></div>
      <h1>Chinese Study</h1>
      <div class="sub">Your HSK1 progress at a glance</div>

      <div class="dash-grid">
        <div class="dash-card">
          <div class="big-num">${streak.count > 0 ? '🔥 ' + streak.count : '—'}</div>
          <div class="dash-label">${streak.count > 0 ? 'day streak' : 'start your streak today'}</div>
        </div>
        <div class="dash-card">
          <div class="big-num">${goal.completedToday}/${goal.target}</div>
          <div class="dash-label">today's reviews</div>
          <div class="goal-bar-wrap"><div class="goal-bar-fill" style="width:${goalPct}%"></div></div>
        </div>
      </div>

      <div class="review-cta ${dueCount === 0 ? 'empty' : ''}" id="reviewCta">
        <div>
          <div class="rc-title">${dueCount > 0 ? dueCount + ' due for review' : 'Nothing due right now'}</div>
          <div class="rc-sub">${dueCount > 0 ? 'Words and listening questions due today, pulled from every lesson' : 'Study a lesson to get words into the review schedule'}</div>
        </div>
        <div class="rc-arrow">${dueCount > 0 ? '→' : ''}</div>
      </div>

      <div class="continue-card" id="continueCard">
        <div>
          <div class="cc-title">Continue where you left off</div>
          <div class="cc-sub">${last ? 'Lesson ' + last.lesson + ' · ' + (modeLabel[last.mode] || last.mode) : 'Lesson 1 · Flip & recall'}</div>
        </div>
        <div class="rc-arrow">→</div>
      </div>

      <div class="mastery-list-title">Lessons</div>
      <div class="mastery-grid" id="masteryGrid"></div>
    `;
  }

  function buildMasteryGrid() {
    const grid = root.querySelector('#masteryGrid');
    grid.innerHTML = '';
    LESSON_ORDER.forEach(lessonId => {
      const { known, total } = lessonMastery(lessonId);
      const pct = Math.round((known / total) * 100);
      const titleParts = lessonTitleParts(lessonId);
      const pill = document.createElement('div');
      pill.className = 'mastery-pill';
      pill.innerHTML = `
        <div class="mp-title">L${lessonId} · ${titleParts.hanzi} <span class="mp-pinyin">${titleParts.pinyin}</span></div>
        <div class="mp-bar-wrap"><div class="mp-bar-fill" style="width:${pct}%"></div></div>
        <div class="mp-frac">${known}/${total} known</div>
      `;
      pill.onclick = () => goTo('lessons', { lesson: lessonId, mode: 'flip' });
      grid.appendChild(pill);
    });
  }

  function mount(container, navigate) {
    root = container;
    goTo = navigate;
    root.innerHTML = html();
    buildMasteryGrid();

    const dueCount = countDueItems();
    root.querySelector('#reviewCta').onclick = () => { if (dueCount > 0) goTo('review'); };

    const last = Storage.getLastPosition();
    root.querySelector('#continueCard').onclick = () => {
      goTo('lessons', last || { lesson: LESSON_ORDER[0], mode: 'flip' });
    };
  }

  return { mount };
})();
