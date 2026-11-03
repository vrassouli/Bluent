"""#552 Wave I real independent Chrome/Edge evidence; NOT Bluent parity."""
import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
E=ROOT/'docs/v3/quality/evidence'
DOC=ROOT/'docs/v3/quality/FOCUS-KEYBOARD-LIFECYCLE-RESEARCH.md'
MODES=('light-ltr','dark-rtl','forced-colors')
class LifecycleEvidence(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.data={b:json.loads((E/f'BLUENT-FOCUS-LIFECYCLE-WIN-{b}.json').read_text(encoding='utf8')) for b in ('CHROME','EDGE')}
 def test_nonproduct_scope(self):
  for d in self.data.values():
   self.assertEqual(552,d['issue'])
   self.assertIn('NOT product/Fluent/AT acceptance',d['status'])
   self.assertEqual('Windows',d['browser']['os'])
   self.assertIn('ISOLATED HTML',d['modes'][0]['source'])
 def test_actual_chrome_edge_versions_and_modes(self):
  for name,d in self.data.items():
   self.assertTrue(d['browser']['version'].startswith('Chrome/' if name=='CHROME' else 'Edg/'))
   self.assertEqual(list(MODES),[m['mode'] for m in d['modes']])
 def test_69_recorded_passes_per_browser(self):
  for d in self.data.values():
   self.assertEqual([23]*3,[len(m['checks']) for m in d['modes']])
   self.assertTrue(all(c['pass'] for m in d['modes'] for c in m['checks']))
 def test_focusin_focusout_native_related_target(self):
  for d in self.data.values():
   for m in d['modes']:
    self.assertTrue(any(t['event']=='focusout' and t.get('target')=='tab-a' and t.get('related')=='tab-b' for t in m['trace']))
    self.assertTrue(any(t['event']=='focusin' and t.get('target')=='tab-b' for t in m['trace']))
 def test_trigger_restore_and_external_focus_not_hijacked(self):
  for d in self.data.values():
   for m in d['modes']:
    self.assertTrue(any(t['event']=='proposed-restore' and t.get('target')=='trigger' for t in m['trace']))
    self.assertTrue(any(t['event']=='restore-rejected' and t.get('target')=='outside' for t in m['trace']))
 def test_removed_trigger_not_restored(self):
  for d in self.data.values():
   for m in d['modes']:
    names={c['name'] for c in m['checks']}
    self.assertIn('removed trigger is never focused',names)
    self.assertIn('Escape closes popup without trigger',names)
 def test_real_pngs_present_not_placeholders(self):
  count=0
  for browser,d in self.data.items():
   for m in d['modes']:
    for key in ('arrowScreenshot','screenshot'):
     f=E/m[key]
     self.assertTrue(f.name.startswith('BLUENT-FOCUS-LIFECYCLE-WIN-'+browser))
     self.assertGreater(f.stat().st_size,5000)
     self.assertEqual(bytes((137,80,78,71,13,10,26,10)),f.read_bytes()[:8])
     count+=1
  self.assertEqual(12,count)
 def test_native_keyboard_and_scoped_browser_cleanup(self):
  s=(ROOT/'scripts/quality/probe_v3_focus_lifecycle_browser.mjs').read_text(encoding='utf8')
  for needle in ('Input.dispatchKeyEvent','keyDown','keyUp','ArrowLeft','ArrowRight','Escape','Browser.getVersion','bluent552-lifecycle-','Get-CimInstance Win32_Process'):
   self.assertIn(needle,s)
  self.assertNotIn('dispatchEvent(new KeyboardEvent',s)
 def test_pure_model_separate_from_native_dom(self):
  model=(ROOT/'scripts/quality/fixtures/focus-lifecycle-prototype.mjs').read_text(encoding='utf8')
  html=(ROOT/'scripts/quality/fixtures/focus-lifecycle-browser.html').read_text(encoding='utf8')
  self.assertIn('NOT Bluent product',model)
  self.assertNotIn('document.activeElement',model)
  self.assertIn('document.activeElement',html)
  self.assertIn('not the bluent product',html.lower())
 def test_all_33_component_acceptance_cases_still_planned(self):
  m=json.loads((ROOT/'docs/v3/quality/FOCUS-KEYBOARD-ACCEPTANCE-MATRIX.json').read_text(encoding='utf8'))
  self.assertEqual(33,len(m['cases']))
  self.assertEqual('not-executed',m['validation_status'])
  self.assertTrue(all(c['status']=='planned' and c['evidence'] is None for c in m['cases']))
 def test_docs_flag_unapproved_not_component_verification(self):
  t=DOC.read_text(encoding='utf8').lower()
  for term in ('138','42','not tests of current bluent','focusasync','#420','#465','#517','draft','research only'):
   self.assertIn(term,t)
if __name__=='__main__':unittest.main()
