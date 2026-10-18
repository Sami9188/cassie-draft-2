/* Parametric perfume bottle renderer (inline SVG), v2.
   Glass with specular highlights, thick base, metal caps with collar, optional reflection.
   Used for the packaging configurator and as a fallback where client photography is not supplied. */
(function () {
  let uid = 0;

  const GLASS = {
    clear:   { a: 'rgba(255,255,255,0.20)', b: 'rgba(255,255,255,0.05)', edge: 'rgba(255,255,255,0.60)', tint: 'rgba(255,255,255,0.08)' },
    crystal: { a: 'rgba(236,240,244,0.30)', b: 'rgba(200,210,220,0.18)', edge: 'rgba(255,255,255,0.75)', tint: 'rgba(220,230,240,0.10)' },
    smoke:   { a: 'rgba(80,80,88,0.78)',    b: 'rgba(28,28,34,0.62)',    edge: 'rgba(210,210,220,0.50)', tint: 'rgba(0,0,0,0.25)' },
    amber:   { a: 'rgba(206,134,52,0.70)',  b: 'rgba(120,62,18,0.60)',   edge: 'rgba(255,220,170,0.55)', tint: 'rgba(255,170,80,0.15)' },
    frosted: { a: 'rgba(238,234,228,0.88)', b: 'rgba(212,206,198,0.78)', edge: 'rgba(255,255,255,0.80)', tint: 'rgba(255,255,255,0.20)' },
    noir:    { a: 'rgba(26,24,26,0.96)',    b: 'rgba(8,8,10,0.96)',      edge: 'rgba(212,180,120,0.55)', tint: 'rgba(0,0,0,0.3)' },
    rose:    { a: 'rgba(236,180,172,0.62)', b: 'rgba(196,122,114,0.52)', edge: 'rgba(255,232,228,0.65)', tint: 'rgba(255,200,195,0.15)' },
    violet:  { a: 'rgba(170,140,220,0.55)', b: 'rgba(90,60,150,0.55)',   edge: 'rgba(230,215,255,0.65)', tint: 'rgba(170,140,220,0.15)' },
    emerald: { a: 'rgba(80,160,130,0.60)',  b: 'rgba(20,80,60,0.60)',    edge: 'rgba(200,245,225,0.6)',  tint: 'rgba(80,160,130,0.15)' }
  };

  const CAP = {
    gold:     ['#f8e7bd', '#cfa75d', '#8a6a2c', '#ecd59a', '#5f4617'],
    silver:   ['#f7f7f9', '#bfc2c9', '#70747c', '#e3e5e9', '#4d5159'],
    black:    ['#55555a', '#1c1c1e', '#000000', '#333337', '#0a0a0b'],
    wood:     ['#cfa678', '#8f6140', '#5a3a22', '#b07f55', '#3e2715'],
    rosegold: ['#fadfd3', '#d69d87', '#96614f', '#ecc0ad', '#6d4337'],
    white:    ['#ffffff', '#e9e6e1', '#b9b4ac', '#f6f4f0', '#8f8a82']
  };

  const BODY = {
    flacon: 'M42 126 Q42 112 56 112 L144 112 Q158 112 158 126 L158 288 Q158 302 144 302 L56 302 Q42 302 42 288 Z',
    column: 'M64 112 L136 112 Q144 112 144 120 L144 296 Q144 304 136 304 L64 304 Q56 304 56 296 L56 120 Q56 112 64 112 Z',
    orb:    'M100 118 C152 118 182 160 182 210 C182 262 150 302 100 302 C50 302 18 262 18 210 C18 160 48 118 100 118 Z',
    facet:  'M58 112 L142 112 L166 138 L166 276 L142 302 L58 302 L34 276 L34 138 Z',
    slim:   'M74 110 L126 110 Q132 110 132 118 L138 296 Q138 304 130 304 L70 304 Q62 304 62 296 L68 118 Q68 110 74 110 Z',
    tall:   'M66 100 Q66 90 76 90 L124 90 Q134 90 134 100 L134 296 Q134 306 124 306 L76 306 Q66 306 66 296 Z'
  };
  const EXTENT = { flacon: [42, 158], column: [56, 144], orb: [18, 182], facet: [34, 166], slim: [62, 138], tall: [66, 134] };

  function capShape(type, g, c) {
    const hl = `<linearGradient id="${g}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>`;
    switch (type) {
      case 'none': return '';
      case 'tall':
        return `<defs>${hl}</defs><rect x="76" y="14" width="48" height="84" rx="3" fill="url(#${g})"/><rect x="76" y="14" width="48" height="84" rx="3" fill="url(#${g}h)"/>`;
      case 'dome':
        return `<defs>${hl}</defs><path d="M68 98 L68 66 Q68 34 100 34 Q132 34 132 66 L132 98 Z" fill="url(#${g})"/><path d="M68 98 L68 66 Q68 34 100 34 Q132 34 132 66 L132 98 Z" fill="url(#${g}h)"/>`;
      case 'crystal':
        return `<path d="M100 18 L136 50 L124 98 L76 98 L64 50 Z" fill="url(#${g})" opacity="0.95"/><path d="M100 18 L112 50 L100 98 L88 50 Z" fill="rgba(255,255,255,0.4)"/><path d="M64 50 L88 50 L76 98 Z" fill="rgba(0,0,0,0.18)"/>`;
      case 'disc':
        return `<defs>${hl}</defs><rect x="58" y="70" width="84" height="28" rx="4" fill="url(#${g})"/><rect x="58" y="70" width="84" height="28" rx="4" fill="url(#${g}h)"/>`;
      case 'sphere':
        return `<defs><radialGradient id="${g}s" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${c[0]}"/><stop offset=".5" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[4]}"/></radialGradient></defs><circle cx="100" cy="62" r="36" fill="url(#${g}s)"/>`;
      default: // block
        return `<defs>${hl}</defs><rect x="62" y="34" width="76" height="64" rx="4" fill="url(#${g})"/><rect x="62" y="34" width="76" height="64" rx="4" fill="url(#${g}h)"/>`;
    }
  }

  window.bottleSVG = function (opts) {
    const o = Object.assign({ shape: 'flacon', cap: 'block', capColor: 'gold', glass: 'clear', liquid: '#e9c27a', label: 'CASSIE', sub: '', fill: 0.72, reflect: false, labelColor: '' }, opts || {});
    const id = 'b' + (++uid);
    const g = GLASS[o.glass] || GLASS.clear;
    const c = CAP[o.capColor] || CAP.gold;
    const body = BODY[o.shape] || BODY.flacon;
    const ext = EXTENT[o.shape] || EXTENT.flacon;
    const liquidTop = 302 - 190 * o.fill;
    const maxW = (ext[1] - ext[0]) * 0.82;
    const L = Math.max(2, (o.label || '').length);
    const fs = Math.min(17, maxW / (L * 0.62 + (L - 1) * 0.28));
    const ls = Math.min(5, fs * 0.28);
    const dark = o.glass === 'noir' || o.glass === 'smoke';
    const labelColor = o.labelColor || (dark ? '#e2c58c' : 'rgba(30,24,16,0.78)');
    const viewH = o.reflect ? 420 : 320;
    return `
<svg viewBox="0 0 200 ${viewH}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${o.label || 'perfume'} bottle render">
  <defs>
    <linearGradient id="${id}g" x1="0" x2="1">
      <stop offset="0" stop-color="${g.b}"/><stop offset="0.14" stop-color="${g.edge}"/>
      <stop offset="0.30" stop-color="${g.a}"/><stop offset="0.55" stop-color="${g.tint}"/>
      <stop offset="0.80" stop-color="${g.b}"/><stop offset="0.93" stop-color="${g.edge}"/><stop offset="1" stop-color="${g.b}"/>
    </linearGradient>
    <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${o.liquid}" stop-opacity="0.95"/><stop offset="1" stop-color="${o.liquid}" stop-opacity="0.7"/>
    </linearGradient>
    <linearGradient id="${id}lx" x1="0" x2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.22"/><stop offset="0.25" stop-color="#fff" stop-opacity="0.12"/>
      <stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.28"/>
    </linearGradient>
    <linearGradient id="${id}c" x1="0" x2="1">
      <stop offset="0" stop-color="${c[2]}"/><stop offset="0.22" stop-color="${c[0]}"/>
      <stop offset="0.5" stop-color="${c[1]}"/><stop offset="0.78" stop-color="${c[3]}"/><stop offset="1" stop-color="${c[4]}"/>
    </linearGradient>
    <linearGradient id="${id}base" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0.22"/>
    </linearGradient>
    <linearGradient id="${id}spec" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.2" stop-color="#fff" stop-opacity="0.45"/><stop offset="0.8" stop-color="#fff" stop-opacity="0.35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="${id}ref" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0.34"/>
    </linearGradient>
    <mask id="${id}rm"><rect x="0" y="190" width="200" height="130" fill="url(#${id}ref)"/></mask>
    <clipPath id="${id}k"><path d="${body}"/></clipPath>
    <radialGradient id="${id}s" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#000" stop-opacity="0.4"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  </defs>
  <g id="${id}bottle">
    ${o.cap === 'none'
      ? `<rect x="88" y="98" width="24" height="16" rx="2" fill="none" stroke="${g.edge}" stroke-width="1"/>`
      : `<rect x="84" y="97" width="32" height="17" rx="2" fill="url(#${id}c)"/><rect x="84" y="97" width="32" height="5" rx="2" fill="#fff" opacity=".35"/>`}
    ${capShape(o.cap, id + 'c', c)}
    <g clip-path="url(#${id}k)">
      <rect x="0" y="${liquidTop}" width="200" height="320" fill="url(#${id}l)" class="liquid"/>
      <rect x="0" y="${liquidTop}" width="200" height="320" fill="url(#${id}lx)"/>
      <rect x="0" y="${liquidTop}" width="200" height="1.5" fill="rgba(255,255,255,0.5)"/>
      <rect x="0" y="276" width="200" height="30" fill="url(#${id}base)"/>
    </g>
    <path d="${body}" fill="url(#${id}g)" stroke="${g.edge}" stroke-width="1.2"/>
    <path d="${body}" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="6" clip-path="url(#${id}k)"/>
    <rect x="${ext[0] + 14}" y="126" width="6" height="150" rx="3" fill="url(#${id}spec)" clip-path="url(#${id}k)"/>
    <rect x="${ext[1] - 18}" y="140" width="2.5" height="130" rx="1.5" fill="#fff" opacity=".18" clip-path="url(#${id}k)"/>
    ${o.label ? `<text x="100" y="212" text-anchor="middle" font-family="Fraunces, Cormorant Garamond, Georgia, serif" font-size="${fs.toFixed(1)}" letter-spacing="${ls.toFixed(1)}" fill="${labelColor}">${o.label}</text>` : ''}
    ${o.sub ? `<text x="100" y="232" text-anchor="middle" font-family="Manrope, Jost, Arial, sans-serif" font-size="${Math.min(7, fs * 0.45).toFixed(1)}" letter-spacing="${Math.min(3, fs * 0.18).toFixed(1)}" fill="${labelColor}">${o.sub}</text>` : ''}
  </g>
  <ellipse cx="100" cy="308" rx="76" ry="7" fill="url(#${id}s)"/>
  ${o.reflect ? `<g transform="translate(0,622) scale(1,-1)" mask="url(#${id}rm)" opacity=".9"><use href="#${id}bottle"/></g>` : ''}
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
