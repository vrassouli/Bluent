from __future__ import annotations

import re
from pathlib import Path


class TextFieldContractError(ValueError):
    pass


_DIRECT_PARAMETERS = {
    "Rows": ("int?", "null"),
    "ResizeTextarea": ("bool", "false"),
    "GainFocus": ("bool", "false"),
    "DigitOnly": ("bool", "false"),
    "AsciiDigits": ("bool", "false"),
    "ArabicToPersianConversion": ("bool", "false"),
}
_PARAMETER_RE = re.compile(
    r"\[Parameter\]\s*public\s+(?P<type>[\w<>?,.]+)\s+"
    r"(?P<name>\w+)\s*\{\s*get;\s*set;\s*\}\s*"
    r"(?:=\s*(?P<initializer>[^;]+);)?"
)


def _read(root: Path, relative: str) -> str:
    path = root / relative
    if not path.is_file():
        raise TextFieldContractError(f"Required TextField contract source is missing: {relative}")
    return path.read_text(encoding="utf-8-sig")


def _require(text: str, needles: tuple[str, ...], origin: str) -> None:
    missing = [needle for needle in needles if needle not in text]
    if missing:
        raise TextFieldContractError(f"{origin} is missing required TextField contract: {missing}")


def _direct_parameter_map(source: str) -> dict[str, str]:
    return {match.group("name"): match.group("type") for match in _PARAMETER_RE.finditer(source)}


def _parameter_initializers(source: str) -> dict[str, str | None]:
    return {
        match.group("name"): (match.group("initializer").strip() if match.group("initializer") else None)
        for match in _PARAMETER_RE.finditer(source)
    }


def _normalized_default(initializer: str | None) -> str | None:
    if initializer is None:
        return None
    value = initializer.strip()
    if len(value) >= 2 and value[0] == value[-1] == '"':
        return value[1:-1]
    if value.startswith("FieldSize."):
        return value.rsplit(".", 1)[-1]
    return value


def _table_rows(markdown: str, heading: str) -> dict[str, tuple[str, ...]]:
    match = re.search(rf"(?m)^###\s+{re.escape(heading)}\s*$", markdown)
    if not match:
        raise TextFieldContractError(f"TextField contract is missing section: {heading}")
    following = re.search(r"(?m)^###\s+", markdown[match.end():])
    end = match.end() + following.start() if following else len(markdown)
    rows: dict[str, tuple[str, ...]] = {}
    for line in markdown[match.end():end].splitlines():
        if not line.strip().startswith("|"):
            continue
        cells = tuple(cell.strip().replace("`", "") for cell in line.strip().strip("|").split("|"))
        if len(cells) < 2 or not cells[0] or set(cells[0]) <= {"-", ":"}:
            continue
        if cells[0].lower() in {"parameter", "member"}:
            continue
        # The reference intentionally groups members with identical origin/type.
        # Expand those rows so each member is still checked independently.
        for member in (part.strip() for part in cells[0].split("/")):
            rows[member] = cells[1:]
    return rows


def check_textfield_contract(root: Path) -> None:
    component = "src/Bluent.UI/Components/TextFieldComponent"
    razor = _read(root, f"{component}/TextField.razor")
    code = _read(root, f"{component}/TextField.razor.cs")
    field_base = _read(root, "src/Bluent.UI/Components/BluentFieldComponentBase.cs")
    input_base = _read(root, "src/Bluent.UI/Components/BluentInputComponentBase.cs")
    contract = _read(root, "docs/v3/design/TEXTFIELD-DESIGN-AND-API-CONTRACT.md")
    docs_workflow = _read(root, ".github/workflows/v3-docs-contract.yml")

    # Direct CLR declarations and the documented direct parameter matrix must agree.
    source_parameters = _direct_parameter_map(code)
    source_defaults = _parameter_initializers(code)
    direct_rows = _table_rows(contract, "TextField parameters")
    expected_source = {name: shape[0] for name, shape in _DIRECT_PARAMETERS.items()}
    if source_parameters != expected_source:
        raise TextFieldContractError(
            f"TextField direct [Parameter] surface drifted: expected {expected_source}, found {source_parameters}"
        )
    if set(direct_rows) != set(_DIRECT_PARAMETERS):
        raise TextFieldContractError(
            f"TextField parameter reference rows drifted: expected {sorted(_DIRECT_PARAMETERS)}, found {sorted(direct_rows)}"
        )
    for name, (expected_type, expected_default) in _DIRECT_PARAMETERS.items():
        row = direct_rows[name]
        if len(row) < 2 or row[0] != expected_type or row[1] != expected_default:
            raise TextFieldContractError(
                f"TextField parameter {name} docs drifted: expected {expected_type}/{expected_default}, found {row}"
            )
        # These direct parameters rely on CLR defaults (false/null). An explicit initializer
        # would silently change consumer behavior while keeping the same type and name.
        if source_defaults.get(name) is not None:
            raise TextFieldContractError(
                f"TextField parameter {name} has an explicit initializer {source_defaults[name]!r}; expected CLR default {expected_default}"
            )

    # Verify the actual inheritance chain and the Bluent-owned inherited Razor parameters.
    _require(razor, ("@inherits BluentFieldComponentBase<string?>",), "TextField.razor")
    _require(field_base, ("BluentFieldComponentBase<TValue> : BluentInputComponentBase<TValue>",), "BluentFieldComponentBase")
    _require(input_base, ("BluentInputComponentBase<TValue> : InputBase<TValue>",), "BluentInputComponentBase")
    expected_inherited = {
        "StartAddon": ("RenderFragment?", "BluentFieldComponentBase<string?>"),
        "EndAddon": ("RenderFragment?", "BluentFieldComponentBase<string?>"),
        "Size": ("FieldSize", "BluentFieldComponentBase<string?>"),
        "BindValueEvent": ("string", "BluentFieldComponentBase<string?>"),
        "Class": ("string?", "BluentInputComponentBase<string?>"),
        "Style": ("string?", "BluentInputComponentBase<string?>"),
    }
    inherited_source = {
        **_direct_parameter_map(field_base),
        **_direct_parameter_map(input_base),
    }
    inherited_defaults = {
        **_parameter_initializers(field_base),
        **_parameter_initializers(input_base),
    }
    for name, (expected_type, _) in expected_inherited.items():
        if inherited_source.get(name) != expected_type:
            raise TextFieldContractError(
                f"Inherited TextField parameter {name} source drifted: expected {expected_type}, found {inherited_source.get(name)}"
            )
    inherited_rows = _table_rows(contract, "Inherited public and framework surface")
    for name, (expected_type, origin) in expected_inherited.items():
        row = inherited_rows.get(name)
        if row is None or len(row) < 2 or row[0] != origin or expected_type not in row[1]:
            raise TextFieldContractError(
                f"Inherited TextField API row {name} is missing/inconsistent; expected {origin}/{expected_type}, found {row}"
            )
    inherited_expected_defaults = {"Size": "Medium", "BindValueEvent": "onchange"}
    for name, expected_default in inherited_expected_defaults.items():
        actual_default = _normalized_default(inherited_defaults.get(name))
        documented = inherited_rows[name][1]
        if actual_default != expected_default or f"default {expected_default}" not in documented:
            raise TextFieldContractError(
                f"Inherited TextField parameter {name} default drifted: source={actual_default!r}, docs={documented!r}, expected={expected_default!r}"
            )
    framework_members = (
        "Value", "ValueChanged", "ValueExpression", "AdditionalAttributes", "DisplayName",
        "EditContext", "FieldIdentifier", "CssClass", "Element", "Id", "Field", "DomHelper",
    )
    missing_framework_rows = [name for name in framework_members if name not in inherited_rows]
    if missing_framework_rows:
        raise TextFieldContractError(f"Inherited/framework TextField rows missing from reference: {missing_framework_rows}")

    # Native input/textarea, attributes, slots and binding are compatibility behavior.
    _require(razor, (
        "<input @attributes=GetInputAdditionalAttributes()",
        "<textarea @attributes=GetInputAdditionalAttributes()",
        '@bind-value:event="@BindValueEvent"',
        "@ref=Element",
        "@StartAddon", "@EndAddon", "@Rows",
    ), "TextField.razor")
    _require(input_base, (
        'AdditionalAttributes["disabled"] is true',
        'if (!item.Key.Equals("class", StringComparison.InvariantCultureIgnoreCase))',
        "ValueExpression = () => _temp!;",
    ), "BluentInputComponentBase")

    # Protect the v2 setter order relied on by all multi-flag combinations.
    cursor = 0
    for marker in (
        "if (DigitOnly)", "value = value?.ToDigits();",
        "if (AsciiDigits)", "value = value?.ToAsciiDigits();",
        "if (ArabicToPersianConversion)", "value = value?.ToPersianChars();",
        "CurrentValueAsString = value;",
    ):
        found = code.find(marker, cursor)
        if found < 0:
            raise TextFieldContractError(f"TextField transform pipeline is missing/reordered at: {marker}")
        cursor = found + len(marker)
    if "if (firstRender && GainFocus && Element != null)" not in code:
        raise TextFieldContractError("GainFocus must remain scoped to first interactive render")
    if "Rows != null && !ResizeTextarea" not in code:
        raise TextFieldContractError("Textarea no-resize behavior no longer follows Rows/ResizeTextarea")

    _require(contract, (
        "all eight boolean combinations", "DigitOnly + AsciiDigits", "DigitOnly + ArabicToPersianConversion",
        "AsciiDigits + ArabicToPersianConversion", "21 live specimens", "28 explicitly named TextField-targeted checks",
        "not a released v3 API", "does not implement the v3 TextField", "not a physical OS IME test",
    ), "TextField canonical design/API contract")

    _require(docs_workflow, (
        '      - "src/Bluent.UI/Components/TextFieldComponent/**"',
        '      - "src/Bluent.UI/Components/BluentFieldComponentBase.cs"',
        '      - "src/Bluent.UI/Components/BluentInputComponentBase.cs"',
        '      - "docs/v3/design/TEXTFIELD-DESIGN-AND-API-CONTRACT.md"',
        '      - "scripts/quality/check_v3_textfield_contract.py"',
        '      - "scripts/quality/test_v3_textfield_contract.py"',
        "python scripts/quality/check_v3_textfield_contract.py",
        "python -m unittest discover -s scripts/quality -p 'test_v3_textfield_contract.py' -v",
    ), "v3 docs-contract workflow wiring")


def main() -> int:
    import argparse
    parser = argparse.ArgumentParser(description="Fail-closed source/API guard for existing TextField baseline and v3 design reference.")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    args = parser.parse_args()
    check_textfield_contract(args.root)
    print("PASS #432 TextField direct/inherited API, binding, native markup, transform-order and evidence boundary contract")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
