from __future__ import annotations
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
QUALITY = ROOT / "docs/v3/quality"
EVIDENCE = QUALITY / "evidence"
SOURCE_REF = "7165a7671044b9c58b7d0c96cc93bf2b2b97fd52"
EXPECTED_CHECKS = 19
EXPECTED_SCREENSHOTS = {
    "LIGHT-LTR", "DARK-RTL", "FORCED-COLORS", "REDUCED-MOTION",
}


class LabelLinkBadgeInteractiveServerEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = (QUALITY / "FLUENT-PARITY-LABEL-LINK-BADGE-BROWSER-AUDIT.md").read_text(encoding="utf-8-sig")
        cls.link_report = (QUALITY / "FLUENT-PARITY-LINK-AUDIT.md").read_text(encoding="utf-8-sig")
        cls.matrix = json.loads((QUALITY / "FLUENT-PARITY-RETRO-AUDIT.json").read_text(encoding="utf-8-sig"))
        cls.route = (ROOT / "src/Bluent.UI.Demo.SSR/Components/Pages/Issue552LabelLinkBadgeProbe.razor").read_text(encoding="utf-8-sig")
        cls.probe = (ROOT / "scripts/quality/probe_v3_label_link_badge_interactive_server.mjs").read_text(encoding="utf-8-sig")
        cls.runs = {
            engine: json.loads((EVIDENCE / f"BLUENT-LABEL-LINK-BADGE-INTERACTIVE-SERVER-{engine.upper()}.json").read_text(encoding="utf-8-sig"))
            for engine in ("chrome", "edge")
        }

    def test_both_engines_have_complete_zero_failure_interactive_server_runs(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                self.assertEqual(engine, run["engine"])
                self.assertEqual(SOURCE_REF, run["sourceRef"])
                self.assertEqual("published Production Blazor InteractiveServer", run["renderer"])
                self.assertEqual(EXPECTED_CHECKS, run["summary"]["checks"])
                self.assertEqual(EXPECTED_CHECKS, run["summary"]["passed"])
                self.assertEqual(0, run["summary"]["failed"])
                self.assertEqual(EXPECTED_CHECKS, len(run["checks"]))
                self.assertTrue(all(item["pass"] for item in run["checks"]))

    def test_real_server_round_trip_and_disabled_link_callback_are_reproduced(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                sentinel = run["sentinelEvidence"]
                self.assertEqual("0", sentinel["before"])
                self.assertEqual("1", sentinel["after"])
                self.assertTrue(sentinel["endpoint"].endswith("/__quality/server-label-link-badge-probe"))

                callback = run["disabledLinkActivationEvidence"]
                self.assertEqual("0", callback["before"])
                self.assertEqual("1", callback["after"])
                keyboard = run["keyboardProbeEvidence"]
                self.assertEqual("1", keyboard["before"])
                self.assertEqual(0, keyboard["disabledLinkTabindexProperty"])
                self.assertIsNone(keyboard["disabledLinkTabindexAttribute"])
                self.assertTrue(keyboard["startFocus"]["isInfoAction"])
                self.assertEqual("server-interaction-sentinel", keyboard["firstTabAfterLabel"]["id"])
                self.assertEqual("BUTTON", keyboard["firstTabAfterLabel"]["tag"])
                self.assertFalse(keyboard["firstTabAfterLabel"]["isDisabledLink"])
                self.assertFalse(keyboard["focusedViaTab"])
                self.assertIsNone(keyboard["afterEnter"])
                self.assertIsNone(keyboard["afterSpace"])
                self.assertTrue(any("Sequential Tab skips the disabled Link" in c["name"] and c["pass"] for c in run["checks"]))
                element = callback["disabledElement"]
                self.assertEqual("A", element["tag"])
                self.assertTrue(element["disabledAttribute"])
                self.assertIsNone(element["hrefAttribute"])
                self.assertIsNone(element["ariaDisabled"])
                self.assertEqual(0, element["tabIndex"])
                check = next(c for c in run["checks"] if "OnClick callback after a real pointer click" in c["name"])
                self.assertTrue(check["pass"])
                self.assertEqual("0", check["actual"]["before"])
                self.assertEqual("1", check["actual"]["after"])

    def test_modes_and_screenshots_are_present_and_nonempty(self):
        for engine, run in self.runs.items():
            with self.subTest(engine=engine):
                self.assertEqual(EXPECTED_SCREENSHOTS, {case["mode"]["name"] for case in run["cases"]})
                screenshots = run["summary"]["screenshots"]
                self.assertEqual(4, len(screenshots))
                for screenshot in screenshots:
                    path = EVIDENCE / screenshot
                    self.assertTrue(path.is_file(), screenshot)
                    self.assertGreater(path.stat().st_size, 1000, screenshot)
                    self.assertIn(engine.upper(), screenshot)

    def test_probe_route_and_cleanup_are_explicitly_qa_only_and_profile_scoped(self):
        self.assertIn('@rendermode InteractiveServer', self.route)
        self.assertIn('/__quality/server-label-link-badge-probe', self.route)
        self.assertIn('OnClick="IncrementDisabledLinkCount"', self.route)
        self.assertIn('disabledLinkClickCount++', self.route)
        self.assertIn('QA-only instrumentation route', self.route)
        self.assertIn('cleanupOwnedBrowserProcesses', self.probe)
        self.assertIn('Contains($profile)', self.probe)
        self.assertNotIn('taskkill.exe /IM', self.probe)
        self.assertNotIn('taskkill /IM', self.probe)

    def test_report_updates_pointer_evidence_without_overstating_native_at_or_parity(self):
        self.assertIn("Published Production InteractiveServer follow-up", self.report)
        self.assertIn("19/19 checks pass", self.report)
        self.assertIn("38/38 combined", self.report)
        self.assertIn("still invokes its supplied OnClick callback", self.report)
        self.assertIn("focus moves directly to the server-interaction sentinel and skips the disabled Link", self.report)
        self.assertIn("Forced Colors and Reduced Motion above are browser emulation", self.report)
        self.assertIn("keyboard activation behavior", self.report)
        self.assertIn("native screen-reader behavior remains untested", self.report)
        self.assertIn("Pointer/runtime gap and sequential-focus gap reproduced", self.link_report)
        self.assertIn("Enter/Space on the anchor and native AT remain untested", self.link_report)

    def test_link_remains_audited_gap_and_no_family_is_promoted(self):
        self.assertFalse(self.matrix["auditComplete"])
        self.assertTrue(self.matrix["noneApproved"])
        for family in self.matrix["families"]:
            self.assertEqual("pending", family["designApproval"])
            self.assertIsNone(family["evidenceBundle"])
            self.assertTrue(all(value == "audited_gaps" for value in family["dimensions"].values()))
        link = next(f for f in self.matrix["families"] if f["family"] == "Link")
        self.assertEqual("known_gaps_open", link["gapDisposition"])
        self.assertIn("pointer click", link["notesForReview"])


if __name__ == "__main__":
    unittest.main()
