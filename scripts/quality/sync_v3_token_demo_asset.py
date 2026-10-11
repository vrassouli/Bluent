#!/usr/bin/env python3
"""Synchronize demo-only #418 CSS from the canonical preview files.

The output is an opt-in Demo.Pages static web asset. This script never modifies
Bluent.UI public bundles and does not approve the token names for release.
"""
from __future__ import annotations

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCES = [
    ROOT / "docs/v3/tokens/issue-418-opt-in.preview.css",
    ROOT / "docs/v3/tokens/issue-418-accessibility.preview.css",
    ROOT / "docs/v3/tokens/issue-418-portal.preview.css",
]
TARGET = ROOT / "src/Bluent.UI.Demo.Pages/wwwroot/v3/issue-418.opt-in.preview.css"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    parts = [
        "/* #418 DEMO-ONLY CSS. Generated from docs/v3/tokens sources; "
        "not the shipping Bluent.UI theme/asset contract. */"
    ]
    for source in SOURCES:
        parts.append(source.read_text(encoding="utf-8").rstrip())
    expected = "\n\n".join(parts) + "\n"
    if args.check:
        if not TARGET.is_file() or TARGET.read_text(encoding="utf-8") != expected:
            print("FAIL: v3 demo asset missing or stale; run sync_v3_token_demo_asset.py")
            return 1
        print("PASS: v3 research demo asset synced; shipping CSS untouched")
        return 0
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(expected, encoding="utf-8")
    print(f"Generated {TARGET.relative_to(ROOT)} from {len(SOURCES)} research sources")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
