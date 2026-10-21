"""Static evidence guard for #552 TabList source-gap report; no product parity claim."""
from pathlib import Path
import json
import unittest

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src/Bluent.UI/Components/TabListComponent"
REPORT = ROOT / "docs/v3/quality/FOCUS-TABLIST-SOURCE-GAPS.md"
MATRIX = ROOT / "docs/v3/quality/FOCUS-KEYBOARD-ACCEPTANCE-MATRIX.json"


class TabListGapSourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.parent = (SRC / "TabList.razor").read_text(encoding="utf-8")
        cls.logic = (SRC / "TabList.razor.cs").read_text(encoding="utf-8")
        cls.item = (SRC / "TabListTabItem.razor").read_text(encoding="utf-8")
        cls.item_logic = (SRC / "TabListTabItem.razor.cs").read_text(encoding="utf-8")
        cls.report = REPORT.read_text(encoding="utf-8")

    def test_report_explicitly_research_only(self):
        for word in ("source evidence only", "not a Fluent parity acceptance", "#465", "#420"):
            self.assertIn(word, self.report)

    def test_item_has_click_but_no_managed_keyboard_contract(self):
        self.assertIn('"onclick"', self.item)
        self.assertNotIn('"onkeydown"', self.item)
        self.assertNotIn("FocusedIndex", self.logic)
        self.assertIn("SelectedIndex", self.logic)

    def test_no_managed_tab_aria_in_renderers(self):
        for source in (self.parent, self.item):
            for token in ('aria-selected', 'aria-controls', 'aria-labelledby', '"tablist"', '"tab"'):
                self.assertNotIn(token, source)
        self.assertIn('class="tab-panel', self.parent)

    def test_navigation_link_must_be_distinguished(self):
        self.assertIn('return "a"', self.item_logic)
        self.assertIn('return "button"', self.item_logic)
        self.assertIn('"href"', self.item)
        self.assertIn("NavigationManager_LocationChanged", self.item_logic)

    def test_owner_acceptance_remains_unverified(self):
        matrix = json.loads(MATRIX.read_text(encoding="utf-8"))
        cases = [c for c in matrix["cases"] if c["owner_issue"] == 465]
        self.assertTrue(cases)
        self.assertTrue(all(c["status"] == "planned" and c["evidence"] is None for c in cases))


if __name__ == "__main__":
    unittest.main()
