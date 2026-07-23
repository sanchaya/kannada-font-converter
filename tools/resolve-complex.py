#!/usr/bin/env python3
"""
Second-pass resolver for "complex" rules from extract-macros.py.

Many rules marked complex are actually a simple Chr()/ChrW() output plus
harmless state-flag bookkeeping (`Chukke = 0`, `Da = 1`, ...). This script
re-scans each rule's raw VBA, strips flag-assignment lines (any
`Identifier = <int>` statement), and tries to resolve the remaining
Selection.Text/str1 assignment the same way the simple-rule parser does.

Rules that involve real reordering (Selection.MoveLeft/MoveRight/Extend,
or no resolvable text assignment at all) are left unresolved - they need
aByte-context-aware pass, not a per-byte substitution, so we honestly mark
them 'unresolved' rather than guessing.

Usage: python3 tools/resolve-complex.py <macro-extracts-dir>
Writes tools/macro-extracts/<file>.resolved.json (input files untouched).
"""
import json
import os
import re
import sys

FLAG_ASSIGN = re.compile(r'^\w+\s*=\s*-?\d+$')
TEXT_ASSIGN = re.compile(r'^Selection\.Text\s*=\s*(.+)$')
STR1_ASSIGN = re.compile(r'^str1\s*=\s*str1\s*&\s*(.+)$')
MOVE = re.compile(r'^Selection\.(MoveLeft|MoveRight|Move|Delete|InsertBefore|InsertAfter)')


def parse_chr_expr(expr):
    out = []
    for part in re.split(r'\s*&\s*', expr.strip()):
        part = part.strip()
        m = re.fullmatch(r'Chr\((\d+)\)', part)
        if m:
            n = int(m.group(1))
            out.append(chr(n))
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


def resolve(raw):
    if not raw:
        return None, 'no-raw'
    lines = [l.strip() for l in raw.split('\n') if l.strip()]
    if any(MOVE.search(l) for l in lines):
        return None, 'reorder'
    text_lines = []
    for l in lines:
        if FLAG_ASSIGN.match(l):
            continue
        m = TEXT_ASSIGN.match(l) or STR1_ASSIGN.match(l)
        if m:
            text_lines.append(m.group(1))
        else:
            # unknown statement type (If/For/Call/etc) - bail
            return None, 'unknown-stmt:' + l[:40]
    if not text_lines:
        return None, 'no-text-assign'
    # last assignment wins (VBA overwrites Selection.Text on each line)
    resolved = parse_chr_expr(text_lines[-1])
    if resolved is None:
        return None, 'unparsable-expr'
    return resolved, 'resolved'


def main():
    src_dir = sys.argv[1]
    total_resolved = 0
    total_remaining = 0
    for fname in sorted(os.listdir(src_dir)):
        if not fname.endswith('.json') or fname.endswith('.resolved.json'):
            continue
        path = os.path.join(src_dir, fname)
        data = json.load(open(path, encoding='utf-8'))
        changed = False
        report = {}
        for sub_name, sub in data.items():
            rules = sub.get('rules')
            if not isinstance(rules, list):
                continue
            r_count = 0
            u_count = 0
            reasons = {}
            for rule in rules:
                if rule.get('complex') and rule.get('output') is None:
                    resolved, reason = resolve(rule.get('raw'))
                    if resolved is not None:
                        rule['output'] = resolved
                        rule['resolved_from_complex'] = True
                        r_count += 1
                        changed = True
                    else:
                        u_count += 1
                        reasons[reason] = reasons.get(reason, 0) + 1
            if r_count or u_count:
                report[sub_name] = {'newly_resolved': r_count, 'still_unresolved': u_count, 'reasons': reasons}
                total_resolved += r_count
                total_remaining += u_count
        if changed:
            out_path = path[:-5] + '.resolved.json'
            json.dump(data, open(out_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        if report:
            print(fname)
            print(json.dumps(report, indent=2))
    print('TOTAL newly resolved:', total_resolved, ' still unresolved:', total_remaining)


if __name__ == '__main__':
    main()
