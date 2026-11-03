from __future__ import annotations
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANDIDATES = ROOT / "docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json"
CROSSWALK = ROOT / "docs/v3/quality/FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.json"
LEDGER = ROOT / "docs/v3/quality/FLUENT-PARITY-WAVE-D-API-REVIEW.json"
REPORT = ROOT / "docs/v3/quality/FLUENT-PARITY-WAVE-D-API-REVIEW.md"
WAVE_D = ("Slider", "RangeSlider", "FileSelect")
ALLOWED = ("Supported", "Missing", "Bluent extension", "N/A")


def spec(disposition: str, mapping: str, rationale: str, confidence: str = "medium", value_dispositions: list[dict] | None = None, follow_up: str | None = None) -> dict:
    result = {"disposition": disposition, "mapping": mapping, "rationale": rationale, "confidence": confidence}
    if value_dispositions:
        result["valueDispositions"] = value_dispositions
    if follow_up:
        result["followUp"] = follow_up
    return result


COMMON = {
    "Tooltip": spec("Bluent extension", "BluentUiComponentBase TooltipService/Popover composition", "Tooltip text and content are registered through Bluent's tooltip service; they are not attributes on fluent-slider or a dedicated file-select tag.", "high"),
    "TooltipContent": spec("Bluent extension", "Bluent tooltip RenderFragment", "Arbitrary tooltip content is a Bluent composition, not an upstream control slot on the pinned slider/file-select references.", "high"),
    "TooltipPlacement": spec("Bluent extension", "Bluent Popover Placement", "Placement is configured through Bluent tooltip infrastructure, not a pinned slider/file-select attribute.", "high"),
    "TooltipAppearance": spec("Bluent extension", "Bluent PopoverAppearance", "Popover styling is a Bluent service/composition, not a pinned slider/file-select attribute.", "high"),
    "DisplayTooltipArrow": spec("Bluent extension", "Bluent tooltip arrow configuration", "Arrow display is configured by Bluent tooltip infrastructure, not a pinned slider/file-select attribute.", "high"),
    "AdditionalAttributes": spec("Supported", "Blazor unmatched-attribute bridge on component root", "All three components forward unmatched attributes to the outer root wrapper; this does not automatically forward ARIA/name attributes to the slider thumb or hidden file input.", "high", follow_up="Validate actual element targets and accessible naming in browser/AT tests."),
    "Class": spec("Supported", "Caller class merged on the outer component root", "The current components merge the caller class into their outer root classes; subcontrol-specific class styling remains a separate design decision.", "high"),
    "Style": spec("Supported", "Caller style on the outer component root", "The current components apply Style to their outer root; computed visual and token parity remain separate.", "high"),
}

D = {
    "Slider": {
        "Min": spec("Supported", "fluent-slider.min", "The scalar lower bound maps to the pinned fluent-slider min attribute conceptually; Bluent still calculates a CSS percentage and does not provide native range semantics.", "high", follow_up="Validate Max > Min, values outside bounds and keyboard-operable semantics through #442."),
        "Max": spec("Supported", "fluent-slider.max", "The scalar upper bound maps to the pinned fluent-slider max attribute conceptually; Bluent still calculates a CSS percentage and does not provide native range semantics.", "high", follow_up="Validate Max > Min, values outside bounds and keyboard-operable semantics through #442."),
        "Value": spec("Supported", "fluent-slider.value", "A single scalar value maps to the upstream slider's value concept; current Bluent markup is a div/thumb composition rather than the upstream custom element.", "high", follow_up="Add value/ARIA/keyboard behavior and verify the contract after remediation."),
        "ValueChanged": spec("Supported", "Scalar value updates from upstream input/change interaction", "The Blazor EventCallback is the scalar value-change surface; current Bluent updates through pointer interop only, so this mapping does not imply keyboard or native input/change parity.", "medium", follow_up="Verify callback order and keyboard/input/change behavior in WebAssembly and published InteractiveServer after #442 remediation."),
        "ThumbSize": spec("Bluent extension", "Bluent custom thumb pixel size", "ThumbSize is a custom integer pixel-size parameter; the pinned fluent-slider exposes a thumb CSS part but no equivalent public thumb-size attribute.", "high"),
    },
    "RangeSlider": {
        "Min": spec("Bluent extension", "Lower bound of a two-thumb range", "The pinned WC crosswalk has no dedicated range-slider tag. The related fluent-slider has a scalar min attribute, but that does not establish an equivalent two-thumb range component.", "high", follow_up="Keep the two-thumb bound/ordering policy explicit and validate both pointer and keyboard behavior through #443."),
        "Max": spec("Bluent extension", "Upper bound of a two-thumb range", "The pinned WC crosswalk has no dedicated range-slider tag. The related fluent-slider has a scalar max attribute, but that does not establish an equivalent two-thumb range component.", "high", follow_up="Keep the two-thumb bound/ordering policy explicit and validate both pointer and keyboard behavior through #443."),
        "Value": spec("Bluent extension", "ValueRange<TValue> with independent minimum and maximum values", "A two-value range is not equivalent to the scalar value property of fluent-slider; the pinned Web Components manifest has no one-to-one RangeSlider tag.", "high", follow_up="Specify crossing/collision policy, independent names/values and stable thumb focus before #443 design approval."),
        "ValueChanged": spec("Bluent extension", "Two-value ValueRange<TValue> callback", "The callback returns a range pair rather than a scalar input value; no dedicated upstream range-slider event contract was found.", "high", follow_up="Specify callback behavior for each thumb and test simultaneous/overlapping pointer interaction."),
        "ThumbSize": spec("Bluent extension", "Bluent custom thumb pixel size for both thumbs", "The parameter sets Bluent's thumb sizing; the pinned WC crosswalk has no range-slider tag or equivalent public thumb-size property.", "high"),
    },
    "FileSelect": {
        "Text": spec("Supported", "fluent-button default slot for the trigger button only", "Text maps to the button label/content conceptually. This is a related trigger-subcontrol mapping only; neither fluent-button nor React Input is a file-select-plus-file-list component.", "medium"),
        "Icon": spec("Bluent extension", "Bluent IconDefinition rendered inside the trigger Button", "The icon is a Bluent IconDefinition rendered through the Bluent Button composition; fluent-button has content slots but no equivalent IconDefinition parameter.", "high"),
        "Accept": spec("Supported", "Native input[type=file].accept hint", "The value is forwarded to the native InputFile accept attribute. This is a chooser hint, not server-side type/content/size/authorization validation and not a dedicated Fluent file-select contract.", "high", follow_up="Keep server-side upload security as a separate acceptance gate; do not treat accept as validation."),
        "ShowFileInfo": spec("Bluent extension", "Toggle file-card list rendering", "The property controls the Bluent file-list composition and whether the picker button remains available; no dedicated upstream file-select component exists.", "high"),
        "AllowRemove": spec("Bluent extension", "Per-file remove action visibility and behavior", "Removal and per-file card composition are Bluent-specific behavior; the current remove button also has a non-semantic private-use glyph accessible name in the browser audit.", "high", follow_up="Supply a localized contextual accessible name and verify real screen-reader output through #444."),
        "Disabled": spec("Bluent extension", "Disabled state on the trigger Button only", "Disabled is passed to the visible Button, but the hidden InputFile itself does not receive disabled; the composite does not fully express disabled state at the native input boundary.", "high", follow_up="Apply the disabled contract consistently to both trigger and InputFile and test keyboard/programmatic activation."),
        "Appearance": spec("Supported", "fluent-button.appearance for the trigger button only", "Appearance configures the Bluent Button subcontrol; this does not create a dedicated Fluent file-select counterpart.", "medium"),
        "Shape": spec("Supported", "fluent-button.shape for the trigger button only", "Shape configures the Bluent Button subcontrol; this does not create a dedicated Fluent file-select counterpart.", "medium"),
        "OnChange": spec("Bluent extension", "Batch callback with IEnumerable<SelectedFile>", "The callback exposes the Bluent selected-file collection and batch behavior; no matching custom file-select event exists in the pinned WC manifest.", "high", follow_up="Verify event ordering and consistency for batch selection, removals and overflow cases."),
        "OnFileSelected": spec("Bluent extension", "Per-file selection EventCallback", "The callback is a Bluent per-file composition event, not a dedicated upstream file-select event.", "high"),
        "OnFileRemoved": spec("Bluent extension", "Per-file removal EventCallback", "The callback is a Bluent per-file removal event, not a dedicated upstream file-select event.", "high"),
        "MaxFiles": spec("Bluent extension", "Bluent selected-file count limit", "MaxFiles controls whether the picker Button is shown and whether the native input is multiple, but HandleFileChanged appends every file in a batch without enforcing remaining capacity. The existing browser audit reproduced three accepted files with MaxFiles=2 in both a single batch and cumulative selection.", "high", follow_up="Choose reject-vs-truncate policy, enforce batch and cumulative limits, and keep OnChange/count/callbacks consistent through #444."),
    },
}

RELATED_TAGS = {
    "RangeSlider": ["fluent-slider"],
    "FileSelect": ["fluent-button"],
}

OUT_OF_BAND = [
    {"name":"InputBase<TValue> binding/validation surface", "scope":"External Microsoft.AspNetCore.Components.Forms.InputBase<TValue>; not counted among the 46 locally declared/inherited parameter occurrences", "disposition":"Bluent extension", "mapping":"Value, ValueChanged, ValueExpression and EditContext/validation integration are framework-owned binding contracts", "rationale":"The local inherited census intentionally stops at the external framework boundary. This ledger does not claim the complete emitted public API or complete EditContext/form behavior; reconcile the framework surface separately before public API acceptance."},
]
def build() -> tuple[dict, str]:
    source = json.loads(CANDIDATES.read_text(encoding="utf-8-sig"))
    crosswalk = json.loads(CROSSWALK.read_text(encoding="utf-8-sig"))
    tag_details = {x["tag"]: x for x in crosswalk["referencedTagDetails"]}
    source_families = [x for x in source["families"] if x["family"] in WAVE_D]
    if tuple(x["family"] for x in source_families) != WAVE_D:
        raise ValueError("Wave D family order or source coverage changed; review the builder.")
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
        related_contracts = []
        for tag in RELATED_TAGS.get(family["family"], []):
            detail = tag_details.get(tag)
            if detail:
                related_contracts.append({"tag": tag, "attributes": detail.get("attributes", []), "events": detail.get("events", []), "slots": detail.get("slots", []), "cssParts": detail.get("cssParts", []), "cssProperties": detail.get("cssProperties", []), "cssStates": detail.get("cssStates", [])})
        counts = Counter(p["reviewDisposition"] for p in parameters)
        ledger_families.append({
            "family": family["family"], "productIssue": family["productIssue"],
            "componentNames": [c["name"] for c in family["components"]],
            "counterpartKind": family.get("counterpartKind"), "referencedTags": family.get("referencedTags", []),
            "upstreamContracts": contracts, "relatedUpstreamContracts": related_contracts, "parameterCount": len(parameters), "reviewedParameterCount": len(parameters),
            "dispositionCounts": {x: counts.get(x, 0) for x in ALLOWED}, "apiReviewStatus": "audited_gaps",
            "designApproval": "pending", "evidenceBundle": None, "parameters": parameters,
        })
    expected_declared = {(f["family"], p["name"]) for f in source_families for c in f["components"] for p in c["parameters"] if p.get("origin") != "local_inherited"}
    if used_declared != expected_declared:
        raise ValueError(f"Disposition map mismatch; missing={expected_declared-used_declared}, extra={used_declared-expected_declared}")
    count = sum(f["parameterCount"] for f in ledger_families)
    if count != 46:
        raise ValueError(f"Expected 46 Wave D parameters, found {count}")
    ledger = {
        "schemaVersion": 1, "auditIssue": 552, "reviewedOn": "2026-10-22", "wave": "D",
        "referenceBaseline": {"webComponents": "@fluentui/web-components@3.1.3", "reactFallback": "@fluentui/react-components@9.74.10 (exact crosswalk snapshot; latest tag 9.74.11)"},
        "sourceCandidatePath": "docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json",
        "upstreamCrosswalkPath": "docs/v3/quality/FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.json",
        "classificationValues": list(ALLOWED), "parameterOccurrenceCount": count,
        "note": "Manual API mapping ledger for Wave D. The machine-generated source candidate file remains unchanged and not_reviewed; Supported means source/API mapping only, not visual, runtime, accessibility or parity acceptance.",
        "families": ledger_families, "outOfBandPublicApi": OUT_OF_BAND, "parityAccepted": False,
    }
    lines = [
        "# Wave D Fluent API review - Slider, RangeSlider and FileSelect", "",
        "Review date: 2026-10-22. Status: **API mapping reviewed with gaps; not parity-approved**.", "",
        "This ledger manually classifies the **46 source-known direct and locally inherited parameter occurrences** across Wave D. It is separate from the machine-generated candidate queue, which remains unchanged and unreviewed. Supported means a source/API mapping is identified; it does not imply DOM, visual, keyboard, Blazor render-mode, ARIA, native screen-reader or Fluent parity acceptance.", "",
        "## Frozen reference hierarchy", "",
        "- Primary WC API contract: @fluentui/web-components@3.1.3, extracted from the published custom-elements.json in the pinned crosswalk.",
        "- React v9 is not substituted for a missing WC counterpart. The exact crosswalk snapshot remains @fluentui/react-components@9.74.10; latest tag 9.74.11 is not silently substituted.",
        "- Source candidates: docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md. This manual ledger does not edit its comparisonStatus or featureSupport fields.", "",
        "## Wave D summary", "",
        "| Family | Owner | Parameters reviewed | Supported | Missing | Bluent extension | N/A | API disposition |", "|---|---:|---:|---:|---:|---:|---:|---|",
    ]
    for family in ledger_families:
        c = family["dispositionCounts"]
        lines.append(f"| {family['family']} | #{family['productIssue']} | {family['parameterCount']} | {c['Supported']} | {c['Missing']} | {c['Bluent extension']} | {c['N/A']} | audited_gaps |")
    lines += ["", "## Pinned WC API surface", ""]
    for family in ledger_families:
        if not family["upstreamContracts"]:
            related = family.get("relatedUpstreamContracts", [])
            if related:
                descriptions = []
                for contract in related:
                    attrs = ", ".join(contract["attributes"]) or "none"
                    slots = ", ".join(("default" if x == "" else x) for x in contract["slots"]) or "none"
                    parts = ", ".join(contract["cssParts"]) or "none"
                    events = ", ".join(contract["events"]) or "no custom events documented"
                    descriptions.append(f"{contract['tag']} (attributes: {attrs}; slots: {slots}; CSS parts: {parts}; events: {events})")
                lines.append(f"- **{family['family']}**: no dedicated one-to-one WC tag; related reference/subcontrol only: " + "; ".join(descriptions) + ". This does not establish family equivalence.")
            else:
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
    lines += ["", "## Locally inherited parameters", "", "These contracts appear in one or more Wave D families. Family-specific overrides (for example, Switch inherits Checkbox properties) are recorded in the per-family ledger.", "", "| Parameter | Default disposition | Mapping and rationale |", "|---|---|---|"]
    for name, item in COMMON.items():
        lines.append(f"| {name} | {item['disposition']} | {item['mapping']}. {item['rationale']} |")
    lines += ["", "## Per-family parameter ledger", ""]
    for family in ledger_families:
        lines += [f"### {family['family']} - #{family['productIssue']}", "", f"Pinned counterpart kind: {family['counterpartKind']}; referenced tags: " + (", ".join(family["referencedTags"]) if family["referencedTags"] else "no dedicated WC tag") + ".", "", "| Component / parameter | Kind / source type | Origin | Disposition | Upstream mapping | Rationale / value-level gaps | Source |", "|---|---|---|---|---|---|---|"]
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
            lines.append(f"| {p['component']}.{p['name']} | {p.get('kind') or '-'} / {p.get('csharpType') or '-'} | {p.get('origin') or '-'} | {p['reviewDisposition']} | {p['mapping']} | {rationale} | {link} |")
        lines.append("")
    lines += ["## Out-of-band public/base findings", "", "| Item | Disposition | Finding |", "|---|---|---|"]
    for item in OUT_OF_BAND:
        lines.append(f"| {item['name']} | {item['disposition']} | {item['mapping']}. {item['rationale']} |")
    lines += [
        "", "## Family-level feature disposition", "",
        "- **Slider (#442): audited_gaps** - fluent-slider is a relevant single-value reference, but Bluent renders a div/thumb composition without native slider role, tabindex, keyboard handling or complete ARIA semantics. Orientation and Size are not active public parameters; ThumbSize is a Bluent extension. See [slider/range browser audit](FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md).",
        "- **RangeSlider (#443): audited_gaps** - the pinned WC crosswalk has no dedicated two-thumb range-slider tag. The related fluent-slider is scalar only; Bluent's two-value range has no equivalent upstream contract and remains pointer-driven without native thumb focus/keyboard semantics. See [slider/range browser audit](FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md).",
        "- **FileSelect (#444): audited_gaps** - there is no dedicated file-select tag; only the trigger button has related fluent-button properties. MaxFiles hides the picker but does not enforce remaining batch capacity (three files can be accepted with MaxFiles=2), Disabled is applied to the trigger rather than the hidden InputFile, and the remove action has an inaccessible glyph-only name. See [FileSelect browser audit](FLUENT-PARITY-FILESELECT-AUDIT.md).",
        "", "## Acceptance boundary", "",
        "No product source, CSS, public API or component design was changed. This manual ledger does not modify the machine-generated candidate file, does not approve Fluent parity, and does not replace runtime/browser/OS/AT tests. Wave D feature dimensions may be recorded as audited_gaps; every family designApproval remains pending and evidenceBundle remains null. External InputBase binding/validation APIs are explicitly outside the 46 local occurrences. See the canonical 18-family matrix and independent visual/behavior/accessibility reports.", ""
    ]
    return ledger, "\n".join(lines)


def main() -> int:
    import argparse
    parser = argparse.ArgumentParser(description="Build the reviewed Wave D Fluent API mapping ledger")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--write", action="store_true")
    group.add_argument("--check", action="store_true")
    args = parser.parse_args()
    ledger, report = build()
    outputs = ((LEDGER, json.dumps(ledger, indent=2, ensure_ascii=False) + "\n"), (REPORT, report))
    if args.write:
        for path, content in outputs:
            path.write_text(content, encoding="utf-8")
        print(f"Wrote Wave D API review for {ledger['parameterOccurrenceCount']} parameter occurrences.")
        return 0
    mismatches = [str(path.relative_to(ROOT)) for path, content in outputs if not path.is_file() or path.read_text(encoding="utf-8-sig") != content]
    if mismatches:
        print("Wave D API review is stale: " + ", ".join(mismatches), file=sys.stderr)
        return 1
    print(f"Wave D API review is current: {ledger['parameterOccurrenceCount']} parameters across {len(ledger['families'])} families.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
