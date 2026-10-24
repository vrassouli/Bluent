"""#552: real original Button Icon geometry + Chrome/Edge AX snapshots, not parity signoff."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
E=ROOT/"docs/v3/quality/evidence"
SIZES=("Small","Medium","Large")
MODES=("light-ltr","dark-rtl","forced-colors")
PUA=lambda s: bool(s) and all(0xE000<=ord(c)<=0xF8FF for c in s)
class ButtonIconEvidence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data={}
        for engine in ("CHROME","EDGE"):
            raw=json.loads((E/f"BLUENT-BUTTON-ICON-ALIGN-{engine}.json").read_text(encoding="utf-8"))
            candidate=json.loads((E/f"BLUENT-BUTTON-ICON-ALIGN-{engine}-SEMANTIC-CANDIDATE.json").read_text(encoding="utf-8"))
            cls.data[engine]=(raw,candidate)
    def test_actual_browsers_and_explicit_unmodified_source_scope(self):
        for engine,(raw,candidate) in self.data.items():
            for snap in (raw,candidate):
                self.assertEqual(552,snap["auditIssue"])
                self.assertEqual(428,snap["ownerIssue"])
                self.assertEqual(429,snap["relatedIssue"])
                self.assertEqual("0da72322",snap["sourceRef"])
                self.assertIn("unmodified Bluent WebAssembly",snap["host"])
                self.assertIn("NOT Fluent parity",snap["status"])
                self.assertEqual(engine.lower(),snap["engine"])
            self.assertFalse(raw.get("semanticCandidate",False))
            self.assertTrue(candidate["semanticCandidate"])
    def test_positive_source_and_restored_semantic_checks_have_exact_count(self):
        for raw,candidate in self.data.values():
            self.assertEqual(9,len(raw["checks"]))
            self.assertEqual(45,len(candidate["checks"]))
            self.assertTrue(all(x["pass"] is True for x in raw["checks"]+candidate["checks"]))
            self.assertEqual(list(MODES),[x["mode"] for x in raw["modes"]])
            self.assertEqual(list(MODES),[x["mode"] for x in candidate["modes"]])
    def test_actual_three_sizes_have_zero_layout_box_delta(self):
        dims={"Small":(24,16),"Medium":(32,20),"Large":(40,22)}
        for raw,_ in self.data.values():
            for mode in raw["modes"]:
                self.assertEqual(list(SIZES),[r["size"] for r in mode["rows"]])
                for row in mode["rows"]:
                    self.assertEqual(3,len(row["buttons"]))
                    a,b,c=row["buttons"]
                    self.assertEqual(["text-only","icon-with-text","icon-only"],[x["kind"] for x in row["buttons"]])
                    self.assertEqual(0,b["deltaIconText"])
                    self.assertEqual(0,b["deltaIconButton"])
                    self.assertEqual(0,b["deltaTextButton"])
                    self.assertEqual(0,c["deltaIconButton"])
                    expectedButton,expectedGlyph=dims[row["size"]]
                    self.assertEqual((expectedButton,expectedButton),(c["button"]["width"],c["button"]["height"]))
                    self.assertEqual((expectedGlyph,expectedGlyph),(b["icon"]["width"],b["icon"]["height"]))
    def test_real_pua_defect_on_button_and_label_contamination(self):
        for raw,_ in self.data.values():
            for mode in raw["modes"]:
                for size in SIZES:
                    tree=mode["ax"][size]
                    self.assertEqual(size,tree["text-only"][0]["name"])
                    icononly=tree["icon-only"][0]
                    self.assertEqual("button",icononly["role"])
                    self.assertTrue(PUA(icononly["name"]))
                    withtext=tree["icon-with-text"][0]["name"]
                    self.assertTrue(withtext.startswith(icononly["name"]))
                    self.assertEqual(size+" with icon",withtext[len(icononly["name"]):].strip())
                    info=next(x for r in mode["rows"] if r["size"]==size for x in r["buttons"] if x["kind"]=="icon-only")
                    self.assertIsNone(info["ariaLabel"])
                    self.assertIsNone(info["title"])
    def test_browser_only_semantic_options_clean_name_and_restore(self):
        for _,candidate in self.data.values():
            for mode in candidate["modes"]:
                for size in SIZES:
                    exp=mode["semanticExperiment"][size]
                    self.assertEqual(size+" with icon",exp["textAfter"][0]["name"])
                    self.assertEqual("Cursor-click example",exp["iconOnlyAfter"][0]["name"])
                    self.assertEqual(exp["before"]["icon-with-text"],exp["restoredText"])
                    self.assertEqual(exp["before"]["icon-only"],exp["restoredOnly"])
    def test_real_screenshots_for_all_browsers_and_modes(self):
        for engine,(raw,candidate) in self.data.items():
            for record in (raw,candidate):
                for mode in record["modes"]:
                    p=E/mode["screenshot"]
                    self.assertIn(engine,p.name)
                    self.assertGreater(p.stat().st_size,2000)
                    self.assertEqual(bytes((137,80,78,71,13,10,26,10)),p.read_bytes()[:8])
    def test_harness_is_explicit_and_scope_is_pure_browser(self):
        js=(ROOT/"scripts/quality/probe_v3_button_icon_alignment.mjs").read_text(encoding="utf-8")
        self.assertIn("const semanticCandidate=process.argv[3]==='semantic-candidate'",js)
        self.assertIn("setAttribute('aria-hidden','true')",js)
        self.assertIn("setAttribute('aria-label','Cursor-click example')",js)
        self.assertIn("removeAttribute('aria-hidden')",js)
        self.assertIn("removeAttribute('aria-label')",js)
        self.assertIn("--user-data-dir='+profile",js)
        self.assertNotIn("taskkill /IM",js)
    def test_documented_owner_and_boundaries_not_falsely_approved(self):
        s=(ROOT/"docs/v3/quality/FLUENT-PARITY-BUTTON-ICON-AX.md").read_text(encoding="utf-8")
        for x in ("#428","#429","#420","Backlog","Draft","not","Penpot","screen-reader"):
            self.assertIn(x.lower(),s.lower())
if __name__=="__main__":unittest.main()
