// Unified persistence layer, backed by real localStorage (works fully offline, shared across
// every screen of the app). Replaces the old per-file `window.storage` sandbox API.
const Storage = (() => {
  const memoryFallback = {};
  let storageOk = true;
  try {
    const t = '__hsk_test__';
    localStorage.setItem(t, '1');
    localStorage.removeItem(t);
  } catch (e) { storageOk = false; }

  function readRaw(key, fallback) {
    try {
      if (!storageOk) return memoryFallback[key] !== undefined ? memoryFallback[key] : fallback;
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function writeRaw(key, value) {
    try {
      if (!storageOk) { memoryFallback[key] = value; return; }
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { memoryFallback[key] = value; }
  }

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function yesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // ===== spaced repetition (Leitner, 5 boxes) =====
  // One shared schedule per item, regardless of which mode (Flip, Type, Listening, ...) touches
  // it — this is the whole point: getting a word right in Type mode should push out its next
  // Flip-mode appearance too, not just its Type-mode one.
  //
  // Box N's interval is BOX_INTERVAL_DAYS[N-1]. Correct answer -> promote a box (longer wait).
  // Wrong answer -> straight back to box 1 (resurfaces tomorrow). A brand-new item has no record
  // at all; it's implicitly "box 1" until its first answer creates one.
  const BOX_INTERVAL_DAYS = [1, 2, 4, 9, 18];
  const DAY_MS = 24 * 60 * 60 * 1000;

  // Item ids are namespaced by book (only "hsk1" exists today) and item type, so this scales to
  // HSK2+ later without collisions or a storage rework — a future book just calls these same
  // builders with its own book prefix (or its own analogous wordItemId/listenItemId pair) and
  // lands in the same 'hsk:srs' store alongside HSK1's items.
  const BOOK = 'hsk1';
  function wordItemId(lessonId, hanzi) { return BOOK + ':word:' + lessonId + ':' + hanzi; }
  function listenItemId(lessonId, idx) { return BOOK + ':listen:' + lessonId + ':' + idx; }

  function getSrs() { return readRaw('hsk:srs', {}); }
  function setSrs(s) { writeRaw('hsk:srs', s); }

  // Returns null for an item that's never been answered — distinct from a real box-1 record,
  // so callers (e.g. the Review queue) can tell "never studied" apart from "due again."
  function getSrsRecord(itemId) {
    const srs = getSrs();
    return srs[itemId] || null;
  }

  function recordSrsResult(itemId, correct) {
    const srs = getSrs();
    const curBox = (srs[itemId] && srs[itemId].box) || 1;
    const newBox = correct ? Math.min(curBox + 1, 5) : 1;
    const now = Date.now();
    srs[itemId] = { box: newBox, due: now + BOX_INTERVAL_DAYS[newBox - 1] * DAY_MS, lastReviewed: now };
    setSrs(srs);
    recordActivity();
  }

  function isDue(itemId) {
    const rec = getSrsRecord(itemId);
    return !!rec && rec.due <= Date.now();
  }

  // Derived display status, used anywhere the old known/learning/not-reviewed language still
  // makes sense (mastery pills, in-lesson stats rows): box 1 reads as "still learning" (hasn't
  // graduated its first box yet), box 2+ reads as "known".
  function itemStatus(itemId) {
    const rec = getSrsRecord(itemId);
    if (!rec) return 'new';
    return rec.box >= 2 ? 'known' : 'learning';
  }

  // Wipes every SRS record for a lesson (both its vocab words and its listening items) —
  // backs the "Reset progress for this lesson" control. Since scheduling is shared across
  // modes now, there's no more per-mode reset, only per-lesson.
  function clearLessonSrs(lessonId) {
    const srs = getSrs();
    const wordPrefix = BOOK + ':word:' + lessonId + ':';
    const listenPrefix = BOOK + ':listen:' + lessonId + ':';
    Object.keys(srs).forEach((id) => {
      if (id.indexOf(wordPrefix) === 0 || id.indexOf(listenPrefix) === 0) delete srs[id];
    });
    setSrs(srs);
  }

  // ---- one-time migration from the old per-mode "known/learning" progress dict ----
  // Old shape: { [lessonId]: { flip: {hanzi: status}, type: {hanzi: status}, listen: {key: status} } }
  // Seeds an initial SRS record for anything already marked, so upgrading doesn't erase study
  // history: 'known' seeds box 2 (due per that box's interval), 'learning' seeds box 1 (due now).
  function migrateToSrsIfNeeded() {
    if (readRaw('hsk:srsMigrated', false)) return;
    const old = readRaw('hsk:progress', {});
    const srs = getSrs();
    const now = Date.now();
    Object.keys(old).forEach((lessonId) => {
      const lp = old[lessonId] || {};
      const flip = lp.flip || {};
      const type = lp.type || {};
      const wordKeys = Object.keys(flip).concat(Object.keys(type)).filter((k, i, arr) => arr.indexOf(k) === i);
      wordKeys.forEach((hanzi) => {
        const id = wordItemId(lessonId, hanzi);
        if (srs[id]) return;
        const known = flip[hanzi] === 'known' || type[hanzi] === 'known';
        const box = known ? 2 : 1;
        srs[id] = { box, due: known ? now + BOX_INTERVAL_DAYS[box - 1] * DAY_MS : now, lastReviewed: now };
      });
      const listen = lp.listen || {};
      Object.keys(listen).forEach((key) => {
        const idx = key.slice(String(lessonId).length + 1);
        const id = listenItemId(lessonId, idx);
        if (srs[id]) return;
        const known = listen[key] === 'known';
        const box = known ? 2 : 1;
        srs[id] = { box, due: known ? now + BOX_INTERVAL_DAYS[box - 1] * DAY_MS : now, lastReviewed: now };
      });
    });
    setSrs(srs);
    writeRaw('hsk:srsMigrated', true);
  }
  migrateToSrsIfNeeded();

  // ---- daily goal + streak ----
  function getDailyGoal() {
    let g = readRaw('hsk:dailyGoal', { target: 15, completedToday: 0, date: todayStr() });
    if (g.date !== todayStr()) g = { target: g.target || 15, completedToday: 0, date: todayStr() };
    return g;
  }
  function getStreak() { return readRaw('hsk:streak', { count: 0, lastGoalDate: null }); }

  function recordActivity() {
    const g = getDailyGoal();
    g.completedToday += 1;
    writeRaw('hsk:dailyGoal', g);
    if (g.completedToday >= g.target) {
      const streak = getStreak();
      const today = todayStr();
      if (streak.lastGoalDate !== today) {
        streak.count = (streak.lastGoalDate === yesterdayStr()) ? streak.count + 1 : 1;
        streak.lastGoalDate = today;
        writeRaw('hsk:streak', streak);
      }
    }
  }

  // ---- autoplay toggles (separate semantics: lessons = "on card open", pinyin = "on tab switch") ----
  function getAutoplay(section) { return readRaw('hsk:autoplay:' + section, section === 'lessons'); }
  function setAutoplay(section, val) { writeRaw('hsk:autoplay:' + section, val); }

  // ---- shared voice preference (used by lessons, review, numbers, and pinyin reference) ----
  // Default rate is "Slow" (0.6) — beginners consistently found Listening mode's old fixed
  // 0.75 rate too fast; better to start slow and let the person speed up than the reverse.
  function getVoicePref() { return readRaw('hsk:voice', { index: 0, rate: 0.6 }); }
  function setVoicePref(pref) { writeRaw('hsk:voice', pref); }

  // ---- "continue where you left off" ----
  function getLastPosition() { return readRaw('hsk:lastPosition', null); }
  function setLastPosition(pos) { writeRaw('hsk:lastPosition', pos); }

  // ---- in-progress session state (the "Go" screen's resume data) ----
  // One flat store, keyed by a caller-chosen string — lessons.js uses "lessons:<lesson>:<mode>"
  // (one slot per lesson+mode combination), numbers.js uses the single key "numbers" (its round
  // isn't lesson-scoped). Shape is whatever the caller needs (card index, round state, etc.) —
  // this is just the save slot, not opinionated about what's in it.
  function getSessions() { return readRaw('hsk:sessions', {}); }
  function setSessions(s) { writeRaw('hsk:sessions', s); }
  function getSession(key) { return getSessions()[key] || null; }
  function setSession(key, data) { const s = getSessions(); s[key] = data; setSessions(s); }
  function clearSession(key) { const s = getSessions(); delete s[key]; setSessions(s); }

  return {
    wordItemId, listenItemId, getSrsRecord, recordSrsResult, isDue, itemStatus, clearLessonSrs,
    getDailyGoal, getStreak, recordActivity,
    getAutoplay, setAutoplay,
    getVoicePref, setVoicePref,
    getLastPosition, setLastPosition,
    getSession, setSession, clearSession,
  };
})();
