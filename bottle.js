/* Parametric perfume bottle renderer (inline SVG).
   Used for the packaging configurator and as a fallback where client photography is not yet supplied. */
(function () {
  let uid = 0;

  const GLASS = {
    clear:   { a: 'rgba(255,255,255,0.22)', b: 'rgba(255,255,255,0.06)', edge: 'rgba(255,255,255,0.55)' },
    smoke:   { a: 'rgba(70,70,78,0.75)',    b: 'rgba(30,30,36,0.55)',    edge: 'rgba(200,200,210,0.45)' },
    amber:   { a: 'rgba(196,128,52,0.65)',  b: 'rgba(120,64,20,0.55)',   edge: 'rgba(255,220,170,0.5)' },
    frosted: { a: 'rgba(236,232,226,0.85)', b: 'rgba(210,204,196,0.75)', edge: 'rgba(255,255,255,0.7)' },
    noir:    { a: 'rgba(22,22,24,0.95)',    b: 'rgba(8,8,10,0.95)',      edge: 'rgba(212,180,120,0.5)' },
    rose:    { a: 'rgba(232,178,170,0.6)',  b: 'rgba(190,120,112,0.5)',  edge: 'rgba(255,230,225,0.6)' },
    crystal: { a: 'rgba(240,244,246,0.4)', b: 'rgba(214,220,224,0.3)', edge: 'rgba(140,148,154,0.55)' }
  };

  const CAP = {
    gold:   ['#f6e3b4', '#c9a25a', '#8a6a2c', '#e8cf92'],
    silver: ['#f4f4f6', '#b9bcc3', '#6f737b', '#dfe1e5'],
    black:  ['#4a4a4e', '#1a1a1c', '#000000', '#2e2e32'],
    wood:   ['#c49a6c', '#8b5e3c', '#5a3a22', '#a97a50'],
    rosegold: ['#f7d9cc', '#d29b85', '#94604f', '#e8bba8']
  };

  const BODY = {
    flacon: 'M42 126 Q42 112 56 112 L144 112 Q158 112 158 126 L158 288 Q158 302 144 302 L56 302 Q42 302 42 288 Z',
    column: 'M64 112 L136 112 Q144 112 144 120 L144 296 Q144 304 136 304 L64 304 Q56 304 56 296 L56 120 Q56 112 64 112 Z',
    orb:    'M100 118 C152 118 182 160 182 210 C182 262 150 302 100 302 C50 302 18 262 18 210 C18 160 48 118 100 118 Z',
    facet:  'M58 112 L142 112 L166 138 L166 276 L142 302 L58 302 L34 276 L34 138 Z',
    slim:   'M74 110 L126 110 Q132 110 132 118 L138 296 Q138 304 130 304 L70 304 Q62 304 62 296 L68 118 Q68 110 74 110 Z'
  };

  function capShape(type, g) {
    switch (type) {
      case 'none':
        return '';
      case 'tall':
        return `<rect x="76" y="14" width="48" height="84" rx="3" fill="url(#${g})"/>`;
      case 'dome':
        return `<path d="M68 98 L68 66 Q68 34 100 34 Q132 34 132 66 L132 98 Z" fill="url(#${g})"/>`;
      case 'crystal':
        return `<path d="M100 18 L136 50 L124 98 L76 98 L64 50 Z" fill="url(#${g})" opacity="0.92"/>
                <path d="M100 18 L112 50 L100 98 L88 50 Z" fill="rgba(255,255,255,0.35)"/>`;
      case 'disc':
        return `<rect x="58" y="70" width="84" height="28" rx="4" fill="url(#${g})"/>`;
      default: // block
        return `<rect x="62" y="34" width="76" height="64" rx="4" fill="url(#${g})"/>`;
    }
  }

  window.bottleSVG = function (opts) {
    const o = Object.assign({ shape: 'flacon', cap: 'block', capColor: 'gold', glass: 'clear', liquid: '#e9c27a', label: 'CASSIE', sub: '', fill: 0.72 }, opts || {});
    const id = 'b' + (++uid);
    const g = GLASS[o.glass] || GLASS.clear;
    const c = CAP[o.capColor] || CAP.gold;
    const body = BODY[o.shape] || BODY.flacon;
    const liquidTop = 302 - 190 * o.fill;
    const maxW = { orb: 120, slim: 58, column: 74, flacon: 100, facet: 104 }[o.shape] || 100;
    const L = Math.max(2, o.label.length);
    const fs = Math.min(17, maxW / (L * 0.62 + (L - 1) * 0.28));
    const ls = Math.min(5, fs * 0.28);
    const labelColor = o.labelColor || ((o.glass === 'noir' || o.glass === 'smoke') ? '#e2c58c' : 'rgba(30,24,16,0.78)');
    return `
<svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${o.label} bottle render">
  <defs>
    <linearGradient id="${id}g" x1="0" x2="1">
      <stop offset="0" stop-color="${g.b}"/><stop offset="0.18" stop-color="${g.edge}"/>
      <stop offset="0.32" stop-color="${g.a}"/><stop offset="0.78" stop-color="${g.b}"/>
      <stop offset="0.92" stop-color="${g.edge}"/><stop offset="1" stop-color="${g.b}"/>
    </linearGradient>
    <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${o.liquid}" stop-opacity="0.95"/><stop offset="1" stop-color="${o.liquid}" stop-opacity="0.65"/>
    </linearGradient>
    <linearGradient id="${id}c" x1="0" x2="1">
      <stop offset="0" stop-color="${c[2]}"/><stop offset="0.25" stop-color="${c[0]}"/>
      <stop offset="0.5" stop-color="${c[1]}"/><stop offset="0.75" stop-color="${c[3]}"/><stop offset="1" stop-color="${c[2]}"/>
    </linearGradient>
    <clipPath id="${id}k"><path d="${body}"/></clipPath>
    <radialGradient id="${id}s" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="100" cy="308" rx="78" ry="8" fill="url(#${id}s)"/>
  ${o.cap === 'none' ? '<rect x="88" y="98" width="24" height="16" rx="2" fill="none" stroke="' + g.edge + '" stroke-width="1"/>' : `<rect x="86" y="96" width="28" height="18" rx="2" fill="url(#${id}c)"/>`}
  ${capShape(o.cap, id + 'c')}
  <g clip-path="url(#${id}k)">
    <rect x="0" y="${liquidTop}" width="200" height="320" fill="url(#${id}l)"/>
    <rect x="0" y="${liquidTop}" width="200" height="2" fill="rgba(255,255,255,0.45)"/>
  </g>
  <path d="${body}" fill="url(#${id}g)" stroke="${g.edge}" stroke-width="1.2"/>
  <path d="${body}" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="5" clip-path="url(#${id}k)"/>
  <rect x="58" y="128" width="7" height="150" rx="3.5" fill="rgba(255,255,255,0.28)" clip-path="url(#${id}k)"/>
  <text x="100" y="212" text-anchor="middle" font-family="Cormorant Garamond, Bodoni Moda, Georgia, serif" font-size="${fs.toFixed(1)}" letter-spacing="${ls.toFixed(1)}" fill="${labelColor}">${o.label}</text>
  ${o.sub ? `<text x="100" y="232" text-anchor="middle" font-family="Jost, DM Sans, Arial, sans-serif" font-size="${Math.min(7, fs * 0.45).toFixed(1)}" letter-spacing="${Math.min(3, fs*0.18).toFixed(1)}" fill="${labelColor}">${o.sub}</text>` : ''}
</svg>`;
  };

  // Replace any product photo that fails to load with a rendered bottle.
  window.attachBottleFallbacks = function () {
    document.querySelectorAll('img[data-fallback]').forEach(function (img) {
      const swap = function () {
        const wrap = document.createElement('div');
        wrap.className = 'bottle-fallback';
        let cfg = {};
        try { cfg = JSON.parse(img.dataset.fallback); } catch (e) {}
        wrap.innerHTML = window.bottleSVG(cfg);
        img.replaceWith(wrap);
      };
      if (img.complete && img.naturalWidth === 0) swap();
      else img.addEventListener('error', swap, { once: true });
    });
  };
})();
