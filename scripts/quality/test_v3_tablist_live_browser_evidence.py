"""Guard for actual product browser observations, without false accessibility approval."""
import json
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
EV = ROOT / "docs/v3/quality/evidence/BLUENT-TABLIST-LIVE-BROWSER-20261022.json"
REPORT = ROOT / "docs/v3/quality/FOCUS-TABLIST-LIVE-BROWSER-20261022.md"

class LiveTabListObservation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(EV.read_text(encoding="utf-8-sig"))
        cls.report = REPORT.read_text(encoding="utf-8-sig")
    def test_six_real_browser_mode_observations(self):
        rows = self.data["results"]
        self.assertEqual(len(rows), 6)
        self.assertEqual({r["engine"] for r in rows}, {"chrome", "edge"})
        for engine in ("chrome", "edge"):
            self.assertEqual({r["mode"] for r in rows if r["engine"] == engine},
                             {"light-ltr", "dark-rtl", "forced-colors"})
    def test_observed_native_focus_and_non_roving_arrows(self):
        for row in self.data["results"]:
            self.assertEqual(row["elementTag"], "BUTTON")
            self.assertEqual(row["accessibilityRole"], "button")
            self.assertIsNone(row["ariaSelected"])
            self.assertTrue(row["nativeTabReached"])
            self.assertTrue(row["arrowRightStayedOnOriginal"])
            self.assertTrue(row["arrowLeftStayedOnOriginal"])
            self.assertTrue(row["pointerSelectionChanged"])
    def test_unapproved_status_explicit(self):
        self.assertIn("not Fluent parity", self.report)
        self.assertIn("not", self.data["scope"].lower())
        self.assertIn("owner #465", self.report)
if __name__ == "__main__":
    unittest.main()
