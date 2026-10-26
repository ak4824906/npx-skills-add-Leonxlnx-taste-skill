"""Bake static font files from a variable font, so Illustrator shows each weight as its own style.

Usage:
  python3 make-static-fonts.py Font[wght].ttf outDir "Family Name" 300,400,600 [italic] [axis=value ...] [opsz=9,72] [css=Family]

Give the baked family a name of its own (for example "Fraunces Soft" when SOFT=100) and pass the
CSS family the book uses as css=. If the name matched a font the designer already has installed
(Google's own static "Fraunces 9pt", say), Illustrator would see different glyphs under the same
name and outline every line set in it "to preserve appearance". Overlapping contours are removed
too, since variable fonts keep them and they render badly once static.

Each opsz value makes its own family ("Family 9pt", "Family 72pt"), matching Google's static naming,
so the paragraphs script can pick the optical size closest to the text size.
Also writes outDir/fonts.json, which export-editable.mjs reads to render the PDF with these static files.
"""
import sys, os, json
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.ttLib.removeOverlaps import removeOverlaps  # needs skia-pathops

src, out, family, weights, *rest = sys.argv[1:]
italic = 'italic' in rest
fixed, opszs, css = {}, [None], None
for a in rest:
    if '=' in a:
        k, v = a.split('=')
        if k == 'opsz': opszs = [float(x) for x in v.split(',')]
        elif k == 'css': css = v
        else: fixed[k] = float(v)
NAMES = {100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black'}
os.makedirs(out, exist_ok=True)
man_path = os.path.join(out, 'fonts.json')
manifest = json.load(open(man_path)) if os.path.exists(man_path) else []
for opsz in opszs:
    fam = family + (f' {opsz:g}pt' if opsz else '')
    for w in [int(x) for x in weights.split(',')]:
        axes = dict(fixed, wght=w)
        if opsz: axes['opsz'] = opsz
        f = TTFont(src)
        present = {a.axisTag for a in f['fvar'].axes}
        inst = instantiateVariableFont(f, {k: v for k, v in axes.items() if k in present}, updateFontNames=False)
        removeOverlaps(inst)
        style = NAMES[w] if not italic else ('Italic' if w == 400 else NAMES[w] + ' Italic')
        ps = (fam + '-' + style).replace(' ', '')
        name = inst['name']
        for rec in list(name.names):
            if rec.nameID in (16, 17, 21, 22, 25): name.removeNames(nameID=rec.nameID)
        # RIBBI-safe naming: family carries the weight unless it is Regular/Italic
        legacy_fam = fam if style in ('Regular', 'Italic') else f'{fam} {NAMES[w]}'
        legacy_sub = 'Italic' if italic else 'Regular'
        for nid, val in ((1, legacy_fam), (2, legacy_sub), (4, f'{fam} {style}'), (6, ps), (16, fam), (17, style), (3, ps)):
            name.setName(val, nid, 3, 1, 0x409)
        inst['OS/2'].usWeightClass = w
        inst['OS/2'].fsSelection = (inst['OS/2'].fsSelection & ~0b1100001) | (1 if italic else 0) | (0b1000000 if style == 'Regular' else 0)
        inst['head'].macStyle = (2 if italic else 0) | (1 if w >= 700 and style in ('Bold', 'Bold Italic') else 0)
        inst.save(os.path.join(out, ps + '.ttf'))
        manifest = [m for m in manifest if m['file'] != ps + '.ttf'] + [{'file': ps + '.ttf', 'family': fam, 'base': css or family, 'weight': w, 'italic': italic, 'opsz': opsz}]
        print('wrote', ps)
json.dump(manifest, open(man_path, 'w'), indent=1)
