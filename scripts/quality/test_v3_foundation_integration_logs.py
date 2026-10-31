"""Negative controls for historical four-mode real Blazor integration evidence."""
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from audit_v3_foundation_integration_logs import MODES, audit_log, verify_matrix

HEADS = {
    "418": "a" * 40, "420": "b" * 40,
    "425": "c" * 40, "421": "d" * 40,
}


class FoundationIntegrationLogPolicy(unittest.TestCase):
    def setUp(self):
        self.tmp = TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self.inputs = {}
        for n, (mode, (label, count)) in enumerate(MODES.items()):
            self.inputs[mode] = self.base / (mode + ".log")
            self.write(mode, {
                "classification": label, "passed": count,
                "total": count, "failed": 0, "errors": []
            }, port=54001+n)

    def write(self, mode, report, port=54001, extra=""):
        self.inputs[mode].write_text(
            f"v3 isolated deep probe origin: http://127.0.0.1:{port}\n"
            + extra + json.dumps(report) + "\n",
            encoding="utf-8",
        )

    def test_checked_in_evidence_has_honest_historical_scope(self):
        path = Path(__file__).resolve().parents[2] / (
            "docs/v3/quality/FOUNDATION-INTEGRATION-EVIDENCE-2026-10-18.json"
        )
        manifest = json.loads(path.read_text(encoding="utf-8-sig"))
        self.assertEqual(manifest["classification"], "historical-local-runtime-evidence-only")
        self.assertEqual(manifest["total"], 3798)
        self.assertEqual(manifest["passed"], 3798)
        self.assertEqual(set(manifest["task_heads"]), {"418", "420", "425", "421"})
        self.assertEqual(set(x["mode"] for x in manifest["modes"]), set(MODES))
        self.assertEqual(len(set(x["origin_port"] for x in manifest["modes"])), 4)
        self.assertIn("screen reader", " ".join(manifest["not_certified"]).lower())
        for entry in manifest["modes"]:
            self.assertEqual(entry["passed"], MODES[entry["mode"]][1])
            self.assertRegex(entry["log_sha256"], r"^[0-9a-f]{64}$")
            self.assertNotIn("\\", entry["log_basename"])
    def test_genuine_four_mode_contract(self):
        report = verify_matrix(self.inputs, HEADS)
        self.assertEqual(report["passed"], 3798)
        self.assertEqual(report["total"], 3798)
        self.assertEqual(len(report["modes"]), 4)
        self.assertIn("historical-local", report["classification"])
        self.assertTrue(report["not_certified"])

    def test_does_not_accept_failed_or_missing_browser_assertion(self):
        for mode, (label, count) in MODES.items():
            self.write(mode, {
                "classification": label, "passed": count-1,
                "total": count, "failed": 1, "errors": ["bad"]
            })
            with self.assertRaisesRegex(ValueError, "not all"):
                audit_log(mode, self.inputs[mode])
            self.write(mode, {
                "classification": label, "passed": count,
                "total": count, "failed": 0, "errors": []
            }, port=54001+list(MODES).index(mode))

    def test_wrong_mode_and_duplicate_source_disallowed(self):
        self.write("edge_wasm", {
            "classification": MODES["chrome_wasm"][0],
            "passed": 950, "total": 950, "failed": 0, "errors": []
        })
        with self.assertRaisesRegex(ValueError, "classification"):
            verify_matrix(self.inputs, HEADS)
        self.inputs.pop("edge_wasm")
        with self.assertRaisesRegex(ValueError, "Four independent"):
            verify_matrix(self.inputs, HEADS)

    def test_port_collision_disallowed(self):
        a = self.inputs["edge_wasm"].read_text()
        self.inputs["edge_wasm"].write_text(a.replace(":54003", ":54001"))
        with self.assertRaisesRegex(ValueError, "same localhost port"):
            verify_matrix(self.inputs, HEADS)

    def test_truncated_json_and_explicit_diagnostic_rejected(self):
        path = self.inputs["chrome_wasm"]
        path.write_text("v3 isolated deep probe origin: http://127.0.0.1:54001\n"
                        + '{"classification": "partial",', encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "truncated"):
            audit_log("chrome_wasm", path)
        self.write("chrome_wasm", {
            "classification": MODES["chrome_wasm"][0],
            "passed": 950, "total": 950, "failed": 0, "errors": []
        }, extra="Probe error: real browser failed\n")
        with self.assertRaisesRegex(ValueError, "diagnostic"):
            audit_log("chrome_wasm", path)

    def test_invalid_head_or_duplicated_source_report_rejected(self):
        with self.assertRaisesRegex(ValueError, "HEAD"):
            verify_matrix(self.inputs, {"418": "short"})
        self.inputs["edge_wasm"].write_bytes(self.inputs["chrome_wasm"].read_bytes())
        with self.assertRaises(ValueError):
            verify_matrix(self.inputs, HEADS)


if __name__ == "__main__":
    unittest.main()