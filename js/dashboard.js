// Dashboard screen: streak, daily goal, per-lesson mastery, continue shortcut,
// and the entry point into the unified weak-word Review queue.
const Dashboard = (() => {
  let root = null;
  let goTo = null;

  function wordKnownStatus(lessonId, hanzi) {
    const flip = Storage.getModeProgress(lessonId, 'flip');
    const type = Storage.getModeProgress(lessonId, 'type');
    if (flip[hanzi] === 'known' || type[hanzi] === 'known') return 'known';
    if (flip[hanzi] === 'learning' || type[hanzi] === 'learning') return 'learning';
    return 'new';
  }

  function lessonMastery(lessonId) {
    const words = LESSONS[lessonId].words;
    let known = 0;
    words.forEach(w => { if (wordKnownStatus(lessonId, w.h) === 'known') known++; });
    return { known, total: words.length };
  }

  function countWeakWords() {
    let n = 0;
    LESSON_ORDER.forEach(lessonId => {
      LESSONS[lessonId].words.forEach(w => {
        if (wordKnownStatus(lessonId, w.h) === 'learning') n++;
      });
    });
    return n;
  }

  function html() {
    const streak = Storage.getStreak();
    const goal = Storage.getDailyGoal();
    const goalPct = Math.min(100, Math.round((goal.completedToday / goal.target) * 100));
    const weakCount = countWeakWords();
    const last = Storage.getLastPosition();

    const modeLabel = { flip: 'Flip & recall', type: 'Type the answer', listen: 'Listening (A/B/C)', numbers: 'Numbers 1-99' };

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

      <div class="review-cta ${weakCount === 0 ? 'empty' : ''}" id="reviewCta">
        <div>
          <div class="rc-title">${weakCount > 0 ? 'Review weak words' : 'No weak words yet'}</div>
          <div class="rc-sub">${weakCount > 0 ? weakCount + ' word' + (weakCount === 1 ? '' : 's') + ' marked "still learning," pulled from every lesson' : 'Words you mark "still learning" in Flip or Type mode will show up here'}</div>
        </div>
        <div class="rc-arrow">${weakCount > 0 ? '→' : ''}</div>
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

    const weakCount = countWeakWords();
    root.querySelector('#reviewCta').onclick = () => { if (weakCount > 0) goTo('review'); };

    const last = Storage.getLastPosition();
    root.querySelector('#continueCard').onclick = () => {
      goTo('lessons', last || { lesson: LESSON_ORDER[0], mode: 'flip' });
    };
  }

  return { mount };
})();
