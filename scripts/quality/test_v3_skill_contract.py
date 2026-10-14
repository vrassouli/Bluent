#!/usr/bin/env python3
"""Four negative controls for proposed/unreleased v3 Skill routing."""
import unittest
from pathlib import Path
import check_v3_skill_contract as c


class V3SkillTests(unittest.TestCase):
    def test_actual_router_and_links(self):
        self.assertEqual(c.validate_repo(), [])

    def test_broken_component_reference_link_is_rejected(self):
        p = c.REQUIRED[0]
        source = p.read_text(encoding="utf-8")
        altered = source.replace("../../../docs/v3/README.md", "../../../docs/v3/NO_SUCH_REFERENCE.md")
        self.assertTrue(any("bad link" in e for e in c.validate_document(p, altered)))

    def test_unreleased_warning_is_mandatory(self):
        p = c.REQUIRED[0]
        source = "Read [current docs](../../../docs/v3/README.md) and [the old Skill](../bluent/SKILL.md) for Bluent."
        self.assertTrue(any("unreleased v3" in e for e in c.validate_document(p, source)))

    def test_legacy_version_routing_is_mandatory(self):
        source = c.REQUIRED[0].read_text(encoding="utf-8").replace("2.x", "older")
        self.assertTrue(any("2.x NuGet consumers" in e for e in c.validate_skill_text(source)))

    def test_avoid_unfounded_api_claims_required(self):
        source = c.REQUIRED[0].read_text(encoding="utf-8")
        altered = source.replace("never invent", "feel free to invent").replace("Never recommend installing", "Recommend installing")
        self.assertTrue(any("anti-fabrication" in e for e in c.validate_skill_text(altered)))


if __name__ == "__main__":
    unittest.main()
