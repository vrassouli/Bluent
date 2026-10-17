"""#420 defensive integration contract for #418 optional ARIA disclosure.

The #418 opt-in public attribute is not yet in this task branch; the tests
pin the *private* JS compatibility contract without adding v3 C# API.
Full end-to-end opt-in acceptance still requires merged foundation source.
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

    def test_opt_in_is_private_not_a_premature_product_api(self):
        self.assertIn("private isOptInDisclosure(settings: PopoverSettings): boolean", self.ts)
        self.assertIn("as PopoverSettings & { accessibleTriggerState?: boolean }", self.ts)
        self.assertIn(".accessibleTriggerState === true", self.ts)
        self.assertNotIn("accessibleTriggerState", self.settings)

    def test_explicit_opt_in_only_preserves_collapsed_surface_idref(self):
        self.assertIn("persistentControls = this.isOptInDisclosure(settings)", self.ts)
        self.assertIn("if (controls && persistentControls)", self.ts)
        self.assertIn("if (visible || entry.persistentControls)", self.ts)
        self.assertIn("trigger.setAttribute('aria-expanded', 'false')", self.ts)
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
        self.assertIn("this.hideSurface(current)", self.ts)
        self.assertIn("this.unbindTrigger(triggerId)", self.ts)
        self.assertIn("this.cancelPendingHide(triggerId)", self.ts)


if __name__ == "__main__":
    unittest.main()