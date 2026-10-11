#!/usr/bin/env python3
"""Audit built v2 theme contracts as the unmodified Bluent v3 migration baseline.

Source-of-truth inventory: src/Bluent.UI/bundleconfig.json and compiled theme CSS.
This is a *static* contract audit, not a browser/contrast/Fluent-parity test.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
UI = ROOT / "src" / "Bluent.UI"
TOKENS = (
    "--colorNeutralBackground1",
    "--colorNeutralForeground1",
    "--colorNeutralStroke1",
    "--colorNeutralStrokeAccessible",
    "--colorBrandBackground",
    "--colorBrandForeground1",
    "--spacingHorizontalM",
    "--borderRadiusMedium",
    "--durationFaster",
)
TOKEN_RE = re.compile(r"(--[a-zA-Z][a-zA-Z0-9-]*)\s*:\s*([^;{}]+);")


def main() -> int:
    entries = json.loads((UI / "bundleconfig.json").read_text(encoding="utf-8-sig"))
    names = [Path(item["outputFileName"]).name for item in entries]
    brands = sorted(
        match.group(1)
        for name in names
        if (match := re.fullmatch(r"bluent\.ui\.theme\.(.+)\.css", name))
    )
    errors: list[str] = []
    hashes = {}
    report = {}
    if not brands:
        errors.append("No theme bundles are defined in bundleconfig.json.")
    for brand in brands:
        source = {}
        for mode in ("light", "dark"):
            filename = UI / "Styles" / "Themes" / f"theme-{brand}-{mode}.css"
            if not filename.is_file():
                errors.append(f"Missing generated theme: {filename.relative_to(ROOT)}")
                continue
            css = filename.read_text(encoding="utf-8-sig")
            if f"[data-bui-theme={mode}]" not in css:
                errors.append(f"{brand}/{mode}: missing expected scoped theme selector.")
            values = dict(TOKEN_RE.findall(css))
            source[mode] = {k: values.get(k) for k in TOKENS}
            for key, value in source[mode].items():
                if value is None:
                    errors.append(f"{brand}/{mode}: missing theme property {key}")
        packed = UI / "wwwroot" / f"bluent.ui.theme.{brand}.min.css"
        if not packed.is_file():
            errors.append(f"{brand}: missing minified static asset {packed.relative_to(ROOT)}")
            continue
        payload = packed.read_bytes()
        hashes[brand] = hashlib.sha256(payload).hexdigest()
        if len(payload) < 10000:
            errors.append(f"{brand}: suspiciously small theme bundle ({len(payload)} bytes).")
        report[brand] = {"minified_bytes": len(payload), "sha256_12": hashes[brand][:12],
                         "core_tokens": source}
    components = UI / "wwwroot" / "bluent.ui.components.min.css"
    if not components.is_file():
        errors.append("Missing bundled component CSS.")
    duplicate_hashes = {}
    for brand, digest in hashes.items():
        duplicate_hashes.setdefault(digest, []).append(brand)
    for grouped in duplicate_hashes.values():
        if len(grouped) > 1:
            errors.append("Duplicate branded theme bundle output: " + ", ".join(grouped))
    print(json.dumps({
        "classification": "static v2 CSS packaging and token contract, not Fluent parity",
        "brands_found": len(brands),
        "core_token_count": len(TOKENS),
        "component_minified_bytes": components.stat().st_size if components.exists() else None,
        "brands": report,
        "errors": errors
    }, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
