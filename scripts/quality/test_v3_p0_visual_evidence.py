"""#552 source-controlled browser screenshot evidence: provenance and no false parity verdict."""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=ROOT/"docs/v3/quality/evidence"


def read(name):
    return json.loads((EVIDENCE/name).read_text(encoding="utf-8"))


def png(name):
    path=EVIDENCE/name
    return path.is_file() and path.stat().st_size>=2000 and path.read_bytes()[:8]==b"\x89PNG\r\n\x1a\n"


class PinnedVisualEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fluent=read("FLUENT-WC-3.1.3-LIGHT-CHROME.json")
        cls.bluent=read("BLUENT-LAB-P0-CHROME.json")

    def test_fluent_pinned_package_and_runtime_checks(self):
        self.assertEqual("3.1.3",self.fluent["packageVersion"])
        self.assertEqual("official_baseline_only_no_bluent_parity",self.fluent["status"])
        self.assertEqual(5,len(self.fluent["assertions"]))
        self.assertTrue(all(x["ok"] for x in self.fluent["assertions"]))
        self.assertEqual(12,len(self.fluent["geometry"]))

    def test_reference_rest_and_keyboard_focus_screenshots(self):
        self.assertTrue(png("FLUENT-WC-3.1.3-LIGHT-CHROME.png"))
        self.assertTrue(png("FLUENT-WC-3.1.3-LIGHT-CHROME-KEYBOARD-FOCUS.png"))

    def test_bluent_four_family_source_specimens(self):
        self.assertEqual("Bluent_current_source_visual_baseline_NOT_fluent_parity",self.bluent["status"])
        families={x["family"] for x in self.bluent["measurements"]}
        self.assertEqual({"Button","Slider","RangeSlider","FileSelect"},families)
        self.assertEqual(5,len(self.bluent["checks"]))
        self.assertTrue(all(x["pass"] for x in self.bluent["checks"]))
        for family in families:
            self.assertTrue(png(f"BLUENT-LAB-{family.upper()}-CHROME.png"))

    def test_a11y_omissions_recorded_not_approved(self):
        observations={m["family"]:m for m in self.bluent["measurements"]}
        self.assertIsNone(observations["Slider"]["role"])
        self.assertIsNone(observations["Slider"]["thumbs"][0]["ariaValueNow"])
        self.assertEqual(2,observations["RangeSlider"]["thumbCount"])
        self.assertTrue(all(t["ariaValueNow"] is None for t in observations["RangeSlider"]["thumbs"]))

    def test_no_claim_of_visual_pixel_or_os_at_acceptance(self):
        self.assertNotIn("parityAccepted",self.fluent)
        self.assertNotIn("parityAccepted",self.bluent)
        self.assertNotIn("osAtApproved",self.fluent)
        self.assertNotIn("osAtApproved",self.bluent)


if __name__=="__main__":
    unittest.main()