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
        self.assertEqual(focus["modeAttribute"],"data-bui-v3-focus-mode")
        self.assertEqual(focus["outputCssVariable"],VAR)
        for mode in ("light","dark"):
            self.assertEqual(tuple(focus[mode]),HOST_CHOICES)
            for host in HOST_CHOICES:
                fragment=('[data-bui-v3-tokens] [data-bui-v3-focus-mode="'+mode+'"]'
                          '[data-bui-v3-focus-host="'+host+'"]')
                self.assertIn(fragment,self.css)
                self.assertIn(VAR+": var("+focus[mode][host]+");",self.css)
        self.assertIn("@media (forced-colors: active)",self.css)
        self.assertIn("data-bui-v3-focus-mode must be explicit on the host",self.css)

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
        for field,value in (("modeAttribute","data-bui-theme"),
                            ("outputCssVariable","--colorStrokeFocus2"),
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
        self.assertIn('id="v3-lab-switch-theme"', razor)
        self.assertIn('id="v3-lab-switch-brand"', razor)
        browser=(SCHEMA.parents[3]/"scripts/quality/probe_v3_blazor_runtime.mjs").read_text(encoding="utf-8")
        self.assertIn('Blazor UI click: independent brand/theme Focus hosts',browser)
        self.assertIn('!row.productTheme',browser)
        self.assertIn('id="v3-nested-word-focus"',razor)
        self.assertIn('data-bui-v3-focus-mode="@AlternateScope.Mode"',razor)
        self.assertIn('nestedFocus',browser)
        self.assertIn('data-v3-portal-focus-fixture',razor)
        self.assertIn('id="v3-word-popover-focus"',razor)
        self.assertIn('approved generated neutral Focus alias survives real Word Popover portal',browser)
        self.assertIn('Word detached Popover Focus uses system Highlight in forced-colors',browser)
        portal_css=(SCHEMA.parents[3]/"src/Bluent.UI.Demo.Pages/wwwroot/v3/issue-418-portal-focus.opt-in.preview.css").read_text(encoding="utf-8")
        self.assertIn('[data-bui-v3-tokens] [data-v3-portal-focus-fixture] .bui-button:focus-visible',portal_css)
        self.assertIn('outline: 2px solid var(--bui-v3-focus-host-ring-candidate)',portal_css)
        self.assertNotIn('--colorBrandBackground',portal_css)
        self.assertIn('--v3-lab-focus: var(--bui-v3-focus-host-ring-candidate);',css)
        self.assertIn('browser.exitCode!==null&&browser.exitCode!==0',browser)
        self.assertIn('BLUENT_V3_418_OWNED_PROFILE',browser)
        self.assertIn('cleanupOwnedBrowser();',browser)
        self.assertEqual(razor.count('data-bui-theme="@(_dark ? "dark" : "light")"'),1) # real product Theme only on root
        self.assertEqual(razor.count('data-bui-v3-focus-mode="@(_dark ? "dark" : "light")"'),5)
        approved=css.split('/* The approved focus comes from the generated, opt-in schema only.',1)[1].split('/* 320 CSS px',1)[0]
        self.assertIn('--v3-lab-focus: var(--bui-v3-focus-host-ring-candidate);',approved)
        self.assertNotIn('--colorNeutralForegroundOnBrand',approved)
        self.assertNotIn('--colorBrandForeground2',approved)
        self.assertNotIn('--colorBrandBackground',approved)


if __name__=="__main__":
    unittest.main()
