"""Source-level guard for the separately verified live #501 Penpot audit.

This never substitutes for connecting to Penpot and executing the real audits.
"""
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[2]
SCRIPT=ROOT/"scripts"/"quality"
DESIGN=ROOT/"docs"/"v3"/"design"

class HandoffContract(unittest.TestCase):
    def test_canonical_penpot_file_and_native_variant_identity(self):
        text=(DESIGN/"BUTTON-FOCUS-VISIBLE-CONTRACT.md").read_text(encoding="utf-8")
        for identity in (
            "b64f6665-c9ab-80b5-8008-c4ac99d9d000",
            "535db143-a732-807e-8008-c64d2fb91b9a",
            "535db143-a732-807e-8008-c64f10ae5f75",
            "cd054205-a525-80d8-8008-c853b7ac86f0",
            "Appearance", "Focus", "Visible", "Off",
        ):
            self.assertIn(identity,text)

    def test_native_focus_geometry_and_disabled_guard_are_auditable(self):
        text=(SCRIPT/"penpot_v3_button_focus_alignment_audit.js").read_text(encoding="utf-8")
        for expected in ('[outer,3,"outer"]','[gap,1,"contrast gap"]',
                         'focusPairs===52','labels===5&&splitTargets===4',
                         'native?.variants?.variantComponents()?.length===10',
                         'original?.variants?.variantComponents()?.length===25'):
            self.assertIn(expected,text)
        self.assertIn("Disabled",text)
        self.assertIn('Focus==="Off"',text)

    def test_real_keyboard_probe_and_documentation_have_known_semantic_gap(self):
        runtime=(SCRIPT/"probe_v3_button_focus_runtime.mjs").read_text(encoding="utf-8")
        docs=(DESIGN/"BUTTON-FOCUS-BROWSER-EVIDENCE.md").read_text(encoding="utf-8")
        for expected in ("Input.dispatchKeyEvent", "forced-colors", "Split", "Tab", "Enter", "Space"):
            self.assertIn(expected,runtime)
        for expected in ("aria-pressed", "Static SSR", "InteractiveServer", "17/17"):
            self.assertIn(expected,docs)

    def test_maintainer_brand_focus_selection_is_documented_and_auditable(self):
        text=(DESIGN/"BUTTON-FOCUS-BRAND-REVIEW.md").read_text(encoding="utf-8")
        audit=(SCRIPT/"penpot_v3_button_brand_review_audit.js").read_text(encoding="utf-8")
        for value in (
            "94a03b1b-8cb6-8091-8008-c8b9bae47e45",
            "bluent.semantic.border.focus",
            "TextField",
            "#1267B4", "#18599B", "2px", "3px",
            "contrast", "Focus2",
        ):
            self.assertIn(value,text)
        for value in (
            "94a03b1b-8cb6-8091-8008-c8b9bae47e45",
            "FIELD FOCUS INDICATOR · BOTTOM ONLY",
            "BRAND FOCUS · SINGLE OUTLINE",
            'ring.tokens?.strokeColor==="bluent.semantic.border.focus"',
            "variantComponents()?.length===10",
        ):
            self.assertIn(value,audit)
        self.assertIn("1.94–2.15",text)
        self.assertIn("**not** a claim",text)
    def test_selected_danger_has_independent_review_contract(self):
        review=(DESIGN/"BUTTON-DANGER-SELECTED-REVIEW-HANDOFF.md").read_text(encoding="utf-8")
        for expected in ("94a03b1b-8cb6-8091-8008-c986fd01b85f","61/61",
                         "535db143-a732-807e-8008-c64f10ae5f75",
                         "colorPaletteRedForeground2", "data-bui-v3-danger-toggle",
                         "843/843", "Backlog", "NOT approval"):
            self.assertIn(expected,review)
        self.assertIn("orthogonal",review.lower())
        self.assertIn("6f4f48b4-7b1e-800e-8008-c9bc0d7c44fa", review)
        self.assertIn("77/77 PASS", review)
        self.assertIn("exported to PNG", review)
        self.assertIn("6f4f48b4-7b1e-800e-8008-c9bc0d7c44fa",
                      (SCRIPT/"penpot_v3_button_danger_selected_audit.js").read_text(encoding="utf-8"))
        self.assertIn("Danger selection review",
            (DESIGN/"BUTTON-FOCUS-IMPLEMENTATION-HANDOFF.md").read_text(encoding="utf-8"))

    def test_native_host_context_research_is_reproducible_and_explicitly_unapproved(self):
        review=(DESIGN/"BUTTON-FOCUS-HOST-CONTEXT-NATIVE-REVIEW.md").read_text(encoding="utf-8")
        audit=(SCRIPT/"penpot_v3_button_host_context_audit.js").read_text(encoding="utf-8")
        for expected in (
            "f4136a9a-101d-8004-8008-ca2956fe05f9",
            "b64f6665-c9ab-80b5-8008-c4ac99d9d000",
            "78/78", "85 native", "100/100", "3.103:1",
            "not yet a public token/API decision",
            "underline", "colorNeutralForegroundOnBrand",
            "NOT approved",
        ):
            self.assertIn(expected.lower(), review.lower())
        for expected in (
            "f4136a9a-101d-8004-8008-ca2956fe05f9",
            "color",
            "Neutral", "BrandHover", "Danger", "Inverted",
            "2px", "3px", "contrast", "errors",
            "DESIGN PROPOSAL",
        ):
            self.assertIn(expected, audit)
        self.assertIn("page.getShapeById", audit)
        self.assertNotIn("createBoard(", audit)
        self.assertNotIn("createRectangle(", audit)

    def test_handoff_skill_does_not_claim_final_approval(self):
        skill=(ROOT/".agents"/"skills"/"bluent-v3-button-focus"/"SKILL.md").read_text(encoding="utf-8")
        for expected in ("#418", "#428", "#501", "Penpot", "not approved"):
            self.assertIn(expected,skill)

if __name__=="__main__":
    unittest.main()
