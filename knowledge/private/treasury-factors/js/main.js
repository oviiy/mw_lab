/* Boot: initialise sections, typeset math, highlight the table of contents. */
(function () {
  const { $, $$, D } = YC;
  document.addEventListener('DOMContentLoaded', () => {
    YC.sections.forEach(init => init());
    if (window.renderMathInElement) {
      renderMathInElement(document.body, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '\\(', right: '\\)', display: false }], throwOnError: false });
    }
    $('#buildNote').innerHTML = `Data bundle built ${D.built} from the thesis repository by <span class="mono">build/build_data.py</span>; ` +
      'numerical code in <span class="mono">engine.js</span>, verified by <span class="mono">engine.test.mjs</span>. Recession dates: NBER.';
    const links = $$('.toc a[href^="#s"]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === `#${e.target.id}`)); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('section[id^="s"]').forEach(s => io.observe(s));
  });
})();
