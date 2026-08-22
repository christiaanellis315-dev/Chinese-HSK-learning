// Book-aware content registry. Replaces the old single global LESSONS/LESSON_ORDER/GRAMMAR/
// GRAMMAR_LESSON_ORDER objects (which only ever held HSK1) with a registry that any number of
// books can add to. Each per-book, per-lesson data file (data/<book>/lessons/lesson-NN.js,
// data/<book>/grammar/lesson-NN.js) calls registerLesson()/registerGrammar() on load — nothing
// here hardcodes what books or lessons exist beyond the 3-book list itself, so adding HSK2/HSK3
// content later is just adding files, never editing this one.
//
// Must load before any data/<book>/... file and before any js/*.js screen module.
const Books = (() => {
  const BOOK_META = [
    { id: 'hsk1', label: 'HSK1' },
    { id: 'hsk2', label: 'HSK2' },
    { id: 'hsk3', label: 'HSK3' },
  ];

  const books = {}; // bookId -> { lessonOrder: [], lessons: {}, grammarOrder: [], grammar: {} }
  function ensureBook(bookId) {
    if (!books[bookId]) books[bookId] = { lessonOrder: [], lessons: {}, grammarOrder: [], grammar: {} };
    return books[bookId];
  }

  function registerLesson(bookId, lessonId, data) {
    const b = ensureBook(bookId);
    if (!(lessonId in b.lessons)) b.lessonOrder.push(lessonId);
    b.lessons[lessonId] = data;
  }

  function registerGrammar(bookId, lessonId, points) {
    const b = ensureBook(bookId);
    if (!(lessonId in b.grammar)) b.grammarOrder.push(lessonId);
    b.grammar[lessonId] = points;
  }

  function listBooks() { return BOOK_META; }
  function bookLabel(bookId) {
    const m = BOOK_META.find((b) => b.id === bookId);
    return m ? m.label : bookId;
  }

  function getLessonOrder(bookId) { return ensureBook(bookId).lessonOrder; }
  function getLessons(bookId) { return ensureBook(bookId).lessons; }
  function getLesson(bookId, lessonId) { return ensureBook(bookId).lessons[lessonId]; }
  function hasContent(bookId) { return getLessonOrder(bookId).length > 0; }

  function getGrammarOrder(bookId) { return ensureBook(bookId).grammarOrder; }
  function getGrammar(bookId, lessonId) { return ensureBook(bookId).grammar[lessonId] || []; }
  function hasGrammar(bookId) { return getGrammarOrder(bookId).length > 0; }

  return {
    registerLesson, registerGrammar,
    listBooks, bookLabel,
    getLessonOrder, getLessons, getLesson, hasContent,
    getGrammarOrder, getGrammar, hasGrammar,
  };
})();

// Splits a lesson's "title" ("你好 (Hello)") into its hanzi and English-gloss parts, and pairs
// it with titleP. Design rule: any hanzi shown on screen must have its pinyin shown alongside it —
// lesson titles are hanzi, so every place a title is displayed must go through this helper.
function lessonTitleParts(bookId, lessonId) {
  const lesson = Books.getLesson(bookId, lessonId);
  const m = lesson.title.match(/^(.*?)\s*(\(.*\))$/);
  return {
    hanzi: m ? m[1] : lesson.title,
    pinyin: lesson.titleP || '',
    english: m ? m[2] : '',
  };
}
