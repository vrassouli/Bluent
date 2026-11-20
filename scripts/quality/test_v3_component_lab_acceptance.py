from __future__ import annotations

import copy
import json
import unittest
from pathlib import Path

from check_v3_component_lab import validate_platform_gate, validate_selectfield_source_contract

ROOT = Path(__file__).resolve().parents[2]
LEDGER = ROOT / "docs/v3/quality/COMPONENT-LAB-COVERAGE.json"
QUEUE = ROOT / "docs/v3/quality/COMPONENT-LAB-FAMILY-QUEUE.json"


class ComponentLabPlatformAcceptanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))
        cls.selectfield_source = (
            ROOT / "src/Bluent.UI/Components/SelectFieldComponent/SelectField.razor"
        ).read_text(encoding="utf-8-sig")

    def test_selectfield_keeps_native_scalar_and_array_bindings(self) -> None:
        validate_selectfield_source_contract(self.selectfield_source)

    def test_selectfield_array_binding_must_keep_inherited_event(self) -> None:
        mutated = self.selectfield_source.replace(
            '@bind:event="@BindValueEvent"', '@bind:event="onchange"', 1
        )
        self.assertNotEqual(mutated, self.selectfield_source)
        with self.assertRaises(AssertionError):
            validate_selectfield_source_contract(mutated)

    def test_selectfield_scalar_binding_must_keep_inherited_event(self) -> None:
        mutated = self.selectfield_source.replace(
            '@bind-value:event="@BindValueEvent"', '@bind-value:event="onchange"', 1
        )
        self.assertNotEqual(mutated, self.selectfield_source)
        with self.assertRaises(AssertionError):
            validate_selectfield_source_contract(mutated)

    def test_selectfield_must_not_reintroduce_fixed_change_handler(self) -> None:
        mutated = self.selectfield_source.replace(
            '@bind-value:event="@BindValueEvent"',
            '@bind-value:event="@BindValueEvent" @onchange="OnValueChanged"',
            1
        )
        self.assertNotEqual(mutated, self.selectfield_source)
        with self.assertRaises(AssertionError):
            validate_selectfield_source_contract(mutated)

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
