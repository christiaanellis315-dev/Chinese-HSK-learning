// Grammar Notes screen: the textbook's own 注释 sections, organized by lesson (3-15; lessons
// 1-2 have none). Structured like the Pinyin Reference and Numbers screens — its own top-level
// area with lesson tabs — rather than nested inside a lesson mode. Each grammar point is an
// expandable card; content comes straight from data/<book>/grammar/lesson-*.js and is rendered
// as-is, with pinyin + a speaker button added to every hanzi example sentence per the app's
// pinyin rule. An example's English translation (when present) sits gated behind the same
// expand action as everything else in the card — there's no separate front/back state here
// the way Flip & Recall has, so expanding *is* the reveal.
const Grammar = (() => {
  let root = null;
  let currentBook = 'hsk1';
  let currentLesson = null;
  const openCards = {};

  function html() {
    return `
      <div class="lamp"></div>
      <h1>Grammar Notes</h1>
      <div class="sub">The textbook's 注释 sections, lesson by lesson — tap a point to expand it</div>
      <div class="top-row" id="speedRow"></div>
      <div class="tabs" id="tabs"></div>
      <div id="content"></div>
    `;
  }

  function buildTabs() {
    const el = root.querySelector('#tabs');
    el.innerHTML = '';
    Books.getGrammarOrder(currentBook).forEach((key) => {
      const b = document.createElement('div');
      b.className = 'tab' + (key === currentLesson ? ' active' : '');
      b.textContent = 'L' + key;
      b.onclick = () => { currentLesson = key; buildTabs(); render(); };
      el.appendChild(b);
    });
  }

  function renderTable(table) {
    if (!table) return '';
    const headerRow = table.headers.map((h) => `<th>${h}</th>`).join('');
    const bodyRows = table.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
    return `<div class="gc-table-wrap"><table class="gc-table"><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
  }

  function renderExamples(examples) {
    if (!examples || !examples.length) return '';
    const rows = examples.map((ex) => `
      <div class="gc-example">
        ${ex.speak ? '<button class="speak-btn" aria-label="Play pronunciation">&#128266;</button>' : ''}
        <div class="gc-example-text">
          <div class="gc-example-raw">${ex.raw}</div>
          ${ex.pinyin ? `<div class="gc-example-pinyin">${ex.pinyin}</div>` : ''}
          ${ex.en ? `<div class="gc-example-en">${ex.en}</div>` : ''}
        </div>
      </div>
    `).join('');
    return `<div class="gc-examples-title">Examples</div>${rows}`;
  }

  function renderBlock(block) {
    let out = '';
    if (block.chinese) out += `<div class="gc-zh-text">${block.chinese}</div>`;
    if (block.english) out += `<div class="gc-en-text">${block.english}</div>`;
    if (block.table) out += renderTable(block.table);
    if (block.examples) out += renderExamples(block.examples);
    if (block.note) out += `<div class="gc-note">${block.note}</div>`;
    return `<div class="gc-block">${out}</div>`;
  }

  function render() {
    const content = root.querySelector('#content');
    const points = Books.getGrammar(currentBook, currentLesson);
    const titleParts = lessonTitleParts(currentBook, currentLesson);

    content.innerHTML = `
      <div class="mastery-list-title" style="margin-top:6px;">Lesson ${currentLesson} · ${titleParts.hanzi} ${titleParts.pinyin}</div>
      ${points.map((pt) => {
        const uid = currentLesson + '-' + pt.num;
        const isOpen = !!openCards[uid];
        return `
          <div class="grammar-card ${isOpen ? 'open' : ''}" data-uid="${uid}">
            <div class="grammar-card-header">
              <div>
                <div class="gc-zh">${pt.num}. ${pt.zh}</div>
                ${pt.zhP ? `<div class="gc-zh-p">${pt.zhP}</div>` : ''}
                <div class="gc-en">${pt.en}</div>
              </div>
              <div class="gc-chevron">&#9654;</div>
            </div>
            <div class="grammar-card-body">${pt.blocks.map(renderBlock).join('')}</div>
          </div>
        `;
      }).join('')}
    `;

    content.querySelectorAll('.grammar-card').forEach((card) => {
      const header = card.querySelector('.grammar-card-header');
      header.onclick = () => {
        const uid = card.dataset.uid;
        openCards[uid] = !openCards[uid];
        card.classList.toggle('open', openCards[uid]);
      };
    });

    // Wire every example's speaker button, in document order (matches the flat list of
    // *audio-bearing* examples they were rendered in, so no id bookkeeping needed). Examples
    // without a `speak` field (e.g. phone-number readings, which have no hanzi to pronounce)
    // render no button at all, so they're excluded here too, keeping the two lists in lockstep.
    let exIdx = 0;
    const audibleExamples = [];
    points.forEach((pt) => pt.blocks.forEach((b) => (b.examples || []).forEach((ex) => { if (ex.speak) audibleExamples.push(ex); })));
    content.querySelectorAll('.gc-example .speak-btn').forEach((btn) => {
      const ex = audibleExamples[exIdx++];
      btn.onclick = (e) => { e.stopPropagation(); Speech.speak(ex.speak, btn); };
    });
  }

  function renderEmptyBook() {
    root.innerHTML = `
      <div class="lamp"></div>
      <h1>Grammar Notes</h1>
      <div class="sub">${Books.bookLabel(currentBook)} — no grammar notes yet</div>
      <div class="soon-box">${Books.bookLabel(currentBook)} grammar notes haven't been added yet.<br>Switch books above to keep studying in the meantime.</div>
    `;
  }

  function mount(container) {
    root = container;
    currentBook = Storage.getCurrentBook();

    if (!Books.hasGrammar(currentBook)) {
      currentLesson = null;
      renderEmptyBook();
      return;
    }

    currentLesson = Books.getGrammarOrder(currentBook)[0];
    root.innerHTML = html();
    Speech.buildSpeedControl(root.querySelector('#speedRow'));
    buildTabs();
    render();
  }

  return { mount };
})();
