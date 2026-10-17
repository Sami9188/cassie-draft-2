(function () {
  document.querySelectorAll('[data-bottle]').forEach(function (el) {
    let cfg = {};
    try { cfg = JSON.parse(el.dataset.bottle); } catch (e) {}
    el.innerHTML = window.bottleSVG(cfg);
  });
  window.attachBottleFallbacks();

  // Mobile menu
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  if (burger) burger.addEventListener('click', function () {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') nav.classList.remove('open'); });

  // Reveal + counters
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      if (en.target.dataset.count) countUp(en.target);
      io.unobserve(en.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.reveal, [data-count]').forEach(function (el) { io.observe(el); });
  function countUp(el) {
    const target = +el.dataset.count, start = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - start) / 1500);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  // Service path tabs
  const tabs = document.querySelectorAll('.path-tabs button');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('on'); });
      t.classList.add('on');
      document.querySelectorAll('.panel').forEach(function (p) { p.classList.toggle('on', p.id === t.dataset.tab); });
    });
  });

  // Sticky process: the bottle assembles step by step
  const stages = [
    { shape: 'flacon', cap: 'none', glass: 'crystal', fill: 0, label: '', liquid: '#e2b46a' },
    { shape: 'flacon', cap: 'none', glass: 'crystal', fill: 0.18, label: '', liquid: '#d9a14e' },
    { shape: 'flacon', cap: 'none', glass: 'crystal', fill: 0.62, label: '', liquid: '#e2b46a' },
    { shape: 'flacon', cap: 'block', capColor: 'gold', glass: 'crystal', fill: 0.78, label: '', liquid: '#e2b46a' },
    { shape: 'flacon', cap: 'block', capColor: 'gold', glass: 'crystal', fill: 0.78, label: 'YOUR BRAND', sub: 'EAU DE PARFUM · 100 ML', liquid: '#e2b46a' },
    { shape: 'flacon', cap: 'block', capColor: 'gold', glass: 'crystal', fill: 0.78, label: 'YOUR BRAND', sub: 'EAU DE PARFUM · 100 ML', liquid: '#e2b46a' }
  ];
  const bottle = document.getElementById('procBottle');
  const stamp = document.getElementById('procStamp');
  const num = document.getElementById('procNum');
  const steps = document.querySelectorAll('.pstep');
  let current = -1;
  function setStage(i) {
    if (i === current) return;
    current = i;
    bottle.innerHTML = window.bottleSVG(stages[i]);
    bottle.animate([{ transform: 'scale(.97)', opacity: .6 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: 'ease-out' });
    stamp.classList.toggle('on', i === 5);
    num.textContent = '0' + (i + 1);
    steps.forEach(function (s, n) { s.classList.toggle('active', n === i); });
  }
  if (bottle) {
    setStage(0);
    const so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setStage(+en.target.dataset.i); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { so.observe(s); });
  }

  // Quote form (demo)
  const form = document.getElementById('qform');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(function (f) {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) return;
    Array.from(form.children).forEach(function (c) { if (!c.classList.contains('form-done')) c.style.display = 'none'; });
    form.querySelector('.form-done').hidden = false;
  });
})();
