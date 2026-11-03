#!/usr/bin/env python3
"""#552 narrow P0 source-level accessibility and coordinate gap checkpoint.

This intentionally observes CURRENT source omissions, not real-browser or
assistive-technology outcomes. When a product issue fixes a source gap, the
frozen snapshot MUST be reviewed/refreshed instead of treating a fix as failure.
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "src/Bluent.UI/Components"
OUTPUT = ROOT / "docs/v3/quality/FLUENT-PARITY-P0-SEMANTICS.json"

SOURCES = {
    "button_markup": "ButtonComponent/Button.razor",
    "button_code": "ButtonComponent/Button.razor.cs",
    "slider_markup": "SliderComponent/Slider.razor",
    "slider_code": "SliderComponent/Slider.razor.cs",
    "range_markup": "RangeSliderComponent/RangeSlider.razor",
    "range_code": "RangeSliderComponent/RangeSlider.razor.cs",
    "file_markup": "FileSelectComponent/FileSelect.razor",
    "file_code": "FileSelectComponent/FileSelect.razor.cs",
}


def source_texts():
    return {key: (BASE / path).read_text(encoding="utf-8-sig")
            for key, path in SOURCES.items()}


def collect(text):
    b, bc = text["button_markup"], text["button_code"]
    s, sc = text["slider_markup"], text["slider_code"]
    r, rc = text["range_markup"], text["range_code"]
    f, fc = text["file_markup"], text["file_code"]
    checks = [
        {
            "family": "Button", "issue": 428, "id": "toggle_aria_pressed",
            "observedSourceGap": (
                "public bool? Toggled" in bc and
                "ToggledChanged" in bc and
                "aria-pressed" not in b and "aria-pressed" not in bc
            ),
            "sourceDisposition": (
                "gap_open" if "aria-pressed" not in b and "aria-pressed" not in bc
                else "source_remediated_pending_browser_reverification"
            ),
            "finding": (
                "The current Button source emits aria-pressed=true/false when Toggled.HasValue on its native-button path and omits component-managed pressed state for active links. The prior browser/AX evidence predates this source update; current DOM, caller-attribute precedence and native AT still require re-verification."
                if "aria-pressed" in b else
                "Toggled public state is represented by a CSS class and callbacks, but the component does not itself emit aria-pressed. Caller-supplied AdditionalAttributes could still provide it."
            ),
            "requirement": "Toggle button needs an accessible pressed state if it functions as a toggle button.",
            "reference": "https://www.w3.org/WAI/ARIA/apg/patterns/button/",
        },
        {
            "family": "Slider", "issue": 442, "id": "slider_thumb_semantics",
            "observedSourceGap": (
                '<div class="thumb"></div>' in s and
                'role="slider"' not in s and
                'tabindex' not in s and
                'aria-valuenow' not in s and
                'type="range"' not in s
            ),
            "finding": "Current thumb is a div without intrinsic slider role, tabindex, or value ARIA. AdditionalAttributes on the OUTER host can add attributes, but does not make the thumb itself a documented operable slider.",
            "requirement": "An operable, labelled slider thumb must be keyboard focusable and expose current/range values.",
            "reference": "https://www.w3.org/WAI/ARIA/apg/patterns/slider/",
        },
        {
            "family": "RangeSlider", "issue": 443, "id": "two_thumb_semantics",
            "observedSourceGap": (
                '<div class="thumb min-thumb"></div>' in r and
                '<div class="thumb max-thumb"></div>' in r and
                'role="slider"' not in r and
                'tabindex' not in r and
                'aria-valuenow' not in r
            ),
            "finding": "Both thumb divs lack independent role, focusability, accessible names and value/range semantics; external host attributes cannot label both thumb nodes independently.",
            "requirement": "Two separately focusable, named slider thumbs with constant Tab order and dependent ARIA bounds.",
            "reference": "https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/",
        },
        {
            "family": "Slider", "issue": 442, "id": "pointer_coordinate_space",
            "observedSourceGap": (
                "args.ScreenX" in sc and
                "GetBoundingClientRectAsync" in sc and
                "screenX - start" in sc
            ),
            "finding": "ScreenX screen coordinates are subtracted from getBoundingClientRect() viewport coordinates; scroll/window position can introduce offset error.",
            "requirement": "Use a consistent coordinate space (e.g., ClientX with viewport rect), and verify with real pointer measurements.",
            "reference": "https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX",
        },
        {
            "family": "RangeSlider", "issue": 443, "id": "pointer_coordinate_space",
            "observedSourceGap": (
                "args.ScreenX" in rc and
                "GetBoundingClientRectAsync" in rc and
                "screenX - start" in rc
            ),
            "finding": "Same mixed coordinate space as Slider, compounded by dependent bounds and thumb selection.",
            "requirement": "Use a consistent coordinate space; test crossing, overlap, RTL, Server binding and viewport scroll.",
            "reference": "https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect",
        },
        {
            "family": "FileSelect", "issue": 444, "id": "remove_action_accessible_name",
            "observedSourceGap": (
                '<Button Icon="@FluentIcons.Delete"' in f and
                'aria-label' not in f and
                'Tooltip=' not in f
            ),
            "finding": "Source creates icon-only remove Button with no explicit accessible name. Needs per-file meaningful accessible naming; no native OS/AT confirmation claimed.",
            "requirement": "Icon-only delete buttons must have a programmatic accessible name.",
            "reference": "https://www.w3.org/WAI/ARIA/apg/patterns/button/",
        },
        {
            "family": "FileSelect", "issue": 444, "id": "maxfiles_vs_input_multiple",
            "observedSourceGap": (
                'multiple="@Multiple"' in f and
                'accept="@Accept"' in f and
                "MaxFiles" in fc
            ),
            "finding": "MaxFiles drives the chooser multiple attribute; accept is a browser chooser hint, not server-side validation. Runtime enforcement requires independent investigation.",
            "requirement": "Document public MaxFiles; validate count/type/size/authorization on server.",
            "reference": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept",
        },
    ]
    for check in checks:
        check.setdefault("sourceDisposition", "gap_open")
    return checks


def snapshot_from(source):
    evidence = collect(source)
    return {
        "schemaVersion": 1, "auditIssue": 552,
        "sourceBaseline": "6ef9c892a82825b1e4c209670433d7fa7a846787",
        "status": "source_observations_with_remediation_pending_reverification",
        "fluentAcceptance": False,
        "realBrowserATResult": "not_reverified_after_current_source_update",
        "historicalObservationCount": len(evidence),
        "remainingSourceGapCount": sum(1 for item in evidence if item["observedSourceGap"]),
        "sourceRemediatedPendingBrowserReverification": sum(1 for item in evidence if item["sourceDisposition"] != "gap_open"),
        "note": "Source observations are refreshed against the current pinned bluent-v3 source. A source-side remediation is not browser, Fluent visual, caller-attribute precedence, or native assistive-technology acceptance.",
        "checks": evidence,
    }


def validate(record, expected):
    failures = []
    if record != expected:
        failures.append("P0 source observations or evidence disclaimers changed; re-review before refreshing snapshot")
    for check in record.get("checks", []):
        disposition = check.get("sourceDisposition")
        if check.get("observedSourceGap") and disposition != "gap_open":
            failures.append(f"{check.get('family')}/{check.get('id')}: open gap has invalid disposition")
        if not check.get("observedSourceGap"):
            if not (check.get("family") == "Button" and check.get("id") == "toggle_aria_pressed"
                    and disposition == "source_remediated_pending_browser_reverification"):
                failures.append(f"{check.get('family')}/{check.get('id')}: unapproved observation removal")
    if record.get("historicalObservationCount") != len(record.get("checks", [])):
        failures.append("historical observation denominator changed")
    if record.get("remainingSourceGapCount") != sum(1 for x in record.get("checks", []) if x.get("observedSourceGap")):
        failures.append("remaining source gap count does not match the evidence rows")
    if record.get("sourceRemediatedPendingBrowserReverification") != 1:
        failures.append("exactly one source-remediated observation must remain pending browser re-verification")
    if record.get("fluentAcceptance") is not False:
        failures.append("Source observation cannot approve Fluent parity")
    return failures


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    expected = snapshot_from(source_texts())
    if args.write:
        findings = validate(expected, expected)
        if findings:
            raise SystemExit("ERROR: P0 source disposition requires review: " + "; ".join(findings))
        OUTPUT.write_text(json.dumps(expected, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("WROTE refreshed P0 source checkpoint: 6 open source gaps + 1 source remediation awaiting browser/AT re-verification; NOT component approval")
        return 0
    if not OUTPUT.exists():
        raise SystemExit(f"Snapshot missing: {OUTPUT}")
    actual = json.loads(OUTPUT.read_text(encoding="utf-8"))
    findings = validate(actual, expected)
    for finding in findings:
        print("FAIL:", finding)
    print(f"P0 source semantics {'FAIL' if findings else 'PASS'}: {len(expected['checks'])} source observations (not Fluent/AT acceptance)")
    return bool(findings)


if __name__ == "__main__":
    raise SystemExit(main())
