---
name: slop-audit
description: Run before delivering any design (brand book, website, deck, social): find and fix the tells that make work look AI-generated rather than studio-made.
---

# Slop audit

Use on every visual deliverable before it goes to the user. The goal is to catch "competent but generated" work.

## Steps
1. Render the work (Playwright screenshots at 1440px and 390px for web; every page at full size for books and decks) and look at each image.
2. If the impeccable or design-taste-frontend skills are loaded, run their critique first (impeccable critique/audit; taste-skill `references/tells.md` and `scripts/inspect.mjs` for web) and fold the findings in.
3. Check each screen or page against the tells below. Write each hit as: page or section, element, tell, fix.
4. Rank all hits, fix the top five, re-render, and audit once more.
5. Save the result as `audit.md` and name the three biggest fixes in the reply.

## Tells
**Type**
- Wide or extended black caps on every heading; one weight everywhere.
- Headlines ending in full stops, slogan cadence on every block.
- Default faces as display: Inter, Archivo, Space Grotesk, Montserrat, Poppins.
- More than three sizes per screen; captions under 12px; unhung punctuation, straight quotes, widows.
- Placeholder fonts in a final deliverable.

**Layout**
- Equal-card bento grids, three-column value triads, centred icon rows.
- Every section the same density; no quiet screens; no real empty space.
- A section named by its own title in giant type.
- Grid with no stated origin.

**Colour and effects**
- Near-black plus one saturated accent everywhere.
- Purple-blue gradients, glows, glass, blobs, noise overlays with no reason.

**Imagery**
- Stock that contradicts the stated place or time; generic LA palms, handshake, laptop-on-desk.
- The same mockup repeated; artwork pasted flat with no wear, curvature, occlusion or matching light.
- Floating devices at 30 degrees on a gradient.

**Copy**
- innovative, seamless, elevate, unlock, cutting-edge, empower, next-level.
- Stat tiles and testimonials with no source; invented numbers.

**The swap test**
- If another brand's logo would fit the page unchanged, the page has no idea in it.

## Bar
Compare against one real studio reference at the same size. If you cannot say what it does better, look again.
