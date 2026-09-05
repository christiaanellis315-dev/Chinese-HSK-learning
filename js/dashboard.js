// Dashboard screen: streak, daily goal, the book selector (HSK1/HSK2/HSK3 — the only place it
// lives), per-lesson mastery, continue shortcut, and the entry point into the spaced-repetition
// Review queue. Every other screen just reads Storage.getCurrentBook() for itself when it mounts.
const Dashboard = (() => {
  let root = null;
  let goTo = null;
  let currentBook = 'hsk1';

  function lessonMastery(lessonId) {
    const words = Books.getLesson(currentBook, lessonId).words;
    let known = 0;
    words.forEach(w => { if (Storage.itemStatus(Storage.wordItemId(currentBook, lessonId, w.h)) === 'known') known++; });
    return { known, total: words.length };
  }

  // How many words + listening items + Sentence Builder exercises, across EVERY book (not just
  // the one currently selected for study), have an SRS due date that's already passed — this must
  // match exactly what the Review screen's queue will contain (Review itself pools all books too;
  // see review.js), so the teaser card here never says "nothing due" while Review actually has
  // items waiting from a book other than the one currently selected, and never blocks the tap into
  // Review because only the current book's count was checked. Naturally 0 for a book with no
  // lessons yet (HSK2/HSK3 today) — Books.getLessonOrder just returns [] for those.
  function countDueItems() {
    let n = 0;
    const now = Date.now();
    Books.listBooks().forEach(({ id: bookId }) => {
      Books.getLessonOrder(bookId).forEach(lessonId => {
        const lesson = Books.getLesson(bookId, lessonId);
        lesson.words.forEach(w => {
          const rec = Storage.getSrsRecord(Storage.wordItemId(bookId, lessonId, w.h));
          if (rec && rec.due <= now) n++;
        });
        (lesson.listening || []).forEach((it, idx) => {
          const rec = Storage.getSrsRecord(Storage.listenItemId(bookId, lessonId, idx));
          if (rec && rec.due <= now) n++;
        });
        (lesson.sentenceBuilder || []).forEach((it, idx) => {
          const rec = Storage.getSrsRecord(Storage.buildItemId(bookId, lessonId, idx));
          if (rec && rec.due <= now) n++;
        });
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
    const hasContent = Books.hasContent(currentBook);

    const modeLabel = { flip: 'Flip & recall', type: 'Type the answer', listen: 'Listening (A/B/C)', build: 'Sentence Builder' };

    const lessonsSectionHtml = hasContent
      ? `<div class="mastery-list-title">Lessons</div><div class="mastery-grid" id="masteryGrid"></div>`
      : `<div class="mastery-list-title">Lessons</div><div class="soon-box">${Books.bookLabel(currentBook)} lessons haven't been added yet.</div>`;

    return `
      <div class="lamp"></div>
      <h1>Chinese Study</h1>
      <div class="sub">Your ${Books.bookLabel(currentBook)} progress at a glance</div>

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

      <div class="mastery-list-title">Studying</div>
      <div class="tabs" id="bookRow"></div>

      ${hasContent ? `
      <div class="continue-card" id="continueCard">
        <div>
          <div class="cc-title">Continue where you left off</div>
          <div class="cc-sub">${last && last.book === currentBook ? 'Lesson ' + last.lesson + ' · ' + (modeLabel[last.mode] || last.mode) : 'Lesson ' + Books.getLessonOrder(currentBook)[0] + ' · Flip & recall'}</div>
        </div>
        <div class="rc-arrow">→</div>
      </div>` : ''}

      ${lessonsSectionHtml}
    `;
  }

  // Picking a book here is a deliberate "start fresh" action, not something you'd do mid-
  // flashcard — so it lives on Dashboard only (reused .tabs/.tab styling, same as Lessons'/
  // Grammar's own tab rows) rather than cluttering every screen's header. Every other screen
  // just reads Storage.getCurrentBook() for itself the next time it's opened, so nothing else
  // needs to know this row exists.
  function buildBookRow() {
    const row = root.querySelector('#bookRow');
    row.innerHTML = Books.listBooks().map(b => `
      <div class="tab ${b.id === currentBook ? 'active' : ''}" data-id="${b.id}">${b.label}</div>
    `).join('');
    row.querySelectorAll('.tab').forEach(t => {
      t.onclick = () => {
        if (t.dataset.id === currentBook) return;
        Storage.setCurrentBook(t.dataset.id);
        mount(root, goTo); // full refresh — mastery grid, due count, continue card all depend on the book
      };
    });
  }

  function buildMasteryGrid() {
    const grid = root.querySelector('#masteryGrid');
    if (!grid) return; // no grid rendered when the current book has no lessons yet
    grid.innerHTML = '';
    Books.getLessonOrder(currentBook).forEach(lessonId => {
      const { known, total } = lessonMastery(lessonId);
      const pct = Math.round((known / total) * 100);
      const titleParts = lessonTitleParts(currentBook, lessonId);
      const pill = document.createElement('div');
      pill.className = 'mastery-pill';
      pill.innerHTML = `
        <div class="mp-title">L${lessonId} · ${titleParts.hanzi} <span class="mp-pinyin">${titleParts.pinyin}</span></div>
        <div class="mp-bar-wrap"><div class="mp-bar-fill" style="width:${pct}%"></div></div>
        <div class="mp-frac">${known}/${total} known</div>
      `;
      pill.onclick = () => goTo('lessons', { book: currentBook, lesson: lessonId, mode: 'flip' });
      grid.appendChild(pill);
    });
  }

  function mount(container, navigate) {
    root = container;
    goTo = navigate;
    currentBook = Storage.getCurrentBook();
    root.innerHTML = html();
    buildBookRow();
    buildMasteryGrid();

    const dueCount = countDueItems();
    root.querySelector('#reviewCta').onclick = () => { if (dueCount > 0) goTo('review'); };

    const continueCard = root.querySelector('#continueCard');
    if (continueCard) {
      const last = Storage.getLastPosition();
      continueCard.onclick = () => {
        goTo('lessons', (last && last.book === currentBook) ? last : { book: currentBook, lesson: Books.getLessonOrder(currentBook)[0], mode: 'flip' });
      };
    }
  }

  return { mount };
})();
