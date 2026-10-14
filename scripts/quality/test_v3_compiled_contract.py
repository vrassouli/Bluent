"""Regression controls for compiled Bluent CLR component parameter signatures.

Run only after building 4 shipped libraries and V3CompiledInventory (CI compiled-clr job).
Edits temporary snapshots only; canonical contract is never modified.
"""
from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ORIGINAL = ROOT / "docs/v3/inventory/public-component-contracts.json"
CLI = [
    "dotnet", "run", "--project",
    str(ROOT / "scripts/quality/v3_compiled_inventory/V3CompiledInventory.csproj"),
    "-c", "Release", "--no-build", "--", str(ROOT),
]


class CompiledContractTests(unittest.TestCase):
    def run_check(self, snapshot: Path) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [*CLI, "--check-contracts", "--contracts-path", str(snapshot)],
            cwd=ROOT, capture_output=True, text=True, timeout=90, check=False,
        )

    def test_canonical_baseline_matches_real_assemblies(self):
        result = self.run_check(ORIGINAL)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("140 fully qualified public CLR types", result.stdout)

    def test_formatting_and_property_order_are_not_api_changes(self):
        payload = json.loads(ORIGINAL.read_text(encoding="utf-8"))
        # JSON indentation and object member order are not CLR metadata semantics.
        payload["Components"] = dict(reversed(list(payload["Components"].items())))
        with tempfile.TemporaryDirectory() as d:
            snapshot = Path(d) / "reformatted.json"
            snapshot.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
            result = self.run_check(snapshot)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_public_parameter_type_mutation_fails(self):
        payload = json.loads(ORIGINAL.read_text(encoding="utf-8"))
        key = "Bluent.UI::Bluent.UI.Components.Button"
        self.assertIn(key, payload["Components"])
        properties = payload["Components"][key]["Properties"]
        previous = properties["Appearance"]
        self.assertIn("ParameterAttribute", previous)
        properties["Appearance"] = "String | get=True set=True | ParameterAttribute"
        with tempfile.TemporaryDirectory() as d:
            snapshot = Path(d) / "tampered.json"
            snapshot.write_text(json.dumps(payload), encoding="utf-8")
            result = self.run_check(snapshot)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("CHANGED", result.stderr)
        self.assertIn("Appearance", result.stderr)

    def test_missing_exported_component_fails(self):
        payload = json.loads(ORIGINAL.read_text(encoding="utf-8"))
        del payload["Components"]["Bluent.UI::Bluent.UI.Components.Button"]
        with tempfile.TemporaryDirectory() as d:
            snapshot = Path(d) / "missing.json"
            snapshot.write_text(json.dumps(payload), encoding="utf-8")
            result = self.run_check(snapshot)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("ADDED", result.stderr)


if __name__ == "__main__":
    unittest.main()
