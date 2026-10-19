"""#418 x #552 source-backed Chrome/Edge Forced Colors slider paint checkpoint.

The tests protect actual archived browser outputs and opt-in isolation. They do
not approve component source changes, native Windows Contrast Themes or OS AT.
"""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
CSS=ROOT/"docs/v3/tokens/issue-418-slider-forced-colors.opt-in.preview.css"
E=ROOT/"docs/v3/tokens/evidence"
BRANDS=("default","excel","office","outlook","powerapps","powerbi",
        "powerpoint","stream","teams","word")


class ForcedColorsSliderTokenCandidate(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.matrices={b:json.loads((E/("SLIDER-HC-"+b+"-MATRIX.json")).read_text(encoding="utf8"))
                      for b in ("CHROME","EDGE")}
        cls.css=CSS.read_text(encoding="utf8")

    def test_two_real_browser_matrices_cover_all_brand_mode_direction_families(self):
        for browser,mat in self.matrices.items():
            self.assertEqual(browser.title(),mat["browser"])
            self.assertEqual(418,mat["issue"])
            self.assertEqual([442,443,552],mat["related"])
            self.assertEqual(10,mat["brands"])
            self.assertEqual(2,mat["modes"])
            self.assertEqual(240,mat["tiles"])
            self.assertEqual(1520,mat["checks"])
            self.assertEqual(0,mat["failureCount"])
            self.assertFalse(mat["errors"])
            tuples={(r["brand"],r["mode"],r["forced"]["dir"],
                     r["forced"]["family"],r["forced"]["scope"]) for r in mat["records"]}
            self.assertEqual(240,len(tuples))
            self.assertEqual(set(BRANDS),{r["brand"] for r in mat["records"]})

    def test_each_case_actually_inherits_correct_emitted_brand_mode(self):
        import re
        for mat in self.matrices.values():
            for r in mat["records"]:
                css=(ROOT/"src/Bluent.UI/Styles/Themes"/
                     ("theme-"+r["brand"]+"-"+r["mode"]+".css")).read_text(encoding="utf8")
                expected=re.search(r"--colorBrandBackground:\s*(#[0-9a-fA-F]{6})\s*;",css)
                self.assertIsNotNone(expected)
                self.assertEqual(expected.group(1).lower(),r["forced"]["legacyBrand"].lower())
                self.assertEqual(expected.group(1).lower(),r["normal"]["legacyBrand"].lower())
    def test_rail_is_painted_only_for_explicit_opt_in(self):
        for mat in self.matrices.values():
            for r in mat["records"]:
                f=r["forced"]
                self.assertTrue(f["forced"])
                self.assertEqual("none",f["gradient"])
                self.assertEqual(300,f["width"])
                self.assertEqual(4,f["height"])
                invisible=(f["color"]=="rgba(0, 0, 0, 0)")
                self.assertEqual(f["scope"]=="none",invisible)

    def test_selected_highlight_width_and_physical_thumb_match_in_rtl_and_ltr(self):
        for mat in self.matrices.values():
            for r in mat["records"]:
                f=r["forced"]
                if f["scope"]=="none":
                    continue
                width=105 if f["family"]=="slider" else 180
                left=0 if f["family"]=="slider" else 60
                thumb=105 if f["family"]=="slider" else 60
                self.assertAlmostEqual(left,float(f["progressLeft"].removesuffix("px")),delta=1)
                self.assertAlmostEqual(width,float(f["progressWidth"].removesuffix("px")),delta=1)
                self.assertAlmostEqual(thumb,f["thumbCenter"],delta=1)
                self.assertNotEqual("none",f["progressContent"])
                self.assertNotEqual("rgba(0, 0, 0, 0)",f["progressColor"])

    def test_normal_media_has_original_gradient_even_when_host_opted_in(self):
        for mat in self.matrices.values():
            for r in mat["records"]:
                n=r["normal"]
                self.assertFalse(n["forced"])
                self.assertIn("linear-gradient",n["gradient"])

    def test_opt_in_css_only_for_forced_colors_and_correct_explicit_selector(self):
        self.assertIn("@media (forced-colors: active)",self.css)
        self.assertIn("[data-bui-v3-tokens][data-bui-v3-slider-hc-proposal]",self.css)
        self.assertIn("[data-bui-v3-tokens] [data-bui-v3-slider-hc-proposal]",self.css)
        self.assertIn("background-color: CanvasText",self.css)
        self.assertIn("background-color: Highlight",self.css)
        self.assertIn("left: var(--min-progress",self.css)
        self.assertIn("width: calc(var(--max-progress",self.css)
        self.assertNotIn("inset-inline-start",self.css)
        self.assertNotIn("forced-color-adjust: none",self.css)

    def test_shipped_component_css_and_source_scss_are_not_modified_by_candidate(self):
        css=(ROOT/"src/Bluent.UI/wwwroot/bluent.ui.components.css").read_text(encoding="utf8")
        self.assertIn(".bui-slider > .rail",css)
        self.assertNotIn("data-bui-v3-slider-hc-proposal",css)
        for family in ("slider","range-slider"):
            path=ROOT/"src/Bluent.UI/Styles/Components"/("_"+family+".scss")
            value=path.read_text(encoding="utf-8-sig")
            self.assertIn("background-image: linear-gradient",value)
            self.assertNotIn("data-bui-v3-slider-hc-proposal",value)

    def test_actual_four_png_captures_and_scoped_browser_cleanup(self):
        for browser,mat in self.matrices.items():
            self.assertEqual("remaining=0",mat["cleanup"])
            self.assertEqual(2,len(mat["screenshots"]))
            for name in mat["screenshots"]:
                self.assertIn(browser,name)
                path=E/name
                self.assertGreater(path.stat().st_size,5000)
                self.assertEqual(bytes([137,80,78,71,13,10,26,10]),path.read_bytes()[:8])

    def test_no_invented_visual_or_native_at_approval(self):
        for mat in self.matrices.values():
            self.assertIn("static markup",mat["scope"])
            self.assertIn("only",mat["scope"].lower())
            self.assertNotIn("fluentParityAccepted",mat)
            self.assertNotIn("nativeOsAtPassed",mat)
            self.assertNotIn("designApproved",mat)
            self.assertNotIn("productFixed",mat)


if __name__=="__main__":
    unittest.main()
