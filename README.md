# CASSIE Perfumes — Website Draft 2 ("Spectrum")

Second design direction for the CASSIE Perfumes website redesign, prepared by The Digital Elites for client review.

**Live preview:** https://sami9188.github.io/cassie-draft-2/
**Draft 1 (for comparison):** https://sami9188.github.io/cassie-draft-1/

## The idea

A colour-shifting, motion-led site. Each section carries its own fragrance mood (plum, oud, amber, fresh, musk, midnight) and the whole page, including the soft "aura" background, blends from one to the next as you scroll. Typography is Fraunces (display) with Manrope (text). Bottles are rendered live as SVG so packaging options, fragrance families and the hero can be re-coloured instantly without photography.

## Sections

1. Hero — manufacturing-first headline, floating product cards, key figures
2. Ticker of services
3. Four ways to work with CASSIE — OEM, ODM, private/white label, bulk supply & export (expanding rows)
4. Six fragrance families — interactive ring with live bottle, accords and markets
5. Manufacturing process — six steps on a drawn timeline
6. Packaging configurator — shape, cap, finish, glass and label, with "Quote this configuration" feeding the RFQ
7. Quality & compliance
8. Export hub — Dubai to GCC, Africa, Far East, North America, Latin America
9. The CASSIE collection (own-brand retail) and distributor enquiry
10. Request a quotation form, contact, footer, WhatsApp button

## Interaction layer (desktop pointers)

- Custom cursor: a dot with a trailing ring that grows on links, becomes a labelled disc on bottles ("Spray") and products ("View"), and a caret in form fields.
- Spray mist: reaching a bottle releases a puff of mist from its cap, drawn on the same canvas as the scent trail that follows the pointer.
- Magnetic buttons and pills that pull toward the pointer; solid buttons fill with a rising liquid wave, glass buttons carry a sheen that follows the pointer.
- Cards tilt in 3D with a glare and a glowing border that follows the pointer; bottles tilt toward the pointer.
- Live previews: hovering a packaging option previews it on the bottle before you click; hovering a fragrance family recolours the aura.
- Rolling text on menu links and buttons, a sliding pill in the menu, headline letters that ripple on hover, timeline dots that pulse, export routes that animate when a market is hovered, and a footer wordmark whose letters swell and soften near the pointer (Fraunces variable axes).
- All of it is skipped on touch devices and for users who prefer reduced motion.

## Notes

- Static HTML/CSS/JS, no build step, no external libraries. Fonts load from Google Fonts.
- Product photos are hotlinked from cassieperfumes.com and fall back to rendered bottles if unavailable.
- Figures (MOQs, counts) and certifications are placeholders for design review and must be confirmed by CASSIE.
- Forms are front-end demos; CRM / email wiring is part of the build phase.
