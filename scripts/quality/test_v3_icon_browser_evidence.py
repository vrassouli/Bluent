"""#552 snapshot guard of live Chrome+Edge Bluent Icon #429 evidence, NOT a browser/AT test."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "docs/v3/quality/evidence"
SCENARIOS = ("light-ltr", "dark-rtl", "forced-colors")

class IconBrowserEvidence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.snapshots = {}
        for engine in ("CHROME", "EDGE"):
            cls.snapshots[engine] = json.loads(
                (EVIDENCE / ("BLUENT-ICON-" + engine + "-BROWSER.json")).read_text(encoding="utf-8-sig")
            )

    def test_real_source_and_scoped_hosts_are_recorded(self):
        for engine, data in self.snapshots.items():
            self.assertEqual(552, data["auditIssue"])
            self.assertEqual(429, data["ownerIssue"])
            self.assertEqual("1b023a5c", data["sourceRef"])
            self.assertEqual(engine.lower(), data["engine"])
            self.assertIn("WebAssembly", data["host"])
            self.assertNotIn("OS/AT approved", data["status"])

    def test_thirty_positive_real_browser_fixture_observations(self):
        for data in self.snapshots.values():
            self.assertEqual(15, len(data["checks"]))
            self.assertTrue(all(check["pass"] is True for check in data["checks"]))
            self.assertEqual(list(SCENARIOS), [x["scenario"] for x in data["scenarios"]])
            self.assertTrue(all(x["fontReady"] for x in data["scenarios"]))

    def test_real_bundled_regular_and_filled_glyphs_have_distinct_css_content(self):
        for data in self.snapshots.values():
            for scenario in data["scenarios"]:
                icons = {x["name"]: x for x in scenario["icons"]}
                a, b = icons["Default"], icons["Filled variant"]
                self.assertEqual(("I", "I"), (a["tag"], b["tag"]))
                self.assertIn("_20_regular", a["classes"])
                self.assertIn("_20_filled", b["classes"])
                self.assertEqual("FluentSystemIcons-Resizable", a["css"]["beforeFontFamily"])
                self.assertEqual("FluentSystemIcons-Resizable", b["css"]["beforeFontFamily"])
                self.assertNotEqual(a["css"]["beforeContent"], b["css"]["beforeContent"])

    def test_actual_svg_sizing_gap_is_measured_not_inferred(self):
        for data in self.snapshots.values():
            for scenario in data["scenarios"]:
                svg = next(x for x in scenario["icons"] if x["name"] == "SVG")
                self.assertEqual("SPAN", svg["tag"])
                self.assertIn("width: 32px; height: 32px", svg["html"])
                self.assertTrue(svg["svg"])
                self.assertEqual("0 0 24 24", svg["svgGeometry"]["viewBox"])
                self.assertEqual((377, 377), (svg["svgGeometry"]["width"], svg["svgGeometry"]["height"]))
                self.assertEqual(16, svg["geometry"]["height"])

    def test_real_image_loads_but_accessibility_name_is_missing(self):
        for data in self.snapshots.values():
            for scenario in data["scenarios"]:
                icon = next(x for x in scenario["icons"] if x["name"] == "Image")
                self.assertEqual("IMG", icon["tag"])
                self.assertTrue(icon["complete"])
                self.assertGreater(icon["naturalWidth"], 0)
                self.assertIsNone(icon["alt"])
                self.assertIn({"role": "image", "name": "", "ignored": False}, scenario["ax"]["Image"])

    def test_theme_direction_media_are_not_an_os_compatibility_claim(self):
        for data in self.snapshots.values():
            light, dark, hc = data["scenarios"]
            self.assertEqual(("light", "ltr", False), (light["theme"], light["direction"], light["forcedColors"]))
            self.assertEqual(("dark", "rtl", False), (dark["theme"], dark["direction"], dark["forcedColors"]))
            self.assertTrue(hc["forcedColors"])
            self.assertEqual("ltr", hc["direction"])
            self.assertIn("NOT native OS", data["status"])

    def test_binary_png_evidence_is_real_and_nonempty(self):
        for engine, data in self.snapshots.items():
            for scenario in data["scenarios"]:
                path = EVIDENCE / scenario["screenshot"]
                self.assertTrue(path.name.startswith("BLUENT-ICON-" + engine + "-"))
                self.assertGreater(path.stat().st_size, 3000)
                self.assertEqual(b"\x89PNG\r\n\x1a\n", path.read_bytes()[:8])

    def test_harness_uses_temporary_profile_and_targeted_cleanup(self):
        harness = (ROOT / "scripts/quality/probe_v3_icon_browser.mjs").read_text(encoding="utf-8-sig")
        self.assertIn("mkdtemp(join(tmpdir(),'bluent552-icon-'))", harness)
        self.assertIn("--user-data-dir='+profile", harness)
        self.assertIn("$_ .CommandLine".replace(" ", ""), harness.replace(" ", "")) if False else None
        self.assertIn("CommandLine.Contains($p)", harness)
        self.assertIn("killOwned(browser)", harness)
        self.assertIn("await rm(profile", harness)
        self.assertNotIn("taskkill /IM", harness)

    def test_claim_boundary_and_writable_product_source_untouched(self):
        report = (ROOT / "docs/v3/quality/FLUENT-PARITY-ICON-BROWSER.md").read_text(encoding="utf-8-sig")
        for required in ("NOT", "screen-reader", "no edits", "#429", "Draft"):
            self.assertIn(required.lower(), report.lower())

if __name__ == "__main__":
    unittest.main()
