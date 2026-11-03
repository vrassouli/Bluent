"""#552 actual Chrome Light/LTR vs Dark/RTL normalized-**width** evidence guards.

No pixel diffs or acceptance: only nominal widths for selected primary button
and slider are aligned; app scaffolds, typography and real AT are not.
"""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
DIR=ROOT/"docs/v3/quality/evidence"


def load(name):
    return json.loads((DIR/name).read_text(encoding="utf-8"))

def image_exists(name):
    p=DIR/name
    return p.is_file() and p.stat().st_size>2000 and p.read_bytes()[:8]==b"\x89PNG\r\n\x1a\n"


class NormalizedChromePairs(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pairs={}
        for mode in ("LIGHT-LTR","DARK-RTL"):
            a=load(f"FLUENT-WC-3.1.3-{mode}{'-NORMALIZED' if mode=='LIGHT-LTR' else ''}-CHROME.json")
            b=load(f"BLUENT-LAB-P0-{mode}-CHROME.json")
            cls.pairs[mode]=(a,b)

    def test_real_browser_pairs_are_present(self):
        for mode,(a,b) in self.pairs.items():
            self.assertEqual(a["scenario"],mode.lower())
            self.assertEqual(b["scenario"],mode.lower())
            self.assertEqual("3.1.3",a["packageVersion"])
            self.assertEqual("b9952aa93e89fd569de54080a7fdd06037b53a41",b["sourceRef"])
            self.assertEqual(7,len(a["assertions"]))
            self.assertEqual(7,len(b["checks"]))
            self.assertTrue(all(x["ok"] for x in a["assertions"]))
            self.assertTrue(all(x["pass"] for x in b["checks"]))

    def test_primary_button_nominal_dimensions_align(self):
        for a,b in self.pairs.values():
            fluent=next(x for x in a["geometry"] if x["id"]=="btn-primary")
            bluent=next(x for x in b["measurements"] if x["family"]=="Button")
            self.assertEqual((96,32),(fluent["renderedWidth"],fluent["renderedHeight"]))
            self.assertEqual((96,32),(bluent["width"],bluent["height"]))

    def test_slider_width_aligns_but_host_height_does_not(self):
        for a,b in self.pairs.values():
            fluent=next(x for x in a["geometry"] if x["id"]=="ref-slider")
            bluent=next(x for x in b["measurements"] if x["family"]=="Slider")
            self.assertEqual(260,fluent["renderedWidth"])
            self.assertEqual(260,bluent["width"])
            self.assertEqual(32,fluent["renderedHeight"])
            self.assertEqual(20,bluent["height"])

    def test_theme_changes_button_surface_on_both_sides(self):
        a_light,b_light=self.pairs["LIGHT-LTR"]
        a_dark,b_dark=self.pairs["DARK-RTL"]
        bg=lambda d,i:next(x for x in d["geometry"] if x["id"]==i)["hostBackground"]
        sourcebg=lambda d,i:next(x for x in d["measurements"] if x["family"]==i)["background"]
        self.assertNotEqual(bg(a_light,"btn-primary"),bg(a_dark,"btn-primary"))
        self.assertNotEqual(sourcebg(b_light,"Button"),sourcebg(b_dark,"Button"))
        self.assertNotEqual(bg(a_light,"btn-primary"),sourcebg(b_light,"Button"))
        self.assertNotEqual(bg(a_dark,"btn-primary"),sourcebg(b_dark,"Button"))

    def test_actual_bluent_slider_thumb_is_not_keyboard_focusable(self):
        for a,b in self.pairs.values():
            slider=next(x for x in b["measurements"] if x["family"]=="Slider")
            focus=slider["keyboardFocusProbe"]
            self.assertIs(focus["rootFocused"],False)
            self.assertEqual(-1,focus["rootTabIndex"])
            self.assertEqual(-1,focus["thumbTabIndex"])
            self.assertIsNone(focus["thumbRole"])
            self.assertIsNone(focus["rootRole"])
            self.assertIsNone(focus["thumbAriaValue"])

    def test_all_real_screenshot_files_present(self):
        for mode,(a,b) in self.pairs.items():
            prefix=f"FLUENT-WC-3.1.3-{mode}{'-NORMALIZED' if mode=='LIGHT-LTR' else ''}-CHROME"
            self.assertTrue(image_exists(prefix+".png"))
            self.assertTrue(image_exists(prefix+"-KEYBOARD-FOCUS.png"))
            for family in ("BUTTON","SLIDER","RANGESLIDER","FILESELECT"):
                self.assertTrue(image_exists(f"BLUENT-LAB-{family}-{mode}-CHROME.png"))

    def test_official_page_rtl_clipping_is_not_present(self):
        for a,b in self.pairs.values():
            bounds=a["pageBounds"]
            self.assertEqual(1240,bounds["innerWidth"])
            self.assertEqual(1240,bounds["docWidth"])
            self.assertGreaterEqual(bounds["mainLeft"],0)
            self.assertLessEqual(bounds["mainRight"],bounds["innerWidth"])

    def test_not_approved_as_fluent_or_screen_reader_parity(self):
        for a,b in self.pairs.values():
            self.assertEqual("official_baseline_only_no_bluent_parity",a["status"])
            self.assertEqual("Bluent_current_source_visual_baseline_NOT_fluent_parity",b["status"])
            self.assertIn("no pixel parity",b["normalizedInScenario"]["claim"])
            self.assertNotIn("nativeATPassed",a)
            self.assertNotIn("nativeATPassed",b)


if __name__=="__main__":
    unittest.main()