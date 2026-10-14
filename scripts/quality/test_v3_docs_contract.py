#!/usr/bin/env python3
"""#422: negative controls for v3 inventory drift guards."""
import unittest
import check_v3_docs_contract as docs


class V3DocsContractTests(unittest.TestCase):
    def setUp(self):
        self.lines = docs.INVENTORY.read_text(encoding="utf-8").splitlines()

    def test_actual_inventory_and_docs(self):
        self.assertEqual(docs.validate_inventory(), [])
        self.assertEqual(docs.validate_canonical_docs(), [])

    def test_stale_package_summary_detected(self):
        changed = [x.replace("| `Bluent.UI` | 58 | 58 | 1 |", "| `Bluent.UI` | 57 | 57 | 1 |") for x in self.lines]
        self.assertTrue(any("Bluent.UI: summary" in x for x in docs.validate_inventory(changed)))

    def test_stale_total_detected(self):
        changed = [x.replace("**66** | **66**", "**65** | **65**") for x in self.lines]
        self.assertTrue(any("Total summary" in x for x in docs.validate_inventory(changed)))

    def test_extra_family_without_summary_detected(self):
        i = next(i for i, line in enumerate(self.lines) if line.startswith("| [Accordion]"))
        changed = self.lines[:i] + ["| [Sample](accordion.md) | `Bluent.UI` | `src/Bluent.UI/Components/AccordionComponent/` | Source verified | Verify | Source only |"] + self.lines[i:]
        failures = docs.validate_inventory(changed)
        self.assertTrue(any("baseline has" in x for x in failures), failures)
        self.assertTrue(any("summary" in x for x in failures), failures)


if __name__ == "__main__":
    unittest.main()
