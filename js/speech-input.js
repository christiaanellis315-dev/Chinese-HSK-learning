// Speech-to-text wrapper for Free Production mode (see lessons.js's 'production' mode), using
// the Web Speech API's SpeechRecognition interface — a different API from speechSynthesis
// (Speech, in speech.js), which only ever speaks text out loud and never listens. Recognition
// needs mic access (prompted on first use, same permission Recorder's pronunciation-practice mic
// already asks for) and isn't implemented in every browser (notably Firefox as of this writing) —
// isSupported() lets callers fall back to typed input cleanly when it's missing or denied.
const SpeechInput = (() => {
  function isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  let activeRecognizer = null;

  function stop() {
    if (activeRecognizer) {
      try { activeRecognizer.abort(); } catch (e) { /* already stopped */ }
      activeRecognizer = null;
    }
  }

  // Listens once for a Mandarin utterance, resolving with the recognized text on success.
  // Resolves with `null` — never rejects — on any failure: unsupported browser, no speech
  // detected, mic permission denied, or any other recognition error, so callers can treat every
  // "didn't get an answer" case the same way (fall back to typed input) instead of branching on
  // a grab-bag of error shapes. `opts.onStart`/`opts.onError` are optional hooks for UI feedback
  // (e.g. showing a "listening…" state, or noticing a permission denial to stop re-prompting).
  function listenOnce(opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      if (!isSupported()) { resolve(null); return; }
      stop();
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      activeRecognizer = rec;
      rec.lang = 'zh-CN';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      let settled = false;
      const finish = (val) => {
        if (settled) return;
        settled = true;
        activeRecognizer = null;
        resolve(val);
      };
      rec.onresult = (e) => {
        const transcript = e.results && e.results[0] && e.results[0][0] ? e.results[0][0].transcript : '';
        finish(transcript || null);
      };
      rec.onerror = (e) => {
        if (opts.onError) opts.onError(e.error);
        finish(null);
      };
      rec.onend = () => finish(null); // covers the rare case neither onresult nor onerror fired
      if (opts.onStart) opts.onStart();
      try { rec.start(); } catch (e) { finish(null); }
    });
  }

  return { isSupported, listenOnce, stop };
})();
