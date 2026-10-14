"""#494 source inventory invariants; runtime and public API remain unverified."""
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("audit_v3_public_inventory", ROOT / "scripts/quality/audit_v3_public_inventory.py")
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class InventoryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.payload = audit.payload()
        cls.rows = cls.payload["components"]

    def test_family_count_corrected(self):
        self.assertEqual(self.payload["retrievalFamilies"]["Bluent.UI"], 58)
        self.assertEqual(self.payload["retrievalFamiliesTotal"], 66)
        self.assertEqual(len(audit.ISSUES), 66)

    def test_markdown_summary_matches_actual_row_counts(self):
        text = audit.INVENTORY.read_text(encoding="utf-8-sig")
        summary = text.split("## Coverage summary", 1)[1].split("## Prioritization", 1)[0]
        q = chr(96)
        self.assertIn("| " + q + "Bluent.UI" + q + " | 58 | 58 | 1 |", summary)
        self.assertIn("| **Total** | **66** | **66** | **1** |", summary)
    def test_generic_dataset_not_lost_behind_abstract_base(self):
        names = [r["markupName"] for r in self.rows if r["package"] == "Bluent.UI.Charts"]
        self.assertIn("Dataset", names)
        self.assertNotIn("Scale", names)
        self.assertTrue({"Chart", "Legend", "Tooltip", "XScale", "YScale", "Gauge"}.issubset(names))

    def test_razor_and_csharp_components(self):
        self.assertTrue(any(r["markupName"] == "AccordionPanel" and r["sourceKind"] == "razor" for r in self.rows))
        self.assertTrue(any(r["markupName"] == "DataGridColumn" and r["sourceKind"] == "csharp" for r in self.rows))
        self.assertTrue(any(r["markupName"] == "Circle" and r["sourceKind"] == "csharp" for r in self.rows))

    def test_internal_paths_require_manual_classification(self):
        rows = [r for r in self.rows if "/Internal/" in r["source"] or "/Internals/" in r["source"]]
        self.assertGreater(len(rows), 0)
        self.assertTrue(all(r["classification"] == "internal-path-review" for r in rows))

    def test_candidate_issues_and_deduplicated_sources(self):
        ids = [(r["package"], r["source"], r["markupName"]) for r in self.rows]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertTrue(all(r["familyIssue"] in range(428, 494) for r in self.rows if r["classification"] == "public-candidate"))

    def test_all_dedicated_component_issue_routes(self):
        for (package, name), (issue, example, kind) in audit.EXPLICIT_COMPONENT_ROUTES.items():
            matches = [r for r in self.rows if r["package"] == package and r["markupName"] == name]
            self.assertEqual(len(matches), 1, (package, name))
            self.assertEqual(matches[0]["componentIssue"], issue)
            self.assertEqual(matches[0]["routing"], "dedicated-source-routed")
            self.assertEqual(matches[0]["consumerExample"], example)
            self.assertEqual(matches[0]["evidenceKind"], kind)
        self.assertEqual(len(audit.EXPLICIT_COMPONENT_ROUTES), 42)
        self.assertEqual(len({value[0] for value in audit.EXPLICIT_COMPONENT_ROUTES.values()}), 42)
    def test_one_component_owns_each_multitag_family_parent(self):
        for family, name in audit.FAMILY_PRIMARY_COMPONENTS.items():
            matching = [r for r in self.rows if r["family"] == family and r["markupName"] == name]
            self.assertEqual(len(matching), 1, (family, name))
            owner = matching[0]
            self.assertEqual(owner["componentIssue"], audit.ISSUES[family])
            self.assertEqual(owner["routing"], "family-primary-provisional")
        self.assertEqual(len(audit.FAMILY_PRIMARY_COMPONENTS), 22)

    def test_infrastructure_base_never_becomes_public_tag(self):
        matches = [row for row in self.rows if row["markupName"] == "PopoverContainerBase"]
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]["classification"], "infrastructure-review")
        self.assertIsNone(matches[0]["componentIssue"])

    def test_explicit_consumer_examples_do_not_disappear(self):
        for (package, name), (_, example, kind) in audit.EXPLICIT_COMPONENT_ROUTES.items():
            if kind == "source-only":
                self.assertIsNone(example)
                continue
            text = (ROOT / example).read_text(encoding="utf-8-sig")
            pattern = (r"<" + __import__("re").escape(name) + r"(?=[\s/>])"
                       if kind == "markup" else
                       r"\b" + __import__("re").escape(name) + r"\b")
            self.assertRegex(text, pattern)

    def test_documented_consumer_infrastructure_never_excluded(self):
        expected = {"Containers": 544, "DockBar": 545, "DockContainer": 546, "DrawerContent": 547}
        for name, issue in expected.items():
            matching = [r for r in self.rows if r["package"] == "Bluent.UI" and r["markupName"] == name]
            self.assertEqual(len(matching), 1)
            self.assertTrue(matching[0]["consumerInfrastructure"])
            self.assertEqual(matching[0]["classification"], "public-candidate")
            self.assertEqual(matching[0]["componentIssue"], issue)
            self.assertEqual(matching[0]["evidenceKind"], "markup")
        master = next(r for r in self.rows if r["markupName"] == "MasterContainer")
        self.assertEqual(master["classification"], "public-candidate")
        self.assertEqual(master["componentIssue"], 548)
        self.assertEqual(master["evidenceKind"], "source-only")

    def test_every_public_candidate_has_exactly_one_issue(self):
        public = [r for r in self.rows if r["classification"] == "public-candidate"]
        self.assertTrue(all(r["componentIssue"] is not None for r in public))
        issues = [r["componentIssue"] for r in public]
        self.assertEqual(len(issues), len(set(issues)))

    def test_composite_internal_exceptions_are_explicit(self):
        for name, reason in audit.NON_CONSUMER_COMPONENTS.items():
            matches = [r for r in self.rows if r["markupName"] == name]
            self.assertEqual(len(matches), 1)
            self.assertEqual(matches[0]["classification"], "internal-composite-review")
            self.assertEqual(matches[0]["exceptionReason"], reason)
            self.assertIsNone(matches[0]["componentIssue"])

    def test_abstract_overflow_is_not_direct_consumer_markup(self):
        row = next(r for r in self.rows if r["markupName"] == "Overflow")
        self.assertEqual(row["classification"], "abstract-public-api")
        self.assertEqual(row["familyIssue"], 472)
        self.assertIsNone(row["componentIssue"])
        self.assertIn("abstract", row["exceptionReason"])
        docs = (ROOT / "docs/components/overflow.md").read_text(encoding="utf-8")
        self.assertIn("Do not generate", docs)

    def test_tooltip_retrieval_family_is_not_a_fake_component(self):
        self.assertEqual(self.payload["nonComponentFamilyExceptions"], {"Tooltip": 456, "Overflow": 472})
        self.assertTrue(
            all(row["family"] != "Tooltip" for row in self.rows
                if row["classification"] == "public-candidate")
        )
        tip = (ROOT / "docs/components/tooltip.md").read_text(encoding="utf-8")
        self.assertIn("there is not a normal consumer-facing", tip)

    def test_no_excluded_candidate_used_directly_by_consumer_markup(self):
        import re
        consumer_files = [
            *sorted((ROOT / "src/Bluent.UI.Demo.Pages").rglob("*.razor")),
            *sorted((ROOT / "docs/components").glob("*.md")),
        ]
        tags = set()
        for path in consumer_files:
            content = path.read_text(encoding="utf-8-sig")
            tags.update(re.findall(r"<([A-Z][a-zA-Z0-9]*)(?=[\\s/>])", content))
        excluded = [r for r in self.rows if r["classification"] not in {"public-candidate", "abstract-public-api"}]
        leaked = [(r["markupName"], r["classification"]) for r in excluded if r["markupName"] in tags]
        self.assertEqual(
            leaked, [],
            "Consumer-facing markup cannot be silently excluded as infrastructure. "
            "Reclassify with an independent issue or document an explicit exception.",
        )

    def test_snapshot_drift(self):
        self.assertEqual(json.loads(audit.OUT.read_text(encoding="utf-8")), self.payload)
        self.assertEqual(self.payload["penpot"]["pageId"], "44b12572-0104-807e-8008-ca032a4746f0")
        self.assertEqual(sum(r["routing"] == "sole-family-provisional" for r in self.rows), 42)
        self.assertTrue(all(r["verification"] == "source-candidate" for r in self.rows))
        self.assertTrue(all(r["componentIssue"] == r["familyIssue"] for r in self.rows if r["routing"] == "sole-family-provisional"))


if __name__ == "__main__":
    unittest.main()
