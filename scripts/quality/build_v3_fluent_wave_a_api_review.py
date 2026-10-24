from __future__ import annotations
import argparse
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CANDIDATES = ROOT / "docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json"
CROSSWALK = ROOT / "docs/v3/quality/FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.json"
LEDGER = ROOT / "docs/v3/quality/FLUENT-PARITY-WAVE-A-API-REVIEW.json"
REPORT = ROOT / "docs/v3/quality/FLUENT-PARITY-WAVE-A-API-REVIEW.md"
WAVE_A = ("Button", "Icon", "Label", "Link", "Badge")
ALLOWED = ("Supported", "Missing", "Bluent extension", "N/A")


def spec(disposition: str, mapping: str, rationale: str, confidence: str = "medium", value_dispositions: list[dict] | None = None, follow_up: str | None = None) -> dict:
    result = {"disposition": disposition, "mapping": mapping, "rationale": rationale, "confidence": confidence}
    if value_dispositions:
        result["valueDispositions"] = value_dispositions
    if follow_up:
        result["followUp"] = follow_up
    return result


COMMON = {
    "Tooltip": spec("Bluent extension", "BluentUiComponentBase TooltipService; no corresponding WC tooltip API", "Tooltip is registered against the generated/provided id with mouseenter/focus triggers and mouseleave/blur hides; native title is not equivalent."),
    "TooltipContent": spec("Bluent extension", "Bluent Popover RenderFragment", "Arbitrary tooltip content is a Bluent composition; no tooltip-content slot exists on the referenced WC tags."),
    "TooltipPlacement": spec("Bluent extension", "Bluent Popover Placement", "Placement is configured by the Bluent tooltip service, not by a referenced WC attribute."),
    "TooltipAppearance": spec("Bluent extension", "Bluent PopoverAppearance", "Popover styling is a Bluent API and has no direct attribute on these WC tags."),
    "DisplayTooltipArrow": spec("Bluent extension", "Bluent tooltip arrow configuration", "No matching tooltip component or arrow attribute exists in the pinned WC tag contracts."),
    "AdditionalAttributes": spec("Supported", "Blazor unmatched-attribute bridge to the root HTML element", "Source forwards arbitrary attributes; exact DOM, disabled and ARIA behavior remains a separate runtime/AT check.", "medium", follow_up="Verify forwarded attributes on the real component in both Blazor render modes."),
    "Class": spec("Supported", "HTML class attribute merged with Bluent classes", "BluentComponentBase.GetComponentClass combines component classes with Class; a CSS part is not a direct replacement for this Blazor API.", "high"),
    "Style": spec("Supported", "HTML style attribute on the root element", "The component forwards Style to the rendered root; CSS token and theme equivalence remain separate review dimensions.", "high"),
}

D = {
"Button": {
"Text": spec("Supported", "fluent-button default slot", "Bluent Text is rendered as the button's content; the pinned tag exposes a default slot.", "high"),
"TextClass": spec("Bluent extension", "Bluent inner text wrapper class; WC exposes CSS part content", "A per-text class is not equivalent to styling the whole WC content part."),
"SecondaryText": spec("Supported", "fluent-compound-button description slot (related tag)", "The equivalent concept exists on the separate compound-button tag, not as a property of fluent-button.", "medium"),
"Icon": spec("Supported", "fluent-button start slot; end slot for alternate placement", "The slot can host icon content; Bluent's paired regular/filled icon rendering and state CSS remain Bluent-specific."),
"Toggled": spec("Bluent extension", "Related candidate: fluent-toggle-button.pressed", "Bluent currently renders a normal button with a toggled class; it does not adopt the toggle-button pressed/mixed or ARIA contract.", "high", follow_up="Verify aria-pressed and state-change behavior in the real browser."),
"Rotated": spec("Bluent extension", "Bluent rotated CSS class", "No rotation attribute or state is documented for the pinned button tags."),
"Orientation": spec("Bluent extension", "Bluent vertical-orientation CSS class", "No orientation attribute is documented for the pinned button tags."),
"ToggledChanged": spec("Bluent extension", "Blazor EventCallback<bool>; no custom event documented in the pinned toggle-button CEM", "The callback is paired with Bluent's Toggled parameter; a CEM event or runtime-equivalent callback contract is not established."),
"OnClick": spec("Supported", "Native DOM click event bridged to EventCallback", "Click is a standard DOM event, not a custom event listed in the CEM; disabled/navigation callback ordering still needs runtime evidence.", "medium", follow_up="Verify pointer, keyboard activation, disabled and navigation ordering."),
"Shape": spec("Supported", "fluent-button.shape", "Bluent Rounded/Circular/Square values match the pinned WC shape values.", "high"),
"Appearance": spec("Supported", "fluent-button.appearance", "Default maps by omitting the attribute; Primary/Outline/Subtle/Transparent match the pinned values. Danger is an extra Bluent appearance.", "high", [{"value":"Default","disposition":"Supported","mapping":"omit appearance attribute"},{"value":"Primary","disposition":"Supported","mapping":"appearance=primary"},{"value":"Outline","disposition":"Supported","mapping":"appearance=outline"},{"value":"Subtle","disposition":"Supported","mapping":"appearance=subtle"},{"value":"Transparent","disposition":"Supported","mapping":"appearance=transparent"},{"value":"Danger","disposition":"Bluent extension","mapping":"no matching appearance value in the pinned WC CEM"}]),
"Size": spec("Supported", "fluent-button.size", "Small/Medium/Large match the pinned WC size values.", "high"),
"Href": spec("Supported", "fluent-anchor-button.href (related tag; not fluent-button)", "Bluent switches to an anchor when Href is non-empty; this is a related-tag mapping, not a single fluent-button API. Disabled-link semantics are separately audited.", "medium", follow_up="Verify href, disabled and keyboard behavior in the real browser."),
"Badge": spec("Bluent extension", "Positioned nested Badge; no dedicated button badge slot in the pinned CEM", "The button renders a positioned wrapper around a Badge; the WC button tags do not expose a badge slot or position API."),
"BadgeHorizontalPosition": spec("Bluent extension", "Bluent badge wrapper horizontal-position class", "No horizontal badge-position attribute exists on the pinned WC button tags."),
"BadgeVerticalPosition": spec("Bluent extension", "Bluent badge wrapper vertical-position class", "No vertical badge-position attribute exists on the pinned WC button tags."),
"Dropdown": spec("Bluent extension", "Popover/Surface composition; fluent-menu-button is related only", "The pinned menu-button CEM does not document a dedicated menu/dropdown slot; Bluent composes a Popover and Surface."),
"ShowDropdownIndicator": spec("Bluent extension", "Bluent-generated caret icons", "The indicator is drawn by Bluent Icon instances; no matching WC attribute is documented."),
"Compact": spec("Bluent extension", "Bluent compact CSS class", "No compact attribute exists on the pinned WC button tags."),
"DropdownPlacement": spec("Bluent extension", "Bluent Popover Placement", "Dropdown placement belongs to the Bluent Popover composition, not the button tag API."),
"ParentPopover": spec("Bluent extension", "Blazor CascadingParameter Popover context", "This is a Blazor composition contract, not a Fluent WC property."),
"Overflow": spec("Bluent extension", "Blazor CascadingParameter Overflow/Toolbar context", "This is a Blazor overflow composition contract, not a Fluent WC property."),
},
"Icon": {
"Value": spec("Bluent extension", "IconDefinition source abstraction; Fluent System Icons is asset-level reference only", "IconDefinition supports CSS-class, arbitrary SVG and image sources; the pinned WC package has no generic Icon tag and the React icon package is not a component-level counterpart.", "high"),
"Variant": spec("Supported", "Fluent System Icons Regular/Filled asset variants", "IconVariant exposes Regular/Filled and falls back to Regular when Filled is absent. No Color enum exists; exact Color asset coverage and requirement remain undecided.", "high", [{"value":"Regular","disposition":"Supported","mapping":"regular asset/source"},{"value":"Filled","disposition":"Supported","mapping":"filled asset/source, with Regular fallback when absent"},{"value":"Color","disposition":"N/A","mapping":"not part of the current public enum; no feature requirement approved"}]),
},
"Label": {
"Text": spec("Supported", "fluent-label default slot", "Text is rendered as label content; the pinned tag exposes a default slot.", "high"),
"ForExpression": spec("Bluent extension", "Native label-for association; no for attribute documented on fluent-label", "Bluent renders a native label with a derived for value. React v9 Label is a cross-platform reference for association only, not a 1:1 WC component mapping.", "high", follow_up="Verify associated-control behavior and id synchronization in the browser."),
"RequiredSymbol": spec("Bluent extension", "Custom required-symbol text; fluent-label has required boolean and asterisk CSS part", "The upstream component can show its required marker but does not expose a custom marker string."),
"Info": spec("Bluent extension", "Bluent Popover plus icon-only Button composition", "No information/tooltip slot is documented on fluent-label; accessible naming of the icon-only trigger is a separate open gap."),
"Size": spec("Supported", "fluent-label.size", "Small/Medium/Large match the pinned WC label size values.", "high"),
"Required": spec("Bluent extension", "fluent-label.required boolean for explicit states; Auto uses Blazor validation inference", "Required/NotRequired map to a boolean, but Auto inspects ForExpression validation metadata and has no direct WC equivalent.", "high", [{"value":"Required","disposition":"Supported","mapping":"required=true"},{"value":"NotRequired","disposition":"Supported","mapping":"required=false"},{"value":"Auto","disposition":"Bluent extension","mapping":"infer from ForExpression validation metadata"}]),
},
"Link": {
"Text": spec("Supported", "fluent-link default slot", "Text is rendered as link content; the pinned tag exposes a default slot.", "high"),
"Href": spec("Supported", "fluent-link.href", "The URL maps directly, but Bluent renders a button when Href is empty and renders an anchor without href when disabled; that composite behavior is not a fluent-link contract.", "high", follow_up="Verify disabled, keyboard focus and default navigation behavior."),
"Appearance": spec("Supported", "fluent-link.appearance", "Default maps by omitting the attribute; Subtle maps to the only documented appearance value.", "high", [{"value":"Default","disposition":"Supported","mapping":"omit appearance attribute"},{"value":"Subtle","disposition":"Supported","mapping":"appearance=subtle"}]),
"OnClick": spec("Supported", "Native DOM click event bridged to EventCallback", "The pinned CEM documents no custom event; click is a standard DOM event. It does not by itself establish prevent-default or disabled semantics.", "medium", follow_up="Verify pointer/keyboard activation and navigation/callback ordering."),
},
"Badge": {
"Appearance": spec("Supported", "fluent-badge.appearance", "Filled/Ghost/Tint map directly; Outlined requires normalization to upstream outline and is currently represented by a Bluent outlined CSS class.", "medium", [{"value":"Filled","disposition":"Supported","mapping":"appearance=filled"},{"value":"Ghost","disposition":"Supported","mapping":"appearance=ghost"},{"value":"Outlined","disposition":"Bluent extension","mapping":"translate to appearance=outline; current Bluent class spelling is outlined"},{"value":"Tint","disposition":"Supported","mapping":"appearance=tint"}]),
"Size": spec("Supported", "fluent-badge.size", "Tiny/ExtraSmall/Small/Medium/Large/ExtraLarge match the pinned WC size values.", "high"),
"Shape": spec("Supported", "fluent-badge.shape", "Square/Rounded/Circular match the pinned WC shape values.", "high"),
"Color": spec("Supported", "fluent-badge.color", "Color semantics align except the Bluent enum value Sever emits the class sever; the pinned WC value is severe.", "medium", [{"value":"Brand","disposition":"Supported","mapping":"color=brand"},{"value":"Danger","disposition":"Supported","mapping":"color=danger"},{"value":"Important","disposition":"Supported","mapping":"color=important"},{"value":"Informative","disposition":"Supported","mapping":"color=informative"},{"value":"Sever","disposition":"Missing","mapping":"upstream expects severe; source enum/class is sever"},{"value":"Subtle","disposition":"Supported","mapping":"color=subtle"},{"value":"Success","disposition":"Supported","mapping":"color=success"},{"value":"Warning","disposition":"Supported","mapping":"color=warning"}]),
"Icon": spec("Supported", "fluent-badge start slot", "The Bluent Icon is rendered before the text, which maps conceptually to the start slot; no end-position property is exposed.", "medium"),
"Text": spec("Supported", "fluent-badge default slot", "Text is rendered as badge content; the pinned tag exposes a default slot.", "high"),
"DropShadow": spec("Bluent extension", "Bluent drop-shadow CSS class", "The pinned fluent-badge CEM exposes no corresponding attribute, CSS part or custom property."),
"AnimateShadow": spec("Bluent extension", "Bluent animated-shadow CSS class", "The pinned fluent-badge CEM exposes no corresponding animation API; reduced-motion behavior is a separate confirmed gap."),
},
}

OUT_OF_BAND = [
    {"name":"Id", "scope":"BluentComponentBase public API; not counted among the 82 [Parameter] occurrences", "disposition":"Supported", "mapping":"HTML id via AdditionalAttributes; generated identifier when none is supplied", "rationale":"BluentComponentBase reads a caller id from AdditionalAttributes or creates one; TooltipService uses the resulting id."},
    {"name":"Disabled", "scope":"Attribute-based base behavior; not a typed [Parameter]", "disposition":"Bluent extension", "mapping":"AdditionalAttributes['disabled'] and IsDisabled", "rationale":"IsDisabled recognizes only a boolean true value. Link/Button disabled navigation semantics differ from fluent-link/fluent-button and need explicit runtime evidence."},
    {"name":"SetStateHasChanged", "scope":"IBluentComponent/Blazor base method; not a component property", "disposition":"N/A", "mapping":"Blazor lifecycle helper", "rationale":"Not a Fluent component feature."},
    {"name":"IconVariant.Color", "scope":"Potential future icon feature; not in current public enum", "disposition":"N/A", "requirementStatus":"not_decided", "mapping":"No Color enum in the current Bluent IconVariant; do not add one without exact asset-release coverage, license/shipping, theme/forced-colors and design review.", "rationale":"The pinned React icon package is an asset reference, not a generic Icon component; the local 20px font map has no Color entries."},
]


def build() -> tuple[dict, str]:
    source = json.loads(CANDIDATES.read_text(encoding="utf-8-sig"))
    crosswalk = json.loads(CROSSWALK.read_text(encoding="utf-8-sig"))
    tag_details = {x["tag"]: x for x in crosswalk["referencedTagDetails"]}
    source_families = [x for x in source["families"] if x["family"] in WAVE_A]
    if tuple(x["family"] for x in source_families) != WAVE_A:
        raise ValueError("Wave A family order or source coverage changed; review the builder.")
    ledger_families = []
    used_declared: set[tuple[str, str]] = set()
    for family in source_families:
        parameters = []
        for component in family["components"]:
            for parameter in component["parameters"]:
                name = parameter["name"]
                if parameter.get("origin") == "local_inherited":
                    review = COMMON.get(name)
                else:
                    review = D.get(family["family"], {}).get(name)
                    used_declared.add((family["family"], name))
                if review is None:
                    raise ValueError(f"Missing disposition: {family['family']}.{name}")
                if review["disposition"] not in ALLOWED:
                    raise ValueError(f"Invalid disposition: {family['family']}.{name}")
                parameters.append({
                    "component": component["name"],
                    "name": name,
                    "kind": parameter.get("kind"),
                    "csharpType": parameter.get("csharpType"),
                    "origin": parameter.get("origin"),
                    "sourceFile": parameter.get("sourceFile"),
                    "sourceLine": parameter.get("sourceLine"),
                    "spellingCandidates": parameter.get("spellingCandidates", []),
                    "sourceCandidateStatus": parameter.get("comparisonStatus"),
                    "sourceFeatureSupport": parameter.get("featureSupport"),
                    "reviewDisposition": review["disposition"],
                    "mapping": review["mapping"],
                    "rationale": review["rationale"],
                    "confidence": review.get("confidence", "medium"),
                    "valueDispositions": review.get("valueDispositions", []),
                    "followUp": review.get("followUp"),
                })
        contracts = []
        for tag in family.get("referencedTags", []):
            detail = tag_details.get(tag)
            if detail:
                contracts.append({"tag": tag, "attributes": detail.get("attributes", []), "events": detail.get("events", []), "slots": detail.get("slots", []), "cssParts": detail.get("cssParts", []), "cssProperties": detail.get("cssProperties", []), "cssStates": detail.get("cssStates", [])})
        counts = Counter(p["reviewDisposition"] for p in parameters)
        ledger_families.append({
            "family": family["family"], "productIssue": family["productIssue"], "componentNames": [c["name"] for c in family["components"]],
            "counterpartKind": family.get("counterpartKind"), "referencedTags": family.get("referencedTags", []),
            "upstreamContracts": contracts, "parameterCount": len(parameters), "reviewedParameterCount": len(parameters),
            "dispositionCounts": {x: counts.get(x, 0) for x in ALLOWED}, "apiReviewStatus": "audited_gaps",
            "designApproval": "pending", "evidenceBundle": None, "parameters": parameters,
        })
    expected_declared = {(f["family"], p["name"]) for f in source_families for c in f["components"] for p in c["parameters"] if p.get("origin") != "local_inherited"}
    if used_declared != expected_declared:
        raise ValueError(f"Disposition map mismatch; missing={expected_declared-used_declared}, extra={used_declared-expected_declared}")
    count = sum(f["parameterCount"] for f in ledger_families)
    if count != 82:
        raise ValueError(f"Expected 82 Wave A parameters, found {count}")
    ledger = {
        "schemaVersion": 1, "auditIssue": 552, "reviewedOn": "2026-10-22", "wave": "A",
        "referenceBaseline": {"webComponents": "@fluentui/web-components@3.1.3", "reactFallback": "@fluentui/react-components@9.74.10 (exact crosswalk snapshot; latest tag 9.74.11)", "iconAssets": "@fluentui/react-icons@2.0.344"},
        "sourceCandidatePath": "docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json",
        "upstreamCrosswalkPath": "docs/v3/quality/FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.json",
        "classificationValues": list(ALLOWED), "parameterOccurrenceCount": count,
        "note": "This is a separate manual-review ledger. The machine-generated source candidate file remains unchanged and still reports comparisonStatus=not_reviewed; Supported here means source/API mapping only, not visual, runtime, accessibility or parity acceptance.",
        "families": ledger_families, "outOfBandPublicApi": OUT_OF_BAND,
        "parityAccepted": False,
    }
    lines = [
        "# Wave A Fluent API review — Button, Icon, Label, Link and Badge", "",
        "Review date: 2026-10-22. Status: **API mapping reviewed with gaps; not parity-approved**.", "",
        "This ledger manually classifies the **82 source-known direct and locally inherited parameter occurrences** across Wave A. It is separate from the machine-generated candidate queue: that queue remains unchanged and unreviewed. `Supported` means a source/API mapping is identified; it does not imply DOM, visual, keyboard, Blazor render-mode, ARIA, native screen-reader or Fluent parity acceptance.", "",
        "## Frozen reference hierarchy", "",
        "- Primary WC API contract: `@fluentui/web-components@3.1.3`, extracted from the published `custom-elements.json` in [the pinned crosswalk](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md).",
        "- React v9 is used only for the Label `ForExpression` association semantics because the pinned WC Label CEM does not document a `for` attribute; it is a cross-platform reference, not a 1:1 component mapping. The exact crosswalk snapshot is `@fluentui/react-components@9.74.10`; the npm latest tag is 9.74.11 and is not silently substituted.",
        "- Icon uses `@fluentui/react-icons@2.0.344` as an asset catalogue only; there is no generic Icon custom-element counterpart. The current Bluent `IconVariant` remains Regular/Filled; Color is not claimed or approved.",
        "- Source candidates: [machine-generated WC API name candidates](FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md). This manual ledger does not edit that file's `comparisonStatus` or `featureSupport` fields.", "",
        "## Wave A summary", "",
        "| Family | Owner | Parameters reviewed | Supported | Missing | Bluent extension | N/A | API disposition |", "|---|---:|---:|---:|---:|---:|---:|---|"
    ]
    for family in ledger_families:
        c = family["dispositionCounts"]
        lines.append(f"| {family['family']} | #{family['productIssue']} | {family['parameterCount']} | {c['Supported']} | {c['Missing']} | {c['Bluent extension']} | {c['N/A']} | audited_gaps |")
    lines += ["", "## Pinned WC API surface", ""]
    for family in ledger_families:
        if not family["upstreamContracts"]:
            lines.append(f"- **{family['family']}**: no dedicated WC tag in 3.1.3; use the Fluent System Icons package as an asset reference only.")
            continue
        tags = []
        for contract in family["upstreamContracts"]:
            attrs = ", ".join(contract["attributes"]) or "none"
            slots = ", ".join(("default" if x == "" else x) for x in contract["slots"]) or "none"
            parts = ", ".join(contract["cssParts"]) or "none"
            events = ", ".join(contract["events"]) or "no custom events documented"
            tags.append(f"`{contract['tag']}` (attributes: {attrs}; slots: {slots}; CSS parts: {parts}; events: {events})")
        lines.append(f"- **{family['family']}**: " + "; ".join(tags) + ".")
    lines += ["", "## Common locally inherited parameters", "", "These eight parameters occur in each of the five family ledgers (40 occurrences total). They are not silently equated to WC component props.", "", "| Parameter | Disposition | Mapping and rationale |", "|---|---|---|"]
    for name in ("Tooltip", "TooltipContent", "TooltipPlacement", "TooltipAppearance", "DisplayTooltipArrow", "AdditionalAttributes", "Class", "Style"):
        item = COMMON[name]
        lines.append(f"| `{name}` | {item['disposition']} | {item['mapping']}. {item['rationale']} |")
    lines += ["", "## Per-family parameter ledger", ""]
    for family in ledger_families:
        lines += [f"### {family['family']} — #{family['productIssue']}", "", f"Pinned counterpart kind: `{family['counterpartKind']}`; referenced tags: " + (", ".join(f"`{t}`" for t in family["referencedTags"]) if family["referencedTags"] else "no dedicated WC tag") + ".", "", "| Parameter | Kind / source type | Disposition | Upstream mapping | Rationale / value-level gaps | Source |", "|---|---|---|---|---|---|"]
        for p in family["parameters"]:
            rationale = p["rationale"]
            if p["valueDispositions"]:
                gaps = [v for v in p["valueDispositions"] if v["disposition"] in ("Missing", "Bluent extension", "N/A")]
                if gaps:
                    rationale += " Value-level notes: " + "; ".join(f"{v['value']}: {v['disposition']} ({v['mapping']})" for v in gaps)
            source = p.get("sourceFile") or "source path not captured"
            line = p.get("sourceLine")
            source_label = f"{Path(source).name}:{line}" if line else Path(source).name
            source_link = f"[ {source_label} ](../../../{source}#L{line})" if line else source_label
            lines.append(f"| `{p['name']}` | {p.get('kind') or '—'} / `{p.get('csharpType') or '—'}` | {p['reviewDisposition']} | {p['mapping']} | {rationale} | {source_link} |")
        lines.append("")
    lines += [
        "## Out-of-band public/base findings", "",
        "| Item | Disposition | Finding |", "|---|---|---|"
    ]
    for item in OUT_OF_BAND:
        lines.append(f"| `{item['name']}` | {item['disposition']} | {item['mapping']}. {item['rationale']} |")
    lines += [
        "", "## Family-level feature disposition", "",
        "- **Button (#428): `audited_gaps`** — the base Button API combines normal, toggle, anchor, compound and menu-button behavior; multiple props are Bluent compositions/extensions, and `Danger` has no direct WC appearance value.",
        "- **Icon (#429): `audited_gaps`** — no WC Icon tag; the generic CSS/SVG/Image source API is a Bluent abstraction. Regular/Filled asset selection is mapped, but Color is not a current public variant and remains an unapproved requirement.",
        "- **Label (#430): `audited_gaps`** — `for` association, automatic required inference, custom required symbol and Info popover are Bluent-specific; only size and explicit required state map to the documented WC API.",
        "- **Link (#431): `audited_gaps`** — href/appearance map, but the component switches between anchor and button and its disabled-anchor behavior is not the fluent-link contract.",
        "- **Badge (#445): `audited_gaps`** — appearance/size/shape/color mostly map, but Outlined requires normalization, `Sever` does not match `severe`, and shadow animation is a Bluent extension with reduced-motion follow-up.",
        "", "## Acceptance boundary", "",
        "No product source, CSS, public API or component design was changed. The ledger does not change the source candidate file, does not approve parity, and does not replace runtime/browser/OS/AT tests. Wave A `feature` dimensions may be recorded as `audited_gaps`; all family `designApproval` values remain pending and `evidenceBundle` remains null. See the [canonical 18-family matrix](FLUENT-PARITY-RETRO-AUDIT.md) and the family reports for the independent visual/behavior/accessibility dimensions.", ""
    ]
    report = "\n".join(lines)
    return ledger, report


def main() -> int:
    parser = argparse.ArgumentParser(description="Build the reviewed Wave A Fluent API mapping ledger")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--write", action="store_true")
    group.add_argument("--check", action="store_true")
    args = parser.parse_args()
    ledger, report = build()
    outputs = ((LEDGER, json.dumps(ledger, indent=2, ensure_ascii=False) + "\n"), (REPORT, report))
    if args.write:
        for path, content in outputs:
            path.write_text(content, encoding="utf-8")
        print(f"Wrote Wave A API review for {ledger['parameterOccurrenceCount']} parameter occurrences.")
        return 0
    mismatches = [str(path.relative_to(ROOT)) for path, content in outputs if not path.is_file() or path.read_text(encoding="utf-8-sig") != content]
    if mismatches:
        print("Wave A API review is stale: " + ", ".join(mismatches), file=sys.stderr)
        return 1
    print(f"Wave A API review is current: {ledger['parameterOccurrenceCount']} parameters across {len(ledger['families'])} families.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
