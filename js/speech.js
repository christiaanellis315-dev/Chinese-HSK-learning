// Shared Mandarin text-to-speech wrapper, used by Lessons, Review and Pinyin screens.
// Runs entirely on-device via the Web Speech API — no network calls, so it keeps working
// offline as long as the phone already has a Chinese TTS voice installed at the OS level.
const Speech = (() => {
  let zhVoices = [];
  let ready = false;
  let onReadyCbs = [];

  function pickVoices() {
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    zhVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('zh'));
    if (!ready && zhVoices.length) {
      ready = true;
      onReadyCbs.forEach(cb => cb());
      onReadyCbs = [];
    }
  }
  if (window.speechSynthesis) {
    pickVoices();
    window.speechSynthesis.onvoiceschanged = pickVoices;
    // Some Android browsers never fire onvoiceschanged reliably — poll briefly as a fallback.
    let pollCount = 0;
    const pollVoices = setInterval(() => {
      pollCount++;
      pickVoices();
      if (ready || pollCount > 10) clearInterval(pollVoices);
    }, 300);
  }

  function onReady(cb) { if (ready) cb(); else onReadyCbs.push(cb); }
  function getVoices() { return zhVoices; }

  function guessGender(voice) {
    const n = voice.name.toLowerCase();
    if (n.includes('female') || n.includes('yaoyao') || n.includes('huihui')) return ' (likely female)';
    if (n.includes('male') || n.includes('kangkang')) return ' (likely male)';
    return '';
  }

  // Global speed control (Slow/Normal/Natural), shared by every screen that plays audio.
  // The choice is stored once in Storage's voice pref and applies everywhere — this just
  // renders the same three-button row into whichever container a screen gives it.
  const SPEEDS = [{ label: 'Very slow', val: 0.4 }, { label: 'Slow', val: 0.6 }, { label: 'Normal', val: 0.75 }, { label: 'Natural', val: 0.95 }];
  function buildSpeedControl(container) {
    const pref = Storage.getVoicePref();
    container.innerHTML = SPEEDS.map(s => `<div class="speed-btn ${pref.rate === s.val ? 'active' : ''}" data-val="${s.val}">${s.label}</div>`).join('');
    container.querySelectorAll('.speed-btn').forEach((btn) => {
      btn.onclick = () => {
        const p = Storage.getVoicePref();
        p.rate = parseFloat(btn.dataset.val);
        Storage.setVoicePref(p);
        buildSpeedControl(container);
      };
    });
  }

  function speak(hanzi, el, rateOverride) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const pref = Storage.getVoicePref();
    const utter = new SpeechSynthesisUtterance(hanzi);
    utter.lang = 'zh-CN';
    utter.rate = rateOverride || pref.rate || 0.85;
    if (zhVoices.length) utter.voice = zhVoices[pref.index] || zhVoices[0];
    if (el) {
      el.classList.add('speaking');
      utter.onend = () => el.classList.remove('speaking');
      utter.onerror = () => el.classList.remove('speaking');
    }
    window.speechSynthesis.speak(utter);
  }

  return { onReady, getVoices, guessGender, speak, buildSpeedControl };
})();
