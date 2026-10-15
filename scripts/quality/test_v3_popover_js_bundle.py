from __future__ import annotations
import tempfile
import unittest
from pathlib import Path
from check_v3_popover_js_bundle import (ROOT,NAMES,BundleContractError,
    same_generated_assets,check_implementation_typescript,check_popover_reduced_motion_style)

class PopoverBundleGateTests(unittest.TestCase):
    def test_checked_in_bundle_and_source_are_consistent(self):
        same_generated_assets(ROOT/"src/Bluent.UI.Scripts/dist",ROOT/"src/Bluent.UI/wwwroot")
        check_implementation_typescript((ROOT/"src/Bluent.UI.Scripts/src/Popover/Popover.ts").read_text(encoding="utf-8-sig"))

    def test_compiled_and_minified_popover_reduced_motion_styles(self):
        authored=(ROOT/"src/Bluent.UI/Styles/Components/_popover.scss").read_text(encoding="utf-8-sig")
        compiled=(ROOT/"src/Bluent.UI/Styles/Components/components.css").read_text(encoding="utf-8-sig")
        minified=(ROOT/"src/Bluent.UI/wwwroot/bluent.ui.components.min.css").read_text(encoding="utf-8-sig")
        check_popover_reduced_motion_style(authored,compiled,minified)

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

if __name__=="__main__":
    unittest.main()
