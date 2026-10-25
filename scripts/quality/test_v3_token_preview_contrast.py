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
        self.assertEqual(self.report["checks"], 140)

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
            "Do not treat any of these source roles as approved normal-text tokens without a reviewed semantic mapping.",
            self.report["reviewNotes"],
        )

    def test_primary_text_on_brand_and_proposed_danger_remain_covered(self) -> None:
        self.assertEqual(self.report["currentDangerBelow4_5"], 10)
        self.assertEqual(self.report["suggestedDangerBelow4_5"], 0)
        self.assertEqual(self.report["minimum"]["primaryText"]["ratio"], 14.548)
        self.assertEqual(self.report["minimum"]["onBrand"]["ratio"], 5.552)
        self.assertFalse(self.report["legacyCssModified"])


if __name__ == "__main__":
    unittest.main()
