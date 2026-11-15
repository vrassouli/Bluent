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

    def test_portal_prototype_does_not_claim_a_public_api(self):
        portal = self.policy["portalBoundary"]
        self.assertFalse(portal["shippingPublicApiApproved"])
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
        self.assertEqual(set(by_page), {30, 33, 45})
        self.assertTrue(all(item["fileId"] == "b64f6665-c9ab-80b5-8008-c4ac99d9d000" for item in records))
        self.assertEqual(by_page[30]["observedRevision"], 808)
        self.assertEqual(by_page[30]["status"], "DRAFT")
        self.assertEqual(by_page[33]["observedRevision"], 809)
        self.assertEqual(by_page[33]["status"], "DRAFT")
        self.assertEqual(by_page[45]["observedRevision"], 810)
        self.assertEqual(by_page[45]["status"], "DRAFT / REVIEW REQUIRED")
        self.assertIn("production aliases", by_page[45]["scope"])

    def test_typography_and_media_limits_are_explicit(self):
        policy = self.policy["typographyAndMediaBoundary"]
        self.assertIn("Segoe UI", policy["productionFontSourceOfTruth"])
        self.assertIn("native Persian OS IME composition/caret/selection", policy["browserEvidenceDoesNotApprove"])
        self.assertIn("native screen-reader speech", policy["browserEvidenceDoesNotApprove"])


if __name__ == "__main__":
    unittest.main()
