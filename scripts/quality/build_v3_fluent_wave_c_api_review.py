from __future__ import annotations
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANDIDATES = ROOT / "docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json"
CROSSWALK = ROOT / "docs/v3/quality/FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.json"
LEDGER = ROOT / "docs/v3/quality/FLUENT-PARITY-WAVE-C-API-REVIEW.json"
REPORT = ROOT / "docs/v3/quality/FLUENT-PARITY-WAVE-C-API-REVIEW.md"
WAVE_C = ("DateField", "TimeField", "MaskedField", "OtpField")
ALLOWED = ("Supported", "Missing", "Bluent extension", "N/A")


def spec(disposition: str, mapping: str, rationale: str, confidence: str = "medium", value_dispositions: list[dict] | None = None, follow_up: str | None = None) -> dict:
    result = {"disposition": disposition, "mapping": mapping, "rationale": rationale, "confidence": confidence}
    if value_dispositions:
        result["valueDispositions"] = value_dispositions
    if follow_up:
        result["followUp"] = follow_up
    return result


COMMON = {
    "StartAddon": spec("Supported", "fluent-text-input start slot", "DateField, TimeField and MaskedField forward this fragment to MaskedField, which renders a leading addon region; OtpField does not render this inherited property and overrides it below.", "high"),
    "EndAddon": spec("Supported", "fluent-text-input end slot", "DateField, TimeField and MaskedField forward this fragment to MaskedField, which renders a trailing addon region; OtpField does not render this inherited property and overrides it below.", "high"),
    "Size": spec("Supported", "fluent-text-input control-size", "DateField, TimeField and MaskedField forward FieldSize to MaskedField, which adds the corresponding size class; OtpField does not apply a size class and overrides it below.", "high"),
    "BindValueEvent": spec("Bluent extension", "Blazor bind-value:event selector", "This is a Blazor input-binding event setting rather than an upstream custom-element attribute; each composite component must be checked for actual wiring.", "high"),
    "Class": spec("Supported", "Caller class forwarded to the rendered control wrapper", "DateField, TimeField and MaskedField forward Class to the MaskedField wrapper. OtpField applies Class to its inner OTP group rather than the outer root and overrides it below.", "high"),
    "Style": spec("Supported", "Caller style on the rendered root/wrapper", "DateField, TimeField and MaskedField forward Style to the MaskedField wrapper; OtpField applies Style to its outer root.", "high"),
}

D = {
    "DateField": {
        "Culture": spec("Bluent extension", "Culture-aware date parse/format and calendar configuration", "The pinned family counterpart is fluent-text-input, not a date-picker tag. Culture is passed to date formatting, parsing and the embedded picker; this is composite Bluent behavior.", "high"),
        "Mode": spec("Bluent extension", "Day/Month/Year calendar mode", "No dedicated date-picker tag exists in the pinned WC crosswalk. Source also exposes a YearSelect inconsistency: formatting uses yyyy/MM while the mask accepts four digits only.", "high", follow_up="Align YearSelect display format, parser and mask; add one regression per CalendarMode before #438 acceptance."),
        "DateClass": spec("Missing", "Declared per-date CSS callback is not forwarded to DateFieldPicker", "The current DateField source declares DateClass but never reads or passes it to the embedded picker; the public parameter has no effect.", "high", follow_up="Wire the callback into the picker or explicitly deprecate it through #438 after design/API review."),
        "Max": spec("Bluent extension", "DateFieldPicker upper date boundary", "Max is passed to the embedded calendar picker, but TryParseValueFromString only parses the typed text and does not enforce the boundary. The pinned text-input CEM has no date-picker contract.", "high", follow_up="Test typed values beyond Max and ensure picker and manual-entry paths share the intended range validation."),
        "Min": spec("Bluent extension", "DateFieldPicker lower date boundary", "Min is passed to the embedded calendar picker, but TryParseValueFromString only parses the typed text and does not enforce the boundary. The pinned text-input CEM has no date-picker contract.", "high", follow_up="Test typed values below Min and ensure picker and manual-entry paths share the intended range validation."),
        "DisplayCalendar": spec("Bluent extension", "Optional embedded calendar picker button", "This controls whether DateField renders its calendar picker addon; there is no dedicated date-picker counterpart in the pinned WC catalog.", "high"),
        "ParsingErrorMessage": spec("Bluent extension", "Blazor InputBase date parsing validation", "Custom parsing copy is part of Blazor form validation and has no matching property on the related fluent-text-input tag.", "high"),
        "BindValueEvent": spec("Missing", "Inherited BindValueEvent is not forwarded to the nested MaskedField", "DateField binds CurrentValueAsString to a MaskedField component but does not pass its own BindValueEvent; the parent parameter has no effect on the visible input event.", "high", follow_up="Either forward the setting or explicitly remove/deprecate the inherited contract through #438 after API review."),
    },
    "TimeField": {
        "ParsingErrorMessage": spec("Bluent extension", "Blazor InputBase time parsing validation", "Custom parsing copy is part of Blazor form validation and has no matching property on the related fluent-text-input tag.", "high"),
        "Seconds": spec("Bluent extension", "Time mask and display precision toggle", "Seconds changes the accepted mask and formatted value; the pinned crosswalk has no dedicated time-picker tag.", "high"),
        "Culture": spec("Bluent extension", "Culture-aware time parsing", "Culture is passed to BindConverter parsing, but TimeOnly/DateTime formatting calls ToString without the Culture argument, so display formatting follows current culture rather than the supplied Culture.", "high", follow_up="Use the supplied Culture consistently for formatting and parsing; test two cultures with different time conventions through #439."),
        "BindValueEvent": spec("Missing", "Inherited BindValueEvent is not forwarded to the nested MaskedField", "TimeField binds CurrentValueAsString to a MaskedField component but does not pass its own BindValueEvent; the parent parameter has no effect on the visible input event.", "high", follow_up="Either forward the setting or explicitly remove/deprecate the inherited contract through #439 after API review."),
    },
    "MaskedField": {
        "Mask": spec("Bluent extension", "Bluent regex mask lexer and literal insertion", "A regex-driven partial-input mask has no one-to-one fluent-text-input property. Actual Chrome and Edge typed-input evidence reproduced a literal-prefix corruption: entering 09123456789 yields 0991-234-5678 for the configured 09xx-xxx-xxxx mask.", "high", follow_up="See FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md and BLUENT-TYPED-FIELDS-CHROME/EDGE.json. Fix GetLiteralAt/AppendLiterals indexing and add typed-entry, paste, backspace and leading-literal regression tests through #440."),
        "AsciiDigits": spec("Bluent extension", "Normalize accepted digits to ASCII", "Digit normalization is a Bluent-specific input transformation and has no matching upstream text-input attribute.", "high", follow_up="Define and test precedence when AsciiDigits and ArabicToPersianConversion are both enabled."),
        "ArabicToPersianConversion": spec("Bluent extension", "Convert Arabic digits to Persian digits", "Culture-specific digit conversion is a Bluent input transformation; when both conversion flags are enabled, source applies ASCII conversion first and Persian conversion second, so the final output is Persian digits.", "high", follow_up="Define mutual exclusion or explicit precedence and add combined-flag tests."),
        "BindValueEvent": spec("Missing", "Inherited BindValueEvent is not used by MaskedField", "MaskedField handles DOM input explicitly with @oninput and does not bind through BindValueEvent; changing this inherited parameter has no effect on the visible input.", "high", follow_up="Resolve the inherited contract through #440; retain input-event semantics if required by the mask engine."),
    },
    "OtpField": {
        "Length": spec("Bluent extension", "Number of one-character OTP cells", "The control is a multi-cell interaction with one hidden bound value; it is not equivalent to one fluent-text-input field.", "high", follow_up="Test zero/negative, one, long and dynamically changed lengths, including focus and form serialization."),
        "Password": spec("Bluent extension", "Switch OTP cells between text and password input types", "Per-cell password masking is a composite OTP behavior, not a property of a single upstream text input.", "high", follow_up="Verify native screen-reader announcements and password-mode behavior with real assistive technology."),
        "AutoSubmit": spec("Bluent extension", "OTP interop submits the enclosing form after all cells are filled", "The interop reads data-otp-auto-submit and calls requestSubmit/submit when the full value is present and an enclosing form exists; this is Bluent form orchestration, not a Fluent input attribute.", "high", follow_up="Add a real form fixture to verify submit count, validation handling and the no-form path in Chrome and Edge."),
        "StartAddon": spec("Missing", "Inherited StartAddon is not rendered by OtpField", "OtpField markup does not render StartAddon despite inheriting the parameter; the public property has no effect.", "high", follow_up="Either render the addon in the approved OTP composition or explicitly deprecate the inherited API through #441."),
        "EndAddon": spec("Missing", "Inherited EndAddon is not rendered by OtpField", "OtpField markup does not render EndAddon despite inheriting the parameter; the public property has no effect.", "high", follow_up="Either render the addon in the approved OTP composition or explicitly deprecate the inherited API through #441."),
        "Size": spec("Missing", "Inherited Size is not applied by OtpField", "OtpField.GetClasses emits only bui-otp-field and the markup has no size-class binding; changing the inherited Size parameter has no effect.", "high", follow_up="Define supported OTP sizing in the approved design/API or explicitly deprecate the inherited parameter through #441."),
        "BindValueEvent": spec("Bluent extension", "OTP interop dispatches the configured DOM event to the hidden bound input", "The JS interop reads data-otp-blazor-event and dispatches the selected event after updating the hidden input; this is Blazor-specific glue rather than an upstream custom-element attribute.", "high", follow_up="Verify input/change event variants against actual Blazor binding and EditContext validation."),
        "Class": spec("Bluent extension", "Caller class applied to inner OTP group", "OtpField applies Class to the inner .otp element, not the outer component root; this differs from the standard field-wrapper placement and needs an explicit API/design decision.", "high", follow_up="Confirm the intended class target in the approved design and add a DOM contract test."),
    },
}

OUT_OF_BAND = [
    {"name":"InputBase<TValue> binding/validation surface", "scope":"External Microsoft.AspNetCore.Components.Forms.InputBase<TValue>; not counted among the 40 locally declared/inherited parameter occurrences", "disposition":"Bluent extension", "mapping":"Value, ValueChanged, ValueExpression and EditContext/validation integration are framework-owned binding contracts", "rationale":"The local inherited census intentionally stops at the external framework boundary. This ledger does not claim the complete emitted public API or complete EditContext/form behavior; reconcile the framework surface separately before public API acceptance."},
]
def build() -> tuple[dict, str]:
    source = json.loads(CANDIDATES.read_text(encoding="utf-8-sig"))
    crosswalk = json.loads(CROSSWALK.read_text(encoding="utf-8-sig"))
    tag_details = {x["tag"]: x for x in crosswalk["referencedTagDetails"]}
    source_families = [x for x in source["families"] if x["family"] in WAVE_C]
    if tuple(x["family"] for x in source_families) != WAVE_C:
        raise ValueError("Wave C family order or source coverage changed; review the builder.")
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
    if count != 40:
        raise ValueError(f"Expected 40 Wave C parameters, found {count}")
    ledger = {
        "schemaVersion": 1, "auditIssue": 552, "reviewedOn": "2026-10-22", "wave": "C",
        "referenceBaseline": {"webComponents": "@fluentui/web-components@3.1.3", "reactFallback": "@fluentui/react-components@9.74.10 (exact crosswalk snapshot; latest tag 9.74.11)"},
        "sourceCandidatePath": "docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json",
        "upstreamCrosswalkPath": "docs/v3/quality/FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.json",
        "classificationValues": list(ALLOWED), "parameterOccurrenceCount": count,
        "note": "Manual API mapping ledger for Wave C. The machine-generated source candidate file remains unchanged and not_reviewed; Supported means source/API mapping only, not visual, runtime, accessibility or parity acceptance.",
        "families": ledger_families, "outOfBandPublicApi": OUT_OF_BAND, "parityAccepted": False,
    }
    lines = [
        "# Wave C Fluent API review — DateField, TimeField, MaskedField and OtpField", "",
        "Review date: 2026-10-22. Status: **API mapping reviewed with gaps; not parity-approved**.", "",
        "This ledger manually classifies the **40 source-known direct and locally inherited parameter occurrences** across Wave C. It is separate from the machine-generated candidate queue, which remains unchanged and unreviewed. Supported means a source/API mapping is identified; it does not imply DOM, visual, keyboard, Blazor render-mode, ARIA, native screen-reader or Fluent parity acceptance.", "",
        "## Frozen reference hierarchy", "",
        "- Primary WC API contract: @fluentui/web-components@3.1.3, extracted from the published custom-elements.json in the pinned crosswalk.",
        "- React v9 is not substituted for a missing WC counterpart. The exact crosswalk snapshot remains @fluentui/react-components@9.74.10; latest tag 9.74.11 is not silently substituted.",
        "- Source candidates: docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md. This manual ledger does not edit its comparisonStatus or featureSupport fields.", "",
        "## Wave C summary", "",
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
    lines += ["", "## Locally inherited parameters", "", "These contracts appear in one or more Wave C families. Family-specific overrides (for example, Switch inherits Checkbox properties) are recorded in the per-family ledger.", "", "| Parameter | Default disposition | Mapping and rationale |", "|---|---|---|"]
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
        "- **DateField (#438): audited_gaps** — the pinned counterpart is only a related text input, not a date picker. DateClass is declared but unused, YearSelect formatting and mask disagree, and manual typed dates bypass Min/Max range enforcement.",
        "- **TimeField (#439): audited_gaps** — there is no dedicated time-picker tag in the pinned WC crosswalk. Seconds and parsing are Bluent-specific, Culture is not used consistently for formatting, and inherited BindValueEvent is not forwarded to the visible mask input.",
        "- **MaskedField (#440): audited_gaps** — regex masks and digit conversion are Bluent extensions; browser evidence reproduces leading-literal corruption (09123456789 becomes 0991-234-5678) in Chrome and Edge. The two digit-conversion flags also have order-dependent combined behavior. See [typed-field browser audit](FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md), [Chrome evidence](evidence/BLUENT-TYPED-FIELDS-CHROME.json) and [Edge evidence](evidence/BLUENT-TYPED-FIELDS-EDGE.json).",
        "- **OtpField (#441): audited_gaps** — multi-cell OTP, password mode and auto-submit are composite Bluent behavior. Inherited StartAddon, EndAddon and Size are declared but not rendered/applied; Class targets the inner OTP group, and native AT/form acceptance remains open.",
        "", "## Acceptance boundary", "",
        "No product source, CSS, public API or component design was changed. This manual ledger does not modify the machine-generated candidate file, does not approve Fluent parity, and does not replace runtime/browser/OS/AT tests. Wave C feature dimensions may be recorded as audited_gaps; every family designApproval remains pending and evidenceBundle remains null. External InputBase binding/validation APIs are explicitly outside the 40 local occurrences. See the canonical 18-family matrix and independent visual/behavior/accessibility reports.", ""
    ]
    return ledger, "\n".join(lines)


def main() -> int:
    import argparse
    parser = argparse.ArgumentParser(description="Build the reviewed Wave C Fluent API mapping ledger")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--write", action="store_true")
    group.add_argument("--check", action="store_true")
    args = parser.parse_args()
    ledger, report = build()
    outputs = ((LEDGER, json.dumps(ledger, indent=2, ensure_ascii=False) + "\n"), (REPORT, report))
    if args.write:
        for path, content in outputs:
            path.write_text(content, encoding="utf-8")
        print(f"Wrote Wave C API review for {ledger['parameterOccurrenceCount']} parameter occurrences.")
        return 0
    mismatches = [str(path.relative_to(ROOT)) for path, content in outputs if not path.is_file() or path.read_text(encoding="utf-8-sig") != content]
    if mismatches:
        print("Wave C API review is stale: " + ", ".join(mismatches), file=sys.stderr)
        return 1
    print(f"Wave C API review is current: {ledger['parameterOccurrenceCount']} parameters across {len(ledger['families'])} families.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())


