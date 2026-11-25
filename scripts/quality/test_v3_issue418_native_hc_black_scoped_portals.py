from __future__ import annotations

import hashlib
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = ROOT / "docs" / "v3" / "quality" / "evidence"
BASE = "BLUENT-ISSUE418-DIALOG-POPOVER-WINDOWS-UIA-2026-11-25-HC-BLACK-SCOPED-WORD-COMPARE-4"
JSON_PATH = EVIDENCE_DIR / f"{BASE}.json"
MARKDOWN_PATH = EVIDENCE_DIR / f"{BASE}.md"


class Issue418NativeHighContrastBlackScopedPortalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        with JSON_PATH.open("r", encoding="utf-8-sig") as stream:
            cls.report = json.load(stream)

    def test_report_is_complete_and_native_state_is_restored(self) -> None:
        self.assertTrue(self.report["completed"])
        self.assertEqual(self.report["issue"], 418)
        self.assertEqual(self.report["environment"]["nativeHighContrastScheme"], "High Contrast Black")
        self.assertTrue(self.report["environment"]["forcedColorsActive"])
        self.assertTrue(self.report["environment"]["prefersContrastMore"])
        hc = self.report["nativeHighContrast"]
        self.assertEqual(hc["originalState"]["scheme"], "High Contrast Black")
        self.assertEqual(hc["originalState"]["flags"], 127)
        self.assertEqual(hc["restoredState"]["flags"], hc["originalState"]["flags"])
        self.assertEqual(hc["restoredState"]["scheme"], hc["originalState"]["scheme"])
        self.assertEqual(hc["restoredState"]["enabled"], hc["originalState"]["enabled"])
        self.assertTrue(hc["exactlyMatchesOriginal"])
        self.assertEqual(self.report["cleanup"]["edgeOwnedProcessesRemaining"], 0)

    def test_current_scope_portal_attributes_are_preserved(self) -> None:
        dom = self.report["popover"]["dom"]
        self.assertEqual(dom["triggerExpanded"], "true")
        self.assertEqual(dom["triggerControls"], dom["surfaceId"])
        self.assertEqual(dom["surfaceId"], "v3-popover-trigger_surface")
        self.assertEqual(dom["surfaceTheme"], "light")
        self.assertIsNone(dom["surfaceBrand"])
        self.assertTrue(dom["surfaceV3Tokens"])
        self.assertEqual(dom["surfaceDensity"], "comfortable")
        self.assertEqual(dom["surfaceDirection"], "ltr")
        self.assertIsNone(dom["surfaceRole"], "Generic Popover must not infer a universal role.")

    def test_alternate_scope_portal_attributes_are_preserved(self) -> None:
        dom = self.report["scopedPopover"]["dom"]
        self.assertEqual(dom["triggerExpanded"], "true")
        self.assertEqual(dom["triggerControls"], dom["surfaceId"])
        self.assertEqual(dom["surfaceId"], "v3-independent-popover-trigger_surface")
        self.assertEqual(dom["surfaceTheme"], "dark")
        self.assertEqual(dom["surfaceBrand"], "word")
        self.assertTrue(dom["surfaceV3Tokens"])
        self.assertEqual(dom["surfaceDensity"], "comfortable")
        self.assertEqual(dom["surfaceDirection"], "rtl")
        self.assertIsNone(dom["surfaceRole"], "Generic Popover must not infer a universal role.")

    def test_native_forced_colors_override_both_scoped_theme_surfaces_consistently(self) -> None:
        light = self.report["popover"]["dom"]
        dark_word = self.report["scopedPopover"]["dom"]
        self.assertEqual(light["surfaceBackground"], "rgb(32, 32, 32)")
        self.assertEqual(dark_word["surfaceBackground"], "rgb(32, 32, 32)")
        self.assertEqual(light["surfaceColor"], "rgb(255, 255, 255)")
        self.assertEqual(dark_word["surfaceColor"], "rgb(255, 255, 255)")
        self.assertEqual(light["surfaceForcedColorAdjust"], "auto")
        self.assertEqual(dark_word["surfaceForcedColorAdjust"], "auto")
        # This records native forced-colors computed values, not a blanket contrast pass.

    def test_three_screenshot_files_match_sha256(self) -> None:
        captures = [
            self.report["dialog"]["screenshot"],
            self.report["popover"]["screenshot"],
            self.report["scopedPopover"]["screenshot"],
        ]
        for capture in captures:
            path = EVIDENCE_DIR / capture["file"]
            self.assertTrue(path.is_file(), str(path))
            data = path.read_bytes()
            self.assertEqual(len(data), capture["bytes"])
            self.assertEqual(hashlib.sha256(data).hexdigest(), capture["sha256"])
            self.assertGreater(len(data), 20_000)

    def test_probe_and_documentation_pin_same_run_scope_comparison(self) -> None:
        source = (ROOT / "scripts/quality/probe_v3_issue418_native_uia.mjs").read_text(encoding="utf-8")
        self.assertIn("scopedPopoverCapturePath", source)
        self.assertIn("surfaceV3Tokens:s.hasAttribute('data-bui-v3-tokens')", source)
        self.assertIn("v3-independent-popover-trigger_surface", source)
        self.assertIn("Keep the CurrentScope surface open", source)
        self.assertNotIn("CurrentScope Popover trigger toggle close", source)
        markdown = MARKDOWN_PATH.read_text(encoding="utf-8-sig")
        self.assertIn("ThemeScope propagation through the detached portal is working", markdown)
        self.assertIn("same browser session and native scheme", markdown)
        self.assertIn("no numeric contrast pass is claimed", markdown.lower())
        self.assertIn("generic surface must not acquire a universal `dialog` role", markdown)


if __name__ == "__main__":
    unittest.main()
