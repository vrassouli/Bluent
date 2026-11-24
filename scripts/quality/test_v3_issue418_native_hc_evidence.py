from __future__ import annotations

import hashlib
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = ROOT / "docs" / "v3" / "quality" / "evidence"
BASE = "BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-HC-2026-11-23"
JSON_PATH = EVIDENCE_DIR / f"{BASE}.json"
MARKDOWN_PATH = EVIDENCE_DIR / f"{BASE}.md"
SCREENSHOT_PATH = EVIDENCE_DIR / f"{BASE}.png"


class Issue418NativeHighContrastEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        with JSON_PATH.open("r", encoding="utf-8-sig") as stream:
            cls.evidence = json.load(stream)

    def test_native_windows_high_contrast_is_scoped_and_restored(self) -> None:
        environment = self.evidence["environment"]
        self.assertEqual(environment["operatingSystem"], "Windows 11 Pro")
        self.assertEqual(environment["nativeScheme"], "High Contrast White")
        self.assertEqual(environment["originalState"]["flags"], 126)
        self.assertFalse(environment["originalState"]["enabled"])
        self.assertEqual(environment["testState"]["flags"], 127)
        self.assertTrue(environment["testState"]["enabled"])
        self.assertEqual(environment["restoredState"]["flags"], 126)
        self.assertTrue(environment["restoredState"]["exactlyMatchesOriginal"])
        self.assertFalse(environment["restoredState"]["enabled"])

    def test_real_edge_observed_native_forced_colors(self) -> None:
        self.assertEqual(self.evidence["environment"]["browser"], "Microsoft Edge")
        self.assertTrue(self.evidence["browserObservations"]["forcedColorsActive"])
        self.assertTrue(self.evidence["browserObservations"]["prefersContrastMore"])
        self.assertEqual(
            self.evidence["environment"]["fixtureRoute"],
            "/v3/interactive-portal-lab",
        )

    def test_dialog_semantics_and_keyboard_observations_are_exact(self) -> None:
        dialog = self.evidence["dialog"]
        self.assertEqual(dialog["role"], "dialog")
        self.assertEqual(dialog["ariaModal"], "true")
        self.assertEqual(dialog["ariaLabelledBy"], "f17659346_title")
        self.assertIsNone(dialog["ariaDescribedBy"])
        self.assertEqual(dialog["focusOnOpen"], "f17659346")
        self.assertEqual(dialog["focusAfterTab"], "f73d00374")
        self.assertEqual(dialog["focusAfterShiftTab"], "v3-modal-last-0")
        self.assertTrue(dialog["escapeClosesDialog"])
        self.assertEqual(dialog["focusAfterEscape"], "v3-show-keyboard-modal")

    def test_popover_trigger_and_surface_limit_are_recorded(self) -> None:
        popover = self.evidence["popover"]
        self.assertEqual(popover["ariaExpanded"], "true")
        self.assertEqual(popover["ariaControls"], "v3-popover-trigger_surface")
        self.assertEqual(popover["surfaceTag"], "SECTION")
        self.assertIsNone(popover["surfaceRole"])
        self.assertEqual(
            popover["surfaceComputedBackground"],
            "rgba(255, 250, 239, 0)",
        )

    def test_native_probe_does_not_claim_physical_keyboard_or_speech(self) -> None:
        method = self.evidence["interactionMethod"]
        self.assertEqual(method["pointer"], "Input.dispatchMouseEvent")
        self.assertEqual(method["keyboard"], "Input.dispatchKeyEvent")
        self.assertFalse(method["physicalKeyboardUsed"])
        self.assertFalse(method["windowsUiAutomationUsedForDialogInteraction"])
        self.assertFalse(method["assistiveTechnologySpeechCaptured"])

    def test_capture_integrity_and_unreviewed_status_are_pinned(self) -> None:
        capture = self.evidence["capture"]
        self.assertEqual(capture["file"], SCREENSHOT_PATH.name)
        self.assertEqual(capture["bytes"], 104481)
        self.assertEqual(
            capture["sha256"],
            "b7f79d840d4bbbdbb314a0451d1b31751b906fe28bb40f6caf9f3185603b8232",
        )
        self.assertTrue(SCREENSHOT_PATH.is_file())
        self.assertEqual(SCREENSHOT_PATH.stat().st_size, capture["bytes"])
        digest = hashlib.sha256(SCREENSHOT_PATH.read_bytes()).hexdigest()
        self.assertEqual(digest, capture["sha256"])
        self.assertFalse(capture["independentPixelReviewCompleted"])
        self.assertFalse(capture["visualApproval"])

    def test_prototype_limits_and_non_acceptance_are_explicit(self) -> None:
        self.assertEqual(self.evidence["status"], "limited-prototype-evidence-only")
        limitations = " ".join(self.evidence["limitations"]).lower()
        for required in (
            "high contrast black",
            "physical hardware key presses",
            "narrator",
            "no explicit role",
            "transparent",
            "not visual design acceptance",
            "does not approve",
        ):
            self.assertIn(required, limitations)
        self.assertTrue(MARKDOWN_PATH.is_file())
        markdown = MARKDOWN_PATH.read_text(encoding="utf-8-sig").lower()
        self.assertIn("not design, api, assistive-technology or product acceptance", markdown)
        self.assertIn("not physical keyboard presses", markdown)


if __name__ == "__main__":
    unittest.main()
