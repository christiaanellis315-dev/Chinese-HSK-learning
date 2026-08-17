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

  // ---- progress: { [lessonId]: { flip: {key: status}, type: {...}, listen: {...} } } ----
  function getProgress() { return readRaw('hsk:progress', {}); }
  function setProgress(p) { writeRaw('hsk:progress', p); }

  function getModeProgress(lessonId, mode) {
    const p = getProgress();
    return (p[lessonId] && p[lessonId][mode]) || {};
  }
  function setItemStatus(lessonId, mode, key, status) {
    const p = getProgress();
    if (!p[lessonId]) p[lessonId] = {};
    if (!p[lessonId][mode]) p[lessonId][mode] = {};
    p[lessonId][mode][key] = status;
    setProgress(p);
    recordActivity();
  }
  function clearModeProgress(lessonId, mode) {
    const p = getProgress();
    if (p[lessonId]) { p[lessonId][mode] = {}; setProgress(p); }
  }
  // Clears a word's "learning"/"known" status from both flip and type modes for a lesson —
  // used by the Review screen so a word stops resurfacing once you've got it.
  function clearWordEverywhere(lessonId, hanzi) {
    const p = getProgress();
    if (p[lessonId]) {
      if (p[lessonId].flip) delete p[lessonId].flip[hanzi];
      if (p[lessonId].type) delete p[lessonId].type[hanzi];
    }
    setProgress(p);
  }
  function setWordKnownEverywhere(lessonId, hanzi) {
    const p = getProgress();
    if (!p[lessonId]) p[lessonId] = {};
    if (!p[lessonId].flip) p[lessonId].flip = {};
    if (!p[lessonId].type) p[lessonId].type = {};
    p[lessonId].flip[hanzi] = 'known';
    p[lessonId].type[hanzi] = 'known';
    setProgress(p);
  }
  function setWordLearningFlip(lessonId, hanzi) {
    const p = getProgress();
    if (!p[lessonId]) p[lessonId] = {};
    if (!p[lessonId].flip) p[lessonId].flip = {};
    p[lessonId].flip[hanzi] = 'learning';
    setProgress(p);
  }

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

  // ---- shared voice preference (used by lessons, review, and pinyin reference) ----
  function getVoicePref() { return readRaw('hsk:voice', { index: 0, rate: 0.85 }); }
  function setVoicePref(pref) { writeRaw('hsk:voice', pref); }

  // ---- "continue where you left off" ----
  function getLastPosition() { return readRaw('hsk:lastPosition', null); }
  function setLastPosition(pos) { writeRaw('hsk:lastPosition', pos); }

  return {
    getProgress, getModeProgress, setItemStatus, clearModeProgress,
    clearWordEverywhere, setWordKnownEverywhere, setWordLearningFlip,
    getDailyGoal, getStreak, recordActivity,
    getAutoplay, setAutoplay,
    getVoicePref, setVoicePref,
    getLastPosition, setLastPosition,
  };
})();
