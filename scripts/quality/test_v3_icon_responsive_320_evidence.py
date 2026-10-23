"""Guard the real, unchanged-source Icon 320px browser observations; not parity acceptance."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "docs/v3/quality/evidence"
EXPECTED = {
    "CHROME": ("chrome", "BLUENT-ICON-CHROME-RESPONSIVE-320-BROWSER.json"),
    "EDGE": ("edge", "BLUENT-ICON-EDGE-RESPONSIVE-320-BROWSER.json"),
}
SCENARIOS = (
    ("mobile-320-light-ltr", "light", "ltr"),
    ("mobile-320-dark-rtl", "dark", "rtl"),
)


class IconResponsive320Evidence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = {
            key: json.loads((EVIDENCE / path).read_text(encoding="utf-8-sig"))
            for key, (_, path) in EXPECTED.items()
        }

    def test_provenance_and_audit_boundary(self):
        for key, (engine, _) in EXPECTED.items():
            with self.subTest(engine=key):
                data = self.data[key]
                self.assertEqual(552, data["auditIssue"])
                self.assertEqual(429, data["ownerIssue"])
                self.assertEqual("1b023a5c", data["sourceRef"])
                self.assertEqual(engine, data["engine"])
                self.assertEqual("responsive-320", data["runMode"])
                self.assertTrue(data["responsive"])
                self.assertFalse(data["candidate"])
                self.assertIn("WebAssembly", data["host"])
                self.assertIn("NOT Fluent parity", data["status"])
                self.assertIn("NOT native OS", data["status"])

    def test_both_engines_recorded_two_real_320px_modes(self):
        for key, data in self.data.items():
            with self.subTest(engine=key):
                self.assertEqual(10, len(data["checks"]))
                self.assertTrue(all(check["pass"] for check in data["checks"]))
                self.assertEqual(list(SCENARIOS), [
                    (scenario["scenario"], scenario["theme"], scenario["direction"])
                    for scenario in data["scenarios"]
                ])
                for scenario in data["scenarios"]:
                    self.assertEqual(320, scenario["viewport"]["width"])
                    self.assertEqual(740, scenario["viewport"]["height"])
                    self.assertTrue(scenario["fontReady"])

    def test_current_svg_size_gap_and_wrapper_fragment_are_preserved(self):
        for key, data in self.data.items():
            for scenario in data["scenarios"]:
                with self.subTest(engine=key, scenario=scenario["scenario"]):
                    icons = {icon["name"]: icon for icon in scenario["icons"]}
                    svg = icons["SVG"]
                    self.assertTrue(svg["svg"])
                    self.assertGreater(svg["svgGeometry"]["width"], 32)
                    self.assertGreater(svg["svgGeometry"]["height"], 32)
                    self.assertEqual(16, svg["geometry"]["height"])
                    self.assertFalse(scenario["responsiveObservation"]["horizontalOverflow"])
                    self.assertEqual(0, scenario["responsiveObservation"]["overflowPixels"])
                    self.assertEqual(320, scenario["viewport"]["documentWidth"])

    def test_custom_image_remains_unnamed_in_browser_ax(self):
        for key, data in self.data.items():
            for scenario in data["scenarios"]:
                with self.subTest(engine=key, scenario=scenario["scenario"]):
                    image = next(icon for icon in scenario["icons"] if icon["name"] == "Image")
                    self.assertEqual("IMG", image["tag"])
                    self.assertIsNone(image["alt"])
                    self.assertTrue(image["complete"])
                    self.assertGreater(image["naturalWidth"], 0)
                    self.assertIn(
                        {"role": "image", "name": "", "ignored": False},
                        scenario["ax"]["Image"],
                    )

    def test_actual_png_captures_exist_for_both_states_and_engines(self):
        for key, data in self.data.items():
            for scenario in data["scenarios"]:
                path = EVIDENCE / scenario["screenshot"]
                with self.subTest(engine=key, screenshot=path.name):
                    self.assertTrue(path.name.startswith(f"BLUENT-ICON-{key}-RESPONSIVE-320-"))
                    self.assertGreater(path.stat().st_size, 3000)
                    self.assertEqual(b"\x89PNG\r\n\x1a\n", path.read_bytes()[:8])


if __name__ == "__main__":
    unittest.main()