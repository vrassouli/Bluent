"""Regression checks for the #552 GitHub owner-follow-up trail."""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
QUALITY = ROOT / "docs/v3/quality"


class OwnerFollowupLogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.log = (QUALITY / "FLUENT-PARITY-OWNER-FOLLOW-UP-LOG.md").read_text(encoding="utf-8-sig")
        cls.retro = (QUALITY / "FLUENT-PARITY-RETRO-AUDIT.md").read_text(encoding="utf-8-sig")

    def test_all_comments_recorded_as_real_links(self):
        for issue, comment_id in (
            (421, 6364097165), (429, 6364123686), (430, 6364121764),
            (431, 6364122316), (433, 6364094735), (436, 6364020962),
            (437, 6364095285), (438, 6364095929), (439, 6364096541),
            (440, 6364017910), (445, 6364122931), (552, 6364097761),
        ):
            with self.subTest(issue=issue):
                self.assertIn(f"https://github.com/vrassouli/Bluent/issues/{issue}#issuecomment-{comment_id}", self.log)

    def test_current_typed_field_count_is_not_stale(self):
        self.assertIn("49/49 checks per engine (repeat run 2026-10-23)", self.retro)
        self.assertNotIn("typed-field browser audit](FLUENT-PARITY-TYPED-FIELDS-BROWSER-AUDIT.md) — 42/42", self.retro)
        self.assertIn("49/49 instrumentation checks in Chrome and 49/49 in Edge", self.log)

    def test_log_preserves_non_acceptance_boundary(self):
        for phrase in (
            "audit-only workstream",
            "design approval pending",
            "published InteractiveServer",
            "native Windows contrast",
            "auditComplete=false",
            "noneApproved=true",
            "Draft, targets bluent-v3",
        ):
            self.assertIn(phrase, self.log)
        self.assertIn("Owner follow-up ledger (2026-10-23)", self.retro)
        self.assertIn("FLUENT-PARITY-OWNER-FOLLOW-UP-LOG.md", self.retro)


if __name__ == "__main__":
    unittest.main()
