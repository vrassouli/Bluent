"""#418 v3 focus host opt-in CSS contract: approved visual mapping, no public API."""
from __future__ import annotations

import copy
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate_v3_token_preview import CSS_OUT, SCHEMA, THEME_DIR, contract, load_source_tokens
from audit_v3_token_preview_contrast import contrast
from audit_v3_focus_host_surface_matrix import HOSTS

HOST_CHOICES=("neutral","brand","brandHover","danger","inverted")
VAR="--bui-v3-focus-host-ring-candidate"


class FocusHostTokenContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema=json.loads(SCHEMA.read_text(encoding="utf-8"))
        cls.css=CSS_OUT.read_text(encoding="utf-8")

    def test_generated_preview_is_in_sync_and_not_a_public_button_rule(self):
        actual,matrix=contract(self.schema)
        self.assertEqual(actual,self.css)
        self.assertEqual(len(matrix["brands"]),10)
        self.assertEqual(len(self.schema["layers"]["source"]),12)
        self.assertEqual(len(self.schema["layers"]["semantic"]),13)
        self.assertEqual(len(self.schema["layers"]["component"]),10)
        self.assertNotIn(".bui-button",actual)
        self.assertNotIn("outline-color:",actual)
        self.assertNotIn(":root {",actual)
        self.assertEqual(actual.count(VAR+": var("),10)
        self.assertEqual(actual.count(VAR+": Highlight;"),1)

    def test_approved_contexts_are_mode_scoped_and_explicit(self):
        focus=self.schema["focusHostPreview"]
        self.assertEqual(focus["penpotBoardId"],"f4136a9a-101d-8004-8008-ca2956fe05f9")
        self.assertEqual(focus["hostAttribute"],"data-bui-v3-focus-host")
        self.assertEqual(focus["outputCssVariable"],VAR)
        for mode in ("light","dark"):
            self.assertEqual(tuple(focus[mode]),HOST_CHOICES)
            for host in HOST_CHOICES:
                fragment=('[data-bui-v3-tokens] [data-bui-theme="'+mode+'"]'
                          '[data-bui-v3-focus-host="'+host+'"]')
                self.assertIn(fragment,self.css)
                self.assertIn(VAR+": var("+focus[mode][host]+");",self.css)
        self.assertIn("@media (forced-colors: active)",self.css)
        self.assertIn("data-bui-theme must be declared on the same focus host",self.css)

    def test_source_host_color_contrast_all_hundred_cases(self):
        focus=self.schema["focusHostPreview"]
        outcomes=[]
        for brand in self.schema["supportedBrands"]:
            for mode in ("light","dark"):
                colors=load_source_tokens(THEME_DIR/("theme-"+brand+"-"+mode+".css"),
                    sorted(set(HOSTS.values())|set(focus[mode].values())))
                for host,background in HOSTS.items():
                    ratio=contrast(colors[focus[mode][host]],colors[background])
                    outcomes.append(ratio)
                    self.assertGreaterEqual(ratio,3,(brand,mode,host,ratio))
        self.assertEqual(len(outcomes),100)
        self.assertGreaterEqual(min(outcomes),3.1)

    def test_forbid_silent_light_dark_role_swap(self):
        tampered=copy.deepcopy(self.schema)
        tampered["focusHostPreview"]["dark"]["inverted"]="--colorNeutralForegroundOnBrand"
        with self.assertRaisesRegex(ValueError,"Approved focus host-role mapping changed"):
            contract(tampered)

    def test_forbid_silent_unapproved_public_name_or_host_attribute(self):
        for field,value in (("outputCssVariable","--colorStrokeFocus2"),
                            ("hostAttribute","data-some-inferred-background")):
            tampered=copy.deepcopy(self.schema)
            tampered["focusHostPreview"][field]=value
            with self.subTest(field=field),self.assertRaisesRegex(ValueError,"Unreviewed focus"):
                contract(tampered)


    def test_real_blazor_host_cards_declare_generated_token_roles(self):
        razor=(SCHEMA.parents[3]/"src/Bluent.UI.Demo.Pages/Pages/Scenarios/V3StylingLab.razor").read_text(encoding="utf-8-sig")
        css=(SCHEMA.parents[3]/"src/Bluent.UI.Demo.Pages/Pages/Scenarios/V3StylingLab.razor.css").read_text(encoding="utf-8-sig")
        for kind in HOST_CHOICES:
            self.assertIn('data-v3-focus-host="'+kind+'" data-bui-v3-focus-host="'+kind+'"',razor)
        self.assertEqual(razor.count('data-bui-theme="@(_dark ? "dark" : "light")"'),6) # root + five explicit host cards
        approved=css.split('/* The approved focus comes from the generated, opt-in schema only.',1)[1].split('/* 320 CSS px',1)[0]
        self.assertIn('--v3-lab-focus: var(--bui-v3-focus-host-ring-candidate);',approved)
        self.assertNotIn('--colorNeutralForegroundOnBrand',approved)
        self.assertNotIn('--colorBrandForeground2',approved)
        self.assertNotIn('--colorBrandBackground',approved)


if __name__=="__main__":
    unittest.main()
