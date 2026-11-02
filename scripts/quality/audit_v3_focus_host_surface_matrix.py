#!/usr/bin/env python3
"""#418: contextual focus source-role audit. NOT production UI/AT certification.

The CSS focus outline has 2px offset from the Button face: compare the ring
to the adjacent HOST, never infer that contrast with its own fill is required.
"""
from __future__ import annotations

import json
from audit_v3_token_preview_contrast import contrast
from generate_v3_token_preview import THEME_DIR, load_source_tokens

HOSTS = {
    "neutral": "--colorNeutralBackground1",
    "brand": "--colorBrandBackground",
    "brandHover": "--colorBrandBackgroundHover",
    "danger": "--colorPaletteRedBackground3",
    "inverted": "--colorNeutralBackgroundInverted",
}
RING_LIGHT = "--colorBrandBackground"
RING_DARK = "--colorBrandForeground2"
INVERSE = "--colorNeutralForegroundOnBrand"


def audit() -> dict:
    cases: list[dict] = []
    failures: list[str] = []
    keys = list({*HOSTS.values(), RING_LIGHT, RING_DARK, INVERSE})
    for mode in ("light", "dark"):
        for path in sorted(THEME_DIR.glob(f"theme-*-{mode}.css")):
            source = load_source_tokens(path, keys)
            brand = path.stem.removeprefix("theme-").removesuffix(f"-{mode}")
            role = RING_DARK if mode == "dark" else RING_LIGHT
            ring, inverse = source[role], source[INVERSE]
            for context, host_role in HOSTS.items():
                host = source[host_role]
                cases.append({
                    "brand": brand, "mode": mode, "hostContext": context,
                    "ringToken": role, "ring": ring,
                    "hostToken": host_role, "host": host,
                    "ringToHost": round(contrast(ring, host), 3),
                    "inverseToken": INVERSE, "inverse": inverse,
                    "inverseToHost": round(contrast(inverse, host), 3),
                })
    if len(cases) != 100 or len({c["brand"] for c in cases}) != 10:
        failures.append("Expected 10 brands × 2 modes × 5 actual host token roles")
    def matching(context, mode=None):
        return [c for c in cases if c["hostContext"] == context
                and (mode is None or c["mode"] == mode)]
    for c in matching("neutral"):
        if c["ringToHost"] < 3:
            failures.append(f"{c['brand']} {c['mode']}: selected contextual neutral ring failed")
    for context in ("brand", "brandHover", "danger"):
        for c in matching(context):
            if c["ringToHost"] >= 3:
                failures.append(f"{c['brand']} {c['mode']} {context}: same-brand ring no longer fails; re-evaluate design")
            if c["inverseToHost"] < 3:
                failures.append(f"{c['brand']} {c['mode']} {context}: inverse brand foreground insufficient")
    for c in matching("inverted", "dark"):
        if c["inverseToHost"] >= 3:
            failures.append(f"{c['brand']}: inverse-on-Dark-inverted host changed; re-evaluate")
    summary = {}
    for mode in ("light", "dark"):
        for context in HOSTS:
            rows = [c for c in cases if c["mode"] == mode and c["hostContext"] == context]
            summary[f"{mode}/{context}"] = {
                "count": len(rows),
                "ring": [min(c["ringToHost"] for c in rows), max(c["ringToHost"] for c in rows)],
                "ringFailures": sum(c["ringToHost"] < 3 for c in rows),
                "inverse": [min(c["inverseToHost"] for c in rows), max(c["inverseToHost"] for c in rows)],
                "inverseFailures": sum(c["inverseToHost"] < 3 for c in rows),
            }
    return {
        "pass": not failures,
        "classification": "Source-only contrast against hypothetical colored HOST containers, not Button-face contrast, paint measurement or universal focus token approval",
        "entries": len(cases),
        "summary": summary,
        "errors": failures,
        "cases": cases,
    }


if __name__ == "__main__":
    report = audit()
    print(json.dumps(report, indent=2, ensure_ascii=False))
    raise SystemExit(0 if report["pass"] else 1)
