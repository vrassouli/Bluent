"""Tests for the #552 responsive/RTL source and evidence inventory."""
import json
import unittest
from pathlib import Path

import build_v3_fluent_responsive_rtl_audit as builder

ROOT=Path(__file__).resolve().parents[2]
QUALITY=ROOT/'docs/v3/quality'
MATRIX=QUALITY/'FLUENT-PARITY-RETRO-AUDIT.json'


class ResponsiveRtlAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ledger,cls.report=builder.build()
        cls.by_family={f['family']:f for f in cls.ledger['families']}
        cls.matrix=json.loads(MATRIX.read_text(encoding='utf-8-sig'))

    def test_exact_18_family_coverage_and_matrix_dimension(self):
        self.assertEqual(18,self.ledger['familyCount'])
        self.assertEqual({f['family'] for f in self.matrix['families']},set(self.by_family))
        self.assertEqual('responsiveRTL',self.ledger['dimension'])
        self.assertEqual('audited_gaps',self.ledger['dimensionStatus'])
        for f in self.matrix['families']:
            self.assertEqual('audited_gaps',f['dimensions']['responsiveRTL'],f['family'])

    def test_all_families_have_selected_dark_rtl_evidence(self):
        self.assertEqual(18,sum(f['hasRtlBrowserEvidence'] for f in self.ledger['families']))
        for f in self.ledger['families']:
            self.assertTrue(f['hasRtlBrowserEvidence'],f['family'])

    def test_narrow_or_zoom_proxy_coverage_is_not_overstated(self):
        expected={'Button','Icon','Slider','RangeSlider','FileSelect'}
        actual={f['family'] for f in self.ledger['families'] if f['hasNarrowOrZoomEvidence']}
        self.assertEqual(expected,actual)
        self.assertIn('not native browser UI zoom',self.ledger['runtimeScope'])
        self.assertIn('not native browser UI zoom',self.report)

    def test_style_and_component_source_anchors_exist(self):
        for f in self.ledger['families']:
            self.assertTrue(f['componentSourceFiles'],f['family'])
            for rel in f['styleFiles']+f['componentSourceFiles']:
                self.assertTrue((ROOT/rel).is_file(),rel)
            for item in f['sourceSnippets']+f['physicalDirectionalDeclarations']+f['logicalDirectionalDeclarations']:
                self.assertTrue((ROOT/item['path']).is_file(),item['path'])
                self.assertGreaterEqual(item['line'],1)
                self.assertTrue(item['excerpt'])

    def test_physical_direction_counts_are_grounded(self):
        self.assertGreater(len(self.by_family['Button']['physicalDirectionalDeclarations']),0)
        self.assertGreater(len(self.by_family['Switch']['physicalDirectionalDeclarations']),0)
        self.assertGreater(len(self.by_family['RangeSlider']['physicalDirectionalDeclarations']),0)
        self.assertIn('not automatic defects',self.ledger['acceptanceBoundary'])

    def test_logical_properties_and_breakpoints_are_inventoried(self):
        self.assertGreater(len(self.by_family['DateField']['logicalDirectionalDeclarations']),0)
        self.assertGreater(len(self.by_family['Button']['breakpointAndReflowRules']),0)
        for f in self.ledger['families']:
            self.assertGreaterEqual(len(f['fixedDimensionRules']),0)

    def test_browser_evidence_files_exist(self):
        for f in self.ledger['families']:
            self.assertTrue(f['browserEvidence'],f['family'])
            for item in f['browserEvidence']:
                self.assertTrue((QUALITY/item['file']).is_file(),item['file'])

    def test_no_family_is_approved_by_responsive_inventory(self):
        self.assertFalse(self.ledger['parityAccepted'])
        self.assertTrue(self.ledger['noneApproved'])
        for f in self.ledger['families']:
            self.assertEqual('pending',f['designApproval'])
            self.assertIsNone(f['evidenceBundle'])

    def test_missing_family_negative_control_fails_closed(self):
        saved=builder.EVIDENCE.pop('Button')
        try:
            with self.assertRaisesRegex(ValueError,'exactly all 18 families'):
                builder.build()
        finally:
            builder.EVIDENCE['Button']=saved

    def test_checked_in_outputs_match_builder(self):
        self.assertEqual(self.ledger,json.loads((QUALITY/'FLUENT-PARITY-RESPONSIVE-RTL-AUDIT.json').read_text(encoding='utf-8-sig')))
        self.assertEqual(self.report,(QUALITY/'FLUENT-PARITY-RESPONSIVE-RTL-AUDIT.md').read_text(encoding='utf-8-sig'))


if __name__=='__main__':
    unittest.main()
