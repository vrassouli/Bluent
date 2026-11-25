from __future__ import annotations

import hashlib
import json
import unittest
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = ROOT / "docs" / "v3" / "quality" / "evidence"
BASE = "BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-UIA-2026-11-24"
JSON_PATH = EVIDENCE_DIR / f"{BASE}.json"
MARKDOWN_PATH = EVIDENCE_DIR / f"{BASE}.md"


def _names(snapshot: dict[str, Any]) -> list[str]:
    return [item.get("name", "") for item in snapshot.get("relevant", [])]


def _focused_names(snapshot: dict[str, Any]) -> list[str]:
    return [
        item.get("name", "")
        for item in snapshot.get("relevant", [])
        if item.get("hasKeyboardFocus")
    ]


class Issue418NativeWindowsUIAEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        with JSON_PATH.open("r", encoding="utf-8-sig") as stream:
            cls.report = json.load(stream)

    def test_report_is_complete_and_classified_as_prototype_evidence(self) -> None:
        self.assertTrue(self.report["completed"])
        self.assertEqual(
            self.report["status"],
            "limited-native-windows-ui-automation-prototype-evidence-only",
        )
        self.assertEqual(self.report["issue"], 418)

    def test_native_windows_edge_environment_and_real_forced_colors_are_pinned(self) -> None:
        environment = self.report["environment"]
        self.assertEqual(environment["os"]["Caption"], "Microsoft Windows 11 Pro")
        self.assertEqual(environment["os"]["BuildNumber"], "28000")
        self.assertEqual(environment["browser"], "Microsoft Edge")
        self.assertIn("Edg/158.0.0.0", environment["edgeUserAgent"])
        self.assertTrue(environment["forcedColorsActive"])
        self.assertTrue(environment["prefersContrastMore"])
        self.assertEqual(environment["renderMode"], "Published InteractiveServer")
        self.assertEqual(environment["fixtureRoute"], "/v3/interactive-portal-lab")

    def test_native_high_contrast_is_restored_exactly(self) -> None:
        high_contrast = self.report["nativeHighContrast"]
        original = high_contrast["originalState"]
        active = high_contrast["testState"]
        restored = high_contrast["restoredState"]
        self.assertEqual(original["flags"], 126)
        self.assertFalse(original["enabled"])
        self.assertEqual(original["scheme"], "High Contrast White")
        self.assertEqual(active["flags"], 127)
        self.assertTrue(active["enabled"])
        self.assertEqual(active["scheme"], original["scheme"])
        self.assertEqual(restored["flags"], original["flags"])
        self.assertEqual(restored["enabled"], original["enabled"])
        self.assertEqual(restored["scheme"], original["scheme"])
        self.assertTrue(high_contrast["exactlyMatchesOriginal"])

    def test_dialog_dom_exposes_modal_role_and_accessible_heading_reference(self) -> None:
        dialog = self.report["dialog"]["domOnOpen"]
        self.assertEqual(dialog["role"], "dialog")
        self.assertEqual(dialog["ariaModal"], "true")
        self.assertEqual(dialog["ariaLabelledBy"], "f1de028b5_title")
        self.assertIsNone(dialog["ariaDescribedBy"])
        self.assertEqual(dialog["background"], "rgb(255, 250, 239)")
        self.assertEqual(dialog["forcedColorAdjust"], "auto")

    def test_dialog_is_exposed_in_windows_uia_with_name_heading_and_close_action(self) -> None:
        snapshots = [
            self.report["dialog"]["afterTab"],
            self.report["dialog"]["afterShiftTab"],
        ]
        combined = [name for snapshot in snapshots for name in _names(snapshot)]
        self.assertIn("v3 keyboard modal", combined)
        self.assertIn("Close modal", combined)
        self.assertIn("Last focusable", combined)
        dialog_nodes = [
            node
            for snapshot in snapshots
            for node in snapshot.get("relevant", [])
            if node.get("name") == "v3 keyboard modal"
            and node.get("controlType") == "ControlType.Window"
            and node.get("frameworkId") == "Chrome"
        ]
        self.assertTrue(dialog_nodes)
        title_nodes = [
            node
            for snapshot in snapshots
            for node in snapshot.get("relevant", [])
            if node.get("automationId") == "f1de028b5_title"
            and node.get("controlType") == "ControlType.Text"
        ]
        self.assertTrue(title_nodes)
        close_nodes = [
            node
            for snapshot in snapshots
            for node in snapshot.get("relevant", [])
            if node.get("name") == "Close modal"
            and node.get("controlType") == "ControlType.Button"
            and "Invoke" in node.get("patterns", [])
        ]
        self.assertTrue(close_nodes)

    def test_synthetic_tab_and_shift_tab_focus_observations_are_exact(self) -> None:
        self.assertIn("Close modal", _focused_names(self.report["dialog"]["afterTab"]))
        self.assertIn(
            "Last focusable",
            _focused_names(self.report["dialog"]["afterShiftTab"]),
        )

    def test_escape_closes_dialog_and_returns_focus_to_original_trigger(self) -> None:
        result = self.report["dialog"]["domAfterEscape"]
        self.assertTrue(result["closed"])
        self.assertEqual(result["activeElementId"], "v3-show-keyboard-modal")

    def test_popover_relationship_is_recorded_without_inventing_missing_semantics(self) -> None:
        popover = self.report["popover"]["dom"]
        self.assertEqual(popover["triggerExpanded"], "true")
        self.assertEqual(popover["triggerControls"], "v3-popover-trigger_surface")
        self.assertIsNone(popover["triggerHasPopup"])
        self.assertEqual(popover["surfaceTag"], "DIV")
        self.assertIsNone(popover["surfaceRole"])
        self.assertEqual(popover["surfaceLabel"], "v3 detached theme ownership probe")
        self.assertEqual(popover["surfaceBackground"], "rgb(255, 250, 239)")
        self.assertEqual(popover["surfaceForcedColorAdjust"], "auto")

    def test_popover_content_is_exposed_in_windows_uia_as_group_and_text(self) -> None:
        items = self.report["popover"]["uiAutomation"]["relevant"]
        group = [
            item for item in items
            if item.get("name") == "v3 detached theme ownership probe"
            and item.get("controlType") == "ControlType.Group"
        ]
        text = [
            item for item in items
            if item.get("name") == "v3 global Popover ownership check"
            and item.get("controlType") == "ControlType.Text"
        ]
        trigger = [
            item for item in items
            if item.get("automationId") == "v3-popover-trigger"
            and item.get("controlType") == "ControlType.Button"
        ]
        self.assertTrue(group)
        self.assertTrue(text)
        self.assertTrue(trigger)

    def test_screenshots_exist_and_match_their_sha256_manifests(self) -> None:
        for section in ("dialog", "popover"):
            capture = self.report[section]["screenshot"]
            path = EVIDENCE_DIR / capture["file"]
            self.assertTrue(path.is_file(), str(path))
            data = path.read_bytes()
            self.assertEqual(len(data), capture["bytes"])
            self.assertEqual(hashlib.sha256(data).hexdigest(), capture["sha256"])
            self.assertGreater(capture["bytes"], 20_000)

    def test_probe_does_not_claim_physical_keyboard_or_spoken_at_acceptance(self) -> None:
        method = self.report["interactionMethod"]
        self.assertTrue(method["keyboardEventsAreSynthetic"])
        self.assertFalse(method["physicalKeyboardUsed"])
        self.assertFalse(method["narratorStarted"])
        self.assertFalse(method["assistiveTechnologySpeechCaptured"])
        limits = " ".join(self.report["limitations"]).lower()
        self.assertIn("physical keyboard", limits)
        self.assertIn("speech", limits)
        self.assertIn("high contrast white", limits)
        self.assertIn("general product accessibility support", limits)

    def test_owned_process_cleanup_and_markdown_companion_are_recorded(self) -> None:
        self.assertEqual(self.report["cleanup"]["edgeOwnedProcessesRemaining"], 0)
        self.assertTrue(MARKDOWN_PATH.is_file())
        markdown = MARKDOWN_PATH.read_text(encoding="utf-8-sig").lower()
        for phrase in (
            "limited native windows engineering evidence",
            "close modal",
            "last focusable",
            "aria-haspopup",
            "no narrator",
            "high contrast black",
            "issue #418 remains in progress",
        ):
            self.assertIn(phrase, markdown)


if __name__ == "__main__":
    unittest.main()
