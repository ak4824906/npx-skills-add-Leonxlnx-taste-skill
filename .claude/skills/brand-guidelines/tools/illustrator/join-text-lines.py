"""Rewrite Chrome's PDF text so Illustrator imports each line as one text object.

Chrome places every glyph with its own Td + Tj, and Illustrator turns each of those into a
separate text box (one per letter). This joins each run of glyphs on a line into a single TJ
array, with the spacing kept as kerning numbers, so the line imports as one editable text object.

Usage: python3 join-text-lines.py in.pdf [out.pdf]   (writes in place if out is omitted)
"""
import re, sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream, ArrayObject, FloatObject, NameObject, ByteStringObject

src = sys.argv[1]
dst = sys.argv[2] if len(sys.argv) > 2 else src


def widths(font):
    """glyph id -> advance width (1/1000 em) for a Type0/CID font, else None."""
    font = font.get_object()
    if font.get('/Subtype') != '/Type0':
        return None
    d = font['/DescendantFonts'][0].get_object()
    dw = float(d.get('/DW', 1000))
    w = {}
    arr = d.get('/W', [])
    i = 0
    while i < len(arr):
        c = int(arr[i])
        nxt = arr[i + 1]
        if isinstance(nxt, list) or hasattr(nxt, '__iter__') and not isinstance(nxt, (int, float)):
            for k, v in enumerate(nxt.get_object() if hasattr(nxt, 'get_object') else nxt):
                w[c + k] = float(v)
            i += 2
        else:
            for k in range(c, int(nxt) + 1):
                w[k] = float(arr[i + 2])
            i += 3
    return lambda g: w.get(g, dw)


RUN = re.compile(rb'<([0-9A-Fa-f]+)> Tj((?:\s+-?[\d.]+ 0 Td <[0-9A-Fa-f]+> Tj)*)')
STEP = re.compile(rb'(-?[\d.]+) 0 Td <([0-9A-Fa-f]+)> Tj')
TF = re.compile(rb'/(\S+) ([\d.]+) Tf')

reader = PdfReader(src)
writer = PdfWriter(clone_from=reader)
pieces = runs = 0
def font_map(res):
    f = res.get('/Font') if res else None
    return {str(k)[1:]: widths(v) for k, v in f.get_object().items()} if f is not None else {}


def rewrite(data, fonts):
    tfs = [(m.start(), m.group(1).decode(), float(m.group(2))) for m in TF.finditer(data)]

    def join(m):
        global pieces, runs
        cur = [t for t in tfs if t[0] < m.start()]
        if not cur:
            return m.group(0)
        _, fname, size = cur[-1]
        w = fonts.get(fname)
        if not w or size == 0:
            return m.group(0)
        glyphs = [m.group(1)] + [g for _, g in STEP.findall(m.group(2))]
        dxs = [float(d) for d, _ in STEP.findall(m.group(2))]
        parts = [b'<' + glyphs[0] + b'>']
        for prev, dx, g in zip(glyphs, dxs, glyphs[1:]):
            adv = sum(w(int(prev[k:k + 4], 16)) for k in range(0, len(prev), 4))
            n = adv - dx * 1000 / size
            if abs(n) > 0.05:
                parts.append(('%.3f' % n).rstrip('0').rstrip('.').encode())
            parts.append(b'<' + g + b'>')
        pieces += len(glyphs)
        runs += 1
        out = b'[' + b' '.join(parts) + b'] TJ'
        # TJ leaves the line matrix at the run start; Chrome's next Td counts from the last glyph
        if sum(dxs):
            out += b'\n' + ('%.5f' % sum(dxs)).encode() + b' 0 Td'
        return out

    return RUN.sub(join, data)


from pypdf.generic import DecodedStreamObject
seen = set()
for page in writer.pages:
    res = page['/Resources']
    fonts = font_map(res)
    so = DecodedStreamObject()
    so.set_data(rewrite(page.get_contents().get_data(), fonts))
    page[NameObject('/Contents')] = writer._add_object(so)
    # text inside form XObjects (Chrome uses them for groups and clips)
    stack = [res]
    while stack:
        r = stack.pop()
        xo = r.get('/XObject')
        for k, ref in (xo.get_object().items() if xo is not None else []):
            x = ref.get_object()
            if x.get('/Subtype') != '/Form' or id(x) in seen:
                continue
            seen.add(id(x))
            xres = x.get('/Resources')
            xfonts = dict(fonts, **font_map(xres.get_object() if xres else None))
            x.set_data(rewrite(x.get_data(), xfonts))
            if xres:
                stack.append(xres.get_object())
writer.write(dst)
print(f'{pieces} glyph pieces joined into {runs} text runs')
