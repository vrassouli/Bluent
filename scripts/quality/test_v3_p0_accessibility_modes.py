"""#552 Chromium emulated forced-colors + 200%-equivalent reflow evidence.

These are browser DOM and image evidence guards, NOT native Windows HC,
NOT browser UI zoom, NOT Fluent parity, and NOT real assistive technology.
"""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
D=ROOT/"docs/v3/quality/evidence"


def read(name):
    return json.loads((D/name).read_text(encoding="utf-8"))


def png(name):
    path=D/name
    return path.is_file() and path.stat().st_size>2000 and path.read_bytes()[:8]==b"\x89PNG\r\n\x1a\n"


class AccessibilityMediaEvidence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fluent_fc=read("FLUENT-WC-3.1.3-FORCED-COLORS-CHROME.json")
        cls.bluent_fc=read("BLUENT-LAB-P0-FORCED-COLORS-CHROME.json")
        cls.fluent_reflow=read("FLUENT-WC-3.1.3-ZOOM-200-REFLOW-CHROME.json")
        cls.bluent_reflow=read("BLUENT-LAB-P0-ZOOM-200-CHROME.json")

    def test_browser_mode_is_actually_active_in_both_documents(self):
        for d in (self.fluent_fc,self.bluent_fc):
            self.assertEqual("forced-colors",d["scenario"])
            self.assertTrue(d["accessibilityMode"]["forcedColors"])
            self.assertTrue(d["accessibilityMode"]["contrastMore"])
            self.assertEqual(1240,d["accessibilityMode"]["viewportWidth"])

    def test_observed_two_bluent_rails_are_unpainted_in_forced_colors(self):
        for family in ("Slider","RangeSlider"):
            specimen=next(x for x in self.bluent_fc["measurements"] if x["family"]==family)
            rail=specimen["rail"]
            self.assertGreater(rail["width"],0)
            self.assertEqual(4,rail["height"])
            self.assertEqual("none",rail["backgroundImage"])
            self.assertIn(rail["backgroundColor"],("transparent","rgba(0, 0, 0, 0)"))

    def test_source_uses_gradient_only_rails_without_forced_colors_fallback(self):
        # If #442/#443 later add a real fallback, this audit snapshot is stale
        # and must be updated together with new browser/AT evidence.
        for name in ("_slider.scss","_range-slider.scss"):
            path=ROOT/"src/Bluent.UI/Styles/Components"/name
            css=path.read_text(encoding="utf-8-sig")
            self.assertIn("background-image: linear-gradient(",css)
            self.assertNotIn("forced-colors",css)

    def test_fluent_ref_has_keyboard_control_and_visible_rail_reference(self):
        self.assertEqual(8,len(self.fluent_fc["assertions"]))
        self.assertTrue(all(a["ok"] for a in self.fluent_fc["assertions"]))
        self.assertIn("Official step slider responds to ArrowRight in actual Chromium",
                      {x["name"] for x in self.fluent_fc["assertions"]})
        self.assertTrue(png("FLUENT-WC-3.1.3-FORCED-COLORS-CHROME.png"))

    def test_bluent_button_focus_yes_slider_focus_no_under_forced_colors(self):
        self.assertEqual(11,len(self.bluent_fc["checks"]))
        self.assertTrue(all(x["pass"] for x in self.bluent_fc["checks"]))
        button=next(x for x in self.bluent_fc["measurements"] if x["family"]=="Button")
        slider=next(x for x in self.bluent_fc["measurements"] if x["family"]=="Slider")
        self.assertTrue(button["buttonFocusProbe"]["focused"])
        self.assertFalse(slider["keyboardFocusProbe"]["rootFocused"])
        self.assertIsNone(slider["keyboardFocusProbe"]["thumbRole"])

    def test_reflow_proxy_is_not_mislabelled_as_native_browser_zoom(self):
        for d in (self.fluent_reflow,self.bluent_reflow):
            self.assertEqual("zoom-200",d["scenario"])
            self.assertEqual(620,d["accessibilityMode"]["viewportWidth"])
            self.assertEqual(2,d["accessibilityMode"]["dpr"])
            self.assertFalse(d["accessibilityMode"]["forcedColors"])
            self.assertEqual(1,d["accessibilityMode"]["visualViewportScale"])

    def test_responsive_natural_bluent_slider_does_not_escape_card(self):
        self.assertEqual("natural intrinsic responsive width",
                         self.bluent_reflow["normalizedInScenario"]["sliderWidth"])
        for family in ("Slider","RangeSlider"):
            x=next(m for m in self.bluent_reflow["measurements"] if m["family"]==family)
            self.assertLessEqual(x["right"],x["parentRight"])
            self.assertLessEqual(x["width"],x["parentWidth"])
        self.assertLessEqual(self.bluent_reflow["accessibilityMode"]["documentScrollWidth"],620)
        self.assertLessEqual(self.fluent_reflow["accessibilityMode"]["documentScrollWidth"],620)

    def test_all_pinned_specimen_images_exist(self):
        for mode in ("FORCED-COLORS","ZOOM-200"):
            for family in ("BUTTON","SLIDER","RANGESLIDER","FILESELECT"):
                self.assertTrue(png(f"BLUENT-LAB-{family}-{mode}-CHROME.png"))
        for stem in ("FLUENT-WC-3.1.3-FORCED-COLORS-CHROME",
                     "FLUENT-WC-3.1.3-ZOOM-200-REFLOW-CHROME"):
            self.assertTrue(png(stem+".png"))
            self.assertTrue(png(stem+"-KEYBOARD-FOCUS.png"))

    def test_reference_and_target_have_no_parity_or_osat_signoff(self):
        for d in (self.fluent_fc,self.bluent_fc,self.fluent_reflow,self.bluent_reflow):
            self.assertIn("NOT_fluent_parity" if "Bluent" in d["status"] else "no_bluent_parity",d["status"])
            self.assertNotIn("osAtApproved",d)
            self.assertNotIn("nativeZoomPassed",d)


if __name__=="__main__":
    unittest.main()