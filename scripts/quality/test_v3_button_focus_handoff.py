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

    def test_handoff_skill_does_not_claim_final_approval(self):
        skill=(ROOT/".agents"/"skills"/"bluent-v3-button-focus"/"SKILL.md").read_text(encoding="utf-8")
        for expected in ("#418", "#428", "#501", "Penpot", "not approved"):
            self.assertIn(expected,skill)

if __name__=="__main__":
    unittest.main()
