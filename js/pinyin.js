// Pinyin reference screen: tones / initials / finals tabs, adapted from
// hsk1_pinyin_reference.html to use the shared Storage + Speech modules.
const Pinyin = (() => {
  let root = null;
  let currentTab = 'tones';

  function html() {
    return `
      <div class="lamp"></div>
      <h1>Pinyin pronunciation reference</h1>
      <div class="sub">Tap any tile to hear it — tones, initials &amp; finals, cross-referenced to lessons you've studied</div>
      <div class="autoplay-row">
        <span>Auto-play on tab switch</span>
        <div class="switch" id="autoplaySwitch"><div class="knob"></div></div>
      </div>
      <div class="top-row" id="speedRow"></div>
      <div class="voice-row" id="voiceRow"></div>
      <div class="voice-note" id="voiceNote"></div>
      <div class="tabs" id="tabs"></div>
      <div id="content"></div>
    `;
  }

  function buildAutoplayToggle() {
    const el = root.querySelector('#autoplaySwitch');
    const on = Storage.getAutoplay('pinyin');
    el.className = 'switch' + (on ? ' on' : '');
    el.innerHTML = '<div class="knob"></div>';
    el.onclick = () => { Storage.setAutoplay('pinyin', !Storage.getAutoplay('pinyin')); buildAutoplayToggle(); };
  }

  function buildSpeedRow() {
    const el = root.querySelector('#speedRow');
    const pref = Storage.getVoicePref();
    const speeds = [{label:'Slow', val:0.6}, {label:'Normal', val:0.75}, {label:'Natural', val:0.95}];
    el.innerHTML = speeds.map(s => `<div class="speed-btn ${pref.rate === s.val ? 'active' : ''}" data-val="${s.val}">${s.label}</div>`).join('');
    el.querySelectorAll('.speed-btn').forEach(btn => {
      btn.onclick = () => {
        const p = Storage.getVoicePref();
        p.rate = parseFloat(btn.dataset.val);
        Storage.setVoicePref(p);
        buildSpeedRow();
      };
    });
  }

  function buildVoiceRow() {
    const row = root.querySelector('#voiceRow');
    const note = root.querySelector('#voiceNote');
    const voices = Speech.getVoices();
    if (voices.length <= 1) {
      row.innerHTML = '';
      note.textContent = voices.length === 1
        ? 'Your device only exposes one Mandarin voice (' + voices[0].name + ') — no alternate voice to switch to here.'
        : 'No Mandarin voice detected yet — audio may not play until one loads. (Check your phone’s Text-to-Speech settings for a Chinese voice if this persists.)';
      return;
    }
    const pref = Storage.getVoicePref();
    note.textContent = 'Your device has ' + voices.length + ' Mandarin voices available — pick one:';
    const select = document.createElement('select');
    select.className = 'voice-select';
    select.innerHTML = voices.map((v, i) => `<option value="${i}">${v.name}${Speech.guessGender(v)}</option>`).join('');
    select.value = pref.index;
    select.onchange = () => {
      const p = Storage.getVoicePref();
      p.index = parseInt(select.value, 10);
      Storage.setVoicePref(p);
      Speech.speak('你好', null);
    };
    row.innerHTML = '';
    row.appendChild(select);
  }

  function buildTabs() {
    const el = root.querySelector('#tabs');
    const tabs = [['tones','Tones'], ['initials','Initials'], ['finals','Finals']];
    el.innerHTML = tabs.map(([id, label]) => `<div class="tab ${currentTab === id ? 'active' : ''}" data-id="${id}">${label}</div>`).join('');
    el.querySelectorAll('.tab').forEach(t => {
      t.onclick = () => { currentTab = t.dataset.id; buildTabs(); render(); };
    });
  }

  function makeTile(word) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.innerHTML = `
      <div class="pinyin">${word.p}</div>
      <div class="hanzi">${word.h}</div>
      <div class="meaning">${word.e}</div>
      ${word.tag ? `<div class="tag">${word.tag === 'ref' ? 'reference' : word.tag}</div>` : ''}
    `;
    tile.onclick = () => Speech.speak(word.h, tile);
    return tile;
  }

  function render() {
    const content = root.querySelector('#content');
    content.innerHTML = '';
    const autoplay = Storage.getAutoplay('pinyin');

    if (currentTab === 'tones') {
      Object.keys(TONES).forEach(toneName => {
        const t = TONES[toneName];
        const titleEl = document.createElement('div');
        titleEl.className = 'section-title';
        titleEl.innerHTML = `<span class="tone-shape">${t.shape}</span>${toneName}`;
        content.appendChild(titleEl);

        const subEl = document.createElement('div');
        subEl.className = 'section-sub';
        subEl.textContent = t.desc;
        content.appendChild(subEl);

        const grid = document.createElement('div');
        grid.className = 'grid';
        t.words.forEach(w => grid.appendChild(makeTile(w)));
        content.appendChild(grid);

        if (autoplay) Speech.speak(t.words[0].h, null);
      });
    } else if (currentTab === 'initials') {
      const titleEl = document.createElement('div');
      titleEl.className = 'section-title';
      titleEl.textContent = 'Initials — sounds at the start of a syllable';
      content.appendChild(titleEl);
      const subEl = document.createElement('div');
      subEl.className = 'section-sub';
      subEl.textContent = 'Each tile leads with a real word from a lesson you’ve studied, so the sound has context.';
      content.appendChild(subEl);

      const grid = document.createElement('div');
      grid.className = 'grid';
      INITIALS.forEach(w => {
        const tile = makeTile(w);
        const initTag = document.createElement('div');
        initTag.style.cssText = 'font-size:10px;color:var(--amber-dim);margin-bottom:2px;';
        initTag.textContent = w.i + '-';
        tile.insertBefore(initTag, tile.firstChild);
        grid.appendChild(tile);
      });
      content.appendChild(grid);
      if (autoplay) Speech.speak(INITIALS[0].h, null);
    } else if (currentTab === 'finals') {
      const titleEl = document.createElement('div');
      titleEl.className = 'section-title';
      titleEl.textContent = 'Finals — sounds at the end of a syllable';
      content.appendChild(titleEl);
      const subEl = document.createElement('div');
      subEl.className = 'section-sub';
      subEl.textContent = 'Grouped the same way your textbook groups them. Tiles marked "reference" aren’t from your vocab yet — they’re just the clearest example of that sound.';
      content.appendChild(subEl);

      Object.keys(FINALS).forEach(groupName => {
        const h = document.createElement('div');
        h.className = 'letter-header';
        h.textContent = groupName;
        content.appendChild(h);
        const grid = document.createElement('div');
        grid.className = 'grid';
        FINALS[groupName].forEach(w => grid.appendChild(makeTile(w)));
        content.appendChild(grid);
      });
      if (autoplay) Speech.speak(FINALS['a — group'][0].h, null);
    }
  }

  function mount(container) {
    root = container;
    root.innerHTML = html();
    buildAutoplayToggle();
    buildSpeedRow();
    buildVoiceRow();
    buildTabs();
    render();
    Speech.onReady(() => { buildVoiceRow(); });
  }

  return { mount };
})();
