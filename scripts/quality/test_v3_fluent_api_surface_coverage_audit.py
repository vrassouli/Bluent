"""Tests for the consolidated #552 API surface disposition audit."""
import json
import unittest
from pathlib import Path
from unittest.mock import patch
import build_v3_fluent_api_surface_coverage_audit as builder

ROOT=Path(__file__).resolve().parents[2]
Q=ROOT/'docs/v3/quality'

class ApiSurfaceCoverageAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ledger,cls.report=builder.build()
        cls.by_family={x['family']:x for x in cls.ledger['families']}

    def test_exact_18_family_and_239_occurrence_reconciliation(self):
        self.assertEqual(18,self.ledger['familyCount'])
        self.assertEqual(239,self.ledger['sourceCandidateOccurrenceCount'])
        self.assertEqual(239,self.ledger['reviewedOccurrenceCount'])
        self.assertEqual(1.0,self.ledger['reviewedOccurrenceCoverage'])
        self.assertEqual({'A':82,'B':71,'C':40,'D':46},self.ledger['waveOccurrenceCounts'])
        self.assertEqual({'cascading':3,'event':10,'slot':28,'value':198},self.ledger['candidateKindCounts'])

    def test_disposition_totals_are_exact_and_non_accepting(self):
        self.assertEqual({'Bluent extension':130,'Missing':11,'N/A':1,'Supported':97},self.ledger['reviewDispositionCounts'])
        self.assertEqual('audited_gaps',self.ledger['apiReviewAcceptance'])
        self.assertFalse(self.ledger['parityAccepted'])
        self.assertTrue(self.ledger['noneApproved'])
        self.assertEqual(18,self.ledger['designApprovalsPendingCount'])
        self.assertEqual(18,self.ledger['evidenceBundlesPendingCount'])

    def test_missing_dispositions_are_linked_to_owning_product_issues(self):
        expected={
          ('NumericField',433,'NumericField','Step'),('Switch',435,'Switch','Circular'),
          ('Switch',435,'Switch','Size'),('SelectField',437,'SelectField','BindValueEvent'),
          ('DateField',438,'DateField','DateClass'),('DateField',438,'DateField','BindValueEvent'),
          ('TimeField',439,'TimeField','BindValueEvent'),('MaskedField',440,'MaskedField','BindValueEvent'),
          ('OtpField',441,'OtpField','StartAddon'),('OtpField',441,'OtpField','EndAddon'),('OtpField',441,'OtpField','Size')}
        actual={(x['family'],x['productIssue'],x['component'],x['parameter']) for x in self.ledger['missingParameters']}
        self.assertEqual(expected,actual)
        for x in self.ledger['missingParameters']:
            self.assertTrue((ROOT/x['sourceFile']).is_file())
            self.assertGreater(x['sourceLine'],0)
            self.assertTrue(x['mapping'])
            self.assertTrue(x['rationale'])

    def test_families_remain_audited_gaps_with_pending_approval(self):
        self.assertEqual(18,len(self.by_family))
        for fam,x in self.by_family.items():
            self.assertEqual('audited_gaps',x['apiReviewStatus'],fam)
            self.assertEqual('pending',x['designApproval'],fam)
            self.assertIsNone(x['evidenceBundle'],fam)
            self.assertEqual(x['sourceOccurrenceCount'],sum(x['dispositionCounts'].values()),fam)

    def test_out_of_band_entries_are_not_unique_member_counts(self):
        self.assertEqual(7,self.ledger['outOfBandPublicApiEntryCount'])
        self.assertIn('not unique API counts',' '.join(self.ledger['limitations']))
        self.assertGreaterEqual(sum(1 for x in self.ledger['outOfBandPublicApiEntries'] if 'InputBase' in x['name']),3)
        self.assertIn('not a public-API completeness certificate',self.report)

    def test_wave_files_and_report_preserve_coverage(self):
        for wave in 'ABCD':
            x=self.ledger['waves'][wave]
            self.assertTrue((Q/x['ledger']).is_file())
            self.assertTrue((Q/x['report']).is_file())
            self.assertEqual(x['parameterOccurrenceCount'],self.ledger['waveOccurrenceCounts'][wave])
        self.assertIn('Missing dispositions',self.report)
        self.assertIn('the 11 entries above',self.report)

    def test_negative_control_rejects_missing_occurrence(self):
        original=builder.readj
        def altered(path):
            value=original(path)
            if path==builder.WAVES['B']:
                value['families'][0]['parameters'].pop()
            return value
        with patch.object(builder,'readj',side_effect=altered):
            with self.assertRaisesRegex(ValueError,'counters mismatch'):
                builder.build()

    def test_negative_control_rejects_missing_mapping_or_rationale(self):
        original=builder.readj
        def altered(path):
            value=original(path)
            if path==builder.WAVES['A']:
                value['families'][0]['parameters'][0]['mapping']=''
            return value
        with patch.object(builder,'readj',side_effect=altered):
            with self.assertRaisesRegex(ValueError,'mapping or rationale'):
                builder.build()

    def test_checked_in_outputs_match_builder(self):
        self.assertEqual(self.ledger,json.loads(builder.JSON_OUT.read_text(encoding='utf-8-sig')))
        self.assertEqual(self.report,builder.MD_OUT.read_text(encoding='utf-8-sig'))

if __name__=='__main__': unittest.main()
