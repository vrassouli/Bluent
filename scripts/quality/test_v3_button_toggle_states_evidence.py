"""#552 original Button pointer-state evidence guard. No browser or OS/AT claim from CI."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
E=ROOT/"docs/v3/quality/evidence"
MODES=("light-ltr","dark-rtl","forced-colors")
class ButtonToggleStateEvidence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.records={engine:json.loads((E/f"BLUENT-BUTTON-STATE-{engine}.json").read_text(encoding="utf-8")) for engine in ("CHROME","EDGE")}
    def test_real_original_demos_recorded_without_mock_contract(self):
        for engine,d in self.records.items():
            self.assertEqual(engine.lower(),d["engine"])
            self.assertEqual(552,d["issue"])
            self.assertEqual(428,d["buttonIssue"])
            self.assertEqual(429,d["iconIssue"])
            self.assertEqual("0eb2afdd",d["sourceRef"])
            self.assertIn("original .NET 10 Blazor WebAssembly Debug",d["host"])
            self.assertIn("not Fluent parity",d["claim"])
    def test_six_original_browser_modes_and_66_positive_observations(self):
        for d in self.records.values():
            self.assertEqual(33,len(d["checks"]))
            self.assertTrue(all(c["pass"] is True for c in d["checks"]))
            self.assertEqual(list(MODES),[case["scenario"] for case in d["cases"]])
    def test_mouse_hover_uses_filled_icon_and_changes_pua_name(self):
        for d in self.records.values():
            for case in d["cases"]:
                a,b,c=case["start"],case["hover"],case["toggled"]
                self.assertFalse(a["hovered"])
                self.assertTrue(b["hovered"])
                self.assertFalse(c["hovered"])
                self.assertEqual(chr(0xE60F)+" Default",a["ax"][0]["name"])
                self.assertEqual(chr(0xE60E)+" Default",b["ax"][0]["name"])
                self.assertEqual(chr(0xE60E)+" Default",c["ax"][0]["name"])
                self.assertNotEqual(a["ax"][0]["name"],b["ax"][0]["name"])
                self.assertIsNone(a["ariaPressed"])
                self.assertIsNone(b["ariaPressed"])
                self.assertIsNone(c["ariaPressed"])
    def test_real_click_selects_then_unselects_actual_source(self):
        for d in self.records.values():
            for c in d["cases"]:
                self.assertNotIn("toggled",c["start"]["buttonClasses"])
                self.assertIn("toggled",c["clicked"]["buttonClasses"])
                self.assertIn("toggled",c["toggled"]["buttonClasses"])
                self.assertNotIn("toggled",c["reset"]["buttonClasses"])
                active=c["toggled"]["icons"]
                self.assertTrue(any("active-icon" in x["classes"] and x["display"]!="none" for x in active))
                self.assertTrue(any(x["classes"].endswith(" icon") and x["display"]=="none" for x in active))
                self.assertTrue(any(x["classes"].endswith(" icon") and x["display"]!="none" for x in c["reset"]["icons"]))
    def test_opt_in_false_and_hover_ax_name_stays_constant(self):
        for d in self.records.values():
            for c in d["cases"]:
                for name in ("falseCandidate","falseCandidateHovered"):
                    t=c[name]
                    self.assertEqual("Default",t["ax"][0]["name"])
                    self.assertIn("false",t["ax"][0]["pressed"])
                self.assertTrue(c["falseCandidateHovered"]["hovered"])
                self.assertEqual(c["start"]["ax"][0]["name"],c["falseRestored"]["ax"][0]["name"])
                self.assertIsNone(c["falseRestored"]["ariaPressed"])
    def test_opt_in_true_semantics_and_original_restoration(self):
        for d in self.records.values():
            for c in d["cases"]:
                self.assertEqual("Default",c["candidate"]["ax"][0]["name"])
                self.assertIn("true",c["candidate"]["ax"][0]["pressed"])
                self.assertEqual(c["toggled"]["ax"][0]["name"],c["restored"]["ax"][0]["name"])
                self.assertIsNone(c["restored"]["ariaPressed"])
    def test_evidence_screenshots_are_real_pngs(self):
        for engine,d in self.records.items():
            for c in d["cases"]:
                p=E/c["image"]
                self.assertIn(engine,p.name)
                self.assertGreater(p.stat().st_size,3000)
                self.assertEqual(bytes((137,80,78,71,13,10,26,10)),p.read_bytes()[:8])
    def test_harness_is_actual_mouse_input_and_scoped_attribute_changes(self):
        src=(ROOT/"scripts/quality/probe_v3_button_toggle_states.mjs").read_text(encoding="utf-8")
        for snippet in ("Input.dispatchMouseEvent","mousePressed","mouseReleased","mouseMoved","aria-pressed","aria-hidden","removeAttribute","taskkill", "bluent552-button-states-"):
            self.assertIn(snippet,src)
        self.assertNotIn("taskkill /IM",src)
        self.assertIn("kill",src.lower())
    def test_boundary_and_owner_documentation(self):
        doc=(ROOT/"docs/v3/quality/FLUENT-PARITY-BUTTON-TOGGLE-STATES.md").read_text(encoding="utf-8")
        for name in ("#552","#428","#429","#420","Draft","In progress","no component","not Fluent parity","screen-reader"):
            self.assertIn(name.lower(),doc.lower())
if __name__=="__main__":unittest.main()
