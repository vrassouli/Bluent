"""#552 real Chrome accessibility-tree and browser-only Forced Colors CSS proposal.

Stored evidence guards, NOT actual OS screen reader, not product CSS fixes, not parity signoff.
"""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
E=ROOT/"docs/v3/quality/evidence"


def load(name):
    return json.loads((E/name).read_text(encoding="utf-8"))


def png(name):
    p=E/name
    return p.is_file() and p.stat().st_size>2000 and p.read_bytes()[:8]==b"\x89PNG\r\n\x1a\n"


class LiveAxAndForcedColorsProposal(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fluent=load("FLUENT-WC-3.1.3-AX-KEYBOARD-CHROME.json")
        cls.bluent=load("BLUENT-LAB-P0-AX-KEYBOARD-CHROME.json")
        cls.families={m["family"]:m for m in cls.bluent["measurements"]}

    def test_actual_browser_reference_exposes_named_slider_roles(self):
        self.assertEqual("ax-keyboard",self.fluent["scenario"])
        sliders=[x for x in self.fluent["accessibilityTree"] if x["role"]=="slider"]
        self.assertEqual(2,len(sliders))
        self.assertEqual({"Volume","Brightness"},{x["name"] for x in sliders})
        self.assertEqual({40,50},{x["value"] for x in sliders})

    def test_actual_bluent_ax_tree_omits_both_slider_roles(self):
        self.assertEqual({"Button","Slider","RangeSlider","FileSelect"},set(self.families))
        for name in ("Slider","RangeSlider"):
            self.assertFalse(any(x["role"]=="slider" for x in self.families[name]["accessibilityTree"]))

    def test_reference_and_target_keyboard_observations_not_falsely_approved(self):
        self.assertEqual(10,len(self.fluent["assertions"]))
        self.assertEqual(20,len(self.bluent["checks"]))
        self.assertTrue(all(x["ok"] for x in self.fluent["assertions"]))
        self.assertTrue(all(x["pass"] for x in self.bluent["checks"]))
        self.assertTrue(any("Button Tab" in x["name"] for x in self.fluent["assertions"]))
        self.assertTrue(any("Button real Tab" in x["label"] for x in self.bluent["checks"]))
        self.assertFalse(self.families["Slider"]["keyboardFocusProbe"]["rootFocused"])
        self.assertTrue(self.families["Button"]["buttonFocusProbe"]["focused"])
        self.assertNotEqual(self.families["Button"]["buttonFocusProbe"]["id"],
                            self.families["Button"]["buttonTabProbe"]["id"])

    def test_actual_keyboard_arrow_input_does_not_change_bluent_label(self):
        for family in ("Slider","RangeSlider"):
            data=self.families[family]["arrowRightProbe"]
            self.assertEqual(data["valueBefore"],data["valueAfter"])
            self.assertTrue(data["valueBefore"])

    def test_candidate_browser_style_restores_both_track_paints(self):
        for family in ("Slider","RangeSlider"):
            data=self.families[family]["experimentalTrackProposal"]
            old,new=data["before"],data["after"]
            self.assertEqual("none",old["backgroundImage"])
            self.assertEqual("rgba(0, 0, 0, 0)",old["backgroundColor"])
            self.assertEqual("rgb(255, 255, 255)",new["backgroundColor"])
            self.assertEqual("rgb(26, 235, 255)",new["afterBg"])
            self.assertGreater(float(new["afterWidth"].removesuffix("px")),0)
            self.assertIn("runtime-only",data["claim"])

    def test_experimental_styles_exist_only_in_audit_fixture(self):
        proposal=(ROOT/"scripts/quality/fixtures/v3-p0-forced-colors-rail-proposal.css").read_text(encoding="utf-8")
        self.assertIn("@media (forced-colors: active)",proposal)
        self.assertIn("CanvasText",proposal)
        self.assertIn("Highlight",proposal)
        for name in ("_slider.scss","_range-slider.scss"):
            product=(ROOT/"src/Bluent.UI/Styles/Components"/name).read_text(encoding="utf-8-sig")
            self.assertNotIn("forced-colors",product)
            self.assertIn("background-image: linear-gradient",product)

    def test_screen_capture_is_real_browser_png(self):
        self.assertTrue(png("FLUENT-WC-3.1.3-AX-KEYBOARD-CHROME.png"))
        self.assertTrue(png("FLUENT-WC-3.1.3-AX-KEYBOARD-CHROME-KEYBOARD-FOCUS.png"))
        for family in ("BUTTON","SLIDER","RANGESLIDER","FILESELECT"):
            self.assertTrue(png("BLUENT-LAB-"+family+"-AX-KEYBOARD-CHROME.png"))

    def test_disposable_browser_cleanup_is_scoped_to_guid_profile(self):
        for name in ("probe_v3_fluent_wc_reference.mjs","probe_v3_bluent_lab_reference.mjs"):
            source=(ROOT/"scripts/quality"/name).read_text(encoding="utf-8")
            self.assertIn("ownedProfilePath=profile.replace",source)
            self.assertIn("CommandLine.Contains($p)",source)
            self.assertIn("Get-CimInstance Win32_Process",source)
            self.assertNotIn("taskkill',['/IM'",source)

    def test_no_parity_screen_reader_or_product_acceptance(self):
        for d in (self.fluent,self.bluent):
            self.assertNotIn("nativeOsAtPassed",d)
            self.assertNotIn("componentApproved",d)
            self.assertNotIn("fluentParityAccepted",d)
        self.assertEqual("official_baseline_only_no_bluent_parity",self.fluent["status"])
        self.assertEqual("Bluent_current_source_visual_baseline_NOT_fluent_parity",self.bluent["status"])


if __name__=="__main__":
    unittest.main()