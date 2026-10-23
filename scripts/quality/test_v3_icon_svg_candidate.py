"""#552 Icon candidate screenshots/DOM/AX evidence; not product or OS AT acceptance."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
E=ROOT/"docs/v3/quality/evidence"
SCENARIOS=["light-ltr","dark-rtl","forced-colors","mobile-320","mobile-320-dark-rtl"]
class Candidate(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data={}
        for engine in ("CHROME","EDGE"):
            cls.data[engine]=(
                json.loads((E/f"BLUENT-ICON-{engine}-BROWSER.json").read_text(encoding="utf-8")),
                json.loads((E/f"BLUENT-ICON-{engine}-CANDIDATE-BROWSER.json").read_text(encoding="utf-8")))
    def test_provenance(self):
        for eng,(before,after) in self.data.items():
            self.assertEqual(552,after["auditIssue"]);self.assertEqual(429,after["ownerIssue"])
            self.assertEqual("1b023a5c",after["sourceRef"])
            self.assertFalse(before.get("candidate",False));self.assertTrue(after["candidate"])
            self.assertEqual("scripts/quality/fixtures/v3-icon-svg-size-candidate.css",after["candidateStylesheet"])
    def test_actual_32px_and_original_377px(self):
        for _,(before,after) in self.data.items():
            self.assertEqual(SCENARIOS,[x["scenario"] for x in after["scenarios"]])
            self.assertEqual(38,len(after["checks"]))
            self.assertTrue(all(x["pass"] for x in after["checks"]))
            for old,new in zip(before["scenarios"],after["scenarios"][:3]):
                a=next(x for x in old["icons"] if x["name"]=="SVG")
                b=next(x for x in new["icons"] if x["name"]=="SVG")
                self.assertEqual((377,377),(a["svgGeometry"]["width"],a["svgGeometry"]["height"]))
                self.assertEqual((32,32),(b["svgGeometry"]["width"],b["svgGeometry"]["height"]))
                self.assertEqual((32,32),(b["geometry"]["width"],b["geometry"]["height"]))
    def test_both_320px_states_recover_svg_and_wrapper_without_page_overflow(self):
        for _,(_,after) in self.data.items():
            for name in ("mobile-320", "mobile-320-dark-rtl"):
                s=next(x for x in after["scenarios"] if x["scenario"]==name)
                self.assertEqual((320,740,320),(s["viewport"]["width"],s["viewport"]["height"],s["viewport"]["documentWidth"]))
                svg=next(x for x in s["icons"] if x["name"]=="SVG")
                self.assertEqual((32,32),(svg["svgGeometry"]["width"],svg["svgGeometry"]["height"]))
                self.assertEqual((32,32),(svg["geometry"]["width"],svg["geometry"]["height"]))
    def test_no_other_icon_geometry_regression(self):
        for _,(_,after) in self.data.items():
            for s in after["scenarios"]:
                i={x["name"]:x for x in s["icons"]}
                self.assertEqual((28,28),(i["Default"]["geometry"]["width"],i["Filled variant"]["geometry"]["width"]))
                self.assertEqual((32,32),(i["Image"]["geometry"]["width"],i["Image"]["geometry"]["height"]))
                self.assertTrue(s["save"]["hasIcon"])
                self.assertEqual("Save",s["save"]["text"])
            m=after["scenarios"][-1]
            self.assertEqual((320,320),(m["viewport"]["width"],m["viewport"]["documentWidth"]))
    def test_two_optional_accessibility_treatments_are_real(self):
        for _,(_,after) in self.data.items():
            ax=after["accessibilityExperiment"]
            self.assertTrue(any(x["ignored"] is True for x in ax["decorative"]))
            self.assertTrue(any(x["role"]=="image" and x["name"]=="PowerPoint file type" and not x["ignored"] for x in ax["informative"]))
            self.assertTrue(all(next(x for x in s["icons"] if x["name"]=="Image")["alt"] is None for s in after["scenarios"]))
    def test_real_binary_snapshots(self):
        for eng,(_,after) in self.data.items():
            for s in after["scenarios"]:
                p=E/s["screenshot"]
                self.assertIn("-CANDIDATE-",p.name)
                self.assertTrue(p.name.startswith("BLUENT-ICON-"+eng))
                self.assertGreater(p.stat().st_size,3000)
                self.assertEqual(bytes((137,80,78,71,13,10,26,10)),p.read_bytes()[:8])
    def test_css_scope_and_not_product_import(self):
        css=(ROOT/"scripts/quality/fixtures/v3-icon-svg-size-candidate.css").read_text(encoding="utf-8")
        self.assertIn("span.bui-icon:has(> svg)",css)
        self.assertIn("span.bui-icon > svg",css)
        self.assertNotIn("img.bui-icon",css)
        self.assertNotIn("i.bui-icon",css)
        for p in ("src/Bluent.UI/Components/IconComponent/Icon.cs","src/Bluent.UI/Styles/Themes/icons.scss"):
            self.assertNotIn("v3-icon-svg-size-candidate.css",(ROOT/p).read_text(encoding="utf-8-sig"))
    def test_harness_requires_explicit_candidate(self):
        h=(ROOT/"scripts/quality/probe_v3_icon_browser.mjs").read_text(encoding="utf-8")
        self.assertIn("const candidate=process.argv[3]==='candidate'",h)
        self.assertIn("document.createElement('style')",h)
        self.assertIn("await readFile(join(root,'scripts/quality/fixtures/v3-icon-svg-size-candidate.css')",h)
    def test_no_false_design_or_at_signoff(self):
        d=(ROOT/"docs/v3/quality/FLUENT-PARITY-ICON-SVG-PROTOTYPE.md").read_text(encoding="utf-8")
        for x in ("PuyaStudio Runner","Figma","NVDA","Backlog","Draft","not product"):
            self.assertIn(x.lower(),d.lower())
if __name__=="__main__": unittest.main()
