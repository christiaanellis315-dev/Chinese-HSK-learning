// Minimal, dependency-free test runner. No Node/npm involved on purpose — this project has no
// build step, and the tests should run the same way the app does: as plain scripts loaded by a
// browser. Open tests/test.html through the same local static server used to develop the app.
const TestRunner = (() => {
  const tests = [];
  let currentGroup = '';

  function group(name, fn) {
    const prev = currentGroup;
    currentGroup = name;
    fn();
    currentGroup = prev;
  }

  function test(name, fn) {
    tests.push({ name: currentGroup ? currentGroup + ' — ' + name : name, fn });
  }

  function assert(cond, msg) {
    if (!cond) throw new Error(msg || 'assertion failed');
  }

  function assertEqual(actual, expected, msg) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) {
      throw new Error((msg ? msg + ' — ' : '') + 'expected ' + e + ', got ' + a);
    }
  }

  function runAll() {
    return tests.map(({ name, fn }) => {
      try {
        fn();
        return { name, pass: true };
      } catch (e) {
        return { name, pass: false, error: e.message };
      }
    });
  }

  function render(results, container) {
    const passCount = results.filter((r) => r.pass).length;
    const failCount = results.length - passCount;
    container.innerHTML = `
      <div class="summary ${failCount ? 'fail' : 'pass'}">
        ${passCount}/${results.length} passed${failCount ? ` — ${failCount} FAILED` : ''}
      </div>
      <ul class="results">
        ${results.map((r) => `
          <li class="${r.pass ? 'pass' : 'fail'}">
            <span class="mark">${r.pass ? '✓' : '✗'}</span>
            <span class="name">${r.name}</span>
            ${r.pass ? '' : `<div class="error">${r.error}</div>`}
          </li>
        `).join('')}
      </ul>
    `;
    if (failCount) {
      results.filter((r) => !r.pass).forEach((r) => console.error('FAIL:', r.name, '—', r.error));
    }
    console.log(`${passCount}/${results.length} tests passed`);
  }

  return { group, test, assert, assertEqual, runAll, render };
})();
