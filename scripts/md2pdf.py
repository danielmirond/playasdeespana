#!/usr/bin/env python3
# scripts/md2pdf.py — Markdown → PDF con la paleta editorial del sitio.
#
# Se usa para los briefs que salen del proyecto (diseño, campaña) y que
# hay que pasar a terceros. Vive en el repo porque ya lo hemos necesitado
# dos veces y el scratchpad no sobrevive entre sesiones.
#
# Uso:  python3 scripts/md2pdf.py entrada.md salida.pdf
# Requiere reportlab:  python3 -m venv .venv && .venv/bin/pip install reportlab
import re, sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, HRFlowable, ListFlowable, ListItem)

SRC, OUT = sys.argv[1], sys.argv[2]
PIE = sys.argv[3] if len(sys.argv) > 3 else 'playas-espana.com'

INK    = colors.HexColor('#2a1a08')
ACCENT = colors.HexColor('#6b400a')
MUTED  = colors.HexColor('#6b5a3e')
LINE   = colors.HexColor('#e0d3bb')
CARD   = colors.HexColor('#faf6ef')

F = '/System/Library/Fonts/Supplemental/'
pdfmetrics.registerFont(TTFont('Ga', F + 'Georgia.ttf'))
pdfmetrics.registerFont(TTFont('Ga-B', F + 'Georgia Bold.ttf'))
pdfmetrics.registerFont(TTFont('Ga-I', F + 'Georgia Italic.ttf'))
pdfmetrics.registerFontFamily('Ga', normal='Ga', bold='Ga-B', italic='Ga-I')

S = lambda **kw: ParagraphStyle(**kw)
st_h1   = S(name='h1', fontName='Ga-B', fontSize=23, leading=27, textColor=INK, spaceAfter=4)
st_sub  = S(name='sub', fontName='Helvetica', fontSize=9, leading=13, textColor=MUTED, spaceAfter=14)
st_h2   = S(name='h2', fontName='Ga-B', fontSize=14.5, leading=18, textColor=ACCENT, spaceBefore=17, spaceAfter=7)
st_h3   = S(name='h3', fontName='Ga-B', fontSize=11, leading=14, textColor=INK, spaceBefore=11, spaceAfter=4)
st_body = S(name='body', fontName='Helvetica', fontSize=9.6, leading=14.6, textColor=INK, spaceAfter=7, alignment=TA_LEFT)
st_li   = S(name='li', parent=st_body, spaceAfter=3.5)
st_cell = S(name='cell', fontName='Helvetica', fontSize=8.3, leading=11.4, textColor=INK)
st_cellh= S(name='cellh', parent=st_cell, fontName='Helvetica-Bold', textColor=ACCENT)


def inline(t):
    t = t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'<i>\1</i>', t)
    t = re.sub(r'`(.+?)`', r'<font face="Courier" size="8.6">\1</font>', t)
    t = re.sub(r'\[(.+?)\]\((.+?)\)', r'<link href="\2" color="#6b400a">\1</link>', t)
    return t


lines = open(SRC, encoding='utf-8').read().split('\n')
flow, i, first_h1 = [], 0, True

while i < len(lines):
    s = lines[i].strip()
    if not s:
        i += 1; continue

    if s.startswith('|'):                                   # tabla
        rows = []
        while i < len(lines) and lines[i].strip().startswith('|'):
            cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
            if not all(set(c) <= set('-: ') for c in cells):
                rows.append(cells)
            i += 1
        n = max(len(r) for r in rows)
        data = [[Paragraph(inline(c), st_cellh if r == 0 else st_cell)
                 for c in row + [''] * (n - len(row))] for r, row in enumerate(rows)]
        avail = A4[0] - 44 * mm
        w = [avail * 0.17, avail * 0.44, avail * 0.39] if n == 3 else [avail / n] * n
        t = Table(data, colWidths=w, repeatRows=1)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), CARD),
            ('LINEBELOW', (0, 0), (-1, 0), .8, ACCENT),
            ('LINEBELOW', (0, 1), (-1, -2), .35, LINE),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 7), ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ]))
        flow += [Spacer(1, 3), t, Spacer(1, 9)]
        continue

    if s in ('---', '***', '___'):
        flow += [Spacer(1, 5), HRFlowable(width='100%', thickness=.6, color=LINE), Spacer(1, 5)]
        i += 1; continue

    m = re.match(r'^(#{1,4})\s+(.*)', s)
    if m:
        lvl, txt = len(m.group(1)), inline(m.group(2))
        if lvl == 1 and first_h1:
            flow.append(Paragraph(txt, st_h1)); first_h1 = False
        elif lvl <= 2:
            flow.append(Paragraph(txt, st_h2))
        else:
            flow.append(Paragraph(txt, st_h3))
        i += 1; continue

    if re.match(r'^([-*]|\d+\.)\s+', s):
        items, numbered = [], bool(re.match(r'^\d+\.', s))
        while i < len(lines) and re.match(r'^\s*([-*]|\d+\.)\s+', lines[i]):
            txt = re.sub(r'^\s*([-*]|\d+\.)\s+', '', lines[i]); i += 1
            while (i < len(lines) and lines[i].startswith('  ') and lines[i].strip()
                   and not re.match(r'^\s*([-*]|\d+\.)\s+', lines[i])):
                txt += ' ' + lines[i].strip(); i += 1
            kw = {'value': len(items) + 1} if numbered else {}
            items.append(ListItem(Paragraph(inline(txt), st_li), leftIndent=13, **kw))
        # `start` en una lista de viñetas se lee como el carácter del bullet
        extra = {'start': 1} if numbered else {'start': '•'}
        flow.append(ListFlowable(items, bulletType='1' if numbered else 'bullet',
                                 bulletFontName='Helvetica', bulletFontSize=8.6,
                                 bulletColor=ACCENT, leftIndent=15, **extra))
        flow.append(Spacer(1, 5)); continue

    buf = []
    while i < len(lines) and lines[i].strip() and not re.match(
            r'^(#{1,4}\s|[-*]\s|\d+\.\s|\||---$)', lines[i].strip()):
        buf.append(lines[i].strip()); i += 1
    txt = ' '.join(buf)
    flow.append(Paragraph(inline(txt), st_sub if txt.startswith('**Fecha:**') else st_body))


def pie(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.4); canvas.setFillColor(MUTED)
    canvas.drawString(22 * mm, 12 * mm, PIE)
    canvas.drawRightString(A4[0] - 22 * mm, 12 * mm, str(doc.page))
    canvas.setStrokeColor(LINE); canvas.setLineWidth(.5)
    canvas.line(22 * mm, 16 * mm, A4[0] - 22 * mm, 16 * mm)
    canvas.restoreState()


doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=22 * mm, rightMargin=22 * mm,
                        topMargin=20 * mm, bottomMargin=22 * mm,
                        title=PIE, author='Daniel Mirón')
doc.build(flow, onFirstPage=pie, onLaterPages=pie)
print('OK →', OUT)
