/* CASSIE Perfumes — Draft 2 motion engine. No dependencies. */
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

  /* ---------- bottles ---------- */
  $$('[data-bottle]').forEach(el => {
    let cfg = {};
    try { cfg = JSON.parse(el.dataset.bottle); } catch (e) {}
    el.insertAdjacentHTML('afterbegin', window.bottleSVG(cfg));
  });
  window.attachBottleFallbacks();

  /* ---------- preloader ---------- */
  const loader = $('#loader');
  const html = document.documentElement;
  function finishLoad() {
    loader.classList.add('out');
    html.classList.remove('lock');
    $('.hero-title').classList.add('in');
    setTimeout(() => $$('.hero .rv').forEach(e => e.classList.add('in')), 500);
    setTimeout(() => loader.remove(), 1200);
  }
  if (reduced) { finishLoad(); }
  else {
    html.classList.add('lock');
    const num = $('#loaderNum'), bar = $('#loaderBar');
    const t0 = performance.now(), dur = 1500;
    (function tick(now) {
      const p = clamp((now - t0) / dur, 0, 1);
      const v = Math.round(easeOut(p) * 100);
      num.textContent = String(v).padStart(2, '0');
      bar.style.width = v + '%';
      if (p < 1) requestAnimationFrame(tick); else setTimeout(finishLoad, 200);
    })(t0);
  }

  /* ---------- smooth scroll (wheel only, fine pointers) ---------- */
  let targetY = window.scrollY, currentY = targetY, lastSet = targetY, smoothing = false;
  if (fine && !reduced) {
    smoothing = true;
    const maxY = () => document.documentElement.scrollHeight - window.innerHeight;
    window.addEventListener('wheel', e => {
      if (e.ctrlKey) return;
      if (e.target.closest && e.target.closest('.gallery')) return;
      e.preventDefault();
      const mult = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1;
      targetY = clamp(targetY + e.deltaY * mult, 0, maxY());
    }, { passive: false });
    window.addEventListener('scroll', () => {
      if (Math.abs(window.scrollY - lastSet) > 1.5) { targetY = currentY = lastSet = window.scrollY; }
    }, { passive: true });
  }

  /* ---------- cursor ---------- */
  const cursor = $('.cursor');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
  if (fine && !reduced) {
    document.body.classList.add('has-cursor');
    const dot = $('.cur-dot'), ring = $('.cur-ring'), label = $('.cur-ring span');
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('a, button, [data-cursor], label, summary');
      if (!t) { cursor.classList.remove('hover', 'link'); return; }
      const txt = t.dataset.cursor !== undefined ? t.dataset.cursor : '';
      label.textContent = txt;
      cursor.classList.toggle('hover', txt !== '');
      cursor.classList.toggle('link', txt === '');
    });
    window.cursorFrame = () => {
      rx = lerp(rx, mx, .18); ry = lerp(ry, my, .18);
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
    };
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduced) $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * .25}px, ${y * .35}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)'; el.style.transform = ''; setTimeout(() => el.style.transition = '', 600); });
  });

  /* ---------- tilt cards + spotlight ---------- */
  if (fine && !reduced) {
    $$('.tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        card.style.transform = `rotateY(${(px - .5) * 10}deg) rotateX(${(.5 - py) * 10}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
    $$('.spot').forEach(s => s.addEventListener('mousemove', e => {
      const r = s.getBoundingClientRect();
      s.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      s.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));
  }

  /* ---------- nav ---------- */
  const nav = $('#nav');
  let lastY = 0;
  const burger = $('#burger'), mm = $('#mobileMenu');
  burger.addEventListener('click', () => {
    const open = mm.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    html.classList.toggle('lock', open);
  });
  mm.addEventListener('click', e => { if (e.target.tagName === 'A') burger.click(); });
  const sections = $$('main section[id]');
  const menuLinks = $$('.menu-pill a');

  /* ---------- reveals + counters ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    if (en.target.dataset.count) countUp(en.target);
    io.unobserve(en.target);
  }), { threshold: .15 });
  $$('.rv:not(.hero .rv), [data-count]').forEach(el => io.observe(el));
  function countUp(el) {
    const target = +el.dataset.count, t0 = performance.now();
    (function tick(now) {
      const p = clamp((now - t0) / 1600, 0, 1);
      el.textContent = Math.round(target * easeOut(p)).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- manifesto words ---------- */
  const mText = $('#manifestoText');
  const highlights = ['factory.', 'factory:', 'CASSIE', 'shelf,'];
  mText.innerHTML = mText.textContent.trim().split(/\s+/).map(w => `<span class="w${highlights.includes(w) ? ' hl' : ''}">${w}</span>`).join(' ');
  const words = $$('.w', mText);
  const manifesto = $('#manifesto');

  /* ---------- hero video rotation ---------- */
  const films = [
    { src: 'https://www.cassieperfumes.com/wp-content/uploads/2026/01/Cassie_Africa-couture_2.mp4', name: 'Africa Couture · brand film' },
    { src: 'https://www.cassieperfumes.com/wp-content/uploads/2026/01/Amor-Loco.mp4', name: 'Amor Loco · brand film' },
    { src: 'https://www.cassieperfumes.com/wp-content/uploads/2026/01/MOTION-01_Swave_V22.mp4', name: 'Swave · brand film' },
    { src: 'https://www.cassieperfumes.com/wp-content/uploads/2026/01/Casie-Xtream_2.mp4', name: 'Xtreme · brand film' },
    { src: 'https://www.cassieperfumes.com/wp-content/uploads/2026/01/Cassie-El-Hombre.mp4', name: 'El Hombre · brand film' }
  ];
  const hv = $$('.hero-media video');
  const filmName = $('#filmName');
  let filmIdx = 0, activeV = 0, filmsOk = true;
  function playFilm(i, slot) {
    const v = hv[slot];
    if (!films.length) { filmName.textContent = 'CASSIE · atelier'; return; }
    const f = films[i % films.length];
    v.src = f.src; v.load();
    const onErr = () => { films.splice(i % films.length, 1); if (!films.length) { filmsOk = false; filmName.textContent = 'CASSIE · atelier'; } else playFilm(i, slot); };
    v.onerror = onErr;
    v.onplaying = () => { hv.forEach(x => x.classList.remove('on')); v.classList.add('on'); filmName.textContent = f.name; };
    v.play().catch(() => {});
  }
  if (!reduced) {
    playFilm(0, 0);
    setInterval(() => {
      if (!films.length || document.hidden) return;
      filmIdx++; activeV = 1 - activeV;
      playFilm(filmIdx, activeV);
    }, 9000);
  }

  /* ---------- zoom video ---------- */
  const zoomVideo = $('#zoomVideo');
  if (!reduced) {
    zoomVideo.src = 'https://www.cassieperfumes.com/wp-content/uploads/2026/01/XCALIBUR-1.mp4';
    zoomVideo.onplaying = () => zoomVideo.classList.add('on');
    zoomVideo.onerror = () => zoomVideo.remove();
  }

  /* ---------- mist canvases ---------- */
  function mist(canvas, palette) {
    const ctx = canvas.getContext('2d');
    let w, h, blobs = [];
    const resize = () => { w = canvas.width = Math.floor(canvas.clientWidth / 2); h = canvas.height = Math.floor(canvas.clientHeight / 2); };
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 9; i++) blobs.push({ x: Math.random(), y: Math.random(), r: .25 + Math.random() * .35, s: .00008 + Math.random() * .00012, a: Math.random() * 6.28, c: palette[i % palette.length] });
    return function (t, visible) {
      if (!visible) return;
      ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      blobs.forEach(b => {
        const x = (b.x + Math.sin(t * b.s + b.a) * .25) * w, y = (b.y + Math.cos(t * b.s * 1.3 + b.a) * .25) * h, r = b.r * Math.max(w, h);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, b.c); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
    };
  }
  const heroMist = mist($('#mist'), ['rgba(120,70,30,.5)', 'rgba(60,40,30,.6)', 'rgba(140,100,50,.35)', 'rgba(40,30,30,.6)']);
  const zoomMist = mist($('#zoomMist'), ['rgba(150,95,45,.55)', 'rgba(80,60,55,.6)', 'rgba(170,120,60,.4)', 'rgba(60,45,40,.6)']);

  /* ---------- scroll scenes ---------- */
  const heroMedia = $('#heroMedia'), heroContent = $('#heroContent'), hero = $('#hero');
  const hs = $('#services'), hsTrack = $('#hsTrack'), hsProg = $('#hsProgress');
  const zoom = $('#zoom'), zoomFrame = $('#zoomFrame'), zoomText = $('#zoomText');
  const cards = $$('.card'), progressBar = $('#progressBar');
  const gallery = $('#gallery');

  function sceneProgress(el) {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / (r.height - window.innerHeight), 0, 1);
  }

  let vh = window.innerHeight;
  window.addEventListener('resize', () => { vh = window.innerHeight; });

  function frame(now) {
    // smooth scroll
    if (smoothing) {
      currentY = lerp(currentY, targetY, .085);
      if (Math.abs(currentY - targetY) < .3) currentY = targetY;
      const y = Math.round(currentY * 100) / 100;
      if (Math.abs(y - window.scrollY) > .05) { lastSet = y; window.scrollTo(0, y); }
    }
    const y = window.scrollY;

    // nav
    nav.classList.toggle('scrolled', y > 40);
    nav.classList.toggle('hide', y > lastY + 4 && y > 300 && !mm.classList.contains('open'));
    if (Math.abs(y - lastY) > 4) lastY = y;
    progressBar.style.width = (y / (document.documentElement.scrollHeight - vh) * 100) + '%';

    // hero parallax
    const hp = clamp(y / vh, 0, 1);
    if (hp < 1.01) {
      heroMedia.style.transform = `scale(${1 + hp * .18}) translateY(${hp * 10}%)`;
      heroContent.style.transform = `translateY(${hp * -80}px)`;
      heroContent.style.opacity = 1 - hp * 1.4;
    }
    heroMist(now, hp < 1 && !filmsOk);

    // manifesto words
    if (!mobile()) {
      const mp = sceneProgress(manifesto);
      const n = words.length;
      words.forEach((w, i) => { w.style.opacity = clamp((mp * 1.15 * n - i) * .8 + .12, .12, 1); });
    }

    // horizontal services
    if (!mobile()) {
      const p = sceneProgress(hs);
      const dist = hsTrack.scrollWidth - window.innerWidth;
      hsTrack.style.transform = `translate3d(${-p * dist}px,0,0)`;
      hsProg.style.width = (p * 100) + '%';
    }

    // zoom film
    const zp = sceneProgress(zoom);
    const zr = zoom.getBoundingClientRect();
    if (zr.bottom > 0 && zr.top < vh) {
      const t = easeOut(clamp(zp / .55, 0, 1));
      const base = mobile() ? .6 : .32;
      zoomFrame.style.transform = `scale(${base + (1 - base) * t})`;
      zoomFrame.style.borderRadius = (32 * (1 - t)) + 'px';
      const tp = clamp((zp - .6) / .25, 0, 1);
      zoomText.style.opacity = tp;
      zoomText.style.transform = `translateY(${(1 - tp) * 30}px)`;
      zoomMist(now, !zoomVideo.classList.contains('on'));
      if (zoomVideo.paused && zoomVideo.src) zoomVideo.play().catch(() => {});
    }

    // card stack
    cards.forEach((c, i) => {
      const next = cards[i + 1];
      if (!next) return;
      const nr = next.getBoundingClientRect();
      const q = clamp((vh * .95 - nr.top) / (vh * .6), 0, 1);
      c.style.transform = `scale(${1 - q * .06})`;
      c.style.filter = `brightness(${1 - q * .55})`;
    });

    // active menu
    let active = null;
    sections.forEach(s => { if (s.getBoundingClientRect().top <= vh * .4) active = s.id; });
    menuLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + active));

    if (window.cursorFrame) window.cursorFrame();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- anchor links with smooth scroll ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const el = $(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (smoothing) { targetY = top; }
    else window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ---------- export peek ---------- */
  const peek = $('#peek'), peekItems = $$('.peek-item');
  if (fine) {
    let px = 0, py = 0;
    $$('#regions li').forEach(li => {
      li.addEventListener('mouseenter', () => { peek.classList.add('on'); peekItems.forEach((p, i) => p.classList.toggle('on', i === +li.dataset.peek)); });
      li.addEventListener('mouseleave', () => peek.classList.remove('on'));
    });
    $('#regions').addEventListener('mousemove', e => { px = e.clientX + 60; py = e.clientY; peek.style.left = px + 'px'; peek.style.top = py + 'px'; });
  }

  /* ---------- gallery drag ---------- */
  let dragging = false, startX = 0, startLeft = 0, moved = false;
  gallery.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') return; dragging = true; moved = false; startX = e.clientX; startLeft = gallery.scrollLeft; gallery.classList.add('dragging'); gallery.setPointerCapture(e.pointerId); });
  gallery.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - startX; if (Math.abs(dx) > 4) moved = true; gallery.scrollLeft = startLeft - dx; });
  const endDrag = () => { dragging = false; gallery.classList.remove('dragging'); };
  gallery.addEventListener('pointerup', endDrag); gallery.addEventListener('pointercancel', endDrag);
  gallery.addEventListener('click', e => { if (moved) e.preventDefault(); }, true);
  gallery.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; gallery.scrollLeft += e.deltaY; e.preventDefault(); }, { passive: false });

  /* ---------- RFQ demo ---------- */
  const form = $('#rfqForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) return;
    Array.from(form.children).forEach(c => { if (!c.classList.contains('f-done')) c.style.display = 'none'; });
    $('.f-done', form).hidden = false;
  });
})();
