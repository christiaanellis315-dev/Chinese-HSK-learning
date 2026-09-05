// Games screen: shared page chrome (lamp/h1/sub) for the three recurring, lesson-independent
// drills — Numbers 1-999, Date & Weekday, and Mahjong Tiles — picked with the same mode-toggle
// pattern the Lessons screen uses for Flip/Type/Listen/Build. Each game owns everything below the
// toggle (autoplay row, speed row, its own round/session logic) and mounts into #gameArea exactly
// as it would mount into a full screen — this module never reaches into a game's internals.
const Games = (() => {
  let root = null;
  let goTo = null;
  let game = 'numbers'; // 'numbers' | 'dateWeekday' | 'mahjong'

  function html() {
    return `
      <div class="lamp"></div>
      <h1>Games</h1>
      <div class="sub">Quick recall drills, independent of any lesson</div>
      <div class="mode-toggle" id="gameToggle"></div>
      <div id="gameArea"></div>
    `;
  }

  function buildToggle() {
    const el = root.querySelector('#gameToggle');
    el.innerHTML = `
      <div class="mode-btn ${game === 'numbers' ? 'active' : ''}" id="numbersGameBtn">Numbers 1-999</div>
      <div class="mode-btn ${game === 'dateWeekday' ? 'active' : ''}" id="dateWeekdayGameBtn">Date &amp; Weekday</div>
      <div class="mode-btn ${game === 'mahjong' ? 'active' : ''}" id="mahjongGameBtn">Mahjong Tiles</div>
    `;
    root.querySelector('#numbersGameBtn').onclick = () => switchGame('numbers');
    root.querySelector('#dateWeekdayGameBtn').onclick = () => switchGame('dateWeekday');
    root.querySelector('#mahjongGameBtn').onclick = () => switchGame('mahjong');
  }

  function switchGame(g) {
    if (g === game) return;
    game = g;
    buildToggle();
    renderGame();
  }

  function renderGame() {
    const area = root.querySelector('#gameArea');
    area.innerHTML = '';
    if (game === 'numbers') NumbersDrill.mount(area, goTo);
    else if (game === 'dateWeekday') DateWeekdayGame.mount(area, goTo);
    else MahjongGame.mount(area, goTo);
  }

  function mount(container, navigate) {
    root = container;
    goTo = navigate || null;
    game = 'numbers';
    root.innerHTML = html();
    buildToggle();
    renderGame();
  }

  return { mount };
})();
