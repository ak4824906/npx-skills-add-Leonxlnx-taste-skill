// Export a brand book (HTML, one .page element per page) as an editable PDF for Illustrator.
// Writes <name>-editable.pdf (vectors, images in clipping masks, live text) and
// <name>-paragraphs.jsx (an Illustrator script that swaps the PDF's line-by-line text
// for real paragraph text boxes with the same fonts, sizes, leading, tracking and colours).
//
// If <outDir>/fonts/fonts.json exists (made by make-static-fonts.py), the book is rendered with
// those static files instead of web or variable fonts. Chrome embeds variable fonts as Type 3,
// which Illustrator cannot edit as text, so static files are what keep the text live.
//
// Usage: node export-editable.mjs book.html [outDir] [pageSelector]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
// CommonJS require so a global Playwright install (NODE_PATH) is found too
const { chromium } = createRequire(import.meta.url)('playwright');

const [, , input, outArg, selArg] = process.argv;
if (!input) { console.error('usage: node export-editable.mjs book.html [outDir] [pageSelector]'); process.exit(1); }
const sel = selArg || '.page';
const src = path.resolve(input);
const outDir = path.resolve(outArg || path.dirname(src));
const name = path.basename(src, '.html');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.emulateMedia({ media: 'print' });
await page.goto(pathToFileURL(src).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const fontDir = path.join(outDir, 'fonts');
const manPath = path.join(fontDir, 'fonts.json');
if (fs.existsSync(manPath)) {
  const fonts = JSON.parse(fs.readFileSync(manPath, 'utf8'));
  const css = fonts.map((f) => `@font-face{font-family:"${f.family}";src:url("${pathToFileURL(path.join(fontDir, f.file)).href}");font-weight:${f.weight};font-style:${f.italic ? 'italic' : 'normal'}}`).join('\n');
  await page.addStyleTag({ content: css });
  const swapped = await page.evaluate((fonts) => {
    // point every text element at the static family, picking the optical size nearest its size in pt
    const byBase = {};
    fonts.forEach((f) => { (byBase[f.base.toLowerCase()] ||= new Set()).add(JSON.stringify([f.family, f.opsz])); });
    const els = new Set();
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) if (n.data.trim() && n.parentElement) els.add(n.parentElement);
    let c = 0;
    for (const el of els) {
      const cs = getComputedStyle(el);
      const base = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
      if (!byBase[base]) continue;
      const pt = parseFloat(cs.fontSize) * 0.75;
      const fam = [...byBase[base]].map((x) => JSON.parse(x)).sort((a, b) => Math.abs((a[1] || pt) - pt) - Math.abs((b[1] || pt) - pt))[0][0];
      el.style.fontFamily = `"${fam}"`;
      el.style.fontVariationSettings = 'normal';
      c++;
    }
    return c;
  }, fonts);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  console.log(`static fonts: ${fonts.length} files, ${swapped} text elements switched`);
}

const data = await page.evaluate((sel) => {
  const pages = [...document.querySelectorAll(sel)];
  const isInline = (el) => ['inline', 'contents'].includes(getComputedStyle(el).display) && el.tagName !== 'BR';
  const ownerOf = (node) => { let el = node.parentElement; while (el && isInline(el)) el = el.parentElement; return el; };
  const rotated = (el, stop) => {
    for (let e = el; e && e !== stop.parentElement; e = e.parentElement) {
      const t = getComputedStyle(e).transform;
      if (t && t !== 'none') { const m = new DOMMatrix(t); if (Math.abs(m.b) > 1e-3 || Math.abs(m.c) > 1e-3 || m.a < 0 || m.d < 0 || Math.abs(m.a - m.d) > 1e-3) return true; }
      if (getComputedStyle(e).writingMode.startsWith('vertical')) return true;
    }
    return false;
  };
  const rgb = (c) => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const out = { pages: [], skipped: 0 };
  pages.forEach((pg, pi) => {
    const pr = pg.getBoundingClientRect();
    const owners = new Map();
    const walker = document.createTreeWalker(pg, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let n = walker.currentNode; n; n = walker.nextNode()) {
      if (n.nodeType === 1) {
        if (n.closest('svg')) continue;
        if (n.tagName === 'BR') { const o = ownerOf(n); if (owners.has(o)) owners.get(o).push({ br: true }); }
        continue;
      }
      if (!n.data.trim() || n.parentElement.closest('svg,script,style')) continue;
      const o = ownerOf(n);
      if (!o) continue;
      if (!owners.has(o)) owners.set(o, []);
      owners.get(o).push({ node: n });
    }
    const paras = [];
    for (const [o, items] of owners) {
      const cs = getComputedStyle(o);
      if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      if (rotated(o, pg)) { out.skipped++; continue; }
      const runs = []; const rects = [];
      for (const it of items) {
        if (it.br) { runs.push({ text: '\u0003' }); continue; }
        const p = it.node.parentElement, s = getComputedStyle(p);
        if (rgb(s.color).a === 0) continue;
        const r = document.createRange(); r.selectNodeContents(it.node);
        const rs = [...r.getClientRects()].filter((x) => x.width > 0 && x.height > 0);
        if (!rs.length) continue;
        rects.push(...rs);
        let t = it.node.data.replace(/\s+/g, ' ');
        if (s.textTransform === 'uppercase') t = t.toUpperCase();
        else if (s.textTransform === 'lowercase') t = t.toLowerCase();
        const ls = s.letterSpacing === 'normal' ? 0 : parseFloat(s.letterSpacing);
        runs.push({ text: t, family: s.fontFamily.split(',')[0].replace(/["']/g, '').trim(), weight: +s.fontWeight, italic: s.fontStyle !== 'normal', size: parseFloat(s.fontSize), tracking: Math.round(ls / parseFloat(s.fontSize) * 1000), color: rgb(s.color), node: it.node });
      }
      // tidy whitespace across runs
      let joined = '';
      runs.forEach((r) => { if (/^\s/.test(r.text) && (joined === '' || /[\s\u0003]$/.test(joined))) r.text = r.text.replace(/^\s+/, ''); if (r.text === '\u0003') joined = joined.replace(/ $/, ''); joined += r.text; });
      for (let i = runs.length - 1; i >= 0; i--) { runs[i].text = runs[i].text.replace(/\s+$/, ''); if (runs[i].text) break; }
      const live = runs.filter((r) => r.text);
      if (!live.some((r) => r.text.trim())) continue;
      const first = live.find((r) => r.node);
      // first baseline: a zero-size inline-block sits on the baseline
      const probe = document.createElement('span');
      probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;padding:0;margin:0;border:0';
      first.node.parentNode.insertBefore(probe, first.node);
      const baseline = probe.getBoundingClientRect().bottom;
      probe.remove();
      const L = Math.min(...rects.map((r) => r.left)), T = Math.min(...rects.map((r) => r.top));
      const R = Math.max(...rects.map((r) => r.right)), B = Math.max(...rects.map((r) => r.bottom));
      const tops = [...new Set(rects.map((r) => Math.round(r.top)))].sort((a, b) => a - b);
      const lines = tops.filter((t, i) => i === 0 || t - tops[i - 1] > 2).length;
      const ob = o.getBoundingClientRect();
      const padL = parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), padR = parseFloat(cs.paddingRight) + parseFloat(cs.borderRightWidth);
      const align = { start: 'left', left: 'left', center: 'center', right: 'right', end: 'right', justify: 'justify' }[cs.textAlign] || 'left';
      const fs0 = parseFloat(getComputedStyle(first.node.parentElement).fontSize);
      let leading = cs.lineHeight === 'normal' ? fs0 * 1.2 : parseFloat(cs.lineHeight);
      if (lines > 1) { const gaps = []; const t2 = tops.filter((t, i) => i === 0 || t - tops[i - 1] > 2); for (let i = 1; i < t2.length; i++) gaps.push(t2[i] - t2[i - 1]); gaps.sort((a, b) => a - b); leading = gaps[Math.floor(gaps.length / 2)]; }
      let x, w;
      if (lines > 1 || align === 'justify') { x = ob.left + padL; w = ob.width - padL - padR + 1; }
      else { w = (R - L) * 1.08 + 6; x = align === 'center' ? (L + R) / 2 - w / 2 : align === 'right' ? R - w : L; }
      paras.push({
        x: x - pr.left, y: T - pr.top, w, h: (B - T) + leading * 1.5,
        firstBaseline: baseline - T, leading, align, lines,
        box: [L - pr.left, T - pr.top, R - pr.left, B - pr.top],
        runs: live.map(({ node, ...r }) => r),
      });
    }
    out.pages.push({ w: pr.width, h: pr.height, paras });
  });
  return out;
}, sel);

await page.pdf({ path: path.join(outDir, `${name}-editable.pdf`), preferCSSPageSize: true, printBackground: true });
// Chrome places each letter separately; join every line into one text run so Illustrator imports whole lines
const here = path.dirname(fileURLToPath(import.meta.url));
console.log(execFileSync('python3', [path.join(here, 'join-text-lines.py'), path.join(outDir, `${name}-editable.pdf`)], { encoding: 'utf8' }).trim());
await browser.close();

const tpl = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'paragraphs.template.jsx'), 'utf8');
fs.writeFileSync(path.join(outDir, `${name}-paragraphs.jsx`), tpl.replace('/*__DATA__*/null', JSON.stringify(data)));
const n = data.pages.reduce((a, p) => a + p.paras.length, 0);
const fams = new Set(); data.pages.forEach((p) => p.paras.forEach((q) => q.runs.forEach((r) => r.family && fams.add(`${r.family} ${r.weight}${r.italic ? ' italic' : ''}`))));
console.log(`${data.pages.length} pages, ${n} paragraphs, ${data.skipped} rotated text blocks left as they are`);
console.log('fonts:', [...fams].join(', '));
