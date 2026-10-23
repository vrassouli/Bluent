"""Regression guard for Icon #429's nine-dimension #552 audit index."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
QUALITY = ROOT / "docs/v3/quality"
REPORT = QUALITY / "FLUENT-PARITY-ICON-AUDIT.md"
MATRIX = QUALITY / "FLUENT-PARITY-RETRO-AUDIT.json"
DIMENSIONS = {
    "visual": ["FLUENT-PARITY-ICON-BROWSER.md", "FLUENT-PARITY-VISUAL-EVIDENCE-AUDIT.md"],
    "feature": ["FLUENT-PARITY-WAVE-A-API-REVIEW.md", "FLUENT-PARITY-ICON-VARIANTS.md"],
    "behavior": ["FLUENT-PARITY-BEHAVIOR-AUDIT.md"],
    "accessibility": ["FLUENT-PARITY-ACCESSIBILITY-AUDIT.md", "FLUENT-PARITY-BUTTON-ICON-AX.md"],
    "tokenTheme": ["FLUENT-PARITY-TOKEN-THEME-AUDIT.md"],
    "responsiveRTL": ["FLUENT-PARITY-RESPONSIVE-RTL-AUDIT.md"],
    "BlazorExtensions": ["FLUENT-PARITY-BLAZOR-EXTENSIONS-AUDIT.md"],
    "designArtifact": ["FLUENT-PARITY-DESIGN-ARTIFACT-AUDIT.md"],
    "migrationDocs": ["FLUENT-PARITY-MIGRATION-DOCS-AUDIT.md"],
}


class IconAuditDimensionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = REPORT.read_text(encoding="utf-8-sig")
        cls.matrix = json.loads(MATRIX.read_text(encoding="utf-8-sig"))
        cls.family = next(f for f in cls.matrix["families"] if f["family"] == "Icon")

    def test_matrix_stays_open_and_all_nine_icon_dimensions_are_audited_gaps(self):
        self.assertFalse(self.matrix["auditComplete"])
        self.assertTrue(self.matrix["noneApproved"])
        self.assertEqual("researching", self.family["auditStatus"])
        self.assertEqual("known_gaps_open", self.family["gapDisposition"])
        self.assertEqual("pending", self.family["designApproval"])
        self.assertIsNone(self.family["evidenceBundle"])
        self.assertEqual(set(DIMENSIONS), set(self.family["dimensions"]))
        for dimension in DIMENSIONS:
            with self.subTest(dimension=dimension):
                self.assertEqual("audited_gaps", self.family["dimensions"][dimension])

    def test_family_report_disposes_each_dimension_without_stale_not_reviewed_claims(self):
        marker = "## Canonical matrix disposition"
        tick = chr(96)
        self.assertIn(marker, self.report)
        section = self.report.split(marker, 1)[1].split("## Required owner actions", 1)[0]
        self.assertNotIn(tick + "not_reviewed" + tick, section)
        for dimension, paths in DIMENSIONS.items():
            with self.subTest(dimension=dimension):
                dimension_cell = re.escape(tick + dimension + tick)
                status_cell = re.escape(tick + "audited_gaps" + tick)
                self.assertRegex(section, rf"(?m)^\| {dimension_cell} \|.*{status_cell}.*\|$")
                for name in paths:
                    self.assertTrue((QUALITY / name).is_file(), name)
                    self.assertIn(f"]({name})", section, f"missing evidence link for {dimension}: {name}")

    def test_editable_penpot_draft_is_linked_but_not_misclassified_as_approval(self):
        location = self.family["editableDesignLocation"]
        self.assertEqual("b64f6665-c9ab-80b5-8008-c4ac99d9d000", location["fileId"])
        self.assertEqual("2026-10-23", location["reviewDate"])
        self.assertEqual("1d7e9dd6-b977-802e-8008-d5a718dd7655", location["bluentDraft"]["pageId"])
        self.assertEqual("1d7e9dd6-b977-802e-8008-d5a718e3f4a2", location["bluentDraft"]["nodeId"])
        self.assertEqual(129, location["bluentDraft"]["editableChildren"])
        self.assertEqual(68, location["bluentDraft"]["textNodes"])
        self.assertEqual(0, location["bluentDraft"]["invalidTextBounds"])
        self.assertEqual(0, location["bluentDraft"]["childrenOutsideBoard"])
        self.assertFalse(location["bluentDraft"]["variantSetComplete"])
        self.assertEqual("pending", self.family["designApproval"])
        self.assertIsNone(self.family["evidenceBundle"])
        self.assertIn("Editable Icon review draft (2026-10-23)", self.report)
        self.assertIn("not a complete reusable Icon variant set", self.report)
        self.assertIn("PENPOT-ISSUE-552-DESIGN-ARTIFACT-ADDENDUM-2026-10-23.json", self.report)
        self.assertTrue((QUALITY / "evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-ADDENDUM-2026-10-23.json").is_file())
        self.assertIn("Penpot review board now exists", (QUALITY / "FLUENT-PARITY-ICON-VARIANTS.md").read_text(encoding="utf-8-sig"))

    def test_disposition_preserves_unapproved_design_and_accessibility_boundaries(self):
        for phrase in (
            "SVG sizing defect",
            "native assistive-technology sign-off",
            "component design approval remains pending",
            "no family-specific 2.x-to-v3 migration section",
        ):
            with self.subTest(phrase=phrase):
                self.assertIn(phrase, self.report)
        section = self.report.split("## Canonical matrix disposition", 1)[1].split("## Required owner actions", 1)[0]
        self.assertNotIn("Fluent-approved", section)


if __name__ == "__main__":
    unittest.main()
