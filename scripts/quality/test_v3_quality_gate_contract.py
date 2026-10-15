"""Explicit negative controls proving v3 quality policy fails closed."""
from __future__ import annotations
import unittest
from check_v3_quality_gate_contract import QUALITY,DOCUMENT,SSR_PROJ,check,check_server_patch,QualityContractError

class V3QualityContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.quality=QUALITY.read_text(encoding="utf-8-sig")
        cls.document=DOCUMENT.read_text(encoding="utf-8-sig")

    def test_actual_contract_passes(self):
        check(self.quality,self.document)

    def test_no_path_filtered_v3_quality_job(self):
        changed=self.quality.replace("branches: [bluent-v3]",
                        "branches: [bluent-v3]\n    paths: [docs/**]",1)
        with self.assertRaisesRegex(QualityContractError,"silently skip"):
            check(changed,self.document)

    def test_not_stable_branch(self):
        with self.assertRaisesRegex(QualityContractError,"isolated v3"):
            check(self.quality.replace("branches: [bluent-v3]","branches: [Dev]",1),self.document)

    def test_no_missing_pack_report(self):
        with self.assertRaisesRegex(QualityContractError,"pack version"):
            check(self.quality.replace("artifacts/v3-evidence/package-validation.json","artifacts/unknown.json"),self.document)

    def test_no_fake_ssr_smoke(self):
        changed=self.quality.replace("check_rendered_accessibility.py","echo successful")
        with self.assertRaisesRegex(QualityContractError,"real rendered SSR"):
            check(changed,self.document)

    def test_no_nonblocking_quality_job(self):
        with self.assertRaisesRegex(QualityContractError,"nonblocking"):
            check(self.quality+"\ncontinue-on-error: true",self.document)

    def test_no_release_push(self):
        with self.assertRaisesRegex(QualityContractError,"never publish"):
            check(self.quality+"\n- run: dotnet nuget push any.nupkg",self.document)

    def test_current_server_dependency_is_patched(self):
        check_server_patch(SSR_PROJ.read_text(encoding="utf-8-sig"))

    def test_reject_vulnerable_server_patch(self):
        original=SSR_PROJ.read_text(encoding="utf-8-sig")
        self.assertIn('Version="10.0.13"',original)
        with self.assertRaisesRegex(QualityContractError,"at least patched"):
            check_server_patch(original.replace('Version="10.0.13"','Version="10.0.12"'))

    def test_no_false_accessibility_claim(self):
        with self.assertRaisesRegex(QualityContractError,"certification"):
            check(self.quality,self.document.replace("Not an accessibility certification.",""))

if __name__=="__main__":
    unittest.main()
