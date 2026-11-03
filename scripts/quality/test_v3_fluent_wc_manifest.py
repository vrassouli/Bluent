"""Official Fluent WC version-pinned manifest negative controls, NOT parity tests."""
import copy
import json
import unittest

from check_v3_fluent_wc_manifest import OUT, validate


class PinnedUpstreamManifestTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.snapshot=json.loads(OUT.read_text(encoding="utf-8"))
    def test_release_manifest_fingerprint_and_ownership(self):
        self.assertEqual([],validate(self.snapshot))
    def test_false_fluent_signoff_rejected(self):
        bad=copy.deepcopy(self.snapshot)
        bad["parityAccepted"]=True
        self.assertTrue(validate(bad))
    def test_legacy_assumption_slider_has_no_step_rejected(self):
        bad=copy.deepcopy(self.snapshot)
        next(x for x in bad["observations"] if x["tag"]=="fluent-slider")["attributes"].remove("step")
        self.assertTrue(validate(bad))
    def test_wrong_file_select_equivalence_rejected(self):
        bad=copy.deepcopy(self.snapshot)
        next(x for x in bad["observations"] if x["tag"]=="fluent-file-select")["manifestStatus"]="published_custom_element"
        self.assertTrue(validate(bad))
    def test_version_drift_rejected(self):
        bad=copy.deepcopy(self.snapshot)
        bad["version"]="2.5.6"
        self.assertTrue(validate(bad))

if __name__=="__main__":
    unittest.main()
