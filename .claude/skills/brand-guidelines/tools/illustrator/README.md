# Editable Illustrator export

Turns a brand book (HTML, one `.page` element per page) into files a designer can edit in Illustrator.

1. **Static fonts.** Chrome embeds variable fonts as Type 3, and Illustrator turns Type 3 into outlines, not text. So bake static files with the book's axis settings:
   `python3 make-static-fonts.py Font[wght].ttf out/fonts "Family" 300,400,600 [italic] [AXIS=value] [opsz=9,72]`
   (needs `pip install fonttools`; it writes `fonts.json` next to the files).
2. **Export.** Run `node export-editable.mjs book.html out/`. It renders the book with the static fonts and writes:
   - `book-editable.pdf`: vectors, images in clipping masks, and live TrueType text.
   - `book-paragraphs.jsx`: an Illustrator script that swaps the PDF's loose text pieces for one area-text box per paragraph.
3. **Check.** `pdffonts book-editable.pdf` should list no Type 3 fonts. Avoid CSS `filter`, `mix-blend-mode`, `backdrop-filter` and blurred `box-shadow` on vector parts, because Chrome rasterizes them. Bake those effects into images instead.
4. **Deliver** the PDF, the .jsx, `fonts/` and the README from `example-ostra/editable/`.
