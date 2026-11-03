import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = ROOT / "docs" / "v3" / "quality" / "evidence"
EXPECTED = {
    ("chrome", "wasm"): "BLUENT-ICON-ATTRIBUTE-COLLISIONS-WASM-CHROME.json",
    ("edge", "wasm"): "BLUENT-ICON-ATTRIBUTE-COLLISIONS-WASM-EDGE.json",
    ("chrome", "interactive-server"): "BLUENT-ICON-ATTRIBUTE-COLLISIONS-INTERACTIVE-SERVER-CHROME.json",
    ("edge", "interactive-server"): "BLUENT-ICON-ATTRIBUTE-COLLISIONS-INTERACTIVE-SERVER-EDGE.json",
}
EXPECTED_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='lime'/%3E%3C/svg%3E"


class IconAttributeCollisionEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.reports = {}
        for key, filename in EXPECTED.items():
            with (EVIDENCE_DIR / filename).open(encoding="utf-8") as handle:
                cls.reports[key] = json.load(handle)

    def test_all_four_browser_renderer_records_are_well_formed(self):
        for (engine, renderer), report in self.reports.items():
            with self.subTest(engine=engine, renderer=renderer):
                self.assertEqual(report["auditIssue"], 552)
                self.assertEqual(report["ownerIssue"], 429)
                self.assertRegex(report["sourceRevision"], r"^[0-9a-f]{40}$")
                self.assertEqual(report["engine"], engine)
                self.assertEqual(report["renderer"], renderer)
                self.assertTrue(report["browserVersion"].startswith("Edg/" if engine == "edge" else "Chrome/"))
                self.assertEqual(report["viewport"], {"width": 1280, "height": 900})
                self.assertIn("not Fluent parity", report["status"])

    def test_each_record_has_twenty_passing_unique_observations(self):
        for key, report in self.reports.items():
            with self.subTest(engine=key[0], renderer=key[1]):
                checks = report["checks"]
                self.assertEqual(len(checks), 20)
                self.assertEqual(len({check["name"] for check in checks}), 20)
                self.assertTrue(all(check["pass"] for check in checks))
                self.assertEqual(report["consoleErrors"], [])

    def test_each_renderer_records_attribute_precedence_and_real_click(self):
        for key, report in self.reports.items():
            with self.subTest(engine=key[0], renderer=key[1]):
                observed = report["observed"]
                self.assertEqual(observed["renderer"], key[1])
                self.assertGreaterEqual(observed["clickCount"], 1)
                self.assertEqual(
                    [item["tag"] for item in observed["icons"]],
                    ["SPAN", "IMG", "I"],
                )
                for icon in observed["icons"]:
                    with self.subTest(icon=icon["id"]):
                        names = icon["attributeNames"]
                        for attribute in ("id", "class", "style"):
                            self.assertEqual(names.count(attribute), 1)
                        self.assertEqual(icon["idValue"], icon["id"])
                        self.assertEqual(icon["probeValue"], icon["id"])
                        self.assertIn("parameter-class", icon["classValue"])
                        self.assertNotIn("attribute-class", icon["classValue"])
                        self.assertEqual(icon["styleWidth"], "2em")
                        self.assertEqual(icon["styleColor"], "")
                image = next(item for item in observed["icons"] if item["id"] == "icon-probe-image")
                self.assertEqual(image["src"], EXPECTED_IMAGE)
                self.assertEqual(image["attributeNames"].count("src"), 1)
                self.assertGreater(image["imageNaturalWidth"], 0)

    def test_only_the_known_ssr_app_css_resource_failure_is_recorded(self):
        for (engine, renderer), report in self.reports.items():
            failures = report["resourceFailures"]
            with self.subTest(engine=engine, renderer=renderer):
                if renderer == "wasm":
                    self.assertEqual(failures, [])
                else:
                    self.assertTrue(failures)
                    self.assertTrue(all("/app.css" in failure for failure in failures))
                    self.assertTrue(any("404" in failure for failure in failures))
                    self.assertTrue(any("ERR_ABORTED" in failure for failure in failures))


if __name__ == "__main__":
    unittest.main()
