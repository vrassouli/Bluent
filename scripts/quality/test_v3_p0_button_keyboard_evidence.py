"""#552 actual keyboard Enter/Space toggle Button comparison, WASM and Production Server.

Snapshot tests protect both known working behavior and missing pressed semantic;
they DO NOT mean component Fluent visual, focus-visible or screen-reader approval.
"""
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
E=ROOT/"docs/v3/quality/evidence"

class ButtonKeyboardEvidence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data={}
        for mode,suffix in (("WebAssembly",""),("Server","-SERVER")):
            d=json.loads((E/("BLUENT-LAB-P0-BUTTON-KEYBOARD"+suffix+"-CHROME.json")).read_text(encoding="utf-8"))
            cls.data[mode]=(d,next(m for m in d["measurements"] if m["family"]=="Button"))

    def test_real_browser_and_two_distinct_host_modes(self):
        for mode,(d,m) in self.data.items():
            self.assertEqual(mode,d["hostingMode"])
            self.assertEqual("button-keyboard",d["scenario"])
            self.assertEqual("b9952aa93e89fd569de54080a7fdd06037b53a41",d["sourceRef"])
            self.assertEqual(552,d["auditIssue"])
            self.assertEqual(10,len(d["checks"]))
            self.assertTrue(all(x["pass"] for x in d["checks"]))
            self.assertEqual(["Button"],[x["family"] for x in d["measurements"]])

    def test_keyboard_enter_and_space_both_activate_real_binding(self):
        for _,(_,m) in self.data.items():
            before,enter,space=m["buttonToggleKeyboard"]["snap"]
            self.assertEqual(["initial","enter","space"],[before["step"],enter["step"],space["step"]])
            self.assertEqual("Pinned: no; change callbacks: 0",before["status"])
            self.assertEqual("Pinned: yes; change callbacks: 1",enter["status"])
            self.assertEqual("Pinned: no; change callbacks: 2",space["status"])
            self.assertEqual([False,True,False],[before["toggled"],enter["toggled"],space["toggled"]])

    def test_missing_aria_pressed_not_confused_with_keyboard_failure(self):
        for _,(_,m) in self.data.items():
            evidence=m["buttonToggleKeyboard"]
            self.assertTrue(evidence["focus"]["focused"])
            self.assertEqual([None,None,None],[x["ariaPressed"] for x in evidence["snap"]])
            self.assertEqual([{"role":"button","name":"Pin selection","pressed":None}],evidence["toggleAX"])

    def test_native_disabled_and_link_baselines_work(self):
        for _,(_,m) in self.data.items():
            first=m["buttonToggleKeyboard"]["snap"][0]
            self.assertTrue(first["disabledOther"])
            self.assertEqual("getting-started",first["linkHref"])
            self.assertEqual("BUTTON",first["tag"])
            self.assertEqual(0,first["tabIndex"])

    def test_source_exposes_toggled_but_does_not_assign_aria(self):
        cs=(ROOT/"src/Bluent.UI/Components/ButtonComponent/Button.razor.cs").read_text(encoding="utf-8-sig")
        razor=(ROOT/"src/Bluent.UI/Components/ButtonComponent/Button.razor").read_text(encoding="utf-8-sig")
        self.assertIn("bool? Toggled",cs)
        self.assertIn("ToggledChanged.InvokeAsync",cs)
        self.assertNotIn("aria-pressed",razor)
        self.assertIn("AdditionalAttributes",razor)

    def test_real_images_and_no_os_at_parity_approval(self):
        for _,(d,m) in self.data.items():
            path=E/m["image"]
            self.assertGreater(path.stat().st_size,2000)
            self.assertEqual(bytes((137,80,78,71,13,10,26,10)),path.read_bytes()[:8])
            self.assertIn("NOT_fluent_parity",d["status"])
            self.assertNotIn("nativeOsAtApproved",d)
            self.assertNotIn("componentDesignApproved",d)

    def test_browser_key_harness_must_include_enter_character_event(self):
        src=(ROOT/"scripts/quality/probe_v3_bluent_lab_reference.mjs").read_text(encoding="utf-8")
        self.assertIn("type:'char'",src)
        self.assertIn("key==='Enter'",src)
        self.assertIn("Input.dispatchKeyEvent",src)


if __name__=="__main__":
    unittest.main()
