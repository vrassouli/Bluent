"""#552 Wave E original Chrome/Edge native keyboard evidence; not an AT/Fluent certification."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
E=ROOT/"docs/v3/quality/evidence"
KINDS=("tab","nav","accordion","menu-disabled","menu-enabled")
MODES=("light-ltr","dark-rtl","forced-colors")
class NativeKeyboardEvidence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.records={e:json.loads((E/f"BLUENT-KEYBOARD-{e}.json").read_text(encoding="utf-8")) for e in ("CHROME","EDGE")}
    def test_original_app_and_scope_provenance(self):
        for engine,d in self.records.items():
            self.assertEqual(552,d["issue"])
            self.assertEqual("8141cd77",d["sourceRef"])
            self.assertEqual(engine.lower(),d["engine"])
            self.assertIn("original unchanged Bluent WebAssembly",d["host"])
            self.assertIn("NOT Fluent parity",d["status"])
    def test_real_browser_cases_and_positive_fixture_checks(self):
        for d in self.records.values():
            self.assertEqual(75,len(d["checks"]))
            self.assertTrue(all(c["pass"] for c in d["checks"]))
            self.assertEqual(15,len(d["cases"]))
            self.assertEqual([(m,k) for m in MODES for k in KINDS],[(c["mode"],c["kind"]) for c in d["cases"]])
    def test_native_tab_focuses_actual_first_tab_from_existing_predecessor(self):
        for d in self.records.values():
            for c in d["cases"]:
                if c["kind"]!="tab":continue
                k=c["keyboard"]
                self.assertTrue(k["setup"]["priorFocused"])
                self.assertTrue(k["afterTab"]["focused"])
                self.assertEqual("BUTTON",k["afterTab"]["activeTag"])
                self.assertEqual(0,k["afterTab"]["tabIndex"])
                self.assertTrue(k["direct"])
    def test_arrow_right_left_do_not_move_tab_focus_or_selection(self):
        for d in self.records.values():
            for c in d["cases"]:
                if c["kind"]!="tab":continue
                k=c["keyboard"]
                self.assertTrue(k["arrowRight"]["focused"])
                self.assertTrue(k["arrowLeft"]["focused"])
                self.assertTrue(k["arrowRight"]["selected"])
                self.assertTrue(k["arrowLeft"]["selected"])
                self.assertIsNone(k["arrowRight"]["ariaSelected"])
                self.assertEqual("button",c["before"]["ax"][0]["role"])
                self.assertNotEqual("First Tab",c["before"]["ax"][0]["name"])
    def test_real_enter_and_space_activate_tab_selection(self):
        for d in self.records.values():
            for c in d["cases"]:
                if c["kind"]!="tab":continue
                k=c["keyboard"]
                self.assertTrue(k["secondBeforeEnter"]["focused"])
                self.assertFalse(k["secondBeforeEnter"]["selected"])
                self.assertFalse(k["enter"]["selected"])
                self.assertTrue(k["space"]["selected"])
    def test_expandable_nav_and_accordion_not_native_focusable(self):
        for d in self.records.values():
            for c in d["cases"]:
                if c["kind"] not in ("nav","accordion"):continue
                k=c["keyboard"]
                self.assertEqual("DIV",k["afterFocus"]["tag"])
                self.assertEqual(-1,k["afterFocus"]["tabIndex"])
                self.assertFalse(k["direct"])
                self.assertFalse(k["afterTab"]["focused"])
                self.assertTrue(k["skippedNonFocusableKeyActivation"])
                self.assertIsNone(k["enter"])
                self.assertIsNone(k["space"])
    def test_menu_enabled_and_disabled_both_not_focusable(self):
        for d in self.records.values():
            for c in d["cases"]:
                if not c["kind"].startswith("menu-"):continue
                k=c["keyboard"]
                self.assertEqual("DIV",c["before"]["tag"])
                self.assertEqual(-1,k["afterFocus"]["tabIndex"])
                self.assertFalse(k["direct"])
                self.assertFalse(k["afterTab"]["focused"])
                self.assertTrue(k["skippedNonFocusableKeyActivation"])
                self.assertEqual(c["kind"]=="menu-disabled",c["before"]["disabled"])
    def test_actual_mode_settings_and_png_binary(self):
        for engine,d in self.records.items():
            for c in d["cases"]:
                self.assertEqual("rtl" if c["mode"]=="dark-rtl" else "ltr",c["setup"]["dir"])
                self.assertEqual(c["mode"]=="forced-colors",c["setup"]["forced"])
                p=E/c["image"]
                self.assertTrue(p.name.startswith("BLUENT-KEYBOARD-"+engine))
                self.assertGreater(p.stat().st_size,3000)
                self.assertEqual(bytes((137,80,78,71,13,10,26,10)),p.read_bytes()[:8])
    def test_native_browser_cdp_not_synthetic_element_events(self):
        source=(ROOT/"scripts/quality/probe_v3_cross_component_keyboard.mjs").read_text(encoding="utf-8")
        for phrase in ("Input.dispatchKeyEvent","keyDown","keyUp","ArrowRight","ArrowLeft","Space","Enter","bluent552-keyboard-"):
            self.assertIn(phrase,source)
        self.assertNotIn("dispatchEvent(new KeyboardEvent(",source)
        self.assertNotIn("taskkill /IM",source)
    def test_scope_cautions_and_explicit_owner_handoffs(self):
        doc=(ROOT/"docs/v3/quality/FLUENT-PARITY-CROSS-CONTROL-KEYBOARD.md").read_text(encoding="utf-8")
        for term in ("#465","#466","#469","#507","#517","#429","#420","Draft","not","screen-reader","diagnostic"):
            self.assertIn(term.lower(),doc.lower())
if __name__=="__main__":unittest.main()
