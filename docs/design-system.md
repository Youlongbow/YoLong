# RAVEN Visual Design System — Editorial Intelligence

**Approved direction:** Direction A (Cold Editorial / Intelligence Luxury), with selective contrast and architectural geometry from Direction C. Implemented in `assets/editorial.css`.

## Brand behavior
RAVEN is an independent professional security, risk governance, field practice and research platform. Visual authority comes from restrained presentation, accurate material and a clear hierarchy, not mock tactical interfaces.

- Main field: graphite black `#0b0e11` and charcoal `#171a1d`.
- Contrast surfaces: warm off-white `#eeece7` and soft mineral grey. Use selectively in one or two modules, not as a full white page.
- Accent: deep crimson `#b9292d` for active navigation, selected actions and small rules.
- Text: warm white `#eeece8`, secondary grey `#a7a9aa`; dark ink on light panels.
- Hero: the original user-approved raven on classical stone architecture, hosted locally at `assets/media/brand/raven-architecture.svg` (a self-contained image). Preserve the raven and architectural setting. Avoid overlaying decorative targeting reticles or combat-interface marks.
- Logomark: original approved RAVEN artwork in `content/media-map.json`. Navigation should retain proportion and have room to breathe.

## Type & layout
- Editorial serif for hero wordmark, principal section titles and highlighted featured stories.
- Modern system sans for navigation, long-form Chinese/English reading and operational copy.
- Monospace only for functional metadata such as dates and short indices.
- 1600px centered content shell with fluid side padding; readable article line measure remains narrower.
- Prefer careful vertical spacing and subtle separators over repeated boxed labels.
- Interaction: tiny hover movement, clear focus rings and no decorative animation on reduced-motion preferences.

## Homepage order
1. Focused architectural hero (dark), authentic English/Chinese headings, two clear actions.
2. Split brand statement — warm light on left, dark on right.
3. Three editorial section links (light research / dark intelligence / light HEAT).
4. Core competencies from the actual profile data.
5. Security incident archive excerpt, with a light featured record and dark adjacent records. The content must come from the actual bilingual archive, never fabricated examples.
6. Research papers and professional platforms.

## Mobile rules
- Preserve raven as a smaller image in the upper field. Keep all editorial text and buttons readable.
- Stack contrast modules naturally; avoid sideways scrolling and text over the raven's face.
- Native navigation and language links should work without JS-dependent routing.
- All images self-hosted; no reliance on Google Fonts for Chinese mainland users.

## Editing safeguards
- Layout changes must leave source content, bilingual article URLs, citations, HEAT curriculum and existing automation data files intact.
- The site remains a Cloudflare preview until domain and publishing cutover acceptance.
- GitHub Actions checks build and live response; use the Playwright browser workflow for visual acceptance on redesigns.
