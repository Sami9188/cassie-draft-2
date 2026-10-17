# CASSIE Perfumes · Website Draft 2 — "Motion"

Homepage design draft for the CASSIE Perfumes B2B website redesign, prepared by The Digital Elites.

Live preview: https://sami9188.github.io/cassie-draft-2/

Direction: cinematic, motion-led. Black canvas, oversized grotesk typography with serif italic accents, CASSIE's own brand films as full-screen backgrounds, and scroll-driven scenes. Manufacturing (OEM / ODM / private label / bulk export) leads; the own-brand shop is a secondary section.

Motion features (all vanilla JS, no libraries, no build step):
- Preloader counter and masked headline reveal
- Smooth inertia scrolling (desktop), custom cursor with labels, magnetic buttons, film grain
- Rotating full-screen brand films in the hero (fallback: animated mist)
- Word-by-word manifesto reveal, counters, marquee
- Pinned horizontal scroll through the four service routes
- Film that scales from a small frame to full screen on scroll
- Six-step process as a stacking card deck
- 3D tilt packaging tiers with cursor glow, spotlight compliance grid
- Export list with hover previews, drag gallery for the CASSIE collection, demo RFQ form

Notes:
- Brand films and product photos are loaded from cassieperfumes.com. To self-host, drop the mp4 files into `media/` and update the `films` array in `main.js`.
- Figures, MOQs, certifications and testimonials are placeholders pending CASSIE approval.
- Forms are demo-only (Zoho CRM in production).
