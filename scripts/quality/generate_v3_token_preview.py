#!/usr/bin/env python3
"""#418 source-backed, opt-in Bluent v3 token bridge (NOT a shipping v3 API).

Source of truth: existing 10-brand per-mode emitted CSS, plus versioned
Penpot Source -> Semantic -> Component design alias manifest.
The generator does not alter legacy declarations or current bundle config.
Run --check to compare committed preview artifacts without changing files.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from v3_theme_css_parser import read_theme_variables

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = ROOT / "docs/v3/tokens/issue-418-token-schema.preview.json"
CSS_OUT = ROOT / "docs/v3/tokens/issue-418-opt-in.preview.css"
MATRIX_OUT = ROOT / "docs/v3/tokens/issue-418-brand-matrix.preview.json"
THEME_DIR = ROOT / "src/Bluent.UI/Styles/Themes"

def _hex_rgb(value: str) -> tuple[int, int, int]:
    code = value.strip().lstrip("#")
    if len(code) != 6:
        raise ValueError(f"Expected opaque six-digit hex color, got {value!r}")
    return tuple(int(code[index:index + 2], 16) for index in (0, 2, 4))

def _linear_channel(channel: int) -> float:
    value = channel / 255
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4

def _luminance(value: str) -> float:
    red, green, blue = (_linear_channel(channel) for channel in _hex_rgb(value))
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue

def _contrast_ratio(first: str, second: str) -> float:
    one, two = sorted((_luminance(first), _luminance(second)), reverse=True)
    return (one + 0.05) / (two + 0.05)

def _mix_toward_white(value: str, amount: float) -> str:
    rgb = _hex_rgb(value)
    mixed = tuple(round(channel + (255 - channel) * amount) for channel in rgb)
    return "#" + "".join(f"{channel:02X}" for channel in mixed)

def _minimum_contrast_candidate(source: str, background: str, target: float) -> tuple[str, float, float]:
    if _contrast_ratio(source, background) >= target:
        return source.upper(), 0.0, _contrast_ratio(source, background)
    low, high = 0.0, 1.0
    for _ in range(48):
        middle = (low + high) / 2
        candidate = _mix_toward_white(source, middle)
        if _contrast_ratio(candidate, background) >= target:
            high = middle
        else:
            low = middle
    candidate = _mix_toward_white(source, high)
    ratio = _contrast_ratio(candidate, background)
    if ratio < target:
        raise ValueError(f"Rounded foreground candidate misses {target}:1: {source} -> {candidate} on {background} = {ratio:.4f}:1")
    return candidate, high, ratio

def build_dark_brand_foreground_candidates(manifest: dict) -> dict:
    config = manifest.get("darkBrandForegroundPreview")
    if not isinstance(config, dict):
        raise ValueError("Missing maintainer-approved dark brand foreground preview contract")
    if config.get("minimumContrastRatio") != 4.5 or config.get("targetContrastRatio") != 4.6:
        raise ValueError("Dark brand foreground preview must preserve the 4.5:1 floor and 4.6:1 rounding buffer")
    if config.get("brandAttribute") != "data-bui-brand" or config.get("themeAttribute") != "data-bui-theme":
        raise ValueError("Dark brand foreground preview must use the existing PortalThemeScope brand/mode attributes")
    if config.get("mixDirection") != "white":
        raise ValueError("Only the reviewed brand-preserving lift toward white is supported")
    roles = config.get("roles", {})
    expected_roles = {
        "action": ("--colorBrandForeground1", "--bui-v3-action-foreground"),
        "linkRest": ("--colorBrandForegroundLink", "--bui-v3-link-foreground"),
        "linkHover": ("--colorBrandForegroundLinkHover", "--bui-v3-link-foreground-hover"),
        "linkPressed": ("--colorBrandForegroundLinkPressed", "--bui-v3-link-foreground-pressed"),
    }
    if set(roles) != set(expected_roles):
        raise ValueError("Expected separate Action Rest, Link Rest, Link Hover and Link Pressed roles")
    for role, (source_css, output_css) in expected_roles.items():
        if roles[role].get("sourceCss") != source_css or roles[role].get("outputCss") != output_css:
            raise ValueError(f"Unexpected source/output role mapping for {role}")
    result = {
        "status": config["status"],
        "minimumContrastRatio": config["minimumContrastRatio"],
        "targetContrastRatio": config["targetContrastRatio"],
        "backgroundCss": config["backgroundCss"],
        "brandAttribute": config["brandAttribute"],
        "themeAttribute": config["themeAttribute"],
        "mixDirection": config["mixDirection"],
        "roles": {},
    }
    target = float(config["targetContrastRatio"])
    for brand in manifest["supportedBrands"]:
        path = THEME_DIR / f"theme-{brand}-dark.css"
        variables = read_theme_variables(path, "dark")
        background = variables.get(config["backgroundCss"])
        if background is None:
            raise ValueError(f"Missing dark neutral background in {path.name}")
        brand_result = {"background": background, "roles": {}}
        for role, (source_css, output_css) in expected_roles.items():
            source = variables.get(source_css)
            if source is None:
                raise ValueError(f"Missing source role {source_css} in {path.name}")
            candidate, mix_amount, ratio = _minimum_contrast_candidate(source, background, target)
            brand_result["roles"][role] = {
                "sourceCss": source_css,
                "outputCss": output_css,
                "source": source.upper(),
                "candidate": candidate,
                "whiteMix": round(mix_amount, 6),
                "contrastRatio": round(ratio, 4),
            }
        result[brand] = brand_result
    return result

def load_source_tokens(path: Path, names: list[str]) -> dict[str, str]:
    mode = path.stem.rsplit("-", 1)[-1]
    values = read_theme_variables(path, mode)
    missing = sorted(set(names) - values.keys())
    if missing:
        raise ValueError(f"Missing source variable(s) {missing}: {path.name}")
    return {name: values[name] for name in names}

def contract(manifest: dict) -> tuple[str, dict]:
    if manifest.get("issue") != 418:
        raise ValueError("Unexpected issue contract")
    layers = manifest["layers"]
    source, semantic, components = (layers[n] for n in ("source", "semantic", "component"))
    if [len(source), len(semantic), len(components)] != [12, 13, 10]:
        raise ValueError("Unexpected #418 layer inventory")
    if len({item["css"] for item in semantic + components}) != len(semantic + components):
        raise ValueError("Duplicate v3 CSS variable")
    if any(not item["css"].startswith("--bui-v3-") for item in semantic + components):
        raise ValueError("An alias would overwrite a legacy variable")
    by_name = {item["name"]: item for item in source + semantic + components}
    if len(by_name) != len(source + semantic + components):
        raise ValueError("Duplicate logical token name")
    for item in semantic + components:
        if item["alias"] not in by_name:
            raise ValueError(f"Unresolved alias for {item['name']}: {item['alias']}")
    order = {item["name"]: i for i, item in enumerate(source + semantic + components)}
    for item in semantic + components:
        if order[item["alias"]] >= order[item["name"]]:
            raise ValueError(f"Backward or circular alias: {item['name']}")
    if manifest["supportedBrands"] != [
        "default", "excel", "office", "outlook", "powerapps", "powerbi",
        "powerpoint", "stream", "teams", "word",
    ] or manifest["modes"] != ["light", "dark"]:
        raise ValueError("Expected existing ten-brand × Light/Dark baseline")
    if manifest["scopeSelector"] != (
        "[data-bui-v3-tokens][data-bui-theme], "
        "[data-bui-v3-tokens] [data-bui-theme]"
    ):
        raise ValueError("Unknown opt-in scope")
    matrix = {}
    source_vars = [entry["css"] for entry in source]
    for brand in manifest["supportedBrands"]:
        matrix[brand] = {}
        for mode in manifest["modes"]:
            path = THEME_DIR / f"theme-{brand}-{mode}.css"
            seen = load_source_tokens(path, source_vars)
            for item in source:
                if brand == "default" and seen[item["css"]].upper() != item["default"][mode].upper():
                    raise ValueError(f"Default Penpot source mismatch: {item['name']}/{mode}")
            resolved: dict[str, str] = {}
            for item in source:
                resolved[item["name"]] = seen[item["css"]]
            for item in semantic + components:
                resolved[item["name"]] = resolved[item["alias"]]
            matrix[brand][mode] = {
                "sourceCss": f"src/Bluent.UI/Styles/Themes/theme-{brand}-{mode}.css",
                "tokens": resolved,
            }

    dark_foregrounds = build_dark_brand_foreground_candidates(manifest)
    css = [
        "/* AUTO-GENERATED #418 PREVIEW — source-backed token alias mapping.",
        "   Not part of Bluent 2.x bundle; no CSS is enabled without explicit opt-in.",
        "   This is a v3 research preview, NOT an approved public token naming API.",
        "   Regenerate: python scripts/quality/generate_v3_token_preview.py */",
        f"{manifest['scopeSelector']} {{",
    ]
    for layer_name, entries in (("semantic", semantic), ("component", components)):
        css.append(f"  /* {layer_name}: aliases only; legacy variables are never overwritten. */")
        for item in entries:
            target = by_name[item["alias"]]
            target_css = target["css"]
            css.append(f"  {item['css']}: var({target_css});")
    css.append("}")
    # Approved visual host-role choice, still an explicitly opted-in preview.
    # Require the context AND current mode on the host itself: otherwise an
    # inherited Light selector can leak into a nested Dark theme host.
    focus = manifest["focusHostPreview"]
    host_attribute = "data-bui-v3-focus-host"
    mode_attribute = "data-bui-v3-focus-mode"
    focus_variable = "--bui-v3-focus-host-ring-candidate"
    contexts = ("neutral", "brand", "brandHover", "danger", "inverted")
    host_roles = {
        "neutral":"--colorNeutralBackground1",
        "brand":"--colorBrandBackground",
        "brandHover":"--colorBrandBackgroundHover",
        "danger":"--colorPaletteRedBackground3",
        "inverted":"--colorNeutralBackgroundInverted",
    }
    approved = {
        "light":{
            "neutral":"--colorBrandBackground",
            "brand":"--colorNeutralForegroundOnBrand",
            "brandHover":"--colorNeutralForegroundOnBrand",
            "danger":"--colorNeutralForegroundOnBrand",
            "inverted":"--colorNeutralForegroundOnBrand",
        },
        "dark":{
            "neutral":"--colorBrandForeground2",
            "brand":"--colorNeutralForegroundOnBrand",
            "brandHover":"--colorNeutralForegroundOnBrand",
            "danger":"--colorNeutralForegroundOnBrand",
            "inverted":"--colorBrandForeground2",
        },
    }
    if focus.get("hostAttribute") != host_attribute or focus.get("modeAttribute") != mode_attribute or focus.get("outputCssVariable") != focus_variable:
        raise ValueError("Unreviewed focus context attribute or public token name")
    if focus.get("penpotBoardId") != "f4136a9a-101d-8004-8008-ca2956fe05f9":
        raise ValueError("Focus mapping lacks the approved owned Penpot board")
    if {k:focus[k] for k in ("light","dark")} != approved:
        raise ValueError("Approved focus host-role mapping changed: new Penpot acceptance required")
    # Verify every source value actually exists for all 10 brands and Light/Dark,
    # then reject candidate if its ring contrasts <3 with the surrounding host.
    from audit_v3_token_preview_contrast import contrast
    for brand in manifest["supportedBrands"]:
        for mode in manifest["modes"]:
            color = load_source_tokens(THEME_DIR / f"theme-{brand}-{mode}.css",
                list(set(host_roles.values()) | set(approved[mode].values())))
            for context in contexts:
                ratio = contrast(color[approved[mode][context]], color[host_roles[context]])
                if ratio < 3:
                    raise ValueError(f"Approved focus contrast drift: {brand}/{mode}/{context}={ratio:.3f}")
    css.append("/* APPROVED VISUAL host-role choice; candidate token ONLY in explicit v3 opt-in scopes.")
    css.append("   data-bui-v3-focus-mode must be explicit on the host; inherited product theme is untouched.")
    css.append("   Not a Button rule: consumers may bind outline-color separately after API review. */")
    for mode in ("light", "dark"):
        for context in contexts:
            part = f'[{mode_attribute}="{mode}"][{host_attribute}="{context}"]'
            css.append(f'[data-bui-v3-tokens]{part},')
            css.append(f'[data-bui-v3-tokens] {part} {{')
            css.append(f"  {focus_variable}: var({approved[mode][context]});")
            css.append("}")
    css.append("@media (forced-colors: active) {")
    css.append(f"  [data-bui-v3-tokens][{mode_attribute}][{host_attribute}],")
    css.append(f"  [data-bui-v3-tokens] [{mode_attribute}][{host_attribute}] {{")
    css.append(f"    {focus_variable}: Highlight;")
    css.append("  }")
    css.append("}")

    # Per-brand dark foreground values are opt-in and local to the existing
    # PortalThemeScope/data-bui-brand host. They are derived from the matching
    # Rest/Hover/Pressed source roles, never borrowed across interaction states.
    css.append("/* MAINTAINER-APPROVED DIRECTION; exact values remain DRAFT candidates. */")
    css.append("/* Per-brand dark foregrounds: own source hue, >=4.6:1 preview target on the neutral Dark surface. */")
    foreground_config = manifest["darkBrandForegroundPreview"]
    for brand in manifest["supportedBrands"]:
        if brand == "default":
            selectors = [
                '[data-bui-v3-tokens][data-bui-theme="dark"]:not([data-bui-brand])',
                '[data-bui-v3-tokens][data-bui-brand=""][data-bui-theme="dark"]',
                '[data-bui-v3-tokens][data-bui-brand="default"][data-bui-theme="dark"]',
                '[data-bui-v3-tokens] [data-bui-theme="dark"]:not([data-bui-brand])',
                '[data-bui-v3-tokens] [data-bui-brand=""][data-bui-theme="dark"]',
                '[data-bui-v3-tokens] [data-bui-brand="default"][data-bui-theme="dark"]',
            ]
        else:
            selectors = [
                f'[data-bui-v3-tokens][data-bui-brand="{brand}"][data-bui-theme="dark"]',
                f'[data-bui-v3-tokens] [data-bui-brand="{brand}"][data-bui-theme="dark"]',
            ]
        css.extend(selector + ("," if index < len(selectors) - 1 else " {") for index, selector in enumerate(selectors))
        for role, role_config in foreground_config["roles"].items():
            candidate = dark_foregrounds[brand]["roles"][role]["candidate"]
            css.append(f"  {role_config['outputCss']}: {candidate};")
        css.append("}")

    # Demo-only specimens make each semantic role inspectable in the real v3
    # Styling Lab. These selectors are scoped to the opted-in preview host.
    css.append("[data-bui-v3-tokens] .v3-brand-foreground-preview {")
    css.append("  display: block;")
    css.append("  margin-block: 1.5rem;")
    css.append("  padding: 1rem;")
    css.append("  border: 1px solid var(--colorNeutralStroke1);")
    css.append("  border-radius: 8px;")
    css.append("}")
    css.append('[data-bui-v3-tokens][data-bui-theme="light"] .v3-brand-foreground-preview { display: none; }')
    css.append("[data-bui-v3-tokens] .v3-brand-foreground-samples {")
    css.append("  display: flex;")
    css.append("  flex-wrap: wrap;")
    css.append("  align-items: center;")
    css.append("  gap: 1rem;")
    css.append("}")
    css.append("[data-bui-v3-tokens] .v3-brand-foreground-action { color: var(--bui-v3-action-foreground); }")
    css.append("[data-bui-v3-tokens] .v3-brand-foreground-link { color: var(--bui-v3-link-foreground); }")
    css.append("[data-bui-v3-tokens] .v3-brand-foreground-link:hover,")
    css.append('[data-bui-v3-tokens] .v3-brand-foreground-link[data-v3-link-state="hover"] { color: var(--bui-v3-link-foreground-hover); }')
    css.append('[data-bui-v3-tokens] .v3-brand-foreground-link[data-v3-link-state="pressed"] { color: var(--bui-v3-link-foreground-pressed); }')

    return "\n".join(css) + "\n", {
        "status": manifest["status"],
        "schema": "docs/v3/tokens/issue-418-token-schema.preview.json",
        "design": manifest["design"],
        "brands": matrix,
        "darkBrandForegroundCandidates": dark_foregrounds,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Check committed outputs, do not write")
    args = parser.parse_args()
    try:
        schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
        css, matrix = contract(schema)
        outputs = {
            CSS_OUT: css,
            MATRIX_OUT: json.dumps(matrix, ensure_ascii=False, indent=2) + "\n",
        }
        for path, expected in outputs.items():
            if args.check:
                if not path.exists() or path.read_text(encoding="utf-8") != expected:
                    raise ValueError(f"Token preview drift: {path.relative_to(ROOT)}")
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(expected, encoding="utf-8")
        print(json.dumps({
            "pass": True, "mode": "check" if args.check else "generate",
            "brandModeCombinations": sum(len(modes) for modes in matrix["brands"].values()),
            "logicalTokensPerCombination": len(schema["layers"]["source"]) + len(schema["layers"]["semantic"]) + len(schema["layers"]["component"]),
            "darkBrandForegroundCandidatePairs": sum(len(entry["roles"]) for entry in matrix["darkBrandForegroundCandidates"].values() if isinstance(entry, dict) and "roles" in entry),
            "darkBrandForegroundTargetRatio": schema["darkBrandForegroundPreview"]["targetContrastRatio"],
            "generated": [str(p.relative_to(ROOT)) for p in outputs],
            "legacyVariablesModified": False, "isIncludedInPublishedBundle": False,
        }, indent=2))
        return 0
    except (ValueError, KeyError, OSError) as e:
        print(f"#418 preview generation FAILED: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
