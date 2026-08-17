// Practice-pronunciation recorder for Flip & Recall cards. Lets the person record their own
// attempt, play it back, and compare it against the correct TTS pronunciation — self-assessment
// only, by ear. There is NO automatic scoring, tone detection, or correctness grading here, and
// there never should be: that would require sending audio to a paid cloud speech API and a
// backend server, which breaks this app's offline-first, zero-cost design.
//
// Everything lives in memory for the current card only. Nothing is saved to disk or uploaded
// anywhere. cleanup() stops any live mic stream and revokes the recording's object URL — it's
// called before every new card renders and before navigating to another screen, so a recording
// never outlives the word it was made for.
const Recorder = (() => {
  let stream = null;
  let mediaRecorder = null;
  let chunks = [];
  let audioUrl = null;

  function isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }

  function cleanup() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try { mediaRecorder.stop(); } catch (e) { /* already stopped */ }
    }
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
    if (audioUrl) { URL.revokeObjectURL(audioUrl); audioUrl = null; }
    mediaRecorder = null;
    chunks = [];
  }

  // Renders a self-contained mic control into `container` for practicing `hanzi`'s pronunciation.
  // Safe to call repeatedly (e.g. once per card render) — always starts from a clean idle state.
  function mountMicButton(container, hanzi) {
    if (!container) return;
    if (!isSupported()) { container.innerHTML = ''; return; }
    cleanup();

    function renderIdle() {
      container.innerHTML = `<button class="mic-btn" id="micBtn" aria-label="Record your pronunciation">&#127908;</button>`;
      container.querySelector('#micBtn').onclick = (e) => { e.stopPropagation(); startRecording(); };
    }

    function renderRecording() {
      container.innerHTML = `<button class="mic-btn recording" id="micBtn" aria-label="Stop recording">&#9632;</button>`;
      container.querySelector('#micBtn').onclick = (e) => { e.stopPropagation(); stopRecording(); };
    }

    function renderRecorded() {
      container.innerHTML = `
        <div class="mic-row">
          <button class="mic-playback-btn" id="playMineBtn">&#9658; Play mine</button>
          <button class="mic-playback-btn compare" id="compareBtn">&#128266; Compare</button>
          <button class="mic-btn mic-btn-small" id="redoBtn" aria-label="Record again">&#127908;</button>
        </div>
      `;
      container.querySelector('#playMineBtn').onclick = (e) => { e.stopPropagation(); if (audioUrl) new Audio(audioUrl).play().catch(() => {}); };
      container.querySelector('#compareBtn').onclick = (e) => { e.stopPropagation(); Speech.speak(hanzi, null); };
      container.querySelector('#redoBtn').onclick = (e) => { e.stopPropagation(); startRecording(); };
    }

    function renderError(msg) {
      container.innerHTML = `<div class="mic-error">${msg}</div>`;
    }

    async function startRecording() {
      cleanup();
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        renderError('Mic access denied — check your browser/site permissions.');
        return;
      }
      chunks = [];
      try {
        mediaRecorder = new MediaRecorder(stream);
      } catch (e) {
        renderError('Recording isn’t supported in this browser.');
        return;
      }
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.start();
      renderRecording();
    }

    function stopRecording() {
      if (!mediaRecorder) return;
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        audioUrl = URL.createObjectURL(blob);
        if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
        renderRecorded();
      };
      mediaRecorder.stop();
    }

    renderIdle();
  }

  return { isSupported, cleanup, mountMicButton };
})();
