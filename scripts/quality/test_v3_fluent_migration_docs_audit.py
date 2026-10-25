"""Tests for the #552 migration-document coverage audit."""
import json
import unittest
from pathlib import Path

import build_v3_fluent_migration_docs_audit as builder

ROOT=Path(__file__).resolve().parents[2]
QUALITY=ROOT/'docs/v3/quality'
MATRIX=QUALITY/'FLUENT-PARITY-RETRO-AUDIT.json'


class MigrationDocsAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ledger,cls.report=builder.build()
        cls.by_family={f['family']:f for f in cls.ledger['families']}
        cls.matrix=json.loads(MATRIX.read_text(encoding='utf-8-sig'))

    def test_exact_18_family_coverage_and_matrix_dimension(self):
        self.assertEqual(18,self.ledger['familyCount'])
        self.assertEqual({f['family'] for f in self.matrix['families']},set(self.by_family))
        self.assertEqual('migrationDocs',self.ledger['dimension'])
        self.assertEqual('audited_gaps',self.ledger['dimensionStatus'])
        for f in self.matrix['families']:
            self.assertEqual('audited_gaps',f['dimensions']['migrationDocs'],f['family'])

    def test_current_component_reference_docs_exist_for_all_families(self):
        self.assertEqual(18,self.ledger['currentComponentDocs'])
        for f in self.ledger['families']:
            self.assertTrue(f['currentDocExists'],f['family'])
            self.assertTrue((ROOT/f['currentComponentDoc']).is_file(),f['currentComponentDoc'])
            self.assertGreater(f['lineCount'],20)
            self.assertTrue(f['headings'])

    def test_no_family_has_a_v3_migration_section_yet(self):
        self.assertEqual(0,self.ledger['familySpecificV3MigrationSections'])
        self.assertEqual(18,self.ledger['familiesWithCurrentDocsButNoV3MigrationSection'])
        for f in self.ledger['families']:
            self.assertFalse(f['hasFamilySpecificV3MigrationSection'],f['family'])
            self.assertEqual('current-component-reference-v3-migration-section-missing',f['docStatus'])

    def test_reference_template_has_required_section_but_is_not_a_guide(self):
        self.assertTrue(self.ledger['referenceTemplateHasRequiredMigrationSection'])
        self.assertIn('template, not 18 populated migration guides',self.report)

    def test_generic_migration_guide_does_not_claim_v3_path(self):
        self.assertFalse(self.ledger['genericMigrationGuideHasV3MigrationPath'])
        self.assertIn('does not provide an approved family-by-family v3 migration path',self.report)

    def test_shared_reference_docs_exist(self):
        self.assertEqual(8,len(self.ledger['relatedDocs']))
        for item in self.ledger['relatedDocs']:
            self.assertTrue(item['exists'],item['path'])
            self.assertTrue((ROOT/item['path']).is_file(),item['path'])

    def test_family_docs_remain_current_api_docs_not_migration_instructions(self):
        for f in self.ledger['families']:
            self.assertIn('No family-specific 2.x-to-v3 migration section',f['gap'])
            self.assertIn('After design/API approval',f['followUp'])

    def test_no_family_is_approved_by_migration_docs_audit(self):
        self.assertFalse(self.ledger['parityAccepted'])
        self.assertTrue(self.ledger['noneApproved'])
        for f in self.ledger['families']:
            self.assertEqual('pending',f['designApproval'])
            self.assertIsNone(f['evidenceBundle'])

    def test_migration_guide_requires_approved_api_and_design(self):
        self.assertIn('Do not publish migration instructions',self.ledger['acceptanceBoundary'])
        self.assertIn('Before/after code examples',self.report)

    def test_missing_family_negative_control_fails_closed(self):
        saved=builder.FAMILY_DOCS.pop('Button')
        try:
            with self.assertRaisesRegex(ValueError,'exactly all 18 families'):
                builder.build()
        finally:
            builder.FAMILY_DOCS['Button']=saved

    def test_checked_in_outputs_match_builder(self):
        self.assertEqual(self.ledger,json.loads((QUALITY/'FLUENT-PARITY-MIGRATION-DOCS-AUDIT.json').read_text(encoding='utf-8-sig')))
        self.assertEqual(self.report,(QUALITY/'FLUENT-PARITY-MIGRATION-DOCS-AUDIT.md').read_text(encoding='utf-8-sig'))


if __name__=='__main__':
    unittest.main()
