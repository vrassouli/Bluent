"""#420: current consumer API sample with real EditContext and Task callbacks."""
from __future__ import annotations
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
PAGE=ROOT/"samples/Bluent.TaskExamples/Pages/Tasks/V3InteractionConventions.razor"
NAV=ROOT/"samples/Bluent.TaskExamples/Layout/MainLayout.razor"

class ConsumerInteractionSampleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.page=PAGE.read_text(encoding="utf-8-sig")

    def test_existing_editcontext_and_binding_contract(self):
        for text in ('<EditForm EditContext="_context" OnValidSubmit="SaveAsync">',
                     '<DataAnnotationsValidator />','@bind-Value="_draft.Customer"',
                     '@bind-Value="_draft.Accepted"','<ValidationMessage',
                     'BindValueEvent="oninput"'):
            self.assertIn(text,self.page)

    def test_async_callback_has_status_disabled_and_cleanup(self):
        for text in ('private async Task SaveAsync()','_busy = true;',
                     'finally','_busy = false;','disabled="@_busy"',
                     'aria-busy="@_busy"','role="status"','aria-live="polite"'):
            self.assertIn(text,self.page)
        self.assertNotIn("async void",self.page)

    def test_example_reachable_from_navigation(self):
        self.assertIn('@page "/tasks/v3-interaction-conventions"',self.page)
        self.assertIn('href="tasks/v3-interaction-conventions"',
                      NAV.read_text(encoding="utf-8-sig"))

if __name__=="__main__":
    unittest.main()
