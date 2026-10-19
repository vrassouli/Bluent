"""#418 source-only contextual focus research on semi-transparent Fluent host layers.

NOT approved public CSS, pixel rendering, native Windows HCM or WCAG certification.
A floating focus ring sits outside its Button face, on the composited HOST.
"""
from __future__ import annotations

import json
import re
from audit_v3_token_preview_contrast import contrast
from generate_v3_token_preview import THEME_DIR, load_source_tokens

SOURCES = ("--colorNeutralBackground1", "--colorBrandBackground",
           "--colorNeutralBackgroundAlpha", "--colorNeutralBackgroundAlpha2",
           "--colorNeutralForegroundOnBrand", "--colorBrandForeground2",
           "--colorStrokeFocus2")
OVERLAYS = ("--colorNeutralBackgroundAlpha", "--colorNeutralBackgroundAlpha2")
UNDERLAYS = ("--colorNeutralBackground1", "--colorBrandBackground")
RGBA = re.compile(r"rgba\(\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(0(?:\.\d+)?|1(?:\.0+)?)\s*\)\Z")


def rgba(value: str) -> tuple[tuple[int, int, int], float]:
    match = RGBA.fullmatch(value.strip())
    if not match:
        raise ValueError(f"Only explicit valid rgba() source is supported: {value!r}")
    rgb = tuple(int(c) for c in match.group(1, 2, 3))
    opacity = float(match.group(4))
    if any(c > 255 for c in rgb) or not 0 < opacity <= 1:
        raise ValueError(f"Unsupported rgba channel or opacity: {value!r}")
    return rgb, opacity


def rgb_hex(value: str) -> tuple[int, int, int]:
    if not re.fullmatch(r"#[0-9a-fA-F]{6}", value):
        raise ValueError(f"Opaque underlay must be 6-digit hex: {value!r}")
    return tuple(int(value[i:i + 2], 16) for i in (1, 3, 5))


def composite(source: str, underlay: str) -> str:
    """Opaque sRGB-alpha composite. Round-to-nearest per RGB channel."""
    foreground, a = rgba(source)
    base = rgb_hex(underlay)
    blended = tuple(int(v * a + u * (1 - a) + .5) for v, u in zip(foreground, base))
    return "#" + "".join(f"{v:02X}" for v in blended)


# Runtime test-hardening contract. Keep this separate from the strict
# 80-case source audit so a removal of real keyboard/system-color checks
# cannot make the source-only diagnostic look like OS accessibility proof.
_ALPHA_FORCED_BROWSER_REQUIREMENTS = (
    "const alphaForcedOriginalTheme=",
    "const alphaForcedRows=[]",
    "for(const theme of [\"light\",\"dark\"])",
    "for(const kind of [\"brand\",\"focus2\"])",
    "Input.dispatchKeyEvent",
    "alphaForcedRows.push(sample)",
    "alphaForcedRows.length===4",
    'x.token.toLowerCase()==="highlight"',
    "x.ring===systemRoles.highlight",
    'x.width==="2px"&&x.offset==="2px"',
    "x.under===systemRoles.canvas",
    "x.over===systemRoles.canvas",
    "x.border===systemRoles.canvasText",
    'JSON.stringify(alphaForcedOriginalTheme)',
    "real alpha Bluent Focus uses system Highlight for BOTH candidates",
    "real alpha source backdrops yield Canvas and visible CanvasText border",
)


def check_alpha_forced_browser_source(source: str) -> None:
    """Fail closed if native Chromium/Blazor forced-color proof is weakened."""
    start = source.find("const alphaForcedOriginalTheme=")
    end = source.find('await cdp.send("Emulation.setEmulatedMedia",{features:[]});', start)
    if start < 0 or end < start:
        raise ValueError("alpha forced-colors browser gate missing: scoped media block")
    actual_forced_block = source[start:end]
    missing = [fragment for fragment in _ALPHA_FORCED_BROWSER_REQUIREMENTS
               if fragment not in actual_forced_block]
    if missing:
        raise ValueError("alpha forced-colors browser gate missing: "
                         + ", ".join(missing))


def audit() -> dict:
    cases = []
    errors = []
    for mode in ("light", "dark"):
        paths = sorted(THEME_DIR.glob(f"theme-*-{mode}.css"))
        for path in paths:
            source = load_source_tokens(path, list(SOURCES))
            brand = path.stem.removeprefix("theme-").removesuffix(f"-{mode}")
            neutral_color = source["--colorBrandBackground" if mode == "light"
                                   else "--colorBrandForeground2"]
            inverse_color = source["--colorNeutralForegroundOnBrand"]
            # Design-only opt-in alternative for explicit alpha hosts.
            # It is NOT a replacement for the maintainer-approved branded
            # ring on opaque neutral hosts.
            focus2 = source["--colorStrokeFocus2"]
            if focus2.lower() != ("#000000" if mode == "light" else "#ffffff"):
                errors.append(f"Focus2 palette source drift: {brand}/{mode} {focus2}")
            for overlay in OVERLAYS:
                for underlay in UNDERLAYS:
                    painted = composite(source[overlay], source[underlay])
                    brand_ratio = round(contrast(neutral_color, painted), 3)
                    inverse_ratio = round(contrast(inverse_color, painted), 3)
                    cases.append({
                        "brand":brand,"mode":mode,
                        "overlayToken":overlay,"overlayRgba":source[overlay],
                        "underlayToken":underlay,"underlayColor":source[underlay],
                        "compositedHost":painted,
                        "ringBrand":neutral_color,"ringInverse":inverse_color,
                        "brandContrast":brand_ratio,"inverseContrast":inverse_ratio,
                        "focus2Token":"--colorStrokeFocus2",
                        "focus2Ring":focus2,
                        "focus2Contrast":round(contrast(focus2, painted),3),
                        "bothBelow3":brand_ratio<3 and inverse_ratio<3,
                        "eitherAtLeast3":max(brand_ratio,inverse_ratio)>=3,
                    })
    if len(cases) != 80 or len({c["brand"] for c in cases}) != 10:
        errors.append("Expected precisely 10 brands x Light/Dark x 2 alpha layers x 2 opaque underlays")
    default_light = next((c for c in cases if c["brand"] == "default"
                          and c["mode"] == "light"
                          and c["overlayToken"] == "--colorNeutralBackgroundAlpha"
                          and c["underlayToken"] == "--colorBrandBackground"), None)
    if default_light is None or default_light["compositedHost"] != "#89B3DA":
        errors.append("Real default/light alpha-over-brand compositing fixture changed")
    # This is intentionally a *diagnostic*, not an accessibility pass;
    # an alpha composite may lack a >=3:1 contrast with EITHER candidate.
    count_unsafe = sum(c["bothBelow3"] for c in cases)
    if count_unsafe != 10:
        errors.append("Research assumption changed: expected ten currently unsafe Light alpha-over-brand cases; source/design review required")
    if default_light and not default_light["bothBelow3"]:
        errors.append("The known default/light alpha-over-brand dual-failure is gone; review source redesign")
    focus2_failures = [c for c in cases if c["focus2Contrast"] < 3]
    if focus2_failures:
        errors.append(f"Explicit alpha-only Focus2 candidate no longer meets 3:1 on {len(focus2_failures)} audited hosts")
    return {
        "passedResearchContract":not errors, "cases":cases, "entries":len(cases),
        "focus2MinimumContrast":min((c["focus2Contrast"] for c in cases),default=0),
        "focus2Below3":len(focus2_failures),
        "focus2Source":{"light":"#000000","dark":"#FFFFFF"},
        "focus2Decision":"DRAFT ALPHA-HOST-ONLY research, never global focus default or approved public CSS",
        "dualFailureCount":count_unsafe,
        "dualFailureByMode":{mode:sum(c["bothBelow3"] for c in cases if c["mode"]==mode)
                             for mode in ("light", "dark")},
        "errors":errors,
        "scope":"SOURCE-ONLY opaque sRGB compositing; not sampled browser pixels, "
                "native forced colors or arbitrary gradients, and NOT approved focus token semantics",
    }


if __name__ == "__main__":
    result = audit()
    print(json.dumps(result,indent=2,ensure_ascii=False))
    raise SystemExit(0 if result["passedResearchContract"] else 1)
