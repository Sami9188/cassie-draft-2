/* CASSIE Perfumes — Draft 2 "Spectrum". Vanilla JS, no dependencies. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const mobile = () => window.innerWidth <= 860;
  const html = document.documentElement;

  /* ---------- themes ---------- */
  const THEMES = {
    plum:     { bg: [22, 11, 29],    fg: [246, 238, 247], light: false, orbs: [[123, 44, 191], [255, 95, 162], [255, 184, 107], [70, 30, 120]] },
    oud:      { bg: [28, 13, 10],    fg: [247, 239, 232], light: false, orbs: [[166, 58, 30], [226, 150, 42], [90, 31, 58], [120, 60, 30]] },
    amber:    { bg: [42, 23, 8],     fg: [251, 242, 228], light: false, orbs: [[242, 169, 59], [255, 106, 61], [255, 217, 138], [160, 80, 30]] },
    fresh:    { bg: [11, 36, 32],    fg: [236, 247, 241], light: false, orbs: [[47, 191, 143], [184, 230, 91], [31, 111, 139], [20, 120, 90]] },
    musk:     { bg: [244, 235, 224], fg: [29, 20, 16],    light: true,  orbs: [[255, 217, 176], [255, 255, 255], [246, 199, 192], [255, 236, 200]] },
    midnight: { bg: [10, 19, 38],    fg: [234, 240, 255], light: false, orbs: [[45, 91, 255], [127, 211, 255], [198, 139, 255], [30, 60, 140]] }
  };
  const themed = $$('[data-theme]');
  let curTheme = 'plum';
  const cur = { bg: THEMES.plum.bg.slice(), fg: THEMES.plum.fg.slice(), orbs: THEMES.plum.orbs.map(c => c.slice()) };
  const rgb = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;

  /* ---------- bottles ---------- */
  $$('[data-bottle]').forEach(el => {
    let cfg = {};
    try { cfg = JSON.parse(el.dataset.bottle); } catch (e) {}
    el.insertAdjacentHTML('afterbegin', window.bottleSVG(cfg));
  });
  window.attachBottleFallbacks();

  /* ---------- split headlines ---------- */
  $$('[data-split]').forEach(h => {
    let i = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          if (!n.textContent.trim()) { n.remove(); return; }
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { const s = document.createElement('span'); s.className = 'sp'; frag.appendChild(s); return; }
            const w = document.createElement('span'); w.className = 'w';
            part.split('').forEach(ch => {
              const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; s.style.setProperty('--i', i++); w.appendChild(s);
            });
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(h);
  });

  /* ---------- loader ---------- */
  const loader = $('#loader');
  function start() {
    loader.classList.add('out');
    html.classList.remove('lock');
    $('.hero h1').classList.add('in');
    setTimeout(() => $$('.hero .rv').forEach(e => e.classList.add('in')), 350);
    setTimeout(() => loader.remove(), 1000);
  }
  if (reduced) start(); else { html.classList.add('lock'); setTimeout(start, 1500); }

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    if (en.target.dataset.count !== undefined) countUp(en.target);
    io.unobserve(en.target);
  }), { threshold: .15 });
  $$('.rv:not(.hero .rv), [data-split]:not(h1), [data-count], #hub').forEach(el => io.observe(el));
  function countUp(el) {
    const target = +el.dataset.count, t0 = performance.now();
    (function tick(now) {
      const p = clamp((now - t0) / 1600, 0, 1);
      el.textContent = Math.round(target * easeOut(p)).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- nav ---------- */
  const nav = $('#nav'), burger = $('#burger'), mm = $('#mobileMenu');
  let lastY = 0;
  burger.addEventListener('click', () => {
    const open = mm.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    html.classList.toggle('lock', open);
  });
  mm.addEventListener('click', e => { if (e.target.tagName === 'A') burger.click(); });
  const sections = $$('main section[id]');
  const menuLinks = $$('.menu a');

  /* ---------- aura canvas ---------- */
  const canvas = $('#aura'), ctx = canvas.getContext('2d');
  let W, H, DPR = 0.5;
  const resize = () => { W = canvas.width = Math.floor(innerWidth * DPR); H = canvas.height = Math.floor(innerHeight * DPR); };
  resize(); addEventListener('resize', resize);
  const blobs = [];
  for (let i = 0; i < 5; i++) blobs.push({ x: .2 + Math.random() * .6, y: .2 + Math.random() * .6, r: .32 + Math.random() * .22, sx: (.00006 + Math.random() * .00008), sy: (.00005 + Math.random() * .00008), a: Math.random() * 6.28, b: Math.random() * 6.28, ci: i % 4 });
  const trail = [];
  let mx = -1, my = -1, lastEmit = 0;
  if (fine && !reduced) addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    const now = performance.now();
    if (now - lastEmit > 28) { lastEmit = now; trail.push({ x: mx, y: my, t: now, ci: (trail.length) % 4, vx: (Math.random() - .5) * .04, vy: -.03 - Math.random() * .04 }); if (trail.length > 36) trail.shift(); }
  }, { passive: true });

  function drawAura(now) {
    ctx.clearRect(0, 0, W, H);
    const light = THEMES[curTheme].light;
    ctx.globalCompositeOperation = light ? 'multiply' : 'lighter';
    blobs.forEach(b => {
      const x = (b.x + Math.sin(now * b.sx + b.a) * .22) * W, y = (b.y + Math.cos(now * b.sy + b.b) * .22) * H, r = b.r * Math.max(W, H);
      const c = cur.orbs[b.ci];
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${light ? .55 : .42})`);
      g.addColorStop(1, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
    });
    // scent trail
    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i], age = (now - p.t) / 1500;
      if (age > 1) { trail.splice(i, 1); continue; }
      const c = cur.orbs[p.ci];
      const r = (40 + age * 110) * DPR, x = (p.x + p.vx * (now - p.t)) * DPR, y = (p.y + p.vy * (now - p.t)) * DPR;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${(1 - age) * (light ? .35 : .45)})`);
      g.addColorStop(1, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- hero parallax + liquid wave ---------- */
  const stage = $('#heroStage');
  const layers = $$('[data-depth]', stage);
  let px = 0, py = 0, tx = 0, ty = 0;
  if (fine && !reduced) addEventListener('mousemove', e => { tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5); }, { passive: true });
  const heroLiquid = $('#heroBottle .liquid');
  const heroLiquidTop = heroLiquid ? +heroLiquid.getAttribute('y') : 0;
  if (heroLiquid) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', heroLiquid.getAttribute('fill'));
    heroLiquid.replaceWith(path);
    window.__wave = path;
  }

  /* ---------- services rows ---------- */
  const rows = $$('.row');
  rows.forEach(r => {
    const head = $('.row-head', r);
    const open = () => { rows.forEach(x => x.classList.toggle('open', x === r)); };
    head.addEventListener('click', open);
    if (fine) head.addEventListener('mouseenter', open);
  });

  /* ---------- fragrance families ---------- */
  const FAM = [
    { name: 'Oud & Woody', c1: '#e2962a', c2: '#5a1f0e', glass: 'noir', liquid: '#3a1d0c', cap: 'block', capColor: 'gold', desc: 'Resinous, smoky and long-lasting. The signature of the Gulf, now in demand far beyond it.', accords: ['Agarwood', 'Sandalwood', 'Cedar', 'Patchouli', 'Saffron', 'Leather'], markets: ['GCC', 'Africa', 'Latin America'] },
    { name: 'Amber & Oriental', c1: '#ffd98a', c2: '#a0501e', glass: 'amber', liquid: '#b8742c', cap: 'dome', capColor: 'gold', desc: 'Warm, sweet and enveloping. Vanilla, resins and spice built for evening wear and gifting.', accords: ['Amber', 'Vanilla', 'Benzoin', 'Labdanum', 'Tonka', 'Cinnamon'], markets: ['GCC', 'Far East', 'North America'] },
    { name: 'Floral', c1: '#ffb4c8', c2: '#b0305e', glass: 'rose', liquid: '#f0a9a0', cap: 'crystal', capColor: 'rosegold', desc: 'From a single rose soliflore to lush white-flower bouquets. The broadest-selling family worldwide.', accords: ['Rose', 'Jasmine', 'Tuberose', 'Peony', 'Iris', 'Ylang-ylang'], markets: ['North America', 'Latin America', 'Far East'] },
    { name: 'Gourmand', c1: '#ffcf9a', c2: '#7a3e18', glass: 'crystal', liquid: '#8a4a1c', cap: 'sphere', capColor: 'rosegold', desc: 'Edible, playful and addictive. Caramel, chocolate and praline profiles that drive repeat purchase.', accords: ['Caramel', 'Praline', 'Chocolate', 'Coffee', 'Pistachio', 'Milk'], markets: ['GCC', 'Far East', 'Latin America'] },
    { name: 'Fresh & Citrus', c1: '#d9ff9a', c2: '#1f7a6a', glass: 'crystal', liquid: '#cfe88a', cap: 'disc', capColor: 'silver', desc: 'Bright, clean and easy to wear. Colognes, aquatics and green florals for daytime and hot climates.', accords: ['Bergamot', 'Lemon', 'Neroli', 'Marine', 'Green tea', 'Vetiver'], markets: ['North America', 'Far East', 'GCC'] },
    { name: 'Musk & Skin', c1: '#fff0dc', c2: '#9a7a6a', glass: 'frosted', liquid: '#efe3cf', cap: 'tall', capColor: 'white', desc: 'Soft, clean and intimate. Modern musks that read as "skin but better", ideal for minimalist brands.', accords: ['White musk', 'Ambrette', 'Cashmeran', 'Iris', 'Cotton', 'Sandalwood'], markets: ['North America', 'Far East', 'GCC'] }
  ];
  const ring = $('#famRing'), orb = $('#famOrb'), famBottle = $('#famBottle'), famCard = $('#famCard');
  FAM.forEach((f, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = f.name; b.style.setProperty('--a', (-90 + i * 60) + 'deg');
    b.addEventListener('click', () => setFam(i));
    ring.appendChild(b);
  });
  function setFam(i) {
    const f = FAM[i];
    $$('button', ring).forEach((b, n) => b.classList.toggle('on', n === i));
    orb.style.setProperty('--c1', f.c1); orb.style.setProperty('--c2', f.c2);
    famBottle.innerHTML = window.bottleSVG({ shape: ['facet', 'orb', 'orb', 'flacon', 'tall', 'column'][i], cap: f.cap, capColor: f.capColor, glass: f.glass, liquid: f.liquid, label: f.name.split(' ')[0].toUpperCase(), sub: 'EAU DE PARFUM', labelColor: f.glass === 'noir' ? '#e2c58c' : (f.glass === 'frosted' ? '#6a5a50' : '#fff'), reflect: true });
    famBottle.classList.remove('swap'); void famBottle.offsetWidth; famBottle.classList.add('swap');
    $('#famName').textContent = f.name;
    $('#famDesc').textContent = f.desc;
    $('#famAccords').innerHTML = f.accords.map(a => `<i>${a}</i>`).join('');
    $('#famMarkets').innerHTML = f.markets.map(a => `<i>${a}</i>`).join('');
    famCard.classList.remove('swap'); void famCard.offsetWidth; famCard.classList.add('swap');
  }
  setFam(0);

  /* ---------- process line ---------- */
  const tlPath = $('#tlPath'), tlLen = tlPath.getTotalLength();
  tlPath.style.strokeDasharray = tlLen; tlPath.style.strokeDashoffset = tlLen;
  const timeline = $('.timeline');

  /* ---------- packaging configurator ---------- */
  const render = $('#packRender'), caption = $('#packCaption'), labelInput = $('#packLabel');
  const state = { shape: 'facet', cap: 'block', capColor: 'gold', glass: 'noir', label: 'YOUR BRAND', sub: 'EAU DE PARFUM', liquid: '#2a1c10', reflect: true };
  const liquids = { noir: '#2a1c10', crystal: '#e8c47e', clear: '#e8c47e', frosted: '#e9dcc2', amber: '#9b531c', smoke: '#5a4a3a', rose: '#f0b4aa', violet: '#8a62c8', emerald: '#2f8a6a' };
  const names = {
    shape: { facet: 'Facet', flacon: 'Flacon', tall: 'Tall', column: 'Column', orb: 'Orb', slim: 'Slim' },
    cap: { block: 'zamac block cap', tall: 'tower cap', dome: 'dome cap', sphere: 'sphere cap', crystal: 'crystal cap', disc: 'disc cap' },
    capColor: { gold: 'Gold', silver: 'Silver', black: 'Matte black', rosegold: 'Rose gold', wood: 'Wood', white: 'White' },
    glass: { noir: 'noir lacquer', crystal: 'crystal clear', frosted: 'frosted', amber: 'amber', smoke: 'smoke', rose: 'blush', violet: 'violet', emerald: 'emerald' }
  };
  const describe = () => `${names.shape[state.shape]} bottle · ${names.capColor[state.capColor]} ${names.cap[state.cap]} · ${names.glass[state.glass]} glass`;
  function draw() {
    state.liquid = liquids[state.glass];
    state.labelColor = (state.glass === 'noir' || state.glass === 'smoke') ? '#e2c58c' : '#2a1c14';
    render.innerHTML = window.bottleSVG(state);
    render.classList.remove('swap'); void render.offsetWidth; render.classList.add('swap');
    caption.textContent = describe();
  }
  $$('.opts').forEach(group => group.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', group).forEach(x => x.classList.remove('on')); b.classList.add('on');
    state[group.dataset.key] = b.dataset.val; draw();
  }));
  labelInput.addEventListener('input', () => { state.label = (labelInput.value.trim() || 'YOUR BRAND').toUpperCase(); draw(); });
  draw();
  $('#packToRfq').addEventListener('click', () => { $('#packField').value = `Configuration: ${describe()}. Label: ${state.label}.`; });

  /* ---------- export hub lines ---------- */
  const hub = $('#hub'), hubLines = $('#hubLines');
  function drawHub() {
    const r = hub.getBoundingClientRect();
    hubLines.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    const nodes = $$('.node', hub), c = $('.node.center', hub);
    const cx = r.width * .5, cy = r.height * .52;
    hubLines.innerHTML = nodes.filter(n => n !== c).map(n => {
      const x = parseFloat(n.style.getPropertyValue('--x')) / 100 * r.width, y = parseFloat(n.style.getPropertyValue('--y')) / 100 * r.height;
      const mx = (cx + x) / 2 + (y - cy) * .18, my = (cy + y) / 2 - (x - cx) * .18;
      return `<path d="M${cx} ${cy} Q${mx} ${my} ${x} ${y}"/>`;
    }).join('');
  }
  drawHub(); addEventListener('resize', drawHub);

  /* ---------- RFQ demo ---------- */
  const form = $('#rfqForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad); if (bad) ok = false;
    });
    if (!ok) return;
    Array.from(form.children).forEach(c => { if (!c.classList.contains('f-done')) c.style.display = 'none'; });
    $('.f-done', form).hidden = false;
  });

  /* ---------- frame loop ---------- */
  let vh = innerHeight; addEventListener('resize', () => { vh = innerHeight; });
  function frame(now) {
    const y = scrollY;

    // theme by section at viewport centre
    let t = curTheme;
    for (const s of themed) { const r = s.getBoundingClientRect(); if (r.top <= vh * .5 && r.bottom > vh * .5) { t = s.dataset.theme; break; } }
    if (t !== curTheme) { curTheme = t; document.body.classList.toggle('light', THEMES[t].light); }
    const T = THEMES[curTheme], k = reduced ? 1 : .075;
    for (let i = 0; i < 3; i++) { cur.bg[i] = lerp(cur.bg[i], T.bg[i], k); cur.fg[i] = lerp(cur.fg[i], T.fg[i], k); }
    cur.orbs.forEach((o, n) => { for (let i = 0; i < 3; i++) o[i] = lerp(o[i], T.orbs[n][i], k); });
    html.style.setProperty('--bg', rgb(cur.bg)); html.style.setProperty('--fg', rgb(cur.fg));
    drawAura(now);

    // nav hide/show + active link
    nav.classList.toggle('hide', y > lastY + 4 && y > 300 && !mm.classList.contains('open'));
    if (Math.abs(y - lastY) > 4) lastY = y;
    let active = null;
    sections.forEach(s => { if (s.getBoundingClientRect().top <= vh * .4) active = s.id; });
    menuLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + active));

    // hero parallax
    px = lerp(px, tx, .06); py = lerp(py, ty, .06);
    layers.forEach(l => { const d = +l.dataset.depth; l.style.setProperty('--px', (px * 40 * d) + 'px'); l.style.setProperty('--py', (py * 30 * d) + 'px'); });
    // liquid wave in hero bottle
    if (window.__wave && y < vh && !reduced) {
      const top = heroLiquidTop, amp = 2.2 + Math.abs(px) * 10, ph = now * .0025;
      let d = `M0 ${top + Math.sin(ph) * amp}`;
      for (let x = 10; x <= 200; x += 10) d += ` L${x} ${(top + Math.sin(ph + x * .045) * amp + Math.sin(ph * 1.7 + x * .02) * amp * .5).toFixed(2)}`;
      d += ' L200 320 L0 320 Z';
      window.__wave.setAttribute('d', d);
    }

    // process line scrub
    const tr = timeline.getBoundingClientRect();
    const tp = clamp((vh * .85 - tr.top) / (tr.height * .9), 0, 1);
    tlPath.style.strokeDashoffset = tlLen * (1 - easeOut(tp));

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- anchors ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const el = $(a.getAttribute('href')); if (!el) return;
    e.preventDefault();
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: reduced ? 'auto' : 'smooth' });
  });
})();
