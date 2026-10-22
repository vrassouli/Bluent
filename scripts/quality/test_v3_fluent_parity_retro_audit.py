"""Contract tests for the #552 18-family Fluent parity backfill matrix."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
QUALITY = ROOT / "docs/v3/quality"
MATRIX = QUALITY / "FLUENT-PARITY-RETRO-AUDIT.json"
REPORT = QUALITY / "FLUENT-PARITY-RETRO-AUDIT.md"
EXPECTED = {
    "Button": 428, "Icon": 429, "Label": 430, "Link": 431, "Badge": 445,
    "TextField": 432, "Checkbox": 434, "Switch": 435, "NumericField": 433,
    "RadioGroup": 436, "SelectField": 437, "DateField": 438, "TimeField": 439,
    "MaskedField": 440, "OtpField": 441, "Slider": 442, "RangeSlider": 443,
    "FileSelect": 444,
}
DIMENSIONS = {
    "visual", "feature", "behavior", "accessibility", "tokenTheme",
    "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs",
}

class RetrospectiveParityMatrixTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(MATRIX.read_text(encoding="utf-8-sig"))
        cls.report = REPORT.read_text(encoding="utf-8-sig")

    def test_exact_18_family_inventory_and_owning_issues(self):
        families = self.data["families"]
        self.assertEqual(18, len(families))
        self.assertEqual(EXPECTED, {f["family"]: f["productIssue"] for f in families})
        self.assertEqual(18, len({f["family"] for f in families}))

    def test_all_nine_dimensions_and_family_statuses_remain_unreviewed(self):
        self.assertFalse(self.data["auditComplete"])
        self.assertTrue(self.data["noneApproved"])
        for family in self.data["families"]:
            self.assertEqual("not_reviewed", family["auditStatus"], family["family"])
            self.assertEqual(DIMENSIONS, set(family["dimensions"]), family["family"])
            self.assertEqual({"not_reviewed"}, set(family["dimensions"].values()), family["family"])
            self.assertEqual("pending", family["designApproval"], family["family"])
            self.assertIsNone(family["evidenceBundle"], family["family"])
            self.assertEqual("untriaged", family["gapDisposition"], family["family"])

    def test_research_leads_are_real_files_not_accepted_evidence(self):
        refs = self.data["supplementalSourceAnalysis"]
        self.assertTrue(refs["interpretation"].startswith("Research leads only"))
        for path in refs.values():
            if path.startswith("docs/"):
                self.assertTrue((ROOT / path).is_file(), path)
        for family in self.data["families"]:
            self.assertTrue(family["researchLeadDocuments"], family["family"])
            for path in family["researchLeadDocuments"]:
                self.assertTrue((ROOT / path).is_file(), f"{family['family']}: {path}")

    def test_markdown_lists_every_family_and_keeps_approval_boundary(self):
        for family in EXPECTED:
            self.assertIn(f"| {family} |", self.report)
        for phrase in (
            "research leads, not acceptance evidence", "nine-dimension acceptance matrix",
            "full evidence bundle remains pending for all 18 families",
            "native OS/assistive-technology acceptance", "PR #553 targets `bluent-v3`",
        ):
            self.assertIn(phrase, self.report)

    def test_branch_isolated_and_all_parity_approvals_still_pending(self):
        self.assertEqual("v3/issue-552-fluent-parity-audit", self.data["branch"])
        self.assertEqual("bluent-v3", self.data["rules"]["changesOnlyTo"])
        self.assertTrue(self.data["rules"]["stable2xProtected"])
        self.assertTrue(self.data["rules"]["candidateSourceNamesAreNotAcceptance"])
        self.assertTrue(self.data["rules"]["sourceResearchDoesNotChangeAuditStatus"])

if __name__ == "__main__":
    unittest.main()
