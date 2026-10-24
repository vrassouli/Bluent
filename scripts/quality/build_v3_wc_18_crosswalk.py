#!/usr/bin/env python3
"""#552 research-only pinned Fluent WC 3.1.3 CEM crosswalk for 18 Bluent families."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CENSUS = ROOT / "docs/v3/quality/FLUENT-PARITY-18-SOURCE-API.json"
P0 = ROOT / "docs/v3/quality/FLUENT-WC-3.1.3-P0-MANIFEST.json"
OUT = ROOT / "docs/v3/quality/FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.json"
REPORT = ROOT / "docs/v3/quality/FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md"

# Classification describes presence of a named WC CUSTOM ELEMENT, never feature parity.
FAMILY_MAPPING = {
    "Button": ("tag_present", ("fluent-button", "fluent-toggle-button", "fluent-compound-button", "fluent-menu-button", "fluent-anchor-button"), "Separate WC button families; Bluent split/dropdown/toggle API not assumed equal."),
    "Icon": ("no_dedicated_tag", (), "Fluent System Icons are outside this Web Component tag catalog; do not infer absence of icon assets."),
    "Label": ("tag_present", ("fluent-label",), "Compare native labeling/for and inherited Bluent field integration."),
    "Link": ("tag_present", ("fluent-link", "fluent-anchor-button"), "An anchor-styled button and link are distinct semantics."),
    "Badge": ("tag_present", ("fluent-badge", "fluent-counter-badge"), "Numeric/counter semantics differ from decorative/status badges."),
    "TextField": ("tag_present", ("fluent-text-input",), "Underline appearance and focus behavior require rendered comparison."),
    "NumericField": ("related_only", ("fluent-text-input",), "No dedicated fluent-number-field tag; text-input is only a related control."),
    "Checkbox": ("tag_present", ("fluent-checkbox",), "Indeterminate and validation/binding details remain unreviewed."),
    "Switch": ("tag_present", ("fluent-switch",), "Bluent Switch inherits Checkbox<bool>; check inherited API, not zero declared props."),
    "RadioGroup": ("tag_present", ("fluent-radio-group", "fluent-radio"), "Group and child radio are separate custom elements."),
    "SelectField": ("related_only", ("fluent-dropdown", "fluent-dropdown-option", "fluent-listbox"), "No fluent-select-field tag; dropdown/listbox are category counterparts, not a 1:1 API."),
    "DateField": ("related_only", ("fluent-text-input",), "No dedicated fluent-date-field/date-picker tag in this pinned WC catalog."),
    "TimeField": ("related_only", ("fluent-text-input",), "No dedicated fluent-time-field/time-picker tag in this pinned WC catalog."),
    "MaskedField": ("related_only", ("fluent-text-input",), "Mask/parser semantics are a Bluent extension pending React fallback review."),
    "OtpField": ("related_only", ("fluent-text-input",), "OTP multi-cell interaction is not equivalent to one text input."),
    "Slider": ("tag_present", ("fluent-slider",), "Value, step, ARIA, orientation and pointer semantics need separate live review."),
    "RangeSlider": ("no_dedicated_tag", (), "No fluent-range-slider custom element in pinned WC 3.1.3; W3C multi-thumb guidance applies."),
    "FileSelect": ("no_dedicated_tag", (), "No fluent-file-select custom element in pinned WC 3.1.3; native InputFile behavior remains Bluent-owned."),
}
WAVES = {
    "A": ("Button", "Icon", "Label", "Link", "Badge"),
    "B": ("TextField", "NumericField", "Checkbox", "Switch", "RadioGroup", "SelectField"),
    "C": ("DateField", "TimeField", "MaskedField", "OtpField"),
    "D": ("Slider", "RangeSlider", "FileSelect"),
}

def as_lists(d):
    # Preserve compact name lists for the candidate queue and pin typed/documented metadata.
    def details(key, fields):
        result = []
        for item in d.get(key, []):
            value = {field: item[field] for field in fields if field in item}
            if value.get("name") is not None:
                result.append(value)
        return sorted(result, key=lambda item: item["name"])
    return {
        "tag": d["tagName"],
        "description": d.get("description", ""),
        "modulePath": d.get("modulePath", ""),
        "superclass": d.get("superclass", {}),
        "attributes": sorted({v["name"] for v in d.get("attributes", []) if "name" in v}),
        "attributeDetails": details("attributes", ("name", "fieldName", "type", "parsedType", "description", "inheritedFrom")),
        "events": sorted({v["name"] for v in d.get("events", []) if "name" in v}),
        "eventDetails": details("events", ("name", "type", "description", "inheritedFrom")),
        "slots": sorted({v["name"] for v in d.get("slots", []) if "name" in v}),
        "slotDetails": details("slots", ("name", "description", "inheritedFrom")),
        "cssParts": sorted({v["name"] for v in d.get("cssParts", []) if "name" in v}),
        "cssPartDetails": details("cssParts", ("name", "description", "inheritedFrom")),
        "cssProperties": details("cssProperties", ("name", "syntax", "inherits", "initialValue", "description")),
        "cssStates": details("cssStates", ("name", "description")),
    }

def build(raw, census, pinned):
    cem = json.loads(raw)
    elements = [d for module in cem["modules"] for d in module.get("declarations", []) if d.get("tagName")]
    tags = {d["tagName"]: d for d in elements}
    if len(tags) != 42 or len(elements) != len(tags):
        raise ValueError("Expected 42 unique published tags from pinned WC 3.1.3")
    if len(census["families"]) != 18 or set(FAMILY_MAPPING) != {f["family"] for f in census["families"]}:
        raise ValueError("Mismatch with the 18-family Bluent source census")
    if pinned["version"] != "3.1.3" or pinned["actualTagCount"] != len(tags):
        raise ValueError("Pinned WC manifest mismatch")
    rows = []
    for source in census["families"]:
        name = source["family"]
        category, refs, note = FAMILY_MAPPING[name]
        for ref in refs:
            if ref not in tags:
                raise ValueError("Mapped tag is absent from pinned CEM: " + ref)
        wave = next(w for w, families in WAVES.items() if name in families)
        rows.append({
            "family": name,
            "productIssue": source["productIssue"],
            "wave": wave,
            "componentCount": source["componentCount"],
            "directParameterCount": sum(c["declaredParameterCount"] for c in source["components"]),
            "counterpartKind": category,
            "referencedTags": list(refs),
            "mappingCaveat": note,
            "apiEquivalence": "not_reviewed",
            "designApproval": "pending",
            "runtimeBehaviorAcceptance": "not_reviewed",
            "nativeOSAT": "not_tested",
            "fluentParity": "not_reviewed",
        })
    details = [as_lists(tags[tag]) for tag in sorted({ref for row in rows for ref in row["referencedTags"]})]
    return {
        "schemaVersion": 1,
        "auditIssue": 552,
        "labIssue": 421,
        "npmPackage": pinned["package"],
        "npmVersion": pinned["version"],
        "npmTarballIntegrity": pinned["integrity"],
        "cemSha256": hashlib.sha256(raw).hexdigest(),
        "cemTagCount": len(tags),
        "cemPublishedTags": sorted(tags),
        "scope": "tag-catalog and declared CEM metadata only; no Bluent-Fluent API equivalence, product acceptance or design signoff",
        "families": rows,
        "referencedTagDetails": details,
        "publishedElementDetails": [as_lists(tags[tag]) for tag in sorted(tags)],
        "publishedElementDetailsSha256": hashlib.sha256(json.dumps([as_lists(tags[tag]) for tag in sorted(tags)], ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest(),
        "metadataScope": "Published CEM descriptions, attributes/types/parsedTypes, events, slots, CSS parts/properties/states and superclass/module metadata; package-authored metadata is not independent runtime verification.",
        "parityAccepted": False,
    }

def markdown(data):
    lines = [
        "# #552 — Fluent WC 3.1.3 catalog crosswalk for all 18 historical pilots",
        "",
        "**Research/Phase 0 reference freeze only — not a Fluent 2 parity decision.** The catalog was extracted from the published npm "
        + "`@fluentui/web-components@3.1.3` tarball, `package/custom-elements.json`, with npm integrity "
        + "`" + data["npmTarballIntegrity"] + "` and content SHA-256 `" + data["cemSha256"] + "`.",
        "",
        "The frozen CEM contains **42 unique custom-element tags**. The JSON preserves typed/documented attributes, parsed types, "
        + "events, slots, CSS parts/properties/states, descriptions, superclass and module paths for all 42 tags. A tag with a similar name is **not proof of API, appearance, "
        + "keyboard, ARIA, lifecycle or behavior equivalence**. This crosswalk supplements #421's canonical retrospective matrix, "
        + "which still records **18/18 unaccepted**; all per-component design frames and native OS/AT tests remain pending.",
        "",
        "| Bluent family | Owner | Wave | WC 3.1.3 relationship | Published tags checked |",
        "| --- | --- | --- | --- | --- |",
    ]
    for row in data["families"]:
        tags = ", ".join("`" + t + "`" for t in row["referencedTags"]) or "No dedicated tag"
        lines.append(f'| {row["family"]} | #{row["productIssue"]} | {row["wave"]} | {row["counterpartKind"]} | {tags} |')
    lines.extend([
        "",
        "## Strict interpretation",
        "",
        "- **tag_present** means the named custom element is exported in this pinned release, nothing more.",
        "- **related_only** means an alternative category component is exported, but no dedicated same-family WC tag is claimed.",
        "- **no_dedicated_tag** means this **specific package release** has no dedicated custom element; it does not claim absence from Fluent React, Fluent System Icons, W3C patterns, or other versions.",
        "- The JSON pins published attribute, event, slot and CSS-part **names** for all referenced tags and the complete 42-tag name catalog. A full Bluent-to-Fluent property/event/visual mapping has **not** been approved.",
        "- Icon reference needs separate Fluent System Icons package/version/Regular-Filled-Color assessment; RangeSlider uses the [W3C multi-thumb guidance](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/) as an external accessibility reference, not as a Fluent tag.",
        "",
        "## Reproduction and guard",
        "",
        "With the verified npm 3.1.3 tarball, extract `package/custom-elements.json` to a **disposable** path, then invoke:",
        "",
        "```sh",
        "python scripts/quality/build_v3_wc_18_crosswalk.py --cem PATH_TO_custom-elements.json --write",
        "python scripts/quality/build_v3_wc_18_crosswalk.py --check",
        "```",
        "",
        "The raw third-party CEM is not committed; only compact source metadata is preserved. Do not silently upgrade the pinned npm version or infer parity from matching names. No Bluent product code, design state, stable `Dev`, or owner issue status was changed.",
        "",
    ])
    return "\n".join(lines)

def validate(current, census, pinned):
    if current.get("parityAccepted") is not False or current.get("scope", "").find("no Bluent-Fluent API equivalence") < 0:
        raise ValueError("False or ambiguous parity approval")
    if current.get("npmVersion") != "3.1.3" or current.get("npmTarballIntegrity") != pinned["integrity"]:
        raise ValueError("Pinned upstream integrity drift")
    if len(current.get("cemPublishedTags", [])) != 42 or len(set(current["cemPublishedTags"])) != 42:
        raise ValueError("Catalog count/uniqueness drift")
    if len(current.get("families", [])) != 18 or {r["family"] for r in current["families"]} != set(FAMILY_MAPPING):
        raise ValueError("18-family list drift")
    details = {d["tag"]: d for d in current.get("referencedTagDetails", [])}
    all_details = {d["tag"]: d for d in current.get("publishedElementDetails", [])}
    if set(all_details) != set(current["cemPublishedTags"]) or len(all_details) != 42:
        raise ValueError("Full published element metadata drift")
    digest = hashlib.sha256(json.dumps(current["publishedElementDetails"], ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest()
    if digest != current.get("publishedElementDetailsSha256"):
        raise ValueError("Published element metadata digest drift")
    for row in current["families"]:
        family = row["family"]
        source = next(f for f in census["families"] if f["family"] == family)
        kind, refs, _ = FAMILY_MAPPING[family]
        if row["productIssue"] != source["productIssue"] or row["counterpartKind"] != kind or row["referencedTags"] != list(refs):
            raise ValueError("Owner or tag mapping drift for " + family)
        if row["directParameterCount"] != sum(c["declaredParameterCount"] for c in source["components"]):
            raise ValueError("Source Parameter census drift for " + family)
        if row["fluentParity"] != "not_reviewed" or row["designApproval"] != "pending" or row["nativeOSAT"] != "not_tested":
            raise ValueError("Unauthorized acceptance for " + family)
        for ref in refs:
            if ref not in details or ref not in current["cemPublishedTags"]:
                raise ValueError("Referenced tag not in pinned catalogue " + ref)
        if any(ref not in current["cemPublishedTags"] for ref in refs):
            raise ValueError("Counterpart outside 42 published tags")

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--cem",type=Path)
    options=ap.add_mutually_exclusive_group(required=True)
    options.add_argument("--write",action="store_true")
    options.add_argument("--check",action="store_true")
    args=ap.parse_args()
    census=json.loads(CENSUS.read_text(encoding="utf-8-sig"))
    pinned=json.loads(P0.read_text(encoding="utf-8-sig"))
    if args.write:
        if not args.cem: ap.error("--write requires --cem")
        result=build(args.cem.read_bytes(),census,pinned)
        OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        REPORT.write_text(markdown(result),encoding="utf-8")
        print(f"Wrote {len(result['families'])} families; {result['cemTagCount']} WC tags; {len(result['referencedTagDetails'])} reference details")
    else:
        current=json.loads(OUT.read_text(encoding="utf-8-sig"))
        validate(current,census,pinned)
        if REPORT.read_text(encoding="utf-8-sig")!=markdown(current):
            raise ValueError("Markdown report drift")
        if args.cem and build(args.cem.read_bytes(),census,pinned)!=current:
            raise ValueError("Original custom-elements.json content drift")
        print(f"PASS {len(current['families'])} families, {current['cemTagCount']} published WC tags")

if __name__=="__main__":
    main()
