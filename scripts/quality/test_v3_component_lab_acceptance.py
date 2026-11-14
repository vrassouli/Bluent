from __future__ import annotations

import copy
import json
import unittest
from pathlib import Path

from check_v3_component_lab import validate_platform_gate

ROOT = Path(__file__).resolve().parents[2]
LEDGER = ROOT / "docs/v3/quality/COMPONENT-LAB-COVERAGE.json"
QUEUE = ROOT / "docs/v3/quality/COMPONENT-LAB-FAMILY-QUEUE.json"


class ComponentLabPlatformAcceptanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))

    def test_integrated_platform_and_pending_family_acceptance_are_distinct(self) -> None:
        validate_platform_gate(copy.deepcopy(self.ledger), copy.deepcopy(self.queue))

    def test_missing_browser_render_mode_cell_is_rejected(self) -> None:
        data = copy.deepcopy(self.ledger)
        data["platformGate"]["platformEngineering"]["exactHeadCi"]["browserMatrix"].pop()
        with self.assertRaises(AssertionError):
            validate_platform_gate(data, copy.deepcopy(self.queue))

    def test_failed_browser_cell_is_rejected(self) -> None:
        data = copy.deepcopy(self.ledger)
        data["platformGate"]["platformEngineering"]["exactHeadCi"]["browserMatrix"][0]["status"] = "failure"
        with self.assertRaises(AssertionError):
            validate_platform_gate(data, copy.deepcopy(self.queue))

    def test_platform_merge_cannot_claim_component_family_acceptance(self) -> None:
        data = copy.deepcopy(self.ledger)
        data["platformGate"]["familyAcceptance"]["acceptedFamilyCount"] = 18
        with self.assertRaises(AssertionError):
            validate_platform_gate(data, copy.deepcopy(self.queue))

    def test_any_complete_family_flag_in_queue_is_rejected(self) -> None:
        queue = copy.deepcopy(self.queue)
        queue["families"][0]["completeDemoAcceptance"] = True
        with self.assertRaises(AssertionError):
            validate_platform_gate(copy.deepcopy(self.ledger), queue)

    def test_design_review_cannot_be_promoted_without_maintainer_approval(self) -> None:
        data = copy.deepcopy(self.ledger)
        data["platformGate"]["designReview"]["status"] = "approved"
        with self.assertRaises(AssertionError):
            validate_platform_gate(data, copy.deepcopy(self.queue))

    def test_penpot_board_identity_is_guarded(self) -> None:
        data = copy.deepcopy(self.ledger)
        data["platformGate"]["designReview"]["boardId"] = "unverified-board"
        with self.assertRaises(AssertionError):
            validate_platform_gate(data, copy.deepcopy(self.queue))

    def test_known_server_pointer_gaps_must_remain_visible(self) -> None:
        data = copy.deepcopy(self.ledger)
        data["platformGate"]["knownPilotGaps"] = data["platformGate"]["knownPilotGaps"][:1]
        with self.assertRaises(AssertionError):
            validate_platform_gate(data, copy.deepcopy(self.queue))


if __name__ == "__main__":
    unittest.main()
