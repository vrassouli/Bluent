"""#552 real isolated Blazor Server evidence guards; never product/Fluent acceptance."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
E=ROOT/'docs/v3/quality/evidence'
LAB=ROOT/'scripts/quality/fixtures/blazor-focus-lab'
DOC=ROOT/'docs/v3/quality/BLUENT-BLAZOR-FOCUS-REAL-LIFECYCLE.md'
MODES=['light-ltr','dark-rtl','forced-colors']
def check(rec, name):
 found=[x for x in rec['checks'] if x['name']==name]
 if len(found)!=1: raise AssertionError('Missing/ambiguous evidence '+name)
 return found[0]['observed']
class BlazorFocusEvidence(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.evidence={k:json.loads((E/f'BLUENT-BLAZOR-FOCUS-{k}.json').read_text(encoding='utf8')) for k in ('CHROME','EDGE')}
 def test_01_actual_blazor_not_product(self):
  for d in self.evidence.values():
   self.assertEqual(552,d['issue'])
   self.assertEqual('Windows',d['platform'])
   self.assertIn('InteractiveServer actual ElementReference.FocusAsync',d['status'])
   self.assertIn('NOT Bluent component/Fluent/AT acceptance',d['status'])
 def test_02_real_browser_modes_and_87_positive_checks(self):
  for b,d in self.evidence.items():
   self.assertTrue(d['browser'].startswith('Chrome/' if b=='CHROME' else 'Edg/'))
   self.assertEqual(MODES,[m['mode'] for m in d['records']])
   self.assertEqual([29]*3,[len(m['checks']) for m in d['records']])
   self.assertTrue(all(c['pass'] for m in d['records'] for c in m['checks']))
 def test_03_real_framework_focus_async_calls(self):
  s=(LAB/'FocusLab.razor').read_text(encoding='utf8')
  for name in ('_target.FocusAsync()','_popupItem.FocusAsync()','_trigger.FocusAsync()','OnAfterRenderAsync','@onclick','@onkeydown','Task.Delay(900)'):
   self.assertIn(name,s)
  host=(LAB/'Program.cs').read_text(encoding='utf8')
  self.assertIn('AddInteractiveServerComponents',host)
  self.assertIn('AddInteractiveServerRenderMode',host)
 def test_04_allowed_focus_async_enters_actual_target(self):
  for d in self.evidence.values():
   for rec in d['records']:
    x=check(rec,'real ElementReference.FocusAsync focused target')
    self.assertEqual(('focused-target','target',1),(x['status'],x['active'],x['focusCalls']))
 def test_05_post_await_success_calls_focus_async(self):
  for d in self.evidence.values():
   for rec in d['records']:
    x=check(rec,'actual async delayed Blazor FocusAsync selects target')
    self.assertEqual(('delay-focused-target','target',2),(x['status'],x['active'],x['focusCalls']))
 def test_06_post_await_outside_focus_cancellation(self):
  for d in self.evidence.values():
   for rec in d['records']:
    x=check(rec,'outside user focus survives delayed resume')
    self.assertEqual(('delay-canceled-owner','outside',2),(x['status'],x['active'],x['focusCalls']))
 def test_07_removed_target_is_not_focused_during_await(self):
  for d in self.evidence.values():
   for rec in d['records']:
    x=check(rec,'async canceled stale target never calls FocusAsync')
    self.assertFalse(x['target'])
    self.assertEqual(('delay-canceled-target',2),(x['status'],x['focusCalls']))
 def test_08_real_onafterrender_async_popup_focus(self):
  for d in self.evidence.values():
   for rec in d['records']:
    x=check(rec,'OnAfterRenderAsync FocusAsync focused mounted popup')
    self.assertEqual(('popup-item',3),(x['active'],x['focusCalls']))
 def test_09_real_escape_restores_connected_trigger(self):
  for d in self.evidence.values():
   for rec in d['records']:
    x=check(rec,'Escape restores connected trigger via FocusAsync')
    self.assertEqual(('trigger',4),(x['active'],x['focusCalls']))
 def test_10_outside_close_does_not_steal_focus(self):
  for d in self.evidence.values():
   for rec in d['records']:
    x=check(rec,'outside-close preserves unrelated user focus')
    self.assertEqual('close-outside',x['active'])
 def test_11_removed_trigger_never_receives_focus(self):
  for d in self.evidence.values():
   for rec in d['records']:
    x=check(rec,'no stale FocusAsync to removed trigger')
    self.assertFalse(x['trigger'])
    self.assertNotEqual('trigger',x['active'])
 def test_12_real_png_bytes_and_count(self):
  count=0
  for b,d in self.evidence.items():
   for rec in d['records']:
    self.assertEqual(2,len(rec['screenshots']))
    for name in rec['screenshots']:
     f=E/name
     self.assertTrue(f.name.startswith('BLUENT-BLAZOR-FOCUS-'+b))
     self.assertGreater(f.stat().st_size,5000)
     self.assertEqual(bytes((137,80,78,71,13,10,26,10)),f.read_bytes()[:8])
     count+=1
  self.assertEqual(12,count)
 def test_13_native_cdp_no_fake_keyboard_events(self):
  s=(ROOT/'scripts/quality/probe_v3_blazor_focus_lifecycle.mjs').read_text(encoding='utf8')
  for token in ('Input.dispatchKeyEvent','Input.dispatchMouseEvent','Browser.getVersion','bluent552-blazor-focus-','--user-data-dir=','dotnet'):
   self.assertIn(token,s)
  self.assertNotIn('dispatchEvent(new KeyboardEvent',s)
 def test_14_all_33_component_acceptance_cases_remain_planned(self):
  m=json.loads((ROOT/'docs/v3/quality/FOCUS-KEYBOARD-ACCEPTANCE-MATRIX.json').read_text(encoding='utf8'))
  self.assertEqual(33,len(m['cases']))
  self.assertEqual('not-executed',m['validation_status'])
  self.assertTrue(all(c['status']=='planned' and c['evidence'] is None for c in m['cases']))
 def test_15_report_distinguishes_blazor_fixture_and_product(self):
  text=DOC.read_text(encoding='utf8').lower()
  for term in ('research only','174/174','interactiveServer'.lower(),'33 owner-bound','not tests of current bluent','Task.Delay(900)'.lower(),'Draft'.lower()):
   self.assertIn(term,text)
if __name__=='__main__':unittest.main()
