"""Tests for the #552 cross-family Blazor extension audit."""
import json
import unittest
from pathlib import Path

import build_v3_fluent_blazor_extensions_audit as builder

ROOT=Path(__file__).resolve().parents[2]
QUALITY=ROOT/'docs/v3/quality'
MATRIX=QUALITY/'FLUENT-PARITY-RETRO-AUDIT.json'


class BlazorExtensionsAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ledger, cls.report=builder.build()
        cls.by_family={f['family']:f for f in cls.ledger['families']}
        cls.matrix=json.loads(MATRIX.read_text(encoding='utf-8-sig'))
        cls.matrix_by_family={f['family']:f for f in cls.matrix['families']}

    def test_exact_18_family_coverage_and_dimension(self):
        expected={f['family'] for f in self.matrix['families']}
        self.assertEqual(18,self.ledger['familyCount'])
        self.assertEqual(expected,set(self.by_family))
        self.assertEqual('BlazorExtensions',self.ledger['dimension'])
        self.assertEqual('audited_gaps',self.ledger['dimensionStatus'])
        for name,family in self.matrix_by_family.items():
            self.assertEqual('audited_gaps',family['dimensions']['BlazorExtensions'],name)

    def test_source_files_and_anchors_exist_for_every_family(self):
        for family in self.ledger['families']:
            self.assertTrue(family['sourceFiles'],family['family'])
            self.assertTrue(family['sourceSnippets'],family['family'])
            for rel in family['sourceFiles']:
                self.assertTrue((ROOT/rel).is_file(),rel)
            for anchor in family['sourceSnippets']:
                self.assertTrue((ROOT/anchor['path']).is_file(),anchor['path'])
                self.assertGreaterEqual(anchor['line'],1)
                self.assertTrue(anchor['excerpt'])

    def test_browser_evidence_and_family_reports_are_real_files(self):
        for family in self.ledger['families']:
            self.assertTrue((ROOT/family['familyReport']).is_file(),family['familyReport'])
            for rel in family['browserEvidence']:
                self.assertTrue((QUALITY/rel).is_file(),rel)

    def test_form_and_event_gaps_are_explicit(self):
        expected={
            'Label':'Required is visual decoration',
            'TextField':'empty input name',
            'NumericField':'Step has no effective behavior',
            'Checkbox':'input.indeterminate',
            'RadioGroup':'ArrowRight crosses into the next group',
            'SelectField':'BindValueEvent is not forwarded',
        }
        for name,needle in expected.items():
            self.assertIn(needle,self.by_family[name]['sourceFinding'],name)

    def test_typed_field_and_otp_gaps_are_explicit(self):
        expected={
            'DateField':'typed values bypass Min/Max',
            'TimeField':'Culture affects parsing',
            'MaskedField':'leading-literal corruption',
            'OtpField':'native clipboard/IME',
        }
        for name,needle in expected.items():
            self.assertIn(needle,self.by_family[name]['sourceFinding'],name)

    def test_pointer_and_file_gaps_are_explicit(self):
        expected={
            'Slider':'native slider role',
            'RangeSlider':'Two-thumb composition',
            'FileSelect':'MaxFiles=2 accepts three files',
        }
        for name,needle in expected.items():
            self.assertIn(needle,self.by_family[name]['sourceFinding'],name)

    def test_render_mode_and_native_at_limits_are_not_overclaimed(self):
        scope=self.ledger['runtimeScope']
        self.assertIn('not a full published InteractiveServer matrix',scope)
        self.assertIn('not native OS/screen-reader acceptance',scope)
        self.assertIn('not accepted',self.report)
        self.assertIn('form serialization',self.report)

    def test_no_family_is_approved_by_this_audit(self):
        self.assertFalse(self.ledger['parityAccepted'])
        self.assertTrue(self.ledger['noneApproved'])
        for family in self.ledger['families']:
            self.assertEqual('pending',family['designApproval'])
            self.assertIsNone(family['evidenceBundle'])

    def test_missing_family_negative_control_fails_closed(self):
        saved=builder.A.pop('Button')
        try:
            with self.assertRaisesRegex(ValueError,'exactly all 18 matrix families'):
                builder.build()
        finally:
            builder.A['Button']=saved

    def test_checked_in_outputs_match_builder(self):
        self.assertEqual(self.ledger,json.loads((QUALITY/'FLUENT-PARITY-BLAZOR-EXTENSIONS-AUDIT.json').read_text(encoding='utf-8-sig')))
        self.assertEqual(self.report,(QUALITY/'FLUENT-PARITY-BLAZOR-EXTENSIONS-AUDIT.md').read_text(encoding='utf-8-sig'))


if __name__=='__main__':
    unittest.main()
