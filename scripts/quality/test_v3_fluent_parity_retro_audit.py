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

    def test_partial_audits_are_evidenced_and_other_families_remain_unreviewed(self):
        self.assertFalse(self.data["auditComplete"])
        self.assertTrue(self.data["noneApproved"])
        families = {family["family"]: family for family in self.data["families"]}
        expected_partial = {
            "Button": ({"behavior", "accessibility"}, "docs/v3/quality/FLUENT-PARITY-BUTTON-AUDIT.md"),
            "Icon": ({"visual", "accessibility"}, "docs/v3/quality/FLUENT-PARITY-ICON-AUDIT.md"),
            "Label": ({"accessibility"}, "docs/v3/quality/FLUENT-PARITY-LABEL-AUDIT.md"),
            "Link": ({"behavior", "accessibility"}, "docs/v3/quality/FLUENT-PARITY-LINK-AUDIT.md"),
            "Badge": ({"feature", "accessibility"}, "docs/v3/quality/FLUENT-PARITY-BADGE-AUDIT.md"),
            "Checkbox": ({"accessibility"}, "docs/v3/quality/FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md"),
            "Switch": ({"accessibility"}, "docs/v3/quality/FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md"),
            "RadioGroup": ({"behavior", "accessibility"}, "docs/v3/quality/FLUENT-PARITY-RADIOGROUP-AUDIT.md"),
            "OtpField": ({"accessibility"}, "docs/v3/quality/FLUENT-PARITY-OTP-AUDIT.md"),
            "NumericField": ({"feature", "behavior"}, "docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md"),
            "SelectField": ({"feature", "behavior"}, "docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md"),
            "DateField": ({"feature", "behavior", "accessibility"}, "docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md"),
            "TimeField": ({"feature", "behavior"}, "docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md"),
            "MaskedField": ({"feature", "behavior"}, "docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md"),
            "Slider": ({"visual", "behavior", "accessibility"}, "docs/v3/quality/FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md"),
            "RangeSlider": ({"visual", "behavior", "accessibility"}, "docs/v3/quality/FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md"),
            "FileSelect": ({"behavior", "accessibility"}, "docs/v3/quality/FLUENT-PARITY-FILESELECT-AUDIT.md"),
        }
        for name, (audited_dimensions, report_path) in expected_partial.items():
            family = families[name]
            self.assertEqual("researching", family["auditStatus"], name)
            self.assertEqual("known_gaps_open", family["gapDisposition"], name)
            self.assertEqual(report_path, family["partialAuditReport"], name)
            self.assertTrue((ROOT / report_path).is_file(), report_path)
            for dimension in DIMENSIONS:
                expected_status = "audited_gaps" if dimension in audited_dimensions else "not_reviewed"
                self.assertEqual(expected_status, family["dimensions"][dimension], f"{name}: {dimension}")
        for family_name, family in families.items():
            self.assertEqual(DIMENSIONS, set(family["dimensions"]), family_name)
            self.assertEqual("pending", family["designApproval"], family_name)
            self.assertIsNone(family["evidenceBundle"], family_name)
            if family_name == "TextField":
                continue
            if family_name not in expected_partial:
                self.assertEqual("not_reviewed", family["auditStatus"], family_name)
                self.assertEqual({"not_reviewed"}, set(family["dimensions"].values()), family_name)
                self.assertEqual("untriaged", family["gapDisposition"], family_name)

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
            "All 18 families now have partial source/API audit reports",
            "native OS/assistive-technology acceptance", "PR #553 targets `bluent-v3`",
        ):
            self.assertIn(phrase, self.report)

    def test_browser_evidence_index_links_all_18_families(self):
        coverage = {
            "Button": ["docs/v3/quality/FLUENT-PARITY-P0-BUTTON-KEYBOARD.md", "docs/v3/quality/FLUENT-PARITY-BUTTON-ICON-AX.md", "docs/v3/quality/FLUENT-PARITY-BUTTON-TOGGLE-STATES.md"],
            "Icon": ["docs/v3/quality/FLUENT-PARITY-ICON-BROWSER.md"],
            "Label": ["docs/v3/quality/FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md"],
            "Link": ["docs/v3/quality/FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md"],
            "Badge": ["docs/v3/quality/FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md"],
            "TextField": ["docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md"],
            "NumericField": ["docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md"],
            "SelectField": ["docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md"],
            "DateField": ["docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md"],
            "TimeField": ["docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md"],
            "MaskedField": ["docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md"],
            "Checkbox": ["docs/v3/quality/FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md"],
            "Switch": ["docs/v3/quality/FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md"],
            "RadioGroup": ["docs/v3/quality/FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md"],
            "OtpField": ["docs/v3/quality/FLUENT-PARITY-CONTROL-SEMANTICS-BROWSER-AUDIT.md"],
            "Slider": ["docs/v3/quality/FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md", "docs/v3/quality/FLUENT-PARITY-P0-POINTER-SCREEN-VIEWPORT.md"],
            "RangeSlider": ["docs/v3/quality/FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md", "docs/v3/quality/FLUENT-PARITY-P0-POINTER-SCREEN-VIEWPORT.md"],
            "FileSelect": ["docs/v3/quality/FLUENT-PARITY-FILESELECT-AUDIT.md", "docs/v3/quality/FLUENT-PARITY-P0-FILESELECT-LIVE-UPLOAD.md", "docs/v3/quality/FLUENT-PARITY-P0-FILESELECT-PUBLISHED-SERVER.md"],
        }
        self.assertEqual(set(EXPECTED), set(coverage))
        for family, paths in coverage.items():
            with self.subTest(family=family):
                self.assertIn(f"| {family} #", self.report)
                for path in paths:
                    self.assertTrue((ROOT / path).is_file(), path)
        refs = self.data["supplementalSourceAnalysis"]
        self.assertIn("18/18 families have linked partial browser/runtime evidence", refs["browserEvidenceCoverageNote"])
        self.assertIn("## Partial browser evidence coverage (2026-10-22)", self.report)
        self.assertFalse(self.data["auditComplete"])
        self.assertTrue(self.data["noneApproved"])
        for family in self.data["families"]:
            self.assertEqual("pending", family["designApproval"])
            self.assertIsNone(family["evidenceBundle"])
    def test_penpot_audit_map_is_recorded_as_draft_not_approval(self):
        self.assertIn("Penpot design-decision artifact (2026-10-22)", self.report)
        self.assertIn("b64f6665-c9ab-80b5-8008-c4ac99d9d000", self.report)
        self.assertIn("07c521b9-e441-80bd-8008-c4ad87df93c3", self.report)
        self.assertIn("4d22aead-d6ef-801a-8008-d482b9bb0cc8", self.report)
        self.assertIn("did not expose a file revision value", self.report)
        self.assertIn("quality/disposition artifact", self.report)
        self.assertIn("component redesign or parity approval", self.report)
        artifact = self.data["supplementalSourceAnalysis"]["penpotAuditArtifact"]
        self.assertIn("DRAFT", artifact)
        self.assertIn("not an approval", artifact)
        self.assertFalse(self.data["auditComplete"])
        self.assertTrue(self.data["noneApproved"])
    def test_branch_isolated_and_all_parity_approvals_still_pending(self):
        self.assertEqual("v3/issue-552-fluent-parity-audit", self.data["branch"])
        self.assertEqual("bluent-v3", self.data["rules"]["changesOnlyTo"])
        self.assertTrue(self.data["rules"]["stable2xProtected"])
        self.assertTrue(self.data["rules"]["candidateSourceNamesAreNotAcceptance"])
        self.assertTrue(self.data["rules"]["sourceResearchDoesNotChangeAuditStatus"])

if __name__ == "__main__":
    unittest.main()
