"""Contract tests for the #552 18-family Fluent parity backfill matrix."""
import json
import re
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
QUALITY = ROOT / "docs/v3/quality"
MATRIX = QUALITY / "FLUENT-PARITY-RETRO-AUDIT.json"
REPORT = QUALITY / "FLUENT-PARITY-RETRO-AUDIT.md"
STALE_REVIEW_STATUS_PATTERN = re.compile(r"\bnot reviewed\b", re.IGNORECASE)
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

    def test_all_nine_dimensions_are_audited_but_not_accepted(self):
        self.assertFalse(self.data["auditComplete"])
        self.assertTrue(self.data["noneApproved"])
        families = {family["family"]: family for family in self.data["families"]}
        expected_partial = {
            "Button": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-BUTTON-AUDIT.md"),
            "TextField": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-TEXTFIELD-AUDIT.md"),
            "Icon": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-ICON-AUDIT.md"),
            "Label": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-LABEL-AUDIT.md"),
            "Link": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-LINK-AUDIT.md"),
            "Badge": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-BADGE-AUDIT.md"),
            "Checkbox": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md"),
            "Switch": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-CHECKBOX-SWITCH-AUDIT.md"),
            "RadioGroup": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-RADIOGROUP-AUDIT.md"),
            "OtpField": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-OTP-AUDIT.md"),
            "NumericField": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md"),
            "SelectField": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md"),
            "DateField": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md"),
            "TimeField": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md"),
            "MaskedField": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-TYPED-FIELDS-AUDIT.md"),
            "Slider": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md"),
            "RangeSlider": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md"),
            "FileSelect": ({"feature", "visual", "behavior", "accessibility", "tokenTheme", "responsiveRTL", "BlazorExtensions", "designArtifact", "migrationDocs"}, "docs/v3/quality/FLUENT-PARITY-FILESELECT-AUDIT.md"),
        }
        for name, (audited_dimensions, report_path) in expected_partial.items():
            family = families[name]
            self.assertEqual("researching", family["auditStatus"], name)
            self.assertEqual("known_gaps_open", family["gapDisposition"], name)
            self.assertEqual(report_path, family["partialAuditReport"], name)
            self.assertTrue((ROOT / report_path).is_file(), report_path)
            self.assertEqual(DIMENSIONS, audited_dimensions, name)
            for dimension in DIMENSIONS:
                self.assertEqual("audited_gaps", family["dimensions"][dimension], f"{name}: {dimension}")
        for family_name, family in families.items():
            self.assertEqual(DIMENSIONS, set(family["dimensions"]), family_name)
            self.assertEqual("researching", family["auditStatus"], family_name)
            self.assertEqual("known_gaps_open", family["gapDisposition"], family_name)
            self.assertEqual("pending", family["designApproval"], family_name)
            self.assertIsNone(family["evidenceBundle"], family_name)

    def test_slider_and_rangeslider_family_audit_matches_matrix_and_addenda(self):
        path=QUALITY / "FLUENT-PARITY-SLIDER-RANGESLIDER-AUDIT.md"
        report=path.read_text(encoding="utf-8-sig")
        self.assertIn("Updated 2026-10-24", report)
        self.assertIn("Design-artifact traceability (2026-10-24)", report)
        self.assertIn("evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-ADDENDUM-2026-10-24-SLIDER.json", report)
        self.assertIn("evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-ADDENDUM-2026-10-24-RANGESLIDER.json", report)
        self.assertIn("`feature`, `tokenTheme`, `responsiveRTL`, `BlazorExtensions`, `designArtifact`, and `migrationDocs`: `audited_gaps`", report)
        self.assertNotIn("`designArtifact`: `not_reviewed`", report)
        for family in ("Slider", "RangeSlider"):
            record=next(x for x in self.data["families"] if x["family"]==family)
            self.assertEqual("audited_gaps", record["dimensions"]["designArtifact"])
            self.assertEqual("pending", record["designApproval"])
            self.assertIsNone(record["evidenceBundle"])

    def test_consolidated_api_surface_rollup_is_linked_and_non_accepting(self):
        report=(QUALITY / "FLUENT-PARITY-API-SURFACE-COVERAGE.md").read_text(encoding="utf-8-sig")
        ledger=json.loads((QUALITY / "FLUENT-PARITY-API-SURFACE-COVERAGE.json").read_text(encoding="utf-8-sig"))
        self.assertIn("FLUENT-PARITY-API-SURFACE-COVERAGE.md", (QUALITY / "FLUENT-PARITY-RETRO-AUDIT.md").read_text(encoding="utf-8-sig"))
        self.assertEqual(239, ledger["reviewedOccurrenceCount"])
        self.assertEqual(11, ledger["missingParameterCount"])
        self.assertFalse(ledger["parityAccepted"])
        self.assertIn("not a public-API completeness certificate", report)
        self.assertIn("all 18 matrix families remain", report)

    def test_family_reports_do_not_call_audited_matrix_dimensions_not_reviewed(self):
        import re
        tick = chr(96)
        dimension_names = r"(?:visual|feature|behavior|accessibility|tokenTheme|responsiveRTL|BlazorExtensions|designArtifact|migrationDocs)"
        for family in self.data["families"]:
            report_path = QUALITY / Path(family["partialAuditReport"]).name
            report = report_path.read_text(encoding="utf-8-sig")
            for line in report.splitlines():
                if re.search(dimension_names, line, re.IGNORECASE) and (tick + "not_reviewed" + tick) in line:
                    self.fail(f"{family['family']} report conflicts with the canonical audited_gaps matrix: {report_path.name}: {line}")
            for dimension, status in family["dimensions"].items():
                self.assertEqual("audited_gaps", status, f"{family['family']} / {dimension}")

    def test_stale_review_status_detector_rejects_plain_language_phrase(self):
        self.assertIsNotNone(STALE_REVIEW_STATUS_PATTERN.search("Visual: not reviewed"))
        self.assertIsNotNone(STALE_REVIEW_STATUS_PATTERN.search("Feature disposition: NOT REVIEWED"))
        self.assertIsNone(STALE_REVIEW_STATUS_PATTERN.search("Visual: audited_gaps"))

    def test_markdown_summary_table_matches_canonical_matrix_status(self):
        markdown = (QUALITY / "FLUENT-PARITY-RETRO-AUDIT.md").read_text(encoding="utf-8-sig")
        start = markdown.index("| # | Existing source family / product issue |")
        end = markdown.index("## Frozen upstream reference baseline", start)
        rows = [
            line for line in markdown[start:end].splitlines()
            if line.startswith("|") and "https://github.com/vrassouli/Bluent/issues/" in line
        ]
        self.assertEqual(18, len(rows))
        for row in rows:
            self.assertIsNone(STALE_REVIEW_STATUS_PATTERN.search(row), row)
            self.assertIn("Audited gaps", row)

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
        self.assertIn("file revision is 447", self.report)
        self.assertIn("Issue #552 Waves A-D API coverage - DRAFT", self.report)
        self.assertIn("quality/disposition artifact", self.report)
        self.assertIn("component redesign or parity approval", self.report)
        artifact = self.data["supplementalSourceAnalysis"]["penpotAuditArtifact"]
        self.assertIn("DRAFT", artifact)
        self.assertIn("not an approval", artifact)
        self.assertIn("revision 447", artifact)
        self.assertIn("Issue #552 Waves A-D API coverage - DRAFT", artifact)
        self.assertFalse(self.data["auditComplete"])
        self.assertTrue(self.data["noneApproved"])
    def test_reference_baseline_and_all_18_upstream_mappings_are_pinned(self):
        baseline = self.data["referenceBaseline"]
        self.assertEqual("2026-10-22", baseline["reviewedOn"])
        self.assertEqual("3.1.3", baseline["webComponents"]["version"])
        self.assertEqual("3.1.3", baseline["webComponents"]["latestTagOnSnapshot"])
        self.assertEqual("9.74.10", baseline["reactFallback"]["version"])
        self.assertEqual("9.74.11", baseline["reactFallback"]["latestTagOnSnapshot"])
        self.assertEqual("2.0.344", baseline["icons"]["version"])
        evidence_path = ROOT / baseline["versionEvidence"]
        self.assertTrue(evidence_path.is_file())
        evidence = json.loads(evidence_path.read_text(encoding="utf-8-sig"))
        for package, key in (("@fluentui/web-components", "webComponents"), ("@fluentui/react-components", "reactFallback"), ("@fluentui/react-icons", "icons")):
            self.assertEqual(baseline[key]["version"], evidence["packages"][package]["selectedVersion"])
            self.assertEqual(baseline[key]["integrity"], evidence["packages"][package]["selectedVersionIntegrity"])
        react_crosswalk = json.loads((ROOT / "docs/v3/quality/FLUENT-REACT-9.74.10-18-API-CANDIDATES.json").read_text(encoding="utf-8-sig"))
        self.assertEqual(baseline["reactFallback"]["integrity"], react_crosswalk["fluentReactIntegrity"])
        allowed_mapping_kinds = {"direct-web-component", "icon-library-reference", "react-v9-cross-platform", "related-only", "native-input-pattern", "bluent-extension"}
        self.assertEqual(18, len(self.data["families"]))
        for family in self.data["families"]:
            with self.subTest(family=family["family"]):
                ref = family["fluentReference"]
                self.assertNotEqual("unverified", ref["matchedUpstreamComponent"])
                self.assertIn(ref["mappingKind"], allowed_mapping_kinds)
                self.assertEqual("2026-10-22", ref["referenceSnapshotDate"])
                self.assertEqual("3.1.3", ref["webComponentsPackageVersion"])
                self.assertEqual("9.74.10", ref["reactFallbackPackageVersion"])
                self.assertTrue(ref["mappingNotes"])
                self.assertIn(f"| {family['family']} #{family['productIssue']} |", self.report)
                if ref["mappingKind"] == "direct-web-component":
                    self.assertTrue(ref["webComponentsComponent"])
        self.assertIn("## Frozen upstream reference baseline (2026-10-22)", self.report)
        self.assertIn("@fluentui/react-components@9.74.10", self.report)
        self.assertIn("latest tag is 9.74.11", self.report)
        self.assertFalse(self.data["auditComplete"])
        self.assertTrue(self.data["noneApproved"])
    def test_wave_a_api_review_covers_all_source_known_parameters(self):
        builder = ROOT / "scripts/quality/build_v3_fluent_wave_a_api_review.py"
        subprocess.run([sys.executable, str(builder), "--check"], check=True, cwd=ROOT)
        ledger = json.loads((QUALITY / "FLUENT-PARITY-WAVE-A-API-REVIEW.json").read_text(encoding="utf-8-sig"))
        candidates = json.loads((QUALITY / "FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json").read_text(encoding="utf-8-sig"))
        wave_a = {"Button", "Icon", "Label", "Link", "Badge"}
        expected = {(f["family"], c["name"], p["name"]) for f in candidates["families"] if f["family"] in wave_a for c in f["components"] for p in c["parameters"]}
        actual = {(f["family"], p["component"], p["name"]) for f in ledger["families"] for p in f["parameters"]}
        self.assertEqual(82, ledger["parameterOccurrenceCount"])
        self.assertEqual(expected, actual)
        self.assertEqual(82, len(actual))
        for family in ledger["families"]:
            self.assertEqual(family["parameterCount"], len(family["parameters"]))
            self.assertEqual("audited_gaps", family["apiReviewStatus"])
            self.assertEqual("pending", family["designApproval"])
            self.assertIsNone(family["evidenceBundle"])
            for parameter in family["parameters"]:
                self.assertIn(parameter["reviewDisposition"], ledger["classificationValues"])
                self.assertTrue(parameter["mapping"], f"{family['family']}.{parameter['name']}")
                self.assertTrue(parameter["rationale"], f"{family['family']}.{parameter['name']}")
                self.assertEqual("not_reviewed", parameter["sourceCandidateStatus"])

    def test_core_control_design_audit_links_editable_frames_without_approval(self):
        report_path = "docs/v3/quality/FLUENT-PARITY-CORE-CONTROLS-DESIGN-AUDIT.md"
        self.assertTrue((ROOT / report_path).is_file())
        self.assertIn("Component design comparisons (partial, 2026-10-22)", self.report)
        design_report = (ROOT / report_path).read_text(encoding="utf-8-sig")
        self.assertIn("Button's comparison export omits its headings and row/column labels", design_report)
        for name in ("Button", "TextField", "Checkbox", "Switch"):
            with self.subTest(family=name):
                family = next(item for item in self.data["families"] if item["family"] == name)
                self.assertEqual("researching", family["auditStatus"])
                self.assertEqual("known_gaps_open", family["gapDisposition"])
                self.assertEqual("audited_gaps", family["dimensions"]["visual"])
                self.assertEqual("audited_gaps", family["dimensions"]["designArtifact"])
                self.assertEqual(report_path, family["designAuditReport"])
                self.assertIn(report_path, family["researchLeadDocuments"])
                location = family["editableDesignLocation"]
                self.assertEqual("b64f6665-c9ab-80b5-8008-c4ac99d9d000", location["fileId"])
                self.assertEqual("2026-10-22", location["reviewDate"])
                self.assertEqual("not exposed by current Penpot connector", location["fileRevision"])
                self.assertIn("maintainer approval pending", location["designDecision"])
                for side in ("reference", "bluentDraft"):
                    self.assertTrue(location[side]["pageId"])
                    self.assertTrue(location[side]["nodeId"])
                self.assertEqual("pending", family["designApproval"])
                self.assertIsNone(family["evidenceBundle"])
        self.assertFalse(self.data["auditComplete"])
        self.assertTrue(self.data["noneApproved"])

    def test_icon_review_board_location_is_grounded_but_not_approval(self):
        icon = next(item for item in self.data["families"] if item["family"] == "Icon")
        location = icon["editableDesignLocation"]
        self.assertEqual("b64f6665-c9ab-80b5-8008-c4ac99d9d000", location["fileId"])
        self.assertEqual("2026-10-23", location["reviewDate"])
        self.assertEqual("1d7e9dd6-b977-802e-8008-d5a718dd7655", location["bluentDraft"]["pageId"])
        self.assertEqual("1d7e9dd6-b977-802e-8008-d5a718e3f4a2", location["bluentDraft"]["nodeId"])
        self.assertEqual(129, location["bluentDraft"]["editableChildren"])
        self.assertEqual(68, location["bluentDraft"]["textNodes"])
        self.assertFalse(location["bluentDraft"]["variantSetComplete"])
        self.assertIn("maintainer approval pending", location["designDecision"])
        self.assertEqual("pending", icon["designApproval"])
        self.assertIsNone(icon["evidenceBundle"])
        self.assertEqual("researching", icon["auditStatus"])
        self.assertTrue(self.data["noneApproved"])
        self.assertFalse(self.data["auditComplete"])
        self.assertTrue((QUALITY / "evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-ADDENDUM-2026-10-23.json").is_file())
        self.assertIn("Icon review-board addendum (2026-10-23)", self.report)
        self.assertIn("not** a complete reusable Icon variant set", self.report)

    def test_branch_isolated_and_all_parity_approvals_still_pending(self):
        self.assertEqual("v3/issue-552-fluent-parity-audit", self.data["branch"])
        self.assertEqual("bluent-v3", self.data["rules"]["changesOnlyTo"])
        self.assertTrue(self.data["rules"]["stable2xProtected"])
        self.assertTrue(self.data["rules"]["candidateSourceNamesAreNotAcceptance"])
        self.assertTrue(self.data["rules"]["sourceResearchDoesNotChangeAuditStatus"])

if __name__ == "__main__":
    unittest.main()
