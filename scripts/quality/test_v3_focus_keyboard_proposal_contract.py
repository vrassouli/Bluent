"""#552: proposal/matrix static guards, NOT runtime component tests."""
import json
import re
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
DOC=ROOT/'docs/v3/quality/FOCUS-KEYBOARD-ARCHITECTURE-PROPOSAL.md'
MATRIX=ROOT/'docs/v3/quality/FOCUS-KEYBOARD-ACCEPTANCE-MATRIX.json'
RESEARCH=ROOT/'docs/v3/quality/FOCUS-KEYBOARD-CORE-RESEARCH.md'
class FocusKeyboardProposalContract(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.doc=DOC.read_text(encoding='utf-8-sig')
  cls.matrix=json.loads(MATRIX.read_text(encoding='utf-8-sig'))
  cls.research=RESEARCH.read_text(encoding='utf-8-sig')
 def test_not_approved_or_component_implementation(self):
  self.assertIn('PROPOSED, NOT APPROVED',self.doc)
  self.assertIn('not** a Bluent production implementation',self.doc)
  self.assertIn('PR #553',self.doc)
  self.assertIn('stable `Dev`',self.doc)
  self.assertEqual('proposal',self.matrix['artifact_status'])
  self.assertEqual('not-executed',self.matrix['validation_status'])
 def test_33_cases_all_planned_with_no_evidence(self):
  self.assertEqual(33,len(self.matrix['cases']))
  self.assertEqual(552,self.matrix['audit_issue'])
  self.assertTrue(all(c['status']=='planned' and c['evidence'] is None for c in self.matrix['cases']))
 def test_owner_groups_and_case_identifiers(self):
  groups={'TABS':(7,465),'NAV':(6,466),'ACC':(6,469),'MENU':(7,517),'CORE':(7,420)}
  allids=set()
  for group,(count,owner) in groups.items():
   cases=[c for c in self.matrix['cases'] if c['id'].startswith(group+'-')]
   self.assertEqual(count,len(cases))
   self.assertTrue(all(c['owner_issue']==owner for c in cases))
  for case in self.matrix['cases']:
   self.assertRegex(case['id'],r'^(TABS|NAV|ACC|MENU|CORE)-\d\d$')
   self.assertNotIn(case['id'],allids)
   allids.add(case['id'])
   self.assertGreater(len(case['scenario']),45)
   self.assertEqual('live-browser-plus-AX',case['test_type'])
 def test_cross_cutting_owners_and_focus_state_separation(self):
  for issue in (420,465,466,469,507,517,429,552):
   self.assertIn('#'+str(issue),self.doc)
  for token in ('FocusNavigationCore','FocusId','SelectedId','ExpandedId','ActiveMenuItemId','FocusDisabledPolicy','ElementReference','post-render'):
   self.assertIn(token.lower(),self.doc.lower())
 def test_no_universal_handler_or_mixed_menu_focus(self):
  self.assertIn('Do not create a universal keyboard handler',self.doc)
  for name in ('TabList','NavList','Accordion','MenuList','MenuItem','aria-activedescendant','aria-current'):
   self.assertIn(name.lower(),self.doc.lower())
 def test_all_keyboard_and_semantic_contracts_named(self):
  for word in ('ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Home','End','Escape','Enter','Space','Tab','aria-selected','aria-expanded','aria-disabled','aria-controls','tabindex'):
   self.assertIn(word.lower(),self.doc.lower())
 def test_pure_helper_fixture_is_not_product_code(self):
  fixture=ROOT/'scripts/quality/fixtures/focus-navigation-core-prototype.mjs'
  tests=ROOT/'scripts/quality/test_v3_focus_navigation_prototype.mjs'
  self.assertTrue(fixture.exists())
  self.assertTrue(tests.exists())
  s=fixture.read_text(encoding='utf-8-sig')
  self.assertIn('NOT Bluent product code',s)
  for forbidden in ('document.','window.','WebSocket','IJSRuntime'):
   self.assertNotIn(forbidden,s)
 def test_fixture_cannot_promote_component_acceptance(self):
  self.assertIn('35 Node.js',self.research)
  self.assertIn('planned/not-executed',self.research)
  self.assertIn('A green audit CI only validates recorded claims',self.doc)
  self.assertTrue(all(c['evidence'] is None for c in self.matrix['cases']))
 def test_document_references_are_real_files(self):
  for doc in (DOC,RESEARCH):
   for link in re.findall(r'\]\(([^)]+)\)',doc.read_text(encoding='utf-8-sig')):
    if link.startswith(('http:','https:','#')):continue
    self.assertTrue((doc.parent/link).is_file(),str(doc)+': '+link)
if __name__=='__main__':unittest.main()
