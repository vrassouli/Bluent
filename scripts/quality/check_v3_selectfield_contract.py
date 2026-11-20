#!/usr/bin/env python3
"""Fail-closed source, docs, CI and retained browser-evidence contract for SelectField #437."""
from __future__ import annotations

import json
from pathlib import Path
import re
import sys
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
BROWSERS = ("Chrome", "Edge")
MODES = ("WebAssembly", "Server")


def validate_source_contract(razor: str, code: str) -> list[str]:
    problems: list[str] = []
    required_razor = (
        '@attributes="GetInputAdditionalAttributes()"',
        'id="@GetInputId()"',
        'name="@NameAttributeValue"',
        '@bind="CurrentValueAsStringArray"',
        '@bind:event="@BindValueEvent"',
        '@bind-value="CurrentValueAsString"',
        '@bind-value:event="@BindValueEvent"',
        "multiple",
        "@ChildContent",
        "StartAddon",
        "EndAddon",
    )
    for token in required_razor:
        if token not in razor:
            problems.append(f"SelectField.razor is missing required native binding token: {token}")

    parameters = re.findall(
        r"\[Parameter(?:\s*\([^]]*\))?\]\s*public\s+[^;{]+?\s+(\w+)\s*\{\s*get;\s*set;\s*\}",
        code,
    )
    if parameters != ["ChildContent"]:
        problems.append(f"SelectField direct parameters must remain only ChildContent; found {parameters}")

    required_code = (
        "typeof(TValue).IsArray",
        "CurrentValueAsStringArray",
        "FormatValueAsStringForArray",
        "typeof(TValue) == typeof(bool[])",
        "typeof(TValue) == typeof(bool?[])",
        "bool.TryParse",
        "BindConverter.TryConvertTo<TValue>",
        "CultureInfo.CurrentCulture",
        "TryParseSelectableValueFromString",
        '? "true" : "false"',
        '"bui-select-field"',
    )
    for token in required_code:
        if token not in code:
            problems.append(f"SelectField.razor.cs is missing typed-field contract token: {token}")
    if "IJSRuntime" in code or "IJSObjectReference" in code:
        problems.append("SelectField must not introduce a JavaScript interaction dependency")
    return problems


def validate_demo_contract(demo: str, server_fixture: str, navigation: str) -> list[str]:
    problems: list[str] = []
    for token in (
        '@page "/components/select-fields"',
        'TValue="string"',
        'TValue="int"',
        'TValue="string[]"',
        'TValue="int[]"',
        'TValue="bool[]"',
        'TValue="bool?[]"',
        'TValue="decimal[]"',
        "CultureInfo.CurrentCulture",
        'id="select-nullable-flags"',
        'id="select-decimals-culture"',
        'BindValueEvent="oninput"',
        "<EditForm",
        "DataAnnotationsValidator",
        'dir="rtl"',
    ):
        if token not in demo:
            problems.append(f"SelectFields demo is missing required scenario: {token}")
    if '@page "/compatibility/select-fields-server"' not in server_fixture:
        problems.append("InteractiveServer fixture route is missing or incorrect")
    if "@rendermode InteractiveServer" not in server_fixture or "<SelectFields" not in server_fixture:
        problems.append("InteractiveServer fixture must render the shared SelectFields showcase")
    if 'Href="components/select-fields"' not in navigation:
        problems.append("SelectField route is missing from the demo side navigation")
    return problems


def validate_reference_contract(reference: str, design: str, migration: str, skill: str) -> list[str]:
    problems: list[str] = []
    for token in (
        "not a released",
        "ChildContent",
        "BindValueEvent",
        "string[]",
        "int[]",
        "bool[]",
        "bool?[]",
        "decimal[]",
        "de-DE",
        "fa-IR",
        "23/23",
        "138/138",
        "combobox",
        "listbox",
        "76/76",
        "DRAFT",
        "Windows Contrast Themes",
        "Narrator",
        "Fluent 2",
        "fluent-select",
        "native listbox",
    ):
        if token.lower() not in reference.lower():
            problems.append(f"Canonical SelectField reference is missing: {token}")
    for token in (
        "DRAFT",
        "native HTML select",
        "BindValueEvent",
        "bool[]",
        "b64f6665-c9ab-80b5-8008-c4ac99d9d000",
        "28143240-43dc-80cc-8008-f84a2fd6a22c",
        "Fluent 2 React",
        "native styling",
        "Dropdown",
        "Combobox",
        "fluent-select",
        "fluent-option",
        "fast-select",
        "first option",
        "native multiple",
    ):
        if token.lower() not in design.lower():
            problems.append(f"SelectField design/API record is missing: {token}")
    if "M25 — SelectField" not in migration:
        problems.append("Migration ledger M25 SelectField section is missing")
    for token in (
        "not merged or released",
        "bluent-v3",
        "76/76",
        "DRAFT",
        "check_v3_selectfield_contract.py",
        "Fluent React/Web Components crosswalk",
    ):
        if token.lower() not in skill.lower():
            problems.append(f"SelectField task Skill is missing: {token}")
    return problems


def validate_evidence_report(report: dict[str, Any], browser: str, mode: str) -> list[str]:
    problems: list[str] = []
    if report.get("component") != "SelectField" or report.get("issue") != 437:
        problems.append("Evidence report component/issue identity is not SelectField #437")
    if report.get("browser") != browser:
        problems.append(f"Evidence browser mismatch: expected {browser}, found {report.get('browser')}")
    expected_mode = "InteractiveServer" if mode == "Server" else "WebAssembly"
    if report.get("renderMode") != expected_mode:
        problems.append(f"Evidence render mode mismatch: expected {expected_mode}, found {report.get('renderMode')}")
    if report.get("culture") != "en-US":
        problems.append(f"Core browser evidence must use en-US; found {report.get('culture')!r}")
    checks = report.get("checks")
    if not isinstance(checks, list) or len(checks) != 23:
        problems.append(f"Evidence must contain exactly 23 assertions; found {len(checks) if isinstance(checks, list) else 'no list'}")
        checks = checks if isinstance(checks, list) else []
    failed = [item.get("name", "unnamed") for item in checks if not item.get("pass")]
    if failed:
        problems.append(f"Browser assertions failed: {failed}")
    summary = report.get("summary", {})
    if summary.get("passed") != 23 or summary.get("failed") != 0:
        problems.append(f"Browser summary must be 23 passed / 0 failed; found {summary}")
    signals = report.get("signals")
    if not isinstance(signals, list) or signals:
        problems.append(f"Unexpected browser runtime signals: {signals}")
    return problems


def validate_culture_evidence_report(report: dict[str, Any], culture: str) -> list[str]:
    problems: list[str] = []
    if report.get("component") != "SelectField" or report.get("issue") != 437:
        problems.append("culture evidence identity is not SelectField #437")
    if report.get("browser") != "Chrome" or report.get("renderMode") != "InteractiveServer":
        problems.append("culture evidence must be Chrome / InteractiveServer")
    if report.get("culture") != culture:
        problems.append(f"culture evidence must report {culture}; found {report.get('culture')!r}")
    checks = report.get("checks")
    if not isinstance(checks, list) or len(checks) != 23:
        problems.append(f"culture evidence must contain exactly 23 assertions; found {len(checks) if isinstance(checks, list) else 'no list'}")
        checks = checks if isinstance(checks, list) else []
    failed = [item.get("name", "unnamed") for item in checks if not item.get("pass")]
    if failed:
        problems.append(f"culture browser assertions failed: {failed}")
    summary = report.get("summary", {})
    if summary.get("passed") != 23 or summary.get("failed") != 0:
        problems.append(f"culture evidence summary must be 23 passed / 0 failed; found {summary}")
    if not isinstance(report.get("signals"), list) or report["signals"]:
        problems.append(f"culture browser runtime signals are unexpected: {report.get('signals')}")
    return problems


def validate_culture_evidence_files(root: Path = ROOT) -> list[str]:
    problems: list[str] = []
    evidence_dir = root / "docs/v3/quality/evidence"
    for culture in ("de-DE", "fa-IR"):
        stem = f"BLUENT-SELECTFIELD-Chrome-Server-{culture}"
        report_path = evidence_dir / f"{stem}.json"
        if not report_path.is_file():
            problems.append(f"Missing culture browser evidence JSON: {report_path.relative_to(root)}")
            continue
        try:
            report = json.loads(report_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            problems.append(f"Invalid culture evidence JSON {report_path.name}: {error}")
            continue
        problems.extend(f"{report_path.name}: {problem}" for problem in validate_culture_evidence_report(report, culture))
        for suffix in ("initial", "final", "narrow-320px"):
            image_path = evidence_dir / f"{stem}-{suffix}.png"
            if not image_path.is_file() or image_path.stat().st_size < 1024:
                problems.append(f"Missing or implausibly small culture screenshot evidence: {image_path.name}")
    return problems


def validate_evidence_files(root: Path = ROOT) -> list[str]:
    problems: list[str] = []
    evidence_dir = root / "docs/v3/quality/evidence"
    for browser in BROWSERS:
        for mode in MODES:
            stem = f"BLUENT-SELECTFIELD-{browser}-{mode}"
            report_path = evidence_dir / f"{stem}.json"
            if not report_path.is_file():
                problems.append(f"Missing browser evidence JSON: {report_path.relative_to(root)}")
                continue
            try:
                report = json.loads(report_path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError) as error:
                problems.append(f"Invalid evidence JSON {report_path.name}: {error}")
                continue
            problems.extend(
                f"{report_path.name}: {problem}"
                for problem in validate_evidence_report(report, browser, mode)
            )
            for suffix in ("initial", "final", "narrow-320px"):
                image_path = evidence_dir / f"{stem}-{suffix}.png"
                if not image_path.is_file() or image_path.stat().st_size < 1024:
                    problems.append(f"Missing or implausibly small screenshot evidence: {image_path.name}")
    return problems



def validate_native_windows_focus_evidence(root: Path = ROOT) -> list[str]:
    problems: list[str] = []
    evidence_dir = root / "docs/v3/quality/evidence"
    report_path = evidence_dir / "BLUENT-SELECTFIELD-WINDOWS-HIGH-CONTRAST.json"
    screenshot_name = "BLUENT-SELECTFIELD-WINDOWS-HIGH-CONTRAST-FOCUS-EDGE.png"
    screenshot_path = evidence_dir / screenshot_name

    if not report_path.is_file():
        return [f"Missing native Windows High Contrast evidence JSON: {report_path.relative_to(root)}"]

    try:
        report = json.loads(report_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        return [f"Invalid native Windows High Contrast evidence JSON: {error}"]

    follow_up = report.get("highContrastKeyboardFocusFollowUp")
    if not isinstance(follow_up, dict):
        return ["Native Windows evidence is missing highContrastKeyboardFocusFollowUp"]

    if follow_up.get("environment", {}).get("highContrastFlagsDuringTest") != 127:
        problems.append("Native Windows focus evidence must record High Contrast enabled (flags 127)")

    target = follow_up.get("windowsUiAutomation", {}).get("target", {})
    if target.get("automationId") != "select-department" or target.get("role") != "combobox":
        problems.append("Native Windows focus evidence must target the Department combobox")
    if target.get("focused") is not True:
        problems.append("Native Windows UI Automation must prove Department focused=true after Tab")

    visual = follow_up.get("visualEvidence", {})
    if visual.get("screenshot") != screenshot_name:
        problems.append(f"Native Windows focus evidence must reference {screenshot_name}")

    if not screenshot_path.is_file():
        problems.append(f"Missing native Windows High Contrast focus screenshot: {screenshot_name}")
    else:
        try:
            png_header = screenshot_path.read_bytes()[:8]
            if png_header != b"\x89PNG\r\n\x1a\n" or screenshot_path.stat().st_size < 1024:
                problems.append(f"Native Windows focus screenshot is not a valid, substantive PNG: {screenshot_name}")
        except OSError as error:
            problems.append(f"Could not read native Windows focus screenshot {screenshot_name}: {error}")

    cleanup = follow_up.get("cleanup", {})
    if cleanup.get("restoreSucceeded") is not True:
        problems.append("Native Windows focus test must confirm successful OS setting restoration")
    if cleanup.get("originalFlags") != 126:
        problems.append("Native Windows focus test must retain the original High Contrast flags (126)")
    restored = cleanup.get("verifiedAfterTest", {})
    if restored.get("enabled") is not False or restored.get("flags") != 126:
        problems.append("Native Windows focus test must verify High Contrast was disabled and restored to flags 126")

    return problems


def validate_nvda_spoken_evidence(root: Path = ROOT) -> list[str]:
    evidence_path = root / "docs/v3/quality/evidence/BLUENT-SELECTFIELD-NVDA-EDGE-SERVER.json"
    if not evidence_path.is_file():
        return [f"Missing NVDA spoken evidence JSON: {evidence_path.relative_to(root)}"]

    try:
        evidence = json.loads(evidence_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        return [f"Invalid NVDA spoken evidence JSON: {error}"]

    problems: list[str] = []
    environment = evidence.get("environment", {})
    if environment.get("operatingSystem") != "Windows 11 Pro" or environment.get("hosting") != "Published Release output (Production)":
        problems.append("NVDA spoken evidence must identify the tested Windows 11 published Release host")
    if environment.get("screenReader") != "NVDA" or environment.get("screenReaderVersion") != "2026.3.0.58174":
        problems.append("NVDA spoken evidence must identify the tested NVDA version (2026.3.0.58174)")
    if environment.get("browser") != "Microsoft Edge" or environment.get("renderMode") != "InteractiveServer":
        problems.append("NVDA spoken evidence must identify the tested Edge/InteractiveServer environment")
    if "Speech Viewer" not in environment.get("captureMethod", ""):
        problems.append("NVDA spoken evidence must identify Speech Viewer as the transcript capture method")

    result = evidence.get("result", {})
    if result.get("status") != "partial-pass":
        problems.append("NVDA spoken evidence must retain its partial-pass scope")
    cases = result.get("cases", [])
    if not isinstance(cases, list):
        cases = []
    by_id = {case.get("id"): case for case in cases if isinstance(case, dict)}

    department = by_id.get("single-select-accessible-name-and-help", {})
    if (
        department.get("automationId") != "select-department"
        or department.get("windowsUiAutomationRole") != "combobox"
        or department.get("focused") is not True
        or "Department combo box Choose a department" not in department.get("speechViewerOutput", "")
    ):
        problems.append("NVDA evidence must retain the spoken Department name, combobox role and help text")

    teams = by_id.get("multiple-select-accessible-name-and-help", {})
    if (
        teams.get("automationId") != "select-teams"
        or teams.get("ariaSemantics") != "native listbox"
        or teams.get("focused") is not True
        or "Teams list Native listbox" not in teams.get("speechViewerOutput", "")
        or "use the platform's modifier keys" not in teams.get("speechViewerOutput", "")
    ):
        problems.append("NVDA evidence must retain the spoken Teams native-listbox name and help text")

    selection = by_id.get("multiple-selected-option-position", {})
    if (
        selection.get("automationId") != "select-teams"
        or selection.get("selectedValues") != ["Engineering", "Product"]
        or "Engineering 1 of 5" not in selection.get("speechViewerOutput", "")
        or "Product 3 of 5" not in selection.get("speechViewerOutput", "")
    ):
        problems.append("NVDA evidence must retain both selected values and their announced positions")

    limitations = result.get("limitations", [])
    if not isinstance(limitations, list) or not any("HTTP 400" in item and "validation" in item.lower() for item in limitations):
        problems.append("NVDA evidence must explicitly retain the unverified validation-announcement limitation")
    if not any("VoiceOver" in item and "Narrator" in item for item in limitations):
        problems.append("NVDA evidence must retain the untested Narrator/VoiceOver scope")

    return problems


def validate_ci_contract(browser_workflow: str, docs_workflow: str) -> list[str]:
    problems: list[str] = []
    if "  selectfield-contract:" not in browser_workflow:
        problems.append("Real compatibility workflow is missing selectfield-contract job")
    marker = "  selectfield-runtime:"
    if marker not in browser_workflow:
        problems.append("Real compatibility workflow is missing selectfield-runtime job")
    else:
        section = browser_workflow.split(marker, 1)[1]
        for token in (
            "needs: selectfield-contract",
            "browser: [Chrome, Edge]",
            "render_mode: [WebAssembly, Server]",
            "run_v3_selectfield.ps1",
            "probe_v3_selectfield.mjs",
            "selectfield-evidence",
            "actions/upload-artifact@v4",
        ):
            if token not in section:
                problems.append(f"selectfield-runtime CI job is missing: {token}")
    culture_marker = "  selectfield-culture-runtime:"
    if culture_marker not in browser_workflow:
        problems.append("Real compatibility workflow is missing selectfield-culture-runtime job")
    else:
        culture_section = browser_workflow.split(culture_marker, 1)[1]
        for token in ("matrix:", "culture: [de-DE, fa-IR]", "-Culture", "Server", "selectfield-culture-evidence", "actions/upload-artifact@v4"):
            if token not in culture_section:
                problems.append(f"selectfield-culture-runtime CI job is missing: {token}")
    for token in (
        "scripts/quality/check_v3_selectfield_contract.py",
        "test_v3_selectfield_contract.py",
    ):
        if token not in browser_workflow:
            problems.append(f"Browser workflow contract gate is missing: {token}")
        if token not in docs_workflow:
            problems.append(f"Documentation workflow contract gate is missing: {token}")
    return problems


def validate_repository(root: Path = ROOT) -> list[str]:
    read = lambda path: (root / path).read_text(encoding="utf-8")
    required_files = (
        "src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor",
        "src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor.cs",
        "src/Bluent.UI.Demo.Pages/Pages/Components/SelectFields.razor",
        "src/Bluent.UI.Demo.SSR/Components/Pages/SelectFieldInteractiveServerProbe.razor",
        "src/Bluent.UI.Demo.Pages/Layout/Side.razor",
        "docs/v3/components/select-field.md",
        "docs/v3/design/SELECTFIELD-DESIGN-AND-API-CONTRACT.md",
        "docs/v3/design/MIGRATION-IMPACT-LEDGER.md",
        ".agents/skills/bluent-v3-selectfield/SKILL.md",
        ".github/workflows/v3-compatibility-browsers.yml",
        ".github/workflows/v3-docs-contract.yml",
    )
    missing = [path for path in required_files if not (root / path).is_file()]
    if missing:
        return [f"Missing required SelectField #437 file: {path}" for path in missing]

    problems: list[str] = []
    problems += validate_source_contract(
        read("src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor"),
        read("src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor.cs"),
    )
    problems += validate_demo_contract(
        read("src/Bluent.UI.Demo.Pages/Pages/Components/SelectFields.razor"),
        read("src/Bluent.UI.Demo.SSR/Components/Pages/SelectFieldInteractiveServerProbe.razor"),
        read("src/Bluent.UI.Demo.Pages/Layout/Side.razor"),
    )
    problems += validate_reference_contract(
        read("docs/v3/components/select-field.md"),
        read("docs/v3/design/SELECTFIELD-DESIGN-AND-API-CONTRACT.md"),
        read("docs/v3/design/MIGRATION-IMPACT-LEDGER.md"),
        read(".agents/skills/bluent-v3-selectfield/SKILL.md"),
    )
    problems += validate_ci_contract(
        read(".github/workflows/v3-compatibility-browsers.yml"),
        read(".github/workflows/v3-docs-contract.yml"),
    )
    problems += validate_evidence_files(root)
    problems += validate_culture_evidence_files(root)
    problems += validate_native_windows_focus_evidence(root)
    problems += validate_nvda_spoken_evidence(root)
    return problems


if __name__ == "__main__":
    failures = validate_repository()
    for failure in failures:
        print(f"FAIL: {failure}", file=sys.stderr)
    print(f"SelectField #437 contract: {'PASS' if not failures else 'FAIL'} ({len(failures)} findings)")
    raise SystemExit(1 if failures else 0)
