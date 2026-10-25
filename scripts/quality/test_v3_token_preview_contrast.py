#!/usr/bin/env python3
"""Contract tests for the #418 source-backed token contrast report."""
from __future__ import annotations

import contextlib
import io
import json
import unittest

from audit_v3_token_preview_contrast import main


class TokenPreviewContrastReportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            cls.exit_code = main()
        cls.report = json.loads(output.getvalue())

    def test_all_twenty_source_brand_mode_cases_are_counted(self) -> None:
        self.assertEqual(self.exit_code, 0)
        self.assertTrue(self.report["pass"])
        self.assertEqual(self.report["brandModePairs"], 20)
        self.assertEqual(self.report["coreContrastPairs"], 80)
        self.assertEqual(self.report["draftForegroundDiagnosticPairs"], 60)
        self.assertEqual(self.report["candidateRoleDiagnosticPairs"], 40)
        self.assertEqual(self.report["additionalCandidateRoleDiagnosticPairs"], 120)
        self.assertEqual(self.report["checks"], 300)

    def test_dark_action_and_link_foreground_gap_is_explicit(self) -> None:
        self.assertEqual(self.report["actionForegroundBelow4_5"], 10)
        self.assertEqual(self.report["brandLinkForegroundBelow4_5"], 10)
        self.assertEqual(self.report["minimum"]["actionForeground"]["ratio"], 3.551)
        self.assertEqual(self.report["minimum"]["brandLinkForeground"]["ratio"], 3.551)
        self.assertFalse(self.report["draftActionForegroundApprovedForOrdinaryText"])
        self.assertFalse(self.report["draftBrandLinkForegroundApprovedForOrdinaryText"])
        self.assertTrue(self.report["reviewRequired"])

    def test_brand_foreground2_is_not_a_universal_dark_text_replacement(self) -> None:
        self.assertEqual(self.report["brandForeground2Below4_5"], 8)
        self.assertEqual(self.report["minimum"]["brandForeground2"]["ratio"], 4.294)
        self.assertFalse(self.report["draftBrandForeground2UniversalTextCandidate"])
        self.assertIn(
            "Do not treat any candidate source role as the approved action.foreground mapping without a reviewed semantic decision.",
            self.report["reviewNotes"],
        )

    def test_primary_text_on_brand_and_proposed_danger_remain_covered(self) -> None:
        self.assertEqual(self.report["currentDangerBelow4_5"], 10)
        self.assertEqual(self.report["suggestedDangerBelow4_5"], 0)
        self.assertEqual(self.report["minimum"]["primaryText"]["ratio"], 14.548)
        self.assertEqual(self.report["minimum"]["onBrand"]["ratio"], 5.552)
        self.assertFalse(self.report["legacyCssModified"])


    def test_brand_hover_foreground_is_contrast_safe_but_state_specific(self) -> None:
        self.assertEqual(self.report["brandForeground2HoverBelow4_5"], 0)
        self.assertEqual(self.report["minimum"]["brandForeground2Hover"]["ratio"], 6.172)
        self.assertFalse(self.report["draftBrandForeground2HoverApprovedForGenericRest"])
        self.assertIn(
            "The source --colorBrandForeground2Hover is above 4.5:1 in all 20 pairs (minimum 6.172:1), but it is a state-specific Hover role, not approval for generic Rest text.",
            self.report["reviewNotes"],
        )

    def test_neutral_foreground_is_safe_baseline_but_not_branded(self) -> None:
        self.assertEqual(self.report["neutralForeground2Below4_5"], 0)
        self.assertEqual(self.report["minimum"]["neutralForeground2"]["ratio"], 10.010)
        self.assertFalse(self.report["neutralForeground2ApprovedAsBrandedAction"])
        self.assertIn(
            "The source --colorNeutralForeground2 is above 4.5:1 in all 20 pairs (minimum 10.010:1), but it removes brand coloration and still requires semantic review.",
            self.report["reviewNotes"],
        )

    def test_link_hover_and_pressed_roles_keep_distinct_dark_gap_patterns(self) -> None:
        self.assertEqual(self.report["brandLinkHoverBelow4_5"], 8)
        self.assertEqual(self.report["minimum"]["brandLinkHover"]["ratio"], 4.294)
        self.assertEqual(
            self.report["brandLinkHoverDarkGapBrands"],
            [
                "default", "office", "outlook", "powerapps",
                "powerpoint", "stream", "teams", "word",
            ],
        )
        self.assertEqual(self.report["brandLinkPressedBelow4_5"], 10)
        self.assertEqual(self.report["minimum"]["brandLinkPressed"]["ratio"], 2.911)
        self.assertEqual(len(self.report["brandLinkPressedDarkGapBrands"]), 10)
        self.assertEqual(self.report["brandForeground2PressedBelow4_5"], 0)
        self.assertEqual(self.report["minimum"]["brandForeground2Pressed"]["ratio"], 10.017)
        self.assertFalse(self.report["brandForeground2PressedApprovedForGenericRest"])
        self.assertFalse(self.report["brandLinkHoverApprovedForRest"])
        self.assertFalse(self.report["brandLinkPressedApprovedForRest"])

    def test_neutral_roles_are_high_contrast_but_not_branded_action_semantics(self) -> None:
        self.assertEqual(self.report["neutralForeground1Below4_5"], 0)
        self.assertEqual(self.report["minimum"]["neutralForeground1"]["ratio"], 14.548)
        self.assertEqual(self.report["neutralLinkForeground2Below4_5"], 0)
        self.assertEqual(self.report["minimum"]["neutralLinkForeground2"]["ratio"], 10.010)
        self.assertEqual(self.report["neutralForeground3Below4_5"], 0)
        self.assertEqual(self.report["minimum"]["neutralForeground3"]["ratio"], 6.193)
        self.assertFalse(self.report["neutralForeground1ApprovedAsBrandedAction"])
        self.assertFalse(self.report["neutralLinkForeground2ApprovedAsBrandedAction"])
        self.assertFalse(self.report["neutralForeground3ApprovedAsBrandedAction"])

if __name__ == "__main__":
    unittest.main()
