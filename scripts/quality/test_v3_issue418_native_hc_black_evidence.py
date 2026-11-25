from __future__ import annotations

import hashlib
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = ROOT / "docs" / "v3" / "quality" / "evidence"
BASE = "BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-UIA-2026-11-25-HC-BLACK"
JSON_PATH = EVIDENCE_DIR / f"{BASE}.json"
MARKDOWN_PATH = EVIDENCE_DIR / f"{BASE}.md"


class Issue418NativeHighContrastBlackEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        with JSON_PATH.open("r", encoding="utf-8-sig") as stream:
            cls.report = json.load(stream)

    def test_report_is_complete_and_limited_to_native_prototype_evidence(self) -> None:
        self.assertTrue(self.report["completed"])
        self.assertEqual(self.report["issue"], 418)
        self.assertEqual(
            self.report["status"],
            "limited-native-windows-ui-automation-prototype-evidence-only",
        )
        self.assertEqual(self.report["environment"]["nativeHighContrastScheme"], "High Contrast Black")

    def test_native_black_scheme_and_original_state_are_restored_exactly(self) -> None:
        hc = self.report["nativeHighContrast"]
        self.assertEqual(hc["targetScheme"], "High Contrast Black")
        original = hc["originalState"]
        active = hc["testState"]
        restored = hc["restoredState"]
        self.assertTrue(original["success"])
        self.assertEqual(original["scheme"], "High Contrast Black")
        self.assertTrue(original["enabled"])
        self.assertEqual(active["scheme"], "High Contrast Black")
        self.assertTrue(active["enabled"])
        self.assertEqual(active["flags"], original["flags"] | 1)
        self.assertEqual(restored["flags"], original["flags"])
        self.assertEqual(restored["scheme"], original["scheme"])
        self.assertEqual(restored["enabled"], original["enabled"])
        self.assertTrue(hc["exactlyMatchesOriginal"])

    def test_native_environment_reports_real_forced_colors(self) -> None:
        env = self.report["environment"]
        self.assertEqual(env["os"]["Caption"], "Microsoft Windows 11 Pro")
        self.assertEqual(env["os"]["BuildNumber"], "28000")
        self.assertEqual(env["browser"], "Microsoft Edge")
        self.assertIn("Edg/158.0.0.0", env["edgeUserAgent"])
        self.assertTrue(env["forcedColorsActive"])
        self.assertTrue(env["prefersContrastMore"])
        self.assertEqual(env["renderMode"], "Published InteractiveServer")
        self.assertEqual(env["fixtureRoute"], "/v3/interactive-portal-lab")

    def test_dialog_system_colors_and_accessible_structure_are_captured(self) -> None:
        dialog = self.report["dialog"]["domOnOpen"]
        self.assertEqual(dialog["role"], "dialog")
        self.assertEqual(dialog["ariaModal"], "true")
        self.assertEqual(dialog["ariaLabelledBy"], "f4b8710ce_title")
        self.assertEqual(dialog["background"], "rgb(32, 32, 32)")
        self.assertEqual(dialog["color"], "rgb(255, 255, 255)")
        self.assertEqual(dialog["outline"], "rgb(142, 227, 240)")
        self.assertEqual(dialog["forcedColorAdjust"], "auto")

    def test_windows_uia_exposes_dialog_heading_and_close_button(self) -> None:
        snapshots = [
            self.report["dialog"]["afterTab"],
            self.report["dialog"]["afterShiftTab"],
        ]
        relevant = [node for snapshot in snapshots for node in snapshot["relevant"]]
        self.assertTrue(any(n["name"] == "v3 keyboard modal" and n["controlType"] == "ControlType.Window" for n in relevant))
        self.assertTrue(any(n["automationId"] == "f4b8710ce_title" and n["controlType"] == "ControlType.Text" for n in relevant))
        self.assertTrue(any(n["name"] == "Close modal" and n["controlType"] == "ControlType.Button" and "Invoke" in n["patterns"] for n in relevant))
        self.assertIn("Close modal", [n["name"] for n in relevant])
        self.assertIn("Last focusable", [n["name"] for n in relevant])

    def test_synthetic_keyboard_path_and_escape_focus_return_are_recorded(self) -> None:
        method = self.report["interactionMethod"]
        self.assertTrue(method["keyboardEventsAreSynthetic"])
        self.assertFalse(method["physicalKeyboardUsed"])
        self.assertFalse(method["narratorStarted"])
        self.assertFalse(method["assistiveTechnologySpeechCaptured"])
        after_tab = [n["name"] for n in self.report["dialog"]["afterTab"]["relevant"] if n["hasKeyboardFocus"]]
        after_shift_tab = [n["name"] for n in self.report["dialog"]["afterShiftTab"]["relevant"] if n["hasKeyboardFocus"]]
        self.assertIn("Close modal", after_tab)
        self.assertIn("Last focusable", after_shift_tab)
        escape = self.report["dialog"]["domAfterEscape"]
        self.assertTrue(escape["closed"])
        self.assertEqual(escape["activeElementId"], "v3-show-keyboard-modal")

    def test_popover_surface_gap_is_recorded_without_claiming_contrast_success(self) -> None:
        popover = self.report["popover"]["dom"]
        self.assertEqual(popover["triggerExpanded"], "true")
        self.assertEqual(popover["triggerControls"], "v3-popover-trigger_surface")
        self.assertIsNone(popover["triggerHasPopup"])
        self.assertEqual(popover["surfaceTag"], "DIV")
        self.assertIsNone(popover["surfaceRole"])
        self.assertEqual(popover["surfaceBackground"], "rgb(255, 255, 255)")
        self.assertEqual(popover["surfaceColor"], "rgb(36, 36, 36)")
        self.assertEqual(popover["surfaceForcedColorAdjust"], "auto")
        # The captured white surface under HC Black is an open finding, never a pass assertion.

    def test_screenshots_are_present_and_match_sha256(self) -> None:
        for section in ("dialog", "popover"):
            capture = self.report[section]["screenshot"]
            path = EVIDENCE_DIR / capture["file"]
            self.assertTrue(path.is_file(), str(path))
            data = path.read_bytes()
            self.assertEqual(len(data), capture["bytes"])
            self.assertEqual(hashlib.sha256(data).hexdigest(), capture["sha256"])
            self.assertGreater(len(data), 20_000)

    def test_probe_is_fail_closed_and_restores_exact_native_state(self) -> None:
        source = (ROOT / "scripts/quality/probe_v3_issue418_native_uia.mjs").read_text(encoding="utf-8")
        self.assertIn("BLUENT_ISSUE418_NATIVE_SCHEME", source)
        self.assertIn("BLUENT_ISSUE418_NATIVE_EVIDENCE_SUFFIX", source)
        self.assertIn("^[A-Z0-9-]{1,32}$", source)
        self.assertIn("some(path => existsSync(path))", source)
        self.assertIn("Refusing to overwrite existing native evidence", source)
        self.assertIn('"High Contrast White", "High Contrast Black"', source)
        self.assertIn("if (!original.scheme)", source)
        self.assertIn('String(original.flags)', source)
        self.assertIn('original.scheme]', source)
        self.assertIn("verified.flags === original.flags", source)
        self.assertIn("verified.scheme === original.scheme", source)
        self.assertIn("verified.enabled === original.enabled", source)

    def test_evidence_limits_are_explicit(self) -> None:
        limitations = " ".join(self.report["limitations"]).lower()
        self.assertIn("high contrast black", limitations)
        self.assertIn("physical", limitations)
        self.assertIn("narrator", limitations)
        self.assertIn("voiceover", limitations)
        self.assertIn("does not approve", limitations)
        self.assertEqual(self.report["cleanup"]["edgeOwnedProcessesRemaining"], 0)
        self.assertTrue(MARKDOWN_PATH.is_file())
        markdown = MARKDOWN_PATH.read_text(encoding="utf-8-sig").lower()
        self.assertIn("limited native windows engineering evidence", markdown)
        self.assertIn("white background and dark text", markdown)
        self.assertIn("issue #418 remains in progress", markdown)


if __name__ == "__main__":
    unittest.main()
