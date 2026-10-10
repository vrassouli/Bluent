#!/usr/bin/env python3
"""Evidence ledger for CSS utility classes used by Bluent consumers (#417).

Scans generated Bluent style.css selector names and statically quoted Razor
class/Class attributes in samples & demos. This is *not* a full Razor compiler
or a precise Bootstrap origin map; values inside C# expressions are excluded.
Use before changing bootstrap-generated utility/breakpoint contracts.
"""
from __future__ import annotations

from collections import Counter, defaultdict
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
GENERATED = ROOT / "src/Bluent.UI/Styles/Themes/styles.css"
CLASS_SELECTOR = re.compile(r"(?<![\w.])\.([a-zA-Z_][\w-]*)")
ATTR = re.compile(r'\b(?:class|Class)\s*=\s*"([^"]*)"', re.IGNORECASE)
SIMPLE = re.compile(r"^[a-zA-Z_][\w-]*$")
SOURCES = (ROOT / "src", ROOT / "samples")
EXCLUDED = {"obj", "bin", "node_modules"}


def main() -> None:
    css = GENERATED.read_text(encoding="utf-8-sig")
    classes = set(CLASS_SELECTOR.findall(css))
    counts = Counter()
    usage = defaultdict(set)
    for directory in SOURCES:
        if not directory.exists():
            continue
        for file in directory.rglob("*.razor"):
            if any(segment in EXCLUDED for segment in file.relative_to(ROOT).parts):
                continue
            source = file.read_text(encoding="utf-8-sig", errors="replace")
            for field in ATTR.findall(source):
                for candidate in field.split():
                    if SIMPLE.fullmatch(candidate) and candidate in classes:
                        counts[candidate] += 1
                        usage[candidate].add(file.relative_to(ROOT).as_posix())
    data = {
        "classification": "static generated-style selector/quoted-Razor consumer intersection, not complete CSS/Bootstrap attribution",
        "generated_css": str(GENERATED.relative_to(ROOT)).replace("\\", "/"),
        "generated_css_bytes": GENERATED.stat().st_size,
        "distinct_generated_classes": len(classes),
        "distinct_used_classes": len(counts),
        "usage_occurrences": sum(counts.values()),
        "files_with_matches": len(set().union(*usage.values())) if usage else 0,
        "examples": [{"class": token, "occurrences": number, "files": sorted(usage[token])[:4]}
                     for token, number in counts.most_common(60)],
        "all_used_classes": sorted(counts),
    }
    print(json.dumps(data, indent=2))


if __name__ == "__main__":
    main()
