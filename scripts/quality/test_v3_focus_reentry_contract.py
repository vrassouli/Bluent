"""#552 Wave H research-only contract; not a native browser accessibility test."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
FIX=ROOT/'scripts/quality/fixtures/focus-navigation-core-prototype.mjs'
DOC=ROOT/'docs/v3/quality/FOCUS-KEYBOARD-REENTRY-DECISION.md'
CASES=ROOT/'docs/v3/quality/FOCUS-KEYBOARD-ACCEPTANCE-MATRIX.json'
class ReentryResearchContract(unittest.TestCase):
 def test_reentry_policy_is_pure_and_backward_compatible(self):
  text=FIX.read_text(encoding='utf-8-sig')
  self.assertIn('focusWithin=true',text)
  self.assertIn("focusWithin must be boolean",text)
  self.assertIn('focusWithin?[focusedId,selectedId]:[selectedId,focusedId]',text)
  self.assertNotIn('document.activeElement',text)
 def test_policy_only_not_design_approval(self):
  text=DOC.read_text(encoding='utf-8-sig')
  for term in ('PROPOSED ONLY','NOT APPROVED','native screen-reader','#420','#465','Href','Tab/Shift+Tab','43 pure'):
   self.assertIn(term.lower(),text.lower())
 def test_33_component_acceptances_still_open(self):
  matrix=json.loads(CASES.read_text(encoding='utf-8-sig'))
  self.assertEqual(33,len(matrix['cases']))
  self.assertEqual('not-executed',matrix['validation_status'])
  self.assertTrue(all(x['status']=='planned' and x['evidence'] is None for x in matrix['cases']))
 def test_new_tests_are_pure_only(self):
  text=(ROOT/'scripts/quality/test_v3_focus_reentry_proposal.mjs').read_text(encoding='utf-8-sig')
  self.assertEqual(8,text.count("test('"))
  self.assertNotIn('Input.dispatchKeyEvent',text)
if __name__=='__main__':unittest.main()
