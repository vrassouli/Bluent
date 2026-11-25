#!/usr/bin/env python3
"""Generate and validate the opt-in #418 non-color foundation token bridge."""
from __future__ import annotations
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = ROOT / "docs/v3/tokens/issue-418-foundation-schema.preview.json"
CSS_OUT = ROOT / "docs/v3/tokens/issue-418-foundations.opt-in.preview.css"
MATRIX_OUT = ROOT / "docs/v3/tokens/issue-418-foundation-matrix.preview.json"
THEME_DIR = ROOT / "src/Bluent.UI/Styles/Themes"
VARIABLE = re.compile(r"(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);")

def read_vars(path: Path) -> dict[str, str]:
    if not path.is_file():
        raise ValueError(f"Missing source theme: {path.relative_to(ROOT)}")
    text = path.read_text(encoding="utf-8-sig")
    return {m.group(1): m.group(2).strip() for m in VARIABLE.finditer(text)}

def load() -> tuple[dict, dict]:
    data = json.loads(SCHEMA.read_text(encoding="utf-8-sig"))
    if data.get("issue") != 418 or data.get("schemaVersion") != "0.1.0-preview":
        raise ValueError("Unexpected foundation schema identity/version")
    if data.get("status") != "draft-opt-in-only-not-public-api":
        raise ValueError("Foundation schema must remain explicitly draft/opt-in")
    if len(data["supportedBrands"]) != 10 or data["modes"] != ["light", "dark"]:
        raise ValueError("Expected exactly ten brands and two modes")
    source = data["layers"]["source"]
    semantic = data["layers"]["semantic"]
    component = data["layers"]["component"]
    source_keys = [x["key"] for x in source]
    if len(set(source_keys)) != len(source_keys):
        raise ValueError("Duplicate foundation source key")
    names = [x["name"] for x in semantic + component]
    css_names = [x["css"] for x in semantic + component]
    if len(set(names)) != len(names) or len(set(css_names)) != len(css_names):
        raise ValueError("Duplicate semantic/component token name or CSS alias")
    source_by_key = {x["key"]: x for x in source}
    design_by_key = {x["key"]: x for x in data["layers"]["designSource"]}
    semantic_by_name = {x["name"]: x for x in semantic}
    for item in semantic:
        alias = item["alias"]
        if alias.startswith("source:"):
            if alias[7:] not in source_by_key:
                raise ValueError(f"Unresolved semantic source alias: {item['name']} -> {alias}")
        elif alias.startswith("design-source:"):
            if alias[14:] not in design_by_key:
                raise ValueError(f"Unresolved semantic design-source alias: {item['name']} -> {alias}")
        else:
            raise ValueError(f"Unsupported semantic alias form: {item['name']} -> {alias}")
    for item in component:
        if item["alias"] not in semantic_by_name:
            raise ValueError(f"Unresolved component semantic alias: {item['name']} -> {item['alias']}")
    return data, source_by_key

def source_matrix(data: dict, source_by_key: dict) -> dict:
    matrix = {}
    all_source = data["layers"]["source"]
    for brand in data["supportedBrands"]:
        matrix[brand] = {}
        for mode in data["modes"]:
            path = THEME_DIR / f"theme-{brand}-{mode}.css"
            values = read_vars(path)
            resolved = {}
            for item in all_source:
                if item.get("mode") and item["mode"] != mode:
                    # Mode-paired shadow-color aliases are still read from each matching theme.
                    if item["mode"] != mode:
                        continue
                css = item.get("css")
                if not css:
                    continue
                value = values.get(css)
                if value is None:
                    raise ValueError(f"Missing {css} in {path.name} ({item['key']})")
                resolved[item["key"]] = value
            matrix[brand][mode] = {"sourceCss": str(path.relative_to(ROOT)).replace("\\", "/"), "tokens": resolved}
    return matrix

def render(data: dict, source_by_key: dict) -> tuple[str, dict]:
    matrix = source_matrix(data, source_by_key)
    lines = [
        "/* AUTO-GENERATED #418 foundation preview. */",
        "/* Exact values stay owned by the existing source theme CSS. */",
        "/* Opt-in only: this file is not included in the published Bluent.UI bundle. */",
        "/* Design-token candidates, not a released public API. */",
        "[data-bui-v3-foundations] {",
    ]
    design_by_key = {x["key"]: x for x in data["layers"]["designSource"]}
    for item in data["layers"]["semantic"]:
        alias = item["alias"]
        if alias.startswith("source:"):
            source = source_by_key[alias[7:]]
            lines.append(f"  {item['css']}: var({source['css']});")
        else:
            design = design_by_key[alias[14:]]
            value = design["value"]
            if design["type"] in ("spacing", "sizing", "borderRadius"):
                css_value = f"{value}px" if value else "0"
            elif design["type"] == "number" and "duration" in design["key"]:
                css_value = f"{value}ms"
            else:
                css_value = str(value)
            lines.append(f"  {item['css']}: {css_value};")
    lines.append("}")
    lines.append("")
    # Component aliases always refer to the semantic layer; never to raw source values.
    lines.append("[data-bui-v3-foundations] {")
    for item in data["layers"]["component"]:
        source = next(x for x in data["layers"]["semantic"] if x["name"] == item["alias"])
        lines.append(f"  {item['css']}: var({source['css']});")
    lines.append("}")
    lines.append("")
    css = "\n".join(lines)
    result = {
        "pass": True,
        "issue": 418,
        "schemaVersion": data["schemaVersion"],
        "brandModeCombinations": len(data["supportedBrands"]) * len(data["modes"]),
        "sourceTokens": len(data["layers"]["source"]),
        "designSourceTokens": len(data["layers"]["designSource"]),
        "semanticAliases": len(data["layers"]["semantic"]),
        "nativePenpotSemanticAliasesExpected": data["design"]["nativePenpotSemanticAliasesExpected"],
        "componentAliases": len(data["layers"]["component"]),
        "sourceValuesVerified": sum(len(v[mode]["tokens"]) for v in matrix.values() for mode in data["modes"]),
        "generated": [str(CSS_OUT.relative_to(ROOT)).replace("\\", "/"), str(MATRIX_OUT.relative_to(ROOT)).replace("\\", "/")],
        "publishedBundleChanged": False,
    }
    return css, {"schemaVersion": data["schemaVersion"], "brandModeCombinations": matrix, "summary": result}

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Verify generated files without writing them")
    args = parser.parse_args()
    try:
        data, source_by_key = load()
        css, matrix = render(data, source_by_key)
        expected = {CSS_OUT: css, MATRIX_OUT: json.dumps(matrix, indent=2, ensure_ascii=False) + "\n"}
        if args.check:
            missing, stale = [], []
            for path, content in expected.items():
                if not path.is_file(): missing.append(str(path.relative_to(ROOT)))
                elif path.read_text(encoding="utf-8-sig") != content: stale.append(str(path.relative_to(ROOT)))
            result = dict(matrix["summary"])
            result.update({"mode":"check","pass":not missing and not stale,"missing":missing,"stale":stale})
            print(json.dumps(result,indent=2))
            return 0 if result["pass"] else 1
        for path, content in expected.items():
            path.parent.mkdir(parents=True,exist_ok=True)
            path.write_text(content,encoding="utf-8")
        print(json.dumps(matrix["summary"],indent=2))
        return 0
    except (OSError, ValueError, KeyError, StopIteration) as exc:
        print(f"#418 foundation preview FAILED: {exc}",file=sys.stderr)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
