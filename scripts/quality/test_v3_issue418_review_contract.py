from __future__ import annotations

import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = ROOT / "docs/v3/tokens/issue-418-token-schema.preview.json"


class Issue418ReviewContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(SCHEMA.read_text(encoding="utf-8-sig"))
        cls.layers = cls.data["layers"]
        cls.policy = cls.data["reviewPolicy"]

    def test_source_namespace_membership_is_complete_and_exclusive(self):
        source_names = {item["name"] for item in self.layers["source"]}
        policy = self.policy["sourceNamespacePolicy"]
        self.assertEqual(set(policy["color"]), {name for name in source_names if name.startswith("bluent.color.")})
        self.assertEqual(set(policy["source"]), {name for name in source_names if name.startswith("bluent.source.")})
        self.assertEqual(len(policy["color"]), 9)
        self.assertEqual(len(policy["source"]), 7)
        self.assertEqual(set(policy["color"]) | set(policy["source"]), source_names)
        self.assertFalse(set(policy["color"]) & set(policy["source"]))
        self.assertIn("role contract", policy["rule"])

    def test_status_danger_is_not_approved_as_normal_text(self):
        semantic = {item["name"]: item for item in self.layers["semantic"]}
        danger = self.policy["dangerConsumerBoundary"]
        self.assertEqual(semantic["bluent.semantic.status.danger"]["alias"], "bluent.source.dangerForeground")
        self.assertEqual(danger["semantic.status.danger"]["allowedRole"], "non-text status indicators/icons/accents on the tested neutral surface")
        self.assertIn("ordinary or small text", danger["semantic.status.danger"]["forbiddenRole"])

    def test_accessible_danger_mapping_is_label_only(self):
        semantic = {item["name"]: item for item in self.layers["semantic"]}
        danger = self.policy["dangerConsumerBoundary"]
        self.assertEqual(semantic["bluent.semantic.text.dangerAccessible"]["alias"], "bluent.source.paletteRedForeground1")
        self.assertEqual(danger["semantic.text.dangerAccessible"]["approvedConsumer"], "Label required marker only")
        self.assertIn("Badge", danger["semantic.text.dangerAccessible"]["notApprovedConsumers"])
        self.assertEqual(danger["component.badge.dangerTextAccessible"]["status"], "unapproved preview candidate")
        components = {item["name"]: item for item in self.layers["component"]}
        self.assertEqual(components["bluent.component.badge.dangerForeground"]["alias"], "bluent.semantic.status.danger")
        badge_status = danger["component.badge.dangerForeground"]
        self.assertEqual(badge_status["status"], "unapproved preview candidate")
        self.assertEqual(badge_status["allowedRole"], "non-text Badge status indicator/icon/accent only, on the tested neutral surface")
        self.assertIn("Badge text foreground", badge_status["forbiddenRole"])
        design = danger["penpotDesignRecord"]
        self.assertEqual(design["pageId"], "acf5f619-7d81-80da-8008-c5ddd53bc436")
        self.assertEqual(design["boardStatus"], "DRAFT")

    def test_focus_host_bridge_is_explicit_and_not_public(self):
        focus = self.policy["focusHostBoundary"]
        self.assertEqual(focus["supportedOpaqueHostKinds"], ["neutral", "brand", "brandHover", "danger", "inverted"])
        self.assertEqual(len(focus["requiresSameElementAttributes"]), 2)
        self.assertFalse(focus["automaticBackgroundInference"])
        self.assertFalse(focus["publicAttributeOrComponentApiApproved"])
        self.assertEqual(focus["selectedOption"], "A")

    def test_portal_prototype_does_not_claim_a_public_api(self):
        portal = self.policy["portalBoundary"]
        self.assertFalse(portal["shippingPublicApiApproved"])
        self.assertEqual(portal["selectedOption"], "A")
        self.assertIn("immutable scope snapshot", portal["ownershipRule"])
        self.assertIn("native Windows Contrast Themes for Dialog/Popover", portal["remainingNativeEvidence"])
        design = portal["penpotDesignRecord"]
        self.assertEqual(design["pageId"], "acf5f619-7d81-80da-8008-c5fec09d9837")
        self.assertEqual(design["boardId"], "acf5f619-7d81-80da-8008-c5fec0b7ec61")
        self.assertEqual(design["observedRevision"], 809)
        self.assertEqual(design["boardStatus"], "DRAFT")
        verification = portal["currentVerification"]
        self.assertEqual(verification["d2"]["chromeWebAssembly"], "126/126")
        self.assertEqual(verification["d2"]["chromePublishedInteractiveServer"], "126/126")
        self.assertEqual(verification["d5"]["runtimeCommit"], "cf008b6d140ac3c4aac5bb9d59880de570620b20")
        self.assertEqual(verification["d5"]["chromeDebugWebAssembly"], "1179/1179")
        self.assertEqual(verification["d5"]["chromePublishedInteractiveServer"], "1178/1178")
        self.assertIn("spoken NVDA/Narrator/VoiceOver acceptance", verification["remaining"])

    def test_penpot_review_records_are_versioned_and_not_approved(self):
        records = self.policy["penpotReviewRecords"]
        by_page = {item["pageNumber"]: item for item in records}
        self.assertEqual(set(by_page), {27, 30, 33, 45, 52, 53, 54, 55})
        self.assertTrue(all(item["fileId"] == "b64f6665-c9ab-80b5-8008-c4ac99d9d000" for item in records))
        self.assertEqual(by_page[30]["observedRevision"], 808)
        self.assertEqual(by_page[30]["status"], "DRAFT")
        self.assertEqual(by_page[33]["observedRevision"], 809)
        self.assertEqual(by_page[33]["status"], "DRAFT")
        self.assertEqual(by_page[45]["observedRevision"], 810)
        self.assertEqual(by_page[45]["status"], "DRAFT / REVIEW REQUIRED")
        self.assertIn("production aliases", by_page[45]["scope"])
        self.assertEqual(by_page[27]["pageId"], "acf5f619-7d81-80da-8008-c5cad7f94014")
        self.assertEqual(by_page[27]["boardId"], "acf5f619-7d81-80da-8008-c5cb90d6963b")
        self.assertEqual(by_page[27]["observedRevision"], 840)
        self.assertEqual(by_page[27]["status"], "DRAFT / native schema aligned; public promotion remains gated")
        self.assertEqual(by_page[52]["status"], "OPTION B SELECTED / PREVIEW ONLY")
        self.assertEqual(by_page[53]["status"], "OPTION A SELECTED / PREVIEW ONLY / PUBLIC API OPEN")
        self.assertEqual(by_page[54]["status"], "OPTION A SELECTED / PROTOTYPE ONLY / NATIVE ACCEPTANCE OPEN")
        self.assertEqual(by_page[55]["status"], "DRAFT / EXACT VALUES NOT APPROVED")
        self.assertEqual(by_page[52]["observedRevision"], 833)
        self.assertEqual(by_page[53]["observedRevision"], 833)
        self.assertEqual(by_page[54]["observedRevision"], 836)
        self.assertEqual(by_page[55]["observedRevision"], 833)
        self.assertIn("public immutable PortalThemeScope value object", by_page[54]["scope"])

    def test_native_penpot_schema_audit_is_recorded_and_green(self):
        audit = self.policy["latestValidation"]["nativePenpotTokenAudit"]
        self.assertEqual(audit["fileId"], "b64f6665-c9ab-80b5-8008-c4ac99d9d000")
        self.assertEqual(audit["date"], "2026-11-20")
        self.assertEqual(audit["revision"], 883)
        self.assertEqual(audit["result"], "PASS")
        self.assertEqual(audit["assertions"], 1285)
        self.assertEqual(audit["passed"], 1285)
        self.assertEqual(audit["failed"], 0)
        self.assertEqual(audit["restoredActiveThemes"], [
            {"group": "Bluent v3 / Mode", "name": "Light · Draft"},
            {"group": "Bluent v3 / Brand×Mode (Preview)", "name": "default / light"},
        ])
        self.assertEqual(audit["logicalTokenCounts"], {"source": 16, "semantic": 17, "component": 13, "total": 46})
        self.assertEqual(audit["nativeBrandThemes"], 20)
        self.assertEqual(audit["brandPaletteTokenCountPerTheme"], 8)
        self.assertEqual(audit["revision"], 883)
        self.assertEqual(self.policy["latestValidation"]["penpot"]["currentRevision"], 883)
        self.assertEqual(audit["totalNativeTokenSets"], 45)
        self.assertEqual(audit["totalNativeTokenEntries"], 492)
        self.assertEqual(audit["activeModeTokenSets"], 17)
        self.assertEqual(audit["activeModeTokenEntries"], 262)
        self.assertFalse(audit["legacyLinkSourceAliasesRemaining"])
        self.assertEqual(audit["totalNativeTokenSets"], 45)
        self.assertEqual(audit["totalNativeTokenEntries"], 492)
        self.assertEqual(audit["activeModeTokenSets"], 17)
        self.assertEqual(audit["activeModeTokenEntries"], 262)

    def test_generated_brand_matrix_design_metadata_matches_schema(self):
        matrix = json.loads((ROOT / "docs/v3/tokens/issue-418-brand-matrix.preview.json").read_text(encoding="utf-8"))
        self.assertEqual(matrix["design"], self.data["design"])

    def test_native_penpot_audit_script_is_stored(self):
        source = (ROOT / "scripts/quality/penpot_v3_issue418_token_schema_audit.js").read_text(encoding="utf-8")
        self.assertIn("b64f6665-c9ab-80b5-8008-c4ac99d9d000", source)
        self.assertIn("Bluent v3 / Brand×Mode (Preview)", source)
        for token in ("bluent.color.foreground4", "bluent.color.brandForegroundLink", "bluent.semantic.text.placeholder", "bluent.semantic.text.dangerAccessible", "bluent.component.badge.dangerTextAccessible"):
            self.assertIn(token, source)
        self.assertIn("finally", source)
        self.assertIn("initialThemes", source)
    def test_historical_windows_release_and_browser_acceptance_is_preserved(self):
        windows = self.policy["latestValidation"]["windowsAcceptance"]
        self.assertEqual(windows["head"], "ecce36cc52ae9903114c4c104c9b0a029e09c220")
        self.assertEqual(windows["date"], "2026-11-17")
        self.assertEqual(windows["releaseValidation"]["releaseBuildWarningsAsErrors"], "PASS; 0 warnings; 0 errors")
        self.assertEqual(windows["releaseValidation"]["solutionTests"], "140/140")
        self.assertEqual(windows["releaseValidation"]["issue418Review"], "13/13")
        self.assertEqual(windows["releaseValidation"]["additiveApiLedger"], "8/8")
        self.assertEqual(windows["browserRuntime"]["wasmChrome"]["checks"], 1179)
        self.assertEqual(windows["browserRuntime"]["wasmEdge"]["passed"], 1179)
        self.assertEqual(windows["browserRuntime"]["forcedColorsChrome"]["passed"], 299)
        self.assertEqual(windows["browserRuntime"]["forcedColorsEdge"]["passed"], 299)
        self.assertEqual(windows["browserRuntime"]["serverFirefox"]["passed"], 34)
        self.assertEqual(windows["browserRuntime"]["serverWebKit"]["passed"], 34)
        self.assertFalse(windows["nativeWindows"]["contrastThemesEnabled"])
        self.assertFalse(windows["nativeWindows"]["narratorRunning"])
        self.assertFalse(windows["nativeWindows"]["nvdaInstalled"])
        self.assertEqual(self.policy["latestValidation"]["githubActions"]["success"], 13)
        self.assertEqual(self.policy["latestValidation"]["exactHead"], "9c5ec655f60e5d31a8553635527aed21b36750fa")

    def test_native_os_and_screen_reader_acceptance_remains_open(self):
        windows = self.policy["latestValidation"]["windowsAcceptance"]["nativeWindows"]
        self.assertIn("not native Windows Contrast Themes", windows["acceptance"])
        remaining = " ".join(self.policy["latestValidation"]["remainingAcceptance"])
        self.assertIn("Native spoken NVDA/Narrator/VoiceOver", remaining)
        self.assertIn("Native Windows Contrast Themes", remaining)
        self.assertIn("Native Safari.app/SafariDriver", remaining)
        self.assertIn("Persian OS IME", remaining)
    def test_latest_exact_head_validation_is_recorded_without_claiming_native_acceptance(self):
        current = self.policy["latestValidation"]
        self.assertEqual(current["exactHead"], "9c5ec655f60e5d31a8553635527aed21b36750fa")
        self.assertEqual(current["githubActions"], {
            "workflows": 13, "success": 13, "failure": 0, "pending": 0, "allExactHead": True,
            "includes": current["githubActions"]["includes"]
        })
        self.assertEqual(current["localRelease"]["solutionTests"], "140/140")
        self.assertEqual(current["currentDev01Verification"]["solutionTests"], "188/188")
        self.assertEqual(current["currentDev01Verification"]["focusedIssue418ReviewContract"], "19/19")
        self.assertEqual(current["currentDev01Verification"]["focusedRegressionSuites"]["total"], "65/65")
        self.assertEqual(current["currentDev01Verification"]["browserRuntimeLocal"]["edgeInteractiveServer"], "1178/1178")
        self.assertEqual(current["penpot"]["currentRevision"], 883)
        self.assertIn("Native spoken NVDA/Narrator/VoiceOver", current["remainingAcceptance"][0])
        self.assertIn("Safari.app/SafariDriver", current["remainingAcceptance"][2])
        native = current["currentNativeEnvironment"]
        self.assertFalse(native["windows"]["highContrastOn"])
        self.assertEqual(native["windows"]["dwFlags"], 126)
        self.assertFalse(native["windows"]["settingsChanged"])
        self.assertTrue(native["nvda"]["installed"])
        self.assertTrue(native["nvda"]["running"])
        self.assertEqual(native["nvda"]["version"], "2026.3")
        self.assertFalse(native["nvda"]["spokenOutputCaptured"])
        self.assertFalse(native["nvda"]["speechLogFound"])
        self.assertFalse(native["safari"]["nativeSafariAppRun"])
        self.assertFalse(native["persianIme"]["compositionCaretSelectionTested"])
        self.assertEqual(current["githubActions"]["workflows"], 13)
        self.assertEqual(current["githubActions"]["success"], 13)

    def test_public_vocabulary_selected_but_aliases_not_shipped(self):
        proposal = self.policy["publicVocabularyProposal"]
        self.assertEqual(proposal["status"], "Option B selected 2026-11-16; production/public API promotion remains gated by design and acceptance review")
        self.assertEqual(proposal["recommendedOption"], "B")
        self.assertIn("bluent.source.*", proposal["options"]["B"])
        alias = proposal["productionAliasPolicy"]
        self.assertEqual(alias["status"], "Option B alias direction selected 2026-11-16; no aliases approved for production by this record")
        self.assertEqual(alias["prefix"], "--bui-v3-*")
        self.assertIn("Explicit v3 opt-in scope", alias["scope"])
        self.assertIn("Never repurpose", alias["compatibility"])
        self.assertIn("excluded from production package", alias["publishing"])

    def test_typography_and_media_limits_are_explicit(self):
        policy = self.policy["typographyAndMediaBoundary"]
        self.assertIn("Segoe UI", policy["productionFontSourceOfTruth"])
        self.assertIn("native Persian OS IME composition/caret/selection", policy["browserEvidenceDoesNotApprove"])
        self.assertIn("native screen-reader speech", policy["browserEvidenceDoesNotApprove"])

    def test_delegated_foundation_decisions_are_explicit_but_not_shipped(self):
        decisions = self.policy["selectedDecisions"]
        self.assertEqual(decisions["date"], "2026-11-16")
        self.assertEqual(decisions["publicTokenVocabulary"]["option"], "B")
        self.assertFalse(decisions["publicTokenVocabulary"]["productionApproval"])
        self.assertEqual(decisions["focusHost"]["option"], "A")
        self.assertFalse(decisions["focusHost"]["productionApiApproval"])
        self.assertIn("same actual painted host", decisions["focusHost"]["contractDirection"])
        self.assertEqual(decisions["portalOwnership"]["option"], "A")
        self.assertIn("immutable snapshot at ShowAsync", decisions["portalOwnership"]["dialog"])
        self.assertIn("Private implementation identity", decisions["portalOwnership"]["ownerIdentity"])
        self.assertFalse(decisions["portalOwnership"]["productionApiApproval"])
        scope_value = decisions["portalOwnership"]["publicScopeValueType"]
        self.assertEqual(scope_value["name"], "Bluent.UI.Components.PortalThemeScope")
        self.assertIn("CascadingValue", scope_value["whyPublic"])
        self.assertFalse(decisions["portalOwnership"]["newOwnerId"])
        self.assertFalse(decisions["portalOwnership"]["newLauncherComponent"])
        self.assertFalse(decisions["portalOwnership"]["newDialogAccessibilityOptions"])
        delta = self.policy["publicApiDelta"]
        self.assertEqual(len(delta["newExportedTypes"]), 1)
        self.assertEqual(len(delta["addedPublicMembers"]["Bluent.UI.Components.DialogConfigurator"]), 6)
        self.assertEqual(len(delta["addedPublicMembers"]["DialogConfiguration"]), 7)
        self.assertEqual(len(delta["addedPublicMembers"]["Bluent.UI.Components.Dialog"]), 9)
        self.assertIn("No existing public member signatures were removed or changed", delta["compatibility"])
        self.assertEqual(decisions["darkBrandForeground"]["brands"], 10)
        self.assertEqual(decisions["darkBrandForeground"]["minimumCandidateContrast"], 4.6001)
        self.assertFalse(decisions["darkBrandForeground"]["productionCssApproved"])
        self.assertIn("Label decorative required marker only", decisions["danger"]["semanticTextDangerAccessible"])
        self.assertIn("DRAFT/REVIEW REQUIRED", decisions["publicationBoundary"])
        self.assertEqual(self.data["darkBrandForegroundPreview"]["selection"]["status"], "Selected opt-in preview target; exact public token names and production CSS remain unapproved.")


    def test_semantic_role_review_inventory_is_complete_and_review_only(self):
        document = (ROOT / "docs/v3/tokens/PUBLIC-TOKEN-VOCABULARY-PROPOSAL.md").read_text(encoding="utf-8")
        marker = "## 2026-11-20 semantic role inventory — review only"
        self.assertEqual(document.count(marker), 1)
        section = marker + document.split(marker, 1)[1]
        role_rows = [line for line in section.splitlines() if line.startswith("| bluent.semantic.")]
        documented = [line.split("|", 2)[1].strip() for line in role_rows]
        expected = {item["name"] for item in self.layers["semantic"]}
        self.assertEqual(len(documented), 17)
        self.assertEqual(len(set(documented)), 17)
        self.assertEqual(set(documented), expected)
        self.assertIn("review only", section.lower())
        self.assertIn("does not update", section)
        self.assertIn("final allow-list and production promotion remain open", section.lower())

    def test_first_wave_semantic_candidates_are_narrow_and_traceable(self):
        document = (ROOT / "docs/v3/tokens/PUBLIC-TOKEN-VOCABULARY-PROPOSAL.md").read_text(encoding="utf-8")
        section = document.split("## 2026-11-20 semantic role inventory \u2014 review only", 1)[1]
        rows = [line for line in section.splitlines() if line.startswith("| bluent.semantic.")]
        first_wave = {
            line.split("|", 2)[1].strip()
            for line in rows if "FIRST-WAVE CANDIDATE" in line
        }
        self.assertEqual(first_wave, {
            "bluent.semantic.text.primary",
            "bluent.semantic.text.disabled",
            "bluent.semantic.text.placeholder",
        })
        danger = next(line for line in rows if line.startswith("| bluent.semantic.text.dangerAccessible"))
        self.assertIn("Label required marker only", danger)
        self.assertIn("KEEP OUT OF THE FIRST-WAVE PUBLIC LIST", danger)
        status_danger = next(line for line in rows if line.startswith("| bluent.semantic.status.danger"))
        self.assertIn("4.164:1", status_danger)
        self.assertIn("non-text", status_danger)

    def test_link_component_acceptance_does_not_promote_semantic_link_aliases(self):
        document = (ROOT / "docs/v3/tokens/PUBLIC-TOKEN-VOCABULARY-PROPOSAL.md").read_text(encoding="utf-8")
        section = document.split("## 2026-11-20 semantic role inventory \u2014 review only", 1)[1]
        for name in (
            "bluent.semantic.link.foregroundRest",
            "bluent.semantic.link.foregroundHover",
            "bluent.semantic.link.foregroundPressed",
        ):
            row = next(line for line in section.splitlines() if line.startswith(f"| {name}"))
            self.assertIn("Link #431", row)
            self.assertIn("existing", row.lower())
            self.assertIn("Defer", row)

    def test_option_b_decision_table_no_longer_marks_selected_direction_pending(self):
        document = (ROOT / "docs/v3/tokens/PUBLIC-TOKEN-VOCABULARY-PROPOSAL.md").read_text(encoding="utf-8")
        table = document.split("## Required maintainer decisions", 1)[1].split("## Deliberately not decided by this proposal", 1)[0]
        self.assertIn("**Selected 2026-11-16**", table)
        self.assertIn("**Selected — Option B**", table)
        self.assertIn("First-wave semantic candidates", table)
        self.assertIn("**Pending**", table)
        self.assertNotIn("| Source namespace | Internal implementation mapping | Pending |", table)


    def test_datefield_consumer_audit_keeps_validation_semantic_review_only(self):
        audit_path = ROOT / "docs/v3/tokens/DATEFIELD-FOUNDATION-DEPENDENCY-AUDIT.md"
        audit = audit_path.read_text(encoding="utf-8-sig")
        self.assertIn("semantic.text.validation", audit)
        self.assertIn("do not add this role to the current 17-role schema", audit)
        self.assertIn("text.dangerAccessible", audit)
        self.assertIn("Label-only", audit)
        self.assertIn("status.danger", audit)
        self.assertIn("non-text", audit)
        self.assertIn("DateClass", audit)
        self.assertIn("YearSelect", audit)
        self.assertIn("DateField #438", audit)

        semantic_names = {item["name"] for item in self.layers["semantic"]}
        self.assertEqual(len(semantic_names), 17)
        self.assertNotIn("bluent.semantic.text.validation", semantic_names)
if __name__ == "__main__":
    unittest.main()
