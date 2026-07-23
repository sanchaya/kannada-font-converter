#!/usr/bin/env python3
"""
Extract conversion rule tables from the KGP Word macro templates (.dot).

The macros (authored by KGP, 2003-2009) convert various legacy encodings to
Nudi Mono, and Nudi Mono/Bi to Unicode. Each converter is a VBA
`Select Case Asc(Selection.Text)` state machine. This script parses every
Select Case block into a JSON rule table:

  { "sub": "SriLipiKAN850ToNudiMono",
    "rules": [ { "cases": [65], "output": "C", "complex": false, "raw": "..." } ] }

Simple rules (straight `Selection.Text = Chr(..) [& Chr(..)]`) become direct
mapping entries. Rules involving state flags (Chukke, Baottu, Pa, Ha, ...)
are marked complex and keep their raw VBA for manual porting.

Usage:
  python3 tools/extract-macros.py <extracted-vba-dir> <output-dir>
(first run `olevba template.dot > name.vba` for each .dot)
"""

import json
import os
import re
import sys


def parse_chr_expr(expr):
    """Resolve `Chr(65) & "x" & Chr(66)` style expressions to a string, or None."""
    out = []
    for part in re.split(r'\s*&\s*', expr.strip()):
        part = part.strip()
        m = re.fullmatch(r'Chr\((\d+)\)', part)
        if m:
            out.append(chr(int(m.group(1))).encode('latin-1', 'replace').decode('cp1252', 'replace')
                       if int(m.group(1)) > 127 else chr(int(m.group(1))))
            continue
        m = re.fullmatch(r'ChrW\((\d+)\)', part)
        if m:
            out.append(chr(int(m.group(1))))
            continue
        m = re.fullmatch(r'"(.*)"', part, re.S)
        if m:
            out.append(m.group(1))
            continue
        return None
    return ''.join(out)


def parse_sub(lines, start):
    """Parse one Sub body (list of lines) into rules."""
    rules = []
    i = start
    current = None
    while i < len(lines):
        line = lines[i].strip()
        if re.match(r'^(End Sub|Private Sub|Public Sub|Sub |Private Function|Function )', line) and i != start:
            break
        m = re.match(r'^Case\s+(.+?):?\s*$', line)
        if m and not line.startswith('Case Else'):
            if current:
                rules.append(finish_rule(current))
            codes = []
            ok = True
            for tok in m.group(1).split(','):
                tok = tok.strip().rstrip(':')
                if tok.isdigit():
                    codes.append(int(tok))
                else:
                    ok = False
            current = {'cases': codes if ok else [], 'case_expr': m.group(1), 'body': []}
        elif line.startswith('Case Else'):
            if current:
                rules.append(finish_rule(current))
            current = {'cases': [], 'case_expr': 'Else', 'body': []}
        elif current is not None and line and not line.startswith("'"):
            current['body'].append(line)
        i += 1
    if current:
        rules.append(finish_rule(current))
    return rules, i


def finish_rule(rule):
    body = rule['body']
    output = None
    complex_rule = False
    # simple: single `Selection.Text = <expr>` (optionally engchar flag lines)
    stmts = [b for b in body if not re.match(r'^(engchar|Make|Pa|Ha|Qa|Di|Geetu|Chukke|Baottu)\s*=', b)]
    if len(stmts) == 1:
        m = re.match(r'^Selection\.Text\s*=\s*(.+)$', stmts[0])
        if not m:
            m = re.match(r'^str1\s*=\s*str1\s*&\s*(.+)$', stmts[0])
        if m:
            output = parse_chr_expr(m.group(1))
    if output is None and stmts:
        complex_rule = True
    return {
        'cases': rule['cases'],
        'case_expr': rule['case_expr'],
        'output': output,
        'complex': complex_rule,
        'raw': '\n'.join(body) if complex_rule else None
    }


def main():
    src_dir, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    summary = {}
    for fname in sorted(os.listdir(src_dir)):
        if not fname.endswith('.vba'):
            continue
        text = open(os.path.join(src_dir, fname), encoding='utf-8', errors='replace').read()
        lines = text.split('\n')
        subs = {}
        for i, line in enumerate(lines):
            m = re.match(r'^(?:Private |Public )?Sub\s+(\w+)\s*\(', line.strip())
            if m and 'Case' in '\n'.join(lines[i:i + 400]):
                name = m.group(1)
                rules, _ = parse_sub(lines, i + 1)
                if len(rules) >= 20:  # only real converters
                    subs[name] = rules
        if subs:
            base = fname[:-4]
            result = {}
            for name, rules in subs.items():
                simple = sum(1 for r in rules if not r['complex'] and r['output'] is not None)
                cx = sum(1 for r in rules if r['complex'])
                result[name] = {'rules': rules, 'simple': simple, 'complex': cx}
            with open(os.path.join(out_dir, base + '.json'), 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=1)
            summary[base] = {k: {'rules': len(v['rules']), 'simple': v['simple'], 'complex': v['complex']}
                             for k, v in result.items()}
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
