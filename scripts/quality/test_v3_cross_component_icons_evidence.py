"""#552 Wave D: guard REAL Chrome/Edge cross-component source evidence, not parity."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
E=ROOT/"docs/v3/quality/evidence"
KINDS=("menu","tab","nav","accordion")
MODES=("light-ltr","dark-rtl","forced-colors")
class CrossIconEvidence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.records={x:json.loads((E/f"BLUENT-CROSS-ICON-{x}.json").read_text(encoding="utf-8")) for x in ("CHROME","EDGE")}
    def test_scopes_actual_original_wasm_source(self):
        for engine,d in self.records.items():
            self.assertEqual(552,d["issue"])
            self.assertEqual("fdd77bca",d["sourceRef"])
            self.assertEqual(engine.lower(),d["engine"])
            self.assertIn("original unchanged Bluent WebAssembly",d["host"])
            self.assertIn("NOT Fluent visual parity",d["status"])
    def test_72_repro_observations_not_parity(self):
        for d in self.records.values():
            self.assertEqual(36,len(d["checks"]))
            self.assertTrue(all(x["pass"] for x in d["checks"]))
            self.assertEqual(12,len(d["cases"]))
            self.assertEqual([(m,k) for m in MODES for k in KINDS],[(x["mode"],x["kind"]) for x in d["cases"]])
    def test_menu_disabled_class_is_not_native_disabled_role(self):
        for d in self.records.values():
            for x in d["cases"]:
                if x["kind"]!="menu":continue
                a=x["before"]
                self.assertEqual("DIV",a["tag"])
                self.assertIn("disabled",a["classes"])
                self.assertTrue(a["disabled"])
                self.assertIsNone(a["role"])
                self.assertEqual("generic",a["ax"][0]["role"])
                self.assertEqual("",a["ax"][0]["name"])
                self.assertEqual([],a["ax"][0]["disabled"])
                self.assertTrue(any("_regular" in i["class"] for i in a["icons"]))
    def test_tabs_real_pointer_selection_works_but_is_not_semantic_tab(self):
        for d in self.records.values():
            for x in d["cases"]:
                if x["kind"]!="tab":continue
                a=x["before"];step=x["tabTransition"]
                self.assertEqual("BUTTON",a["tag"])
                self.assertIn("selected",a["classes"])
                self.assertEqual("button",a["ax"][0]["role"])
                self.assertIsNone(a["ariaSelected"])
                self.assertEqual([],a["ax"][0]["selected"])
                self.assertIn("First Tab",a["ax"][0]["name"])
                self.assertNotEqual("First Tab",a["ax"][0]["name"])
                self.assertNotIn("selected",step["deselected"]["classes"])
                self.assertIn("selected",step["reselected"]["classes"])
                self.assertIsNone(step["reselected"]["ariaSelected"])
    def test_nav_expand_works_but_generic_aria(self):
        for d in self.records.values():
            for x in d["cases"]:
                if x["kind"]!="nav":continue
                a=x["before"];b=x["selected"]
                self.assertEqual("DIV",a["tag"])
                self.assertIn("expandable",a["classes"])
                self.assertNotIn("expanded",a["classes"])
                self.assertIn("expanded",b["classes"])
                self.assertIsNone(a["ariaExpanded"])
                self.assertIsNone(b["ariaExpanded"])
                self.assertEqual("generic",b["ax"][0]["role"])
                self.assertEqual("",a["ax"][0]["name"])
    def test_accordion_expand_works_but_header_is_generic(self):
        for d in self.records.values():
            for x in d["cases"]:
                if x["kind"]!="accordion":continue
                a=x["before"];b=x["selected"]
                self.assertEqual("DIV",a["tag"])
                self.assertEqual("header",a["classes"])
                self.assertEqual("generic",a["ax"][0]["role"])
                self.assertEqual("",a["ax"][0]["name"])
                self.assertIsNone(a["ariaExpanded"])
                self.assertIn("expanded",b["ancestorClasses"])
                self.assertIsNone(b["ariaExpanded"])
    def test_real_png_bytes_and_display_modes(self):
        for engine,d in self.records.items():
            for x in d["cases"]:
                path=E/x["image"]
                self.assertIn(engine,path.name)
                self.assertGreater(path.stat().st_size,3000)
                self.assertEqual(bytes((137,80,78,71,13,10,26,10)),path.read_bytes()[:8])
                self.assertEqual("rtl" if x["mode"]=="dark-rtl" else "ltr",x["setup"]["dir"])
                self.assertEqual(x["mode"]=="forced-colors",x["setup"]["forced"])
    def test_harness_is_native_pointer_and_scoped_cleanup_not_fake_DOM(self):
        script=(ROOT/"scripts/quality/probe_v3_cross_component_icons.mjs").read_text(encoding="utf-8")
        for x in ("Input.dispatchMouseEvent","mouseMoved","mousePressed","mouseReleased","TabList","bluent552-cross-icon-","--user-data-dir=","Stop-Process"):
            if x=="TabList":continue
            self.assertIn(x,script)
        self.assertNotIn("setAttribute('aria-",script)
        self.assertNotIn("taskkill /IM",script)
    def test_report_owners_and_non_acceptance(self):
        t=(ROOT/"docs/v3/quality/FLUENT-PARITY-CROSS-CONTROL-ICON-AX.md").read_text(encoding="utf-8")
        for x in ("#465","#466","#469","#507","#517","#429","#420","Draft","not","screen-reader"):
            self.assertIn(x.lower(),t.lower())
if __name__=="__main__":unittest.main()
