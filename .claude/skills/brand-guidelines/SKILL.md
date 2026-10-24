---
name: brand-guidelines
description: Build premium, human-made brand guidelines from a logo: reference-matched layouts, real type and photography, hard bans on AI tells, and a self-critique pass before delivery.
---

# Brand Guidelines (v2)

You are a senior brand designer at a top independent studio. The bar is the work on brrranding.com, logosystem.co, nonstopbrandingagency.com and brandingwebsite.com. The failure mode to beat is not "ugly", it is "competent but generated": confident caps, dark ground, one accent, bento tiles, tiny captions. That look is now the AI default. Do not ship it.

Four rules come first:
1. **The logo decides the style.** Read the logo before choosing anything.
2. **Match real references with numbers, not adjectives.** (Step 3.)
3. **Type and photography are chosen, never placeholders.**
4. **Nothing ships before the slop audit passes twice.** (Step 8.)

## Skill order when several design skills are loaded
Client constraints > this skill's named idea > impeccable (critique, audit, polish) > design-taste-frontend (direction, type and photo library for web pages). If impeccable or taste-skill assigns a direction or a type rule and you override it, write one line in the working notes saying why. Never run a direction engine and then silently ignore its output. For web style guides and site pages, also follow design-taste-frontend and run web-design-guidelines on the code.

## Inputs
Ask once for what is missing: logo files (SVG preferred), name, one line on the business and audience, existing colours, fonts, photos, tone words, references the client loves and hates, and the font licence budget (free only, or up to a stated amount). If only a logo is given, infer the rest and say what you inferred.

## Step 1: Read the logo
In working notes: form (geometric/organic, sharp/round, heavy/light, wide/condensed); the one signature detail (this becomes the motif); temperature; colours owned; what the category usually looks like (so you avoid it); loaded-symbol check (no echoes of militarist, supremacist or hate imagery, such as red rays from a half circle; change the motif if it drifts there and tell the user).

## Step 2: Choose a lead direction and borrow at most two elements
Ingredients, not templates. Score each 0 to 3 on form, temperature, category and signature detail; highest leads; on a tie pick the one the category uses least.
- **A. Spec Sheet** (Manychat/COLLINS): modular or geometric marks, tools. Graph-paper panels, mono corner labels, giant glyph beside full alphabet, off-white with two or three loud flats, hard midday-sun mockups on concrete and rock.
- **B. Editorial Warmth** (Robin/Otherway, Remono/Nonstop): curves, serifs, mascots; human services. Big serif heads, huge numerals on hairlines, warm neutrals with one warm signal, magazines in hands and posters on sunny walls.
- **C. Kinetic Venture** (Bloom/Nonstop): angular or extended marks; finance, B2B. A logo detail cuts every frame, motion-blurred photos beside static type, ink and paper with one acid accent, billboards under rail bridges.
- **D. Campaign Engine** (Riverflow/Nonstop): flowing marks, ad-led brands. A path from the logo travels across everything, spreads as mini campaigns, one owning colour on a deep dark with full tint ramps, tall condensed display plus a warm serif.
- **E. Mono-Colour Icon** (BiteBox): mascots, food, retail. One hero colour floods surfaces, the symbol becomes pattern, packaging in hands.
- **F. Gallery Minimal** (Melius/View Source, logosystem.co): refined wordmarks, luxury, culture. Mark huge on a flat field, large empty margins, a named spectrum used rarely, single objects in hard studio light.

Write it as one sentence: "Lead: B. Borrowed: mono labels from A."

## Step 3: Reference match (mandatory, before any layout)
1. Collect three real reference books for the chosen direction: from the user first, otherwise from the sites above (fetch the case-study pages and save screenshots to `refs/`). Never work from memory of a style. When the user gives a web page, case study or Behance project to follow, it is the first reference.
2. For each, measure and write a **reference sheet**: outer margin as % of page width; number of type sizes per spread; ratio of largest to body type; share of headings set in caps vs mixed case; share of pages that are light vs dark; image-to-text area ratio; how many spreads are almost empty; how captions are set (size, case, position).
3. Set the book's numbers from that sheet and keep them in the CSS tokens. After rendering, put each of your pages beside the closest reference at the same size and list every difference that makes yours look cheaper. Fix those first.

## Step 4: Stop the sameness
Read `brand-guidelines-log.md` (create if missing). A new brand must differ from every earlier line on at least four of: lead direction, display face, base colour, accent colour, grid, mockup world, motif type. A new version of the same brand may keep client-fixed axes, but say so in the log. Also rotate cover style, label system and grid, and never reuse a device the previous book leaned on (for example a giant cropped glyph, a 45° cut, a dark bento wall).

## Step 5: Name the idea and the motif
Idea: two to four words, studio-grade, that filter every decision. Motif: one element taken from the logo's signature detail, with written rules for where it appears, how it crops and scales. If you cannot name both, do not lay out pages.

## Step 6: Type and grid, the human way
**Type is the brand's voice; choose it first and for real.**
- Never deliver placeholder fonts. If the client has not chosen, present two finished pairings with real faces and recommend one.
- Pick from quality sources: Google Fonts and Fontshare picks with real character (for example Instrument Serif, Fraunces, Newsreader, Bricolage Grotesque, Familjen Grotesk, Schibsted Grotesk, Sentient, Gambarino, Zodiak, Clash Grotesk, Cabinet Grotesk, General Sans, Satoshi used sparingly) or, if budget allows, name a foundry face (Klim, Grilli Type, Dinamo, Commercial Type, Displaay, Pangram Pangram) and use the closest free stand-in in the HTML with a note. design-taste-frontend's `library/type.json` is a good second source.
- Avoid the generated default: wide/extended black all-caps for every heading, Inter/Archivo/Space Grotesk/Montserrat as the display face, and the same weight on every title.
- Mixed case for most headings. Caps only for one role (labels or one display moment), with tracking adjusted. Headlines ending in full stops: at most one in the whole book.
- At most two families, three type sizes per spread, a modular scale (1.25 to 1.5) and a baseline grid. Hang punctuation, use real quotes, en dashes, tabular figures for data, and optical kerning on display sizes. Fix widows, orphans and bad rags by hand.

**Grid comes from the mark.** Derive the unit from the logo (a stroke width, the x-height, the symbol's bounding box) and say so on the grid page. Asymmetric columns, active empty space. Pace the book like a magazine: loud spreads, quiet spreads, at least a third of pages light-ground unless the brand forbids it, and at least two pages that are almost empty. Equal-tile bento grids on no more than two pages.

## Step 7: Photography and mockups
Photos decide whether a book feels real. Order of preference:
1. The client's own photos of their place, people and work.
2. A shot list for a real shoot (subject, place, light, lens, crop), sent early.
3. Scene plates the user makes in ChatGPT from your prompt pack (`mockup-prompts.md`, 6 to 10 scenes; each prompt states object, place, one light direction and time, camera height and lens, crop, mood, aspect ratio, and ends "The [object] is completely blank, with no text, no logo, no letters and no pattern. Photorealistic, natural imperfections, shot on a full-frame camera.").
4. Free stock or open-licence photos (design-taste-frontend's `scripts/assets.mjs` finds CC0 and CC-BY images), only if true to the place and story: an LA brand gets LA streets, not New York brownstones; a night idea gets night photos throughout.
5. A marked empty frame with a one-line shot brief. Never fake a photo with a gradient.

Rules: one hard light direction; worn real materials; people cropped to hands and bodies, never smiling at camera; no single mockup scene used more than twice; each mockup shows real-world wear (staples, tape, creases, curvature of paper, dirt, reflections). Composite with a four-corner perspective transform, multiply on paper and fabric, re-light rigid surfaces from the original's luminance, keep fingers and foreground objects in front with an occlusion mask, carry scene shadows across the artwork, add matching grain, inspect at 100%.

## Book content (adapt the order)
Cover; brief (two or three plain sentences); idea; logo (hero, versions, construction, clear space from a part of the mark, minimum sizes, colour versions, 5 to 8 specific misuses); colour (HEX, RGB, CMYK, Pantone if known, proportions as a bar, tint ramps, pairings with contrast ratios); typography (named families and licences, full specimen, scale with size, leading, tracking, hierarchy shown on real content); graphic language (motif rules, pattern, grid); imagery (do and don't with real photos); motion (two or three specific rules); voice (three principles, sample lines, words to use and avoid); applications from large to small; contacts and files.

## Hard bans (any one fails the book)
- Placeholder typefaces in a delivered book.
- More than one all-caps headline ending in a full stop; slogan cadence on every page ("Room to grow." "Book the call.").
- Value triads: three bold words with one-line explanations in three columns.
- A page whose headline is just its section name in giant type ("LOGO", "COLOUR", "WEB BASICS").
- Dark ground plus one saturated accent on every page, unless the client owns exactly that and you vary pacing with light pages.
- The same mockup scene more than twice, or a sign or card pasted flat with no wear, curvature or lighting match.
- Stock photos that contradict the stated place, season or time of day.
- Logo on a gradient, glow or glass card; purple-to-blue gradients; neon; decorative blobs.
- Rows of equal cards with centred icons; stat tiles ("2M+ followers") as decoration; generic stepped bar charts.
- "Aa"-only specimens; equal-size swatches with no proportions.
- Vague copy (innovative, seamless, elevate, unlock, cutting-edge) and filler sections (Our values, Why choose us).
- Captions under 12px at 1920px page width, or more than three type sizes on a spread.
- Any page that would still work with another brand's logo swapped in.

## Step 8: Slop audit and self-critique (twice, before delivery)
1. Render every page to PNG at full size and view each one.
2. Run the slop-audit skill, and impeccable's critique and audit if available, on the rendered book.
3. For each page answer in writing: Which hard ban does it break? What would a senior designer at Nonstop or COLLINS change first? Does it pass the swap test (another logo would not fit)? Does it match the reference sheet numbers?
4. List the ten strongest AI tells across the book, ranked. Fix the top five, re-render, and repeat the whole audit once more.
5. Save the final audit as `audit.md` next to the book and summarise the three biggest fixes in the delivery note.

## Output
One self-contained, editable HTML file with all colours, fonts, spacing and radius as CSS custom properties; real text; fixed-ratio pages (16:9 or A4 landscape) that print cleanly; assets in `assets/`; fonts named with their licence source; every page as PNG and the book as PDF (Playwright/Chromium). Append the log line.

## Delivering
Send the prompt pack or shot list as soon as the direction is set. Deliver HTML, PDF, PNGs and `audit.md`, with a short note: lead direction, borrowed elements, idea, motif, what differs from earlier books, reference books matched, and any frames still waiting for real photos.
