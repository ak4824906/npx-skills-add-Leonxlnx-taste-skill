// Brand book: real paragraph text for Illustrator.
// 1. Install the book's fonts. 2. File > Open the -editable.pdf, choose "All pages".
// 3. File > Scripts > Other Script... and pick this file.
// Each paragraph's line-by-line PDF text is replaced by one area-text box with the same
// font, size, leading, tracking, colour and alignment, in the same place in the stack.
#target illustrator
(function () {
  var DATA = /*__DATA__*/null;

  if (!app.documents.length) { alert('Open the editable PDF first (File > Open, "All pages"), then run this script.'); return; }
  var doc = app.activeDocument;
  var abs = doc.artboards, pages = DATA.pages, map = [], i, j;

  if (abs.length === pages.length) { for (i = 0; i < pages.length; i++) map[i] = i; }
  else if (abs.length === 1) {
    var ans = prompt('This document has one artboard. Which page of the PDF is it? (1 to ' + pages.length + ')', '1');
    if (!ans) return;
    var pn = parseInt(ans, 10) - 1;
    if (isNaN(pn) || pn < 0 || pn >= pages.length) { alert('No page ' + ans + '.'); return; }
    for (i = 0; i < pages.length; i++) map[i] = -1;
    map[pn] = 0;
  } else { alert('The document has ' + abs.length + ' artboards but the book has ' + pages.length + ' pages. Open the PDF with "All pages", or one page at a time.'); return; }

  // ---- fonts ----
  function norm(s) { return String(s).toLowerCase().replace(/[\s_\-]/g, ''); }
  var WEIGHTS = [['hairline', 100], ['thin', 100], ['extralight', 200], ['ultralight', 200], ['semibold', 600], ['demibold', 600], ['extrabold', 800], ['ultrabold', 800], ['light', 300], ['medium', 500], ['bold', 700], ['heavy', 800], ['black', 900]];
  function styleWeight(st) { for (var k = 0; k < WEIGHTS.length; k++) if (st.indexOf(WEIGHTS[k][0]) >= 0) return WEIGHTS[k][1]; return 400; }

  var needed = {}, p, q, r;
  for (i = 0; i < pages.length; i++) { if (map[i] < 0) continue; for (j = 0; j < pages[i].paras.length; j++) { var rs = pages[i].paras[j].runs; for (var k = 0; k < rs.length; k++) if (rs[k].family) needed[norm(rs[k].family)] = rs[k].family; } }
  var cands = {}, nf;
  for (nf in needed) cands[nf] = [];
  for (i = 0; i < app.textFonts.length; i++) {
    var f = app.textFonts[i], fam = norm(f.family);
    for (nf in needed) {
      if (fam === nf || fam.indexOf(nf) === 0) {
        var st = norm(f.style), m = /(\d+)pt/.exec(fam);
        cands[nf].push({ font: f, exact: fam === nf, w: styleWeight(st), it: /italic|oblique/.test(st), opsz: m ? +m[1] : 0 });
      }
    }
  }
  var missing = [];
  for (nf in needed) if (!cands[nf].length) missing.push(needed[nf]);
  if (missing.length) { alert('Install these fonts, restart Illustrator and run the script again (nothing was changed):\n\n' + missing.join('\n')); return; }
  var fcache = {};
  function pickFont(run, sizePt) {
    var key = norm(run.family) + '|' + run.weight + '|' + run.italic + '|' + Math.round(sizePt);
    if (fcache[key]) return fcache[key];
    var list = cands[norm(run.family)], best = null, bs = 1e9;
    for (var c = 0; c < list.length; c++) {
      var s = Math.abs(list[c].w - run.weight) + (list[c].it !== run.italic ? 1000 : 0) + (list[c].exact ? 0 : 20) + (list[c].opsz ? Math.abs(list[c].opsz - sizePt) / 4 : 0);
      if (s < bs) { bs = s; best = list[c].font; }
    }
    return (fcache[key] = best);
  }

  // ---- existing PDF text: read bounds once ----
  var olds = [];
  for (i = 0; i < doc.textFrames.length; i++) {
    var tf0 = doc.textFrames[i], gb = tf0.geometricBounds;
    olds.push({ tf: tf0, cx: (gb[0] + gb[2]) / 2, cy: (gb[1] + gb[3]) / 2, used: false });
  }

  var JUST = { left: Justification.LEFT, center: Justification.CENTER, right: Justification.RIGHT, justify: Justification.FULLJUSTIFYLASTLINELEFT };
  function rangeOf(tf, start, len) {
    var rg = tf.textRange.characters[start];
    try { rg.length = len; return [rg]; } catch (e) {
      var out = []; for (var c = start; c < start + len; c++) out.push(tf.textRange.characters[c]); return out;
    }
  }
  function style(rgs, run, k, leading) {
    var col = new RGBColor(); col.red = run.color.r; col.green = run.color.g; col.blue = run.color.b;
    for (var g = 0; g < rgs.length; g++) {
      var ca = rgs[g].characterAttributes;
      ca.textFont = pickFont(run, run.size * k);
      ca.size = run.size * k;
      ca.autoLeading = false;
      ca.leading = leading;
      ca.tracking = run.tracking;
      ca.fillColor = col;
    }
  }

  var made = 0, removed = 0;
  for (i = 0; i < pages.length; i++) {
    if (map[i] < 0) continue;
    var ab = abs[map[i]].artboardRect, L = ab[0], T = ab[1], K = (ab[2] - ab[0]) / pages[i].w;
    for (j = 0; j < pages[i].paras.length; j++) {
      q = pages[i].paras[j];
      var bx = [L + q.box[0] * K - 2, T - q.box[1] * K + 2, L + q.box[2] * K + 2, T - q.box[3] * K - 2];
      var hits = [];
      for (k = 0; k < olds.length; k++) {
        var o = olds[k];
        if (!o.used && o.cx >= bx[0] && o.cx <= bx[2] && o.cy <= bx[1] && o.cy >= bx[3]) { o.used = true; hits.push(o.tf); }
      }
      var rect = doc.pathItems.rectangle(T - q.y * K, L + q.x * K, q.w * K, q.h * K);
      var tf = doc.textFrames.areaText(rect);
      if (hits.length) { try { tf.move(hits[0], ElementPlacement.PLACEBEFORE); } catch (e) {} }
      var text = '', last = null;
      for (k = 0; k < q.runs.length; k++) text += q.runs[k].text === '\u0003' ? String.fromCharCode(3) : q.runs[k].text;
      tf.contents = text;
      tf.name = text.substr(0, 40);
      tf.firstBaseline = FirstBaselineType.FIXED;
      tf.firstBaselineMin = q.firstBaseline * K;
      tf.textRange.paragraphAttributes.justification = JUST[q.align] || Justification.LEFT;
      try { tf.textRange.paragraphAttributes.hyphenation = false; tf.textRange.paragraphAttributes.everyLineComposer = false; } catch (e) {}
      var off = 0, alpha = 1;
      for (k = 0; k < q.runs.length; k++) {
        r = q.runs[k];
        var len = r.text.length;
        if (r.family) last = r; else r = last;
        if (r && len) { style(rangeOf(tf, off, len), r, K, q.leading * K); alpha = Math.min(alpha, r.color.a); }
        off += len;
      }
      if (alpha < 1) tf.opacity = alpha * 100;
      for (k = 0; k < hits.length; k++) { try { hits[k].remove(); removed++; } catch (e) {} }
      made++;
    }
  }
  alert('Done. ' + made + ' paragraph boxes made, ' + removed + ' loose text pieces replaced.\nRotated or vertical text was left as it was.');
})();
