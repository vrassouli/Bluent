"""Guards the conservative #552 React API semantic triage report."""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPORT = ROOT / "docs/v3/quality/FLUENT-REACT-9.74.10-SEMANTIC-TRIAGE.md"
FAMILIES = (
    "Button", "Icon", "Label", "Link", "Badge", "TextField", "NumericField",
    "Checkbox", "Switch", "RadioGroup", "SelectField", "DateField", "TimeField",
    "MaskedField", "OtpField", "Slider", "RangeSlider", "FileSelect",
)

class SemanticTriageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = REPORT.read_text(encoding="utf-8-sig")

    def test_all_18_families_have_explicit_dispositions(self):
        self.assertIn("## Family-by-family semantic disposition", self.text)
        for family in FAMILIES:
            self.assertIn(f"| {family} |", self.text, family)

    def test_report_does_not_promote_name_matches_to_parity(self):
        self.assertIn("zero parity approvals", self.text)
        self.assertIn("Approved mappings: 0", self.text)
        self.assertIn("not_reviewed` / `not_inferred", self.text)

    def test_non_equivalence_and_high_risk_contracts_are_preserved(self):
        for phrase in (
            "RangeSlider", "Not equivalent", "FileSelect", "MaxFiles",
            "ToggleButton", "CompoundButton", "Dropdown and Combobox",
            "published InteractiveServer", "native OS/assistive technology",
        ):
            self.assertIn(phrase, self.text)

if __name__ == "__main__":
    unittest.main()
