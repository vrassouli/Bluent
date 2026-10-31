"""#420 defensive integration contract for #418 optional ARIA disclosure.

The #418 opt-in behavior is integrated privately into this task branch while
keeping the #420 public PopoverSettings API unchanged. These tests pin the
optional, author-preserving ARIA contract and its owner-scoped Escape handling.
"""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src/Bluent.UI.Scripts/src/Popover/Popover.ts"
SETTINGS = ROOT / "src/Bluent.UI.Scripts/src/Popover/PopoverSettings.ts"


class FoundationInteropCompatibility(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ts = SRC.read_text(encoding="utf-8-sig")
        cls.settings = SETTINGS.read_text(encoding="utf-8-sig")

    @staticmethod
    def validate_opt_in_settings_contract(settings: str):
        """Both valid lifecycle phases: absent before #418, OPTIONAL after."""
        import re
        occurrences = re.findall(r"\baccessibleTriggerState\b", settings)
        if not occurrences:
            return "not-yet-integrated"
        if len(occurrences) != 1 or not re.search(
            r"(?m)(?:^|[;{])\s*accessibleTriggerState\?:\s*boolean\s*;", settings
        ):
            raise AssertionError(
                "Merged #418 accessibleTriggerState must occur once as an "
                "optional boolean, never a mandatory or differently typed API"
            )
        return "foundation-integrated"

    def test_opt_in_guard_supports_both_foundation_integration_phases(self):
        self.assertIn("private isOptInDisclosure(settings: PopoverSettings): boolean", self.ts)
        self.assertIn("as PopoverSettings & { accessibleTriggerState?: boolean }", self.ts)
        self.assertIn(".accessibleTriggerState === true", self.ts)
        self.assertIn(
            self.validate_opt_in_settings_contract(self.settings),
            ("not-yet-integrated", "foundation-integrated")
        )

    def test_optional_settings_gate_rejects_mandatory_or_mistyped_contract(self):
        for invalid in (
            "accessibleTriggerState: boolean;",
            "accessibleTriggerState?: string;",
            "accessibleTriggerState?: boolean;\naccessibleTriggerState?: boolean;",
        ):
            with self.assertRaises(AssertionError):
                self.validate_opt_in_settings_contract(invalid)
        self.assertEqual(
            self.validate_opt_in_settings_contract(
                "export type PopoverSettings={accessibleTriggerState?: boolean;};"
            ),
            "foundation-integrated",
        )
        self.assertEqual(
            self.validate_opt_in_settings_contract(
                "export type PopoverSettings={triggerId: string;};"
            ),
            "not-yet-integrated",
        )

    def test_explicit_opt_in_preserves_collapsed_surface_idref_and_rebind_state(self):
        self.assertIn("persistentControls = this.isOptInDisclosure(settings)", self.ts)
        self.assertIn("if (controls && persistentControls)", self.ts)
        self.assertIn("if (visible || entry.persistentControls)", self.ts)
        self.assertIn("const initiallyVisible = this.getSurface(settings)?.classList.contains('show') === true", self.ts)
        self.assertIn("trigger.setAttribute('aria-expanded', initiallyVisible ? 'true' : 'false')", self.ts)
        self.assertIn("if (entry.controls)", self.ts)
        self.assertIn("entry.trigger.removeAttribute('aria-controls')", self.ts)
        self.assertIn("trigger: Element; expanded: boolean; controls: boolean; persistentControls: boolean", self.ts)

    def test_non_opted_click_and_author_owned_aria_remain_separate(self):
        self.assertIn("!this.isOptInDisclosure(settings) && !settings.triggerEvents?.includes('click')", self.ts)
        self.assertIn("!trigger.hasAttribute('aria-expanded')", self.ts)
        self.assertIn("!trigger.hasAttribute('aria-controls')", self.ts)
        self.assertIn("if (managed.expanded", self.ts)
        self.assertIn("if (managed.controls", self.ts)

    def test_nested_dialog_escape_respects_scope_and_cleanup(self):
        self.assertIn("event.defaultPrevented || event.isComposing || event.repeat", self.ts)
        self.assertIn("if (this.isOptInDisclosure(current))", self.ts)
        self.assertIn("trigger?.contains(target) || surface.contains(target)", self.ts)
        self.assertIn("this.hideSurface(current, true)", self.ts)
        self.assertIn("this.restoreFocus(settings)", self.ts)
        self.assertIn("trigger.focus({ preventScroll: true })", self.ts)
        self.assertIn("this.unbindTrigger(triggerId)", self.ts)
        self.assertIn("this.cancelPendingHide(triggerId)", self.ts)


if __name__ == "__main__":
    unittest.main()
