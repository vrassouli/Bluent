from __future__ import annotations
import tempfile
import unittest
from pathlib import Path
from check_v3_popover_js_bundle import (ROOT,NAMES,BundleContractError,
    same_generated_assets,check_implementation_typescript,check_popover_reduced_motion_style,check_popover_right_end_style,check_overlay_reduced_motion_style)

class PopoverBundleGateTests(unittest.TestCase):
    def test_checked_in_bundle_and_source_are_consistent(self):
        same_generated_assets(ROOT/"src/Bluent.UI.Scripts/dist",ROOT/"src/Bluent.UI/wwwroot")
        check_implementation_typescript((ROOT/"src/Bluent.UI.Scripts/src/Popover/Popover.ts").read_text(encoding="utf-8-sig"))

    def test_compiled_and_minified_popover_reduced_motion_styles(self):
        authored=(ROOT/"src/Bluent.UI/Styles/Components/_popover.scss").read_text(encoding="utf-8-sig")
        compiled=(ROOT/"src/Bluent.UI/Styles/Components/components.css").read_text(encoding="utf-8-sig")
        minified=(ROOT/"src/Bluent.UI/wwwroot/bluent.ui.components.min.css").read_text(encoding="utf-8-sig")
        check_popover_reduced_motion_style(authored,compiled,minified)

    def test_overlay_reduced_motion_in_author_source_compiled_published(self):
        authored=(ROOT/"src/Bluent.UI/Styles/Components/_overlay.scss").read_text(encoding="utf-8")
        compiled=(ROOT/"src/Bluent.UI/Styles/Components/components.css").read_text(encoding="utf-8")
        published=(ROOT/"src/Bluent.UI/wwwroot/bluent.ui.components.min.css").read_text(encoding="utf-8")
        check_overlay_reduced_motion_style(authored,compiled,published)

    def test_overlay_missing_authored_reduced_motion_is_rejected(self):
        a="@media (prefers-reduced-motion: reduce){.bui-overlay{animation-duration: 0s;animation-delay: 0s;}}"
        c="@media (prefers-reduced-motion:reduce){.bui-overlay{animation-duration:0s;animation-delay:0s}}"
        with self.assertRaisesRegex(BundleContractError,"authored"):
            check_overlay_reduced_motion_style(a.replace("reduce","no-preference"),c,c)

    def test_overlay_stale_compiled_reduced_motion_is_rejected(self):
        a="@media (prefers-reduced-motion: reduce){.bui-overlay{animation-duration: 0s;animation-delay: 0s;}}"
        c="@media (prefers-reduced-motion:reduce){.bui-overlay{animation-duration:0s;animation-delay:0s}}"
        with self.assertRaisesRegex(BundleContractError,"compiled"):
            check_overlay_reduced_motion_style(a,c.replace("0s","0.25s"),c)

    def test_overlay_stale_published_reduced_motion_is_rejected(self):
        a="@media (prefers-reduced-motion: reduce){.bui-overlay{animation-duration: 0s;animation-delay: 0s;}}"
        c="@media (prefers-reduced-motion:reduce){.bui-overlay{animation-duration:0s;animation-delay:0s}}"
        with self.assertRaisesRegex(BundleContractError,"published"):
            check_overlay_reduced_motion_style(a,c,c.replace("0s","0.25s"))

    def test_popover_right_end_valid_in_all_three_authoritative_assets(self):
        authored=(ROOT/"src/Bluent.UI/Styles/Components/_popover.scss").read_text(encoding="utf-8")
        compiled=(ROOT/"src/Bluent.UI/Styles/Components/components.css").read_text(encoding="utf-8")
        minified=(ROOT/"src/Bluent.UI/wwwroot/bluent.ui.components.min.css").read_text(encoding="utf-8")
        check_popover_right_end_style(authored,compiled,minified)

    def test_regressed_sass_right_end_selector_is_rejected(self):
        source="&.right-end { transform: translateX(-10px); }"
        css=".bui-popover-surface.right-end { transform: translateX(-10px); }"
        with self.assertRaisesRegex(BundleContractError,"Sass"):
            check_popover_right_end_style(source.replace("&.right-end","&right-end"),css,css)

    def test_compiled_stale_right_end_selector_is_rejected(self):
        source="&.right-end { transform: translateX(-10px); }"
        css=".bui-popover-surface.right-end { transform: translateX(-10px); }"
        with self.assertRaisesRegex(BundleContractError,"compiled"):
            check_popover_right_end_style(source,css.replace(".bui-popover-surface.right-end",".bui-popover-surfaceright-end"),css)

    def test_published_stale_right_end_selector_is_rejected(self):
        source="&.right-end { transform: translateX(-10px); }"
        css=".bui-popover-surface.right-end { transform: translateX(-10px); }"
        with self.assertRaisesRegex(BundleContractError,"published"):
            check_popover_right_end_style(source,css,css.replace(".bui-popover-surface.right-end",".bui-popover-surfaceright-end"))

    def test_css_source_missing_reduced_motion_is_rejected(self):
        source="@media (prefers-reduced-motion: reduce) {transition-duration: 0s;transition-delay: 0s;}"
        compiled="@media(prefers-reduced-motion:reduce){.bui-popover-surface{transition-duration:0s;transition-delay:0s}}"
        with self.assertRaisesRegex(BundleContractError,"authored"):
            check_popover_reduced_motion_style(source.replace("reduce","no-preference"),
                                               compiled,compiled)

    def test_stale_minified_css_is_rejected(self):
        source="@media (prefers-reduced-motion: reduce) {transition-duration: 0s;transition-delay: 0s;}"
        compiled="@media(prefers-reduced-motion:reduce){.bui-popover-surface{transition-duration:0s;transition-delay:0s}}"
        with self.assertRaisesRegex(BundleContractError,"Published"):
            check_popover_reduced_motion_style(source,compiled,
                                               compiled.replace("transition-duration:0s","transition-duration:2s"))

    def test_stale_published_bundle_fails(self):
        with tempfile.TemporaryDirectory() as path:
            base=Path(path)
            dist=base/"dist";published=base/"web"
            dist.mkdir();published.mkdir()
            for name in NAMES:
                (dist/name).write_text("fresh",encoding="utf8")
                (published/name).write_text("fresh",encoding="utf8")
            (published/"bluent.ui.js").write_text("stale",encoding="utf8")
            with self.assertRaisesRegex(BundleContractError,"stale"):
                same_generated_assets(dist,published)

    def test_missing_artifact_fails(self):
        with tempfile.TemporaryDirectory() as path:
            base=Path(path)
            with self.assertRaisesRegex(BundleContractError,"missing"):
                same_generated_assets(base,base)

    def test_missing_keyboard_escape_listener_fails(self):
        authored=(ROOT/"src/Bluent.UI.Scripts/src/Popover/Popover.ts").read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(BundleContractError,"Escape/focus"):
            check_implementation_typescript(authored.replace("event.key !== 'Escape'","event.key !== 'Delete'"))

    def test_no_motion_transition_completion_cannot_be_dropped(self):
        authored=(ROOT/"src/Bluent.UI.Scripts/src/Popover/Popover.ts").read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(BundleContractError,"transition|focus"):
            check_implementation_typescript(authored.replace("if (duration <= 0)", "if (duration < 0)"))

    def test_rapid_reopen_must_cancel_stale_hide(self):
        authored=(ROOT/"src/Bluent.UI.Scripts/src/Popover/Popover.ts").read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(BundleContractError,"transition|focus"):
            check_implementation_typescript(authored.replace("this.cancelPendingHide(settings.triggerId)", "this.skipPendingHide(settings.triggerId)"))

    def test_disclosure_scope_must_not_touch_hover_tooltips(self):
        authored=(ROOT/"src/Bluent.UI.Scripts/src/Popover/Popover.ts").read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(BundleContractError,"popover Escape/focus"):
            check_implementation_typescript(authored.replace(
                "settings.triggerEvents?.includes('click')",
                "settings.triggerEvents?.includes('mouseenter')"))

    def test_disclosure_must_preserve_author_supplied_attributes(self):
        authored=(ROOT/"src/Bluent.UI.Scripts/src/Popover/Popover.ts").read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(BundleContractError,"popover Escape/focus"):
            check_implementation_typescript(authored.replace(
                "!trigger.hasAttribute('aria-expanded')",
                "trigger.hasAttribute('aria-expanded')"))

    def test_disclosure_cleanup_cannot_be_dropped(self):
        authored=(ROOT/"src/Bluent.UI.Scripts/src/Popover/Popover.ts").read_text(encoding="utf-8-sig")
        with self.assertRaisesRegex(BundleContractError,"popover Escape/focus"):
            check_implementation_typescript(authored.replace(
                "this._managedTriggerAria.delete(triggerId)",
                "this._managedTriggerAria.clear()"))

    def test_popover_single_child_cleanup_cannot_be_replaced_with_global_dispose(self):
        authored=(ROOT/"src/Bluent.UI.Scripts/src/Popover/Popover.ts").read_text(encoding="utf-8-sig")
        changed=authored.replace("public destroyPopover(triggerId: string)",
                                  "public destroyAll(): void")
        with self.assertRaisesRegex(BundleContractError,"popover Escape/focus"):
            check_implementation_typescript(changed)

if __name__=="__main__":
    unittest.main()
