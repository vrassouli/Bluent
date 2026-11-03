from __future__ import annotations
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANDIDATES = ROOT / "docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json"
CROSSWALK = ROOT / "docs/v3/quality/FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.json"
LEDGER = ROOT / "docs/v3/quality/FLUENT-PARITY-WAVE-B-API-REVIEW.json"
REPORT = ROOT / "docs/v3/quality/FLUENT-PARITY-WAVE-B-API-REVIEW.md"
WAVE_B = ("TextField", "NumericField", "Checkbox", "Switch", "RadioGroup", "SelectField")
ALLOWED = ("Supported", "Missing", "Bluent extension", "N/A")


def spec(disposition: str, mapping: str, rationale: str, confidence: str = "medium", value_dispositions: list[dict] | None = None, follow_up: str | None = None) -> dict:
    result = {"disposition": disposition, "mapping": mapping, "rationale": rationale, "confidence": confidence}
    if value_dispositions:
        result["valueDispositions"] = value_dispositions
    if follow_up:
        result["followUp"] = follow_up
    return result


COMMON = {
    "StartAddon": spec("Supported", "fluent-text-input start slot", "TextField and NumericField render this fragment in the leading adornment region; SelectField uses its native-select wrapper and is overridden below.", "high"),
    "EndAddon": spec("Supported", "fluent-text-input end slot", "TextField and NumericField render this fragment in the trailing adornment region; SelectField uses its native-select wrapper and is overridden below.", "high"),
    "Size": spec("Supported", "fluent-text-input control-size", "FieldSize Small/Medium/Large is a Bluent field-size API; the pinned text-input CEM exposes control-size. Actual visual size parity remains separate.", "medium"),
    "BindValueEvent": spec("Bluent extension", "Blazor bind-value:event selector", "This selects the DOM event used by Bluent input binding; it is not an upstream custom-element attribute. Verify per-family wiring rather than assuming inheritance means the parameter is honored.", "high"),
    "Tooltip": spec("Bluent extension", "BluentUiComponentBase TooltipService", "Tooltip is a Bluent service/popover composition; no tooltip attribute exists on the referenced Wave B tags.", "high"),
    "TooltipContent": spec("Bluent extension", "Bluent Popover RenderFragment", "Arbitrary tooltip content is a Bluent composition; no matching tooltip-content slot exists on the referenced tags.", "high"),
    "TooltipPlacement": spec("Bluent extension", "Bluent Popover Placement", "Placement is configured by Bluent tooltip infrastructure, not a referenced upstream control attribute.", "high"),
    "TooltipAppearance": spec("Bluent extension", "Bluent PopoverAppearance", "Popover styling is a Bluent API, not an attribute on the referenced controls.", "high"),
    "DisplayTooltipArrow": spec("Bluent extension", "Bluent tooltip arrow configuration", "No matching tooltip-arrow attribute exists on the referenced controls.", "high"),
    "AdditionalAttributes": spec("Supported", "Blazor unmatched-attribute bridge", "Source forwards unmatched attributes; exact role/ARIA/disabled behavior is a separate browser and AT review.", "medium", follow_up="Verify forwarded attributes on the actual element in WASM and published InteractiveServer."),
    "Class": spec("Supported", "HTML class merged with Bluent classes", "The component merges caller class with component classes; a CSS part is not a direct replacement for the Blazor API.", "high"),
    "Style": spec("Supported", "HTML style on the component root", "The component forwards Style to its root; token/theme and computed visual parity remain separate.", "high"),
}

D = {
    "TextField": {
        "Rows": spec("Bluent extension", "Native textarea mode with rows; pinned family counterpart is fluent-text-input", "Rows switches the component from input to textarea. The selected crosswalk does not claim a one-tag mapping for this mode; this ledger does not silently broaden the pinned upstream reference set.", "high"),
        "ResizeTextarea": spec("Bluent extension", "Bluent textarea resize styling", "This controls native textarea resizing; it is not a fluent-text-input attribute.", "high"),
        "GainFocus": spec("Bluent extension", "Blazor programmatic focus helper", "Focus is a Blazor interaction convenience, not a Fluent text-input property.", "high"),
        "DigitOnly": spec("Bluent extension", "Bluent digit-only input filtering", "Character filtering is a Bluent input behavior and has no matching attribute in the pinned text-input CEM.", "high"),
        "AsciiDigits": spec("Bluent extension", "Bluent digit normalization to ASCII", "Digit normalization is a Bluent input behavior and has no matching upstream attribute.", "high"),
        "ArabicToPersianConversion": spec("Bluent extension", "Arabic digit to Persian digit conversion", "Culture-specific digit conversion is a Bluent input behavior and has no matching upstream attribute.", "high"),
    },
    "NumericField": {
        "ParsingErrorMessage": spec("Bluent extension", "Bluent InputBase parsing validation message", "The custom parsing message belongs to Blazor validation; the related fluent-text-input CEM does not expose a NumericField parsing-message property.", "high"),
        "MinimumErrorMessage": spec("Bluent extension", "Bluent minimum-bound validation message", "Custom validation copy is a Bluent feature, not a pinned upstream text-input attribute.", "high"),
        "MaximumErrorMessage": spec("Bluent extension", "Bluent maximum-bound validation message", "Custom validation copy is a Bluent feature, not a pinned upstream text-input attribute.", "high"),
        "OverflowErrorMessage": spec("Bluent extension", "Bluent numeric overflow validation message", "Custom numeric validation copy is a Bluent feature, not a pinned upstream text-input attribute.", "high"),
        "GainFocus": spec("Bluent extension", "Blazor programmatic focus helper", "Focus is a Blazor interaction convenience, not an upstream text-input property.", "high"),
        "Format": spec("Bluent extension", "Bluent numeric display/edit formatting", "Formatting is implemented by the Bluent numeric input and is not an upstream text-input attribute.", "high"),
        "Min": spec("Bluent extension", "Bluent numeric validation bound", "The component renders type=text and validates numeric bounds in Blazor; the pinned fluent-text-input CEM has no min attribute and no dedicated number-field tag is mapped.", "high"),
        "Max": spec("Bluent extension", "Bluent numeric validation bound", "The component renders type=text and validates numeric bounds in Blazor; the pinned fluent-text-input CEM has no max attribute and no dedicated number-field tag is mapped.", "high"),
        "Step": spec("Missing", "Declared Step parameter has no effective source behavior", "The current implementation records the parameter but does not apply it to numeric parsing, increment/decrement behavior or the rendered input. This is a source-confirmed owner issue, not a request to change product code in #552.", "high", follow_up="Track/remediate through #433 after its design/API gate; add a negative-control test proving Step affects the intended contract."),
        "OnBlur": spec("Supported", "Native blur event bridged to Blazor EventCallback", "The component invokes OnBlur from its actual blur handler. This is a standard DOM event mapping, not a custom event claimed by the CEM.", "high", follow_up="Verify callback ordering and value validation in both Blazor render modes."),
        "OnFocus": spec("Supported", "Native focus event bridged to Blazor EventCallback", "The component invokes OnFocus from its actual focus handler. This is a standard DOM event mapping, not a custom event claimed by the CEM.", "high", follow_up="Verify callback ordering and GainFocus interaction in both Blazor render modes."),
    },
    "Checkbox": {
        "Label": spec("Bluent extension", "External native label associated by for/id", "The pinned fluent-checkbox CEM does not document a label attribute or default label slot; Bluent renders a separate native label and changes its text according to state.", "high"),
        "UncheckedLabel": spec("Bluent extension", "State-specific unchecked label text", "A separate label string for the unchecked state is Bluent-specific; no matching upstream attribute is documented.", "high"),
        "IndeterminateLabel": spec("Bluent extension", "State-specific indeterminate label text", "A separate label string for the indeterminate state is Bluent-specific; no matching upstream attribute is documented.", "high"),
        "Required": spec("Bluent extension", "Custom required-marker string", "Required is a string rendered beside the visible label; it is not a boolean required attribute and does not itself establish native required validation.", "high", follow_up="Keep visual required-marker behavior distinct from native required semantics and EditContext validation."),
        "Circular": spec("Bluent extension", "Boolean circular CSS variant", "Bluent exposes a bool that adds a circular class; Fluent exposes a shape attribute. The bool/square default is not a direct shape-enum contract.", "medium", [{"value":"true","disposition":"Supported","mapping":"shape=circular conceptually"},{"value":"false","disposition":"Bluent extension","mapping":"Bluent square/default shape is not a one-to-one bool value in the Fluent shape API"}]),
        "Size": spec("Supported", "fluent-checkbox.size", "CheckboxSize Medium/Large map to the documented size attribute conceptually; rendered size and missing enum values remain separate visual/API review.", "medium"),
        "LabelPosition": spec("Bluent extension", "Bluent label-before layout class", "Before/After label placement is implemented as Bluent wrapper layout; the pinned checkbox CEM has no label-position attribute.", "high"),
    },
    "Switch": {
        "Label": spec("Bluent extension", "External native label associated by for/id", "The pinned fluent-switch CEM has no documented label attribute or slot; Bluent renders a separate label whose text changes with state.", "high"),
        "UncheckedLabel": spec("Bluent extension", "State-specific unchecked label text", "A separate unchecked-state label string is a Bluent API; no matching upstream switch attribute is documented.", "high"),
        "IndeterminateLabel": spec("N/A", "Inherited Checkbox parameter is not applicable to non-nullable Switch<bool>", "Switch is bound to bool and its markup has no indeterminate branch; the inherited property cannot affect this control.", "high"),
        "Required": spec("Bluent extension", "Custom required-marker string", "The string renders a visual marker beside the label; Switch markup does not set native required from this parameter.", "high"),
        "Circular": spec("Missing", "Inherited Circular parameter has no effect on Switch", "Switch overrides GetClasses without including Checkbox's circular class, so the inherited parameter is present in the CLR surface but not applied by the current component.", "high", follow_up="Remediate or explicitly deprecate through #435; do not silently count inherited parameters as supported."),
        "Size": spec("Missing", "Inherited Size parameter has no effect on Switch", "Switch overrides GetClasses without adding the inherited Checkbox size class, and fluent-switch has no size attribute in the pinned CEM.", "high", follow_up="Remediate or explicitly deprecate through #435 after the component API/design decision."),
        "LabelPosition": spec("Bluent extension", "Bluent label-before layout class", "Before/After placement is a Bluent wrapper behavior; the pinned switch CEM documents no label-position attribute or slot.", "high"),
    },
    "RadioGroup": {
        "ChildContent": spec("Supported", "fluent-radio-group default slot", "The group hosts its radio children. The conceptual default slot matches, but Bluent Radio components are not Fluent custom elements and do not share the same DOM/AX contract.", "medium"),
        "RadioGroup.Label": spec("Bluent extension", "Bluent group label wrapper", "The pinned fluent-radio-group CEM exposes no label attribute or named label slot; Bluent renders its own label content.", "high"),
        "ItemsLabelPosition": spec("Bluent extension", "Bluent per-item label positioning", "This controls Bluent child layout and has no matching attribute on fluent-radio-group or fluent-radio.", "high"),
        "Orientation": spec("Supported", "fluent-radio-group.orientation", "Horizontal/Vertical map to the documented orientation concept; actual keyboard roving and layout parity remain separate.", "high"),
        "RadioGroup": spec("Bluent extension", "Cascading Blazor parent-group association", "The Radio child receives a Blazor CascadingParameter to subscribe to its parent; this is not an upstream custom-element attribute.", "high"),
        "Value": spec("Supported", "fluent-radio.value", "The child Radio Value identifies that option's value; group selection and native name/form serialization are separate contracts.", "medium", follow_up="Verify group selection, native name grouping, form submission and keyboard isolation in both browsers/render modes."),
        "Radio.Label": spec("Bluent extension", "External native label associated by for/id", "The pinned fluent-radio CEM does not document a label attribute or default label slot; Bluent uses a separate associated label.", "high"),
    },
    "SelectField": {
        "ChildContent": spec("Bluent extension", "Native select option ChildContent", "Bluent renders native option children inside a native select; the pinned upstream candidates are fluent-dropdown/listbox custom elements and fluent-dropdown-option, not a one-to-one native select API.", "high"),
        "StartAddon": spec("Bluent extension", "Bluent native-select start-addon wrapper", "The Fluent dropdown control slot represents the control itself and is not equivalent to an arbitrary leading addon fragment.", "high"),
        "EndAddon": spec("Bluent extension", "Bluent native-select end-addon wrapper", "The Fluent dropdown indicator slot is not equivalent to an arbitrary trailing addon fragment.", "high"),
        "Size": spec("Supported", "fluent-dropdown.size", "FieldSize Small/Medium/Large maps conceptually to the documented dropdown size attribute; native select appearance is not a visual parity verdict.", "medium"),
        "BindValueEvent": spec("Missing", "Inherited BindValueEvent is not honored by SelectField", "SelectField binds through an explicit @onchange handler rather than using BindValueEvent; the inherited parameter has no effect in the current source.", "high", follow_up="Resolve the inherited API contract through #437; test both change and input paths before deciding whether to remove or honor it."),
    },
}

OUT_OF_BAND = [
    {"name":"InputBase<TValue> binding/validation surface", "scope":"External Microsoft.AspNetCore.Components.Forms.InputBase<TValue>; not counted among the 71 locally declared/inherited parameter occurrences", "disposition":"Bluent extension", "mapping":"Value, ValueChanged, ValueExpression and EditContext/validation integration are framework-owned binding contracts", "rationale":"The local inherited census intentionally stops at the external framework boundary. This ledger does not claim the complete emitted public API or complete EditContext/form behavior; reconcile the framework surface separately before public API acceptance."},
]


def build() -> tuple[dict, str]:
    source = json.loads(CANDIDATES.read_text(encoding="utf-8-sig"))
    crosswalk = json.loads(CROSSWALK.read_text(encoding="utf-8-sig"))
    tag_details = {x["tag"]: x for x in crosswalk["referencedTagDetails"]}
    source_families = [x for x in source["families"] if x["family"] in WAVE_B]
    if tuple(x["family"] for x in source_families) != WAVE_B:
        raise ValueError("Wave B family order or source coverage changed; review the builder.")
    ledger_families = []
    used_declared: set[tuple[str, str]] = set()
    for family in source_families:
        parameters = []
        for component in family["components"]:
            for parameter in component["parameters"]:
                name = parameter["name"]
                component_key = f"{component['name']}.{name}"
                review = D.get(family["family"], {}).get(component_key) or D.get(family["family"], {}).get(name) or COMMON.get(name)
                if parameter.get("origin") != "local_inherited":
                    used_declared.add((family["family"], name))
                if review is None:
                    raise ValueError(f"Missing disposition: {family['family']}.{component['name']}.{name}")
                if review["disposition"] not in ALLOWED:
                    raise ValueError(f"Invalid disposition: {family['family']}.{component['name']}.{name}")
                parameters.append({
                    "component": component["name"], "name": name, "kind": parameter.get("kind"),
                    "csharpType": parameter.get("csharpType"), "origin": parameter.get("origin"),
                    "sourceFile": parameter.get("sourceFile"), "sourceLine": parameter.get("sourceLine"),
                    "spellingCandidates": parameter.get("spellingCandidates", []),
                    "sourceCandidateStatus": parameter.get("comparisonStatus"),
                    "sourceFeatureSupport": parameter.get("featureSupport"),
                    "reviewDisposition": review["disposition"], "mapping": review["mapping"],
                    "rationale": review["rationale"], "confidence": review.get("confidence", "medium"),
                    "valueDispositions": review.get("valueDispositions", []), "followUp": review.get("followUp"),
                })
        contracts = []
        for tag in family.get("referencedTags", []):
            detail = tag_details.get(tag)
            if detail:
                contracts.append({"tag": tag, "attributes": detail.get("attributes", []), "events": detail.get("events", []), "slots": detail.get("slots", []), "cssParts": detail.get("cssParts", []), "cssProperties": detail.get("cssProperties", []), "cssStates": detail.get("cssStates", [])})
        counts = Counter(p["reviewDisposition"] for p in parameters)
        ledger_families.append({
            "family": family["family"], "productIssue": family["productIssue"],
            "componentNames": [c["name"] for c in family["components"]],
            "counterpartKind": family.get("counterpartKind"), "referencedTags": family.get("referencedTags", []),
            "upstreamContracts": contracts, "parameterCount": len(parameters), "reviewedParameterCount": len(parameters),
            "dispositionCounts": {x: counts.get(x, 0) for x in ALLOWED}, "apiReviewStatus": "audited_gaps",
            "designApproval": "pending", "evidenceBundle": None, "parameters": parameters,
        })
    expected_declared = {(f["family"], p["name"]) for f in source_families for c in f["components"] for p in c["parameters"] if p.get("origin") != "local_inherited"}
    if used_declared != expected_declared:
        raise ValueError(f"Disposition map mismatch; missing={expected_declared-used_declared}, extra={used_declared-expected_declared}")
    count = sum(f["parameterCount"] for f in ledger_families)
    if count != 71:
        raise ValueError(f"Expected 71 Wave B parameters, found {count}")
    ledger = {
        "schemaVersion": 1, "auditIssue": 552, "reviewedOn": "2026-10-22", "wave": "B",
        "referenceBaseline": {"webComponents": "@fluentui/web-components@3.1.3", "reactFallback": "@fluentui/react-components@9.74.10 (exact crosswalk snapshot; latest tag 9.74.11)"},
        "sourceCandidatePath": "docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json",
        "upstreamCrosswalkPath": "docs/v3/quality/FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.json",
        "classificationValues": list(ALLOWED), "parameterOccurrenceCount": count,
        "note": "Manual API mapping ledger for Wave B. The machine-generated source candidate file remains unchanged and not_reviewed; Supported means source/API mapping only, not visual, runtime, accessibility or parity acceptance.",
        "families": ledger_families, "outOfBandPublicApi": OUT_OF_BAND, "parityAccepted": False,
    }
    lines = [
        "# Wave B Fluent API review — TextField, NumericField, Checkbox, Switch, RadioGroup and SelectField", "",
        "Review date: 2026-10-22. Status: **API mapping reviewed with gaps; not parity-approved**.", "",
        "This ledger manually classifies the **71 source-known direct and locally inherited parameter occurrences** across Wave B. It is separate from the machine-generated candidate queue, which remains unchanged and unreviewed. Supported means a source/API mapping is identified; it does not imply DOM, visual, keyboard, Blazor render-mode, ARIA, native screen-reader or Fluent parity acceptance.", "",
        "## Frozen reference hierarchy", "",
        "- Primary WC API contract: @fluentui/web-components@3.1.3, extracted from the published custom-elements.json in the pinned crosswalk.",
        "- React v9 is not substituted for a missing WC counterpart. The exact crosswalk snapshot remains @fluentui/react-components@9.74.10; latest tag 9.74.11 is not silently substituted.",
        "- Source candidates: docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md. This manual ledger does not edit its comparisonStatus or featureSupport fields.", "",
        "## Wave B summary", "",
        "| Family | Owner | Parameters reviewed | Supported | Missing | Bluent extension | N/A | API disposition |", "|---|---:|---:|---:|---:|---:|---:|---|",
    ]
    for family in ledger_families:
        c = family["dispositionCounts"]
        lines.append(f"| {family['family']} | #{family['productIssue']} | {family['parameterCount']} | {c['Supported']} | {c['Missing']} | {c['Bluent extension']} | {c['N/A']} | audited_gaps |")
    lines += ["", "## Pinned WC API surface", ""]
    for family in ledger_families:
        if not family["upstreamContracts"]:
            lines.append(f"- **{family['family']}**: no dedicated WC tag in the pinned crosswalk.")
            continue
        tags = []
        for contract in family["upstreamContracts"]:
            attrs = ", ".join(contract["attributes"]) or "none"
            slots = ", ".join(("default" if x == "" else x) for x in contract["slots"]) or "none"
            parts = ", ".join(contract["cssParts"]) or "none"
            events = ", ".join(contract["events"]) or "no custom events documented"
            tags.append(f"{contract['tag']} (attributes: {attrs}; slots: {slots}; CSS parts: {parts}; events: {events})")
        lines.append(f"- **{family['family']}**: " + "; ".join(tags) + ".")
    lines += ["", "## Locally inherited parameters", "", "These contracts appear in one or more Wave B families. Family-specific overrides (for example, Switch inherits Checkbox properties) are recorded in the per-family ledger.", "", "| Parameter | Default disposition | Mapping and rationale |", "|---|---|---|"]
    for name, item in COMMON.items():
        lines.append(f"| {name} | {item['disposition']} | {item['mapping']}. {item['rationale']} |")
    lines += ["", "## Per-family parameter ledger", ""]
    for family in ledger_families:
        lines += [f"### {family['family']} — #{family['productIssue']}", "", f"Pinned counterpart kind: {family['counterpartKind']}; referenced tags: " + (", ".join(family["referencedTags"]) if family["referencedTags"] else "no dedicated WC tag") + ".", "", "| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |", "|---|---|---|---|---|---|---|"]
        for p in family["parameters"]:
            rationale = p["rationale"]
            if p["valueDispositions"]:
                gaps = [v for v in p["valueDispositions"] if v["disposition"] in ("Missing", "Bluent extension", "N/A")]
                if gaps:
                    rationale += " Value-level notes: " + "; ".join(f"{v['value']}: {v['disposition']} ({v['mapping']})" for v in gaps)
            source_path = p.get("sourceFile") or "source path not captured"
            line_no = p.get("sourceLine")
            label = f"{Path(source_path).name}:{line_no}" if line_no else Path(source_path).name
            link = f"[{label}](../../../{source_path}#L{line_no})" if line_no else label
            lines.append(f"| {p['component']}.{p['name']} | {p.get('kind') or '—'} / {p.get('csharpType') or '—'} | {p.get('origin') or '—'} | {p['reviewDisposition']} | {p['mapping']} | {rationale} | {link} |")
        lines.append("")
    lines += ["## Out-of-band public/base findings", "", "| Item | Disposition | Finding |", "|---|---|---|"]
    for item in OUT_OF_BAND:
        lines.append(f"| {item['name']} | {item['disposition']} | {item['mapping']}. {item['rationale']} |")
    lines += [
        "", "## Family-level feature disposition", "",
        "- **TextField (#432): audited_gaps** — the base input and slot concepts map to fluent-text-input, but textarea mode, resize, programmatic focus and digit normalization are Bluent-specific behaviors.",
        "- **NumericField (#433): audited_gaps** — no dedicated fluent-number-field tag is mapped; Min/Max/Format/custom validation are Bluent behavior, Step is declared but ineffective in current source, and the browser exposes a textbox rather than a spinbutton.",
        "- **Checkbox (#434): audited_gaps** — the upstream tag exists, but state-specific label text, string required markers, label positioning and the bool Circular API are not one-to-one with the pinned CEM.",
        "- **Switch (#435): audited_gaps** — the upstream switch tag exists, but Bluent inherits Checkbox properties; Circular and Size currently have no effect, while IndeterminateLabel is not applicable to the bool control.",
        "- **RadioGroup (#436): audited_gaps** — the group/option tags exist; orientation and option value map conceptually, while cascading group context, labels and item layout remain Bluent-specific. Runtime evidence separately records missing group semantics, native name grouping and arrow isolation.",
        "- **SelectField (#437): audited_gaps** — no one-to-one fluent-select-field tag is mapped; Bluent renders a native select, and its inherited BindValueEvent is not honored by the current explicit onchange handler.",
        "", "## Acceptance boundary", "",
        "No product source, CSS, public API or component design was changed. This manual ledger does not modify the machine-generated candidate file, does not approve Fluent parity, and does not replace runtime/browser/OS/AT tests. Wave B feature dimensions may be recorded as audited_gaps; every family designApproval remains pending and evidenceBundle remains null. External InputBase binding/validation APIs are explicitly outside the 71 local occurrences. See the canonical 18-family matrix and the independent visual/behavior/accessibility reports.", ""
    ]
    return ledger, "\n".join(lines)


def main() -> int:
    import argparse
    parser = argparse.ArgumentParser(description="Build the reviewed Wave B Fluent API mapping ledger")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--write", action="store_true")
    group.add_argument("--check", action="store_true")
    args = parser.parse_args()
    ledger, report = build()
    outputs = ((LEDGER, json.dumps(ledger, indent=2, ensure_ascii=False) + "\n"), (REPORT, report))
    if args.write:
        for path, content in outputs:
            path.write_text(content, encoding="utf-8")
        print(f"Wrote Wave B API review for {ledger['parameterOccurrenceCount']} parameter occurrences.")
        return 0
    mismatches = [str(path.relative_to(ROOT)) for path, content in outputs if not path.is_file() or path.read_text(encoding="utf-8-sig") != content]
    if mismatches:
        print("Wave B API review is stale: " + ", ".join(mismatches), file=sys.stderr)
        return 1
    print(f"Wave B API review is current: {ledger['parameterOccurrenceCount']} parameters across {len(ledger['families'])} families.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
