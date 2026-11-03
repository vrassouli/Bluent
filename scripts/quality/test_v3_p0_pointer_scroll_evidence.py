"""#552 actual Chrome pointer coordinate mismatch: real WebAssembly + published Server.

Guards intentional *existing bugs* against silent acceptance. The tests should
be revisited together with captured browser evidence after product remediation.
They do not implement a fix, touch Server code, or certify touch/OS AT.
"""
import json
import re
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
E=ROOT/"docs/v3/quality/evidence"


def load(mode):
    name="BLUENT-LAB-P0-POINTER-SCROLL-"+("SERVER-" if mode=="Server" else "")+"CHROME.json"
    return json.loads((E/name).read_text(encoding="utf-8"))


def scalar_value(family,sample):
    raw=sample["afterDown"]
    if family=="Slider":
        match=re.fullmatch(r"Value: (-?\d+)",raw)
        assert match is not None,raw
        return int(match.group(1))
    match=re.fullmatch(r"Range: (-?\d+) to (-?\d+)",raw)
    assert match is not None,raw
    return int(match.group(2 if sample["targetFraction"]>.5 else 1))


def predicted(family,sample,coordinate):
    down=next(e for e in sample["events"] if e["kind"]=="down")
    p=sample["position"]
    # Lab source has ThumbSize=20 and both families Min=-50..50 or 0..100.
    span=p["width"]-20
    fraction=max(0,min(1,(down[coordinate]-(p["left"]+10))/span))
    return -50+100*fraction if family=="Slider" else 100*fraction


class ChromePointerViewportMismatch(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data={mode:load(mode) for mode in ("WebAssembly","Server")}
        cls.families={mode:{x["family"]:x for x in data["measurements"]}
                      for mode,data in cls.data.items()}

    def test_actual_published_server_and_current_wasm_sources(self):
        for mode,d in self.data.items():
            self.assertEqual(mode,d["hostingMode"])
            self.assertEqual("pointer-scroll",d["scenario"])
            self.assertEqual("b9952aa93e89fd569de54080a7fdd06037b53a41",d["sourceRef"])
            self.assertEqual(552,d["auditIssue"])
            self.assertIn("Production Blazor InteractiveServer" if mode=="Server" else "WebAssembly Debug Lab",d["mode"])
            self.assertEqual({"Slider","RangeSlider"},set(self.families[mode]))

    def test_all_browser_observation_checks_pass(self):
        for d in self.data.values():
            self.assertEqual(11,len(d["checks"]))
            self.assertTrue(all(x["pass"] for x in d["checks"]))

    def test_8_real_pointerdowns_are_received_by_expected_controls(self):
        for mode,families in self.families.items():
            for family,component in families.items():
                for case in component["pointerScrollEvidence"]["cases"]:
                    events=[x for x in case["events"] if x["kind"]=="down"]
                    self.assertEqual(1,len(events),(mode,family,case))
                    self.assertEqual("lab-slider-int" if family=="Slider" else "lab-range-int",events[0]["id"])
                    self.assertNotEqual(case["before"],case["afterDown"])

    def test_screen_and_client_css_viewport_coordinates_diverge(self):
        for mode,families in self.families.items():
            for component in families.values():
                for case in component["pointerScrollEvidence"]["cases"]:
                    down=next(x for x in case["events"] if x["kind"]=="down")
                    self.assertAlmostEqual(18,down["screenX"]-down["clientX"],places=3)
                    self.assertAlmostEqual(153,down["screenY"]-down["clientY"],places=3)

    def test_actual_value_tracks_screenx_and_not_clientx(self):
        # Rounded integer outputs are ~4-6 points too large versus clientX.
        for mode,families in self.families.items():
            for family,component in families.items():
                for case in component["pointerScrollEvidence"]["cases"]:
                    actual=scalar_value(family,case)
                    byscreen=predicted(family,case,"screenX")
                    byclient=predicted(family,case,"clientX")
                    self.assertLess(abs(actual-byscreen),1.0,(mode,family,case["case"],actual,byscreen))
                    self.assertGreater(abs(actual-byclient),3.5,(mode,family,case["case"],actual,byclient))

    def test_scroll_applies_to_actual_host_scroller_not_assumed_window(self):
        for mode,families in self.families.items():
            for family,component in families.items():
                normal,scrolled=component["pointerScrollEvidence"]["cases"]
                self.assertEqual(("normal","scroll"),(normal["case"],scrolled["case"]))
                prop="scrollContainerTop" if mode=="WebAssembly" else "scrollY"
                self.assertGreaterEqual(scrolled["position"][prop]-normal["position"][prop],100)
                if mode=="WebAssembly":
                    self.assertEqual(0,scrolled["position"]["scrollY"])
                else:
                    self.assertEqual(0,scrolled["position"]["scrollContainerTop"])

    def test_source_still_mixes_screen_space_with_viewport_rect(self):
        for folder,component in (("SliderComponent","Slider"),("RangeSliderComponent","RangeSlider")):
            source=(ROOT/f"src/Bluent.UI/Components/{folder}/{component}.razor.cs").read_text(encoding="utf-8-sig")
            self.assertIn("args.ScreenX, args.ScreenY",source)
            self.assertIn("GetBoundingClientRectAsync(RailSelector)",source)
            self.assertIn("var relativeX = screenX - start",source)
            self.assertNotIn("args.ClientX",source)

    def test_4_real_browser_images_and_no_false_parity_approval(self):
        for mode,d in self.data.items():
            for x in d["measurements"]:
                png=E/x["image"]
                self.assertGreater(png.stat().st_size,2000)
                self.assertEqual(bytes((137,80,78,71,13,10,26,10)),png.read_bytes()[:8])
            self.assertIn("NOT_fluent_parity",d["status"])
            self.assertNotIn("nativeTouchPassed",d)
            self.assertNotIn("productFixApproved",d)


if __name__=="__main__":
    unittest.main()
