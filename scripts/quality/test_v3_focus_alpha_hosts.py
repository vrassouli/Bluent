"""#418 fail-closed alpha-composited focus-host research, NOT public CSS approval."""
from __future__ import annotations

from collections import Counter
from pathlib import Path
import unittest
from unittest.mock import patch
from audit_v3_focus_alpha_hosts import audit, composite, rgba, rgb_hex, check_alpha_forced_browser_source
from generate_v3_token_preview import THEME_DIR


class FocusAlphaHostsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = audit()

    def test_all_ten_brands_two_modes_two_real_alpha_layers_two_underlays(self):
        self.assertTrue(self.report["passedResearchContract"], self.report["errors"])
        self.assertEqual(self.report["entries"], 80)
        self.assertEqual(len({c["brand"] for c in self.report["cases"]}), 10)
        self.assertEqual(Counter(c["mode"] for c in self.report["cases"]),
                         {"light":40,"dark":40})

    def test_known_light_alpha_over_brand_is_below_three_for_both_colors(self):
        case = next(c for c in self.report["cases"]
                    if c["brand"]=="default" and c["mode"]=="light"
                    and c["overlayToken"]=="--colorNeutralBackgroundAlpha"
                    and c["underlayToken"]=="--colorBrandBackground")
        self.assertEqual(case["compositedHost"], "#89B3DA")
        self.assertEqual(case["brandContrast"], 2.627)
        self.assertEqual(case["inverseContrast"], 2.205)
        self.assertTrue(case["bothBelow3"])

    def test_all_ten_light_brands_expose_one_dual_contrast_failure(self):
        fails=[c for c in self.report["cases"] if c["bothBelow3"]]
        self.assertEqual(len(fails),10)
        self.assertEqual({c["brand"] for c in fails},
                         {c["brand"] for c in self.report["cases"]})
        self.assertTrue(all(c["mode"]=="light" and
                            c["overlayToken"]=="--colorNeutralBackgroundAlpha" and
                            c["underlayToken"]=="--colorBrandBackground" for c in fails))

    def test_dark_current_baseline_has_no_dual_failure_but_no_certification(self):
        self.assertEqual(self.report["dualFailureByMode"],{"light":10,"dark":0})
        self.assertIn("not sampled browser pixels",self.report["scope"])
        self.assertIn("NOT approved focus token semantics",self.report["scope"])

    def test_true_opaque_underlay_and_alpha_compositing(self):
        self.assertEqual(composite("rgba(255, 255, 255, 0.5)","#1267B4"),"#89B3DA")
        self.assertEqual(composite("rgba(255, 255, 255, 1)","#1267B4"),"#FFFFFF")
        self.assertEqual(composite("rgba(0, 0, 0, 0.5)","#FFFFFF"),"#808080")

    def test_alpha_only_focus2_color_meets_three_in_all_eighty_source_hosts(self):
        self.assertEqual(self.report["focus2Below3"],0)
        self.assertEqual(self.report["focus2MinimumContrast"],8.511)
        self.assertEqual(self.report["focus2Source"],{"light":"#000000","dark":"#FFFFFF"})
        self.assertEqual(len(self.report["cases"]),80)
        for c in self.report["cases"]:
            self.assertEqual(c["focus2Token"],"--colorStrokeFocus2")
            self.assertGreaterEqual(c["focus2Contrast"],3.0)
            expected="#000000" if c["mode"]=="light" else "#ffffff"
            self.assertEqual(c["focus2Ring"].lower(),expected)
        self.assertIn("never global focus default",self.report["focus2Decision"])

    def test_alpha_risky_default_light_repaired_by_existing_focus2_source_only(self):
        c=next(c for c in self.report["cases"] if c["brand"]=="default"
            and c["mode"]=="light" and c["bothBelow3"])
        self.assertEqual(c["compositedHost"],"#89B3DA")
        self.assertEqual(c["focus2Ring"],"#000000")
        self.assertEqual(c["focus2Contrast"],9.524)

    def test_focus2_palettes_remain_source_backed_and_fail_closed_on_drift(self):
        # Keep ALL actual emitted themes present, change precisely one value.
        # We must assert a palette-specific rejection, not a missing-theme error.
        from audit_v3_focus_alpha_hosts import audit as source_audit
        from audit_v3_focus_alpha_hosts import load_source_tokens as real_load
        def changed(path, names):
            actual=real_load(path,names)
            if path.name=="theme-default-light.css":
                self.assertEqual(actual["--colorStrokeFocus2"],"#000000")
                actual["--colorStrokeFocus2"]="#FFFFFF"
            return actual
        with patch("audit_v3_focus_alpha_hosts.load_source_tokens",side_effect=changed):
            result=source_audit()
        self.assertFalse(result["passedResearchContract"])
        self.assertTrue(any("Focus2 palette source drift: default/light" in e
                            for e in result["errors"]),result["errors"])

    def test_real_blazor_alpha_specimen_and_isolated_scope_are_preserved(self):
        root=Path(__file__).resolve().parents[2]
        razor=(root/"src/Bluent.UI.Demo.Pages/Pages/Scenarios/V3StylingLab.razor").read_text(encoding="utf-8-sig")
        css=(root/"src/Bluent.UI.Demo.Pages/Pages/Scenarios/V3StylingLab.razor.css").read_text(encoding="utf-8")
        for name in ("v3-alpha-focus-start","v3-alpha-brand-button",
                     "v3-alpha-focus2-button","v3-alpha-focus-end"):
            self.assertIn(name,razor)
        self.assertIn('<Button id="v3-alpha-focus2-button"',razor)
        self.assertIn('data-v3-alpha-ring="focus2"',razor)
        self.assertIn(".v3-lab-alpha-focus-card[data-v3-alpha-ring=\"focus2\"]",css)
        self.assertIn("--v3-lab-focus: var(--colorStrokeFocus2)",css)
        self.assertIn("background: var(--colorNeutralBackgroundAlpha)",css)
        self.assertIn("background: var(--colorBrandBackground)",css)
        self.assertIn(".v3-lab-alpha-focus-card ::deep .bui-button",css)
        self.assertIn("@media (forced-colors: active)",css)
        self.assertNotIn("alpha-focus", (root/"src/Bluent.UI/Styles/Components/components.css").read_text(encoding="utf-8"))

    def test_real_blazor_probe_requires_native_tabs_and_exact_focus_targets(self):
        p=Path(__file__).resolve().parents[0]/"probe_v3_blazor_runtime.mjs"
        probe=p.read_text(encoding="utf-8")
        self.assertIn('await cdp.send("Input.dispatchKeyEvent"',probe)
        self.assertIn('v3-alpha-brand-button',probe)
        self.assertIn('v3-alpha-focus2-button',probe)
        for gate in ("actual Bluent alpha-host branded ring Tab focus ",
                     "actual Bluent alpha-host Focus2 keyboard ring from source ",
                     "real Bluent explicit alpha Focus2 computed host contrast ",
                     "real Bluent branded ring alpha risk reproduced "):
            self.assertIn(gate,probe)
        self.assertIn("alphaBrand.focused&&alphaBrand.visible",probe)
        self.assertIn("alphaFocus2.focused&&alphaFocus2.visible",probe)
        self.assertIn("candidateRatio>=3",probe)
        self.assertIn("brandedRatio<3",probe)

    def test_real_blazor_alpha_forced_colors_source_gate(self):
        from pathlib import Path
        probe=(Path(__file__).parent/"probe_v3_blazor_runtime.mjs").read_text(encoding="utf-8")
        check_alpha_forced_browser_source(probe)

    def test_forced_alpha_weakening_native_keyboard_is_rejected(self):
        from pathlib import Path
        probe=(Path(__file__).parent/"probe_v3_blazor_runtime.mjs").read_text(encoding="utf-8")
        broken=probe.replace('alphaForcedRows.push(sample)','/* removed */')
        with self.assertRaisesRegex(ValueError,"browser gate missing"):
            check_alpha_forced_browser_source(broken)

    def test_forced_alpha_real_native_keyboard_removed_is_rejected(self):
        from pathlib import Path
        probe=(Path(__file__).parent/"probe_v3_blazor_runtime.mjs").read_text(encoding="utf-8")
        start=probe.index("const alphaForcedOriginalTheme=")
        end=probe.index('await cdp.send("Emulation.setEmulatedMedia",{features:[]});',start)
        block=probe[start:end]
        self.assertIn("Input.dispatchKeyEvent",block)
        broken=probe[:start]+block.replace("Input.dispatchKeyEvent","Runtime.evaluate")+probe[end:]
        with self.assertRaisesRegex(ValueError,"browser gate missing"):
            check_alpha_forced_browser_source(broken)

    def test_forced_alpha_weakening_system_highlight_is_rejected(self):
        from pathlib import Path
        probe=(Path(__file__).parent/"probe_v3_blazor_runtime.mjs").read_text(encoding="utf-8")
        broken=probe.replace('x.ring===systemRoles.highlight','x.ring!==""')
        with self.assertRaisesRegex(ValueError,"browser gate missing"):
            check_alpha_forced_browser_source(broken)

    def test_forced_alpha_missing_canvastext_border_is_rejected(self):
        from pathlib import Path
        probe=(Path(__file__).parent/"probe_v3_blazor_runtime.mjs").read_text(encoding="utf-8")
        broken=probe.replace('x.border===systemRoles.canvasText','true')
        with self.assertRaisesRegex(ValueError,"browser gate missing"):
            check_alpha_forced_browser_source(broken)

    def test_forced_alpha_theme_restoration_cannot_be_hardcoded(self):
        from pathlib import Path
        probe=(Path(__file__).parent/"probe_v3_blazor_runtime.mjs").read_text(encoding="utf-8")
        broken=probe.replace('JSON.stringify(alphaForcedOriginalTheme)',"'light'")
        with self.assertRaisesRegex(ValueError,"browser gate missing"):
            check_alpha_forced_browser_source(broken)

    def test_no_false_acceptance_of_zero_opacity_or_non_rgba(self):
        for value in ("transparent","rgb(255, 255, 255)",
                      "rgba(0, 0, 0, 0)","rgba(256, 0, 0, 0.5)",
                      "rgba(255, 255, 255, .5)","rgba(0, 0, 0, -0.1)"):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    rgba(value)

    def test_underlay_must_be_real_opaque_hex(self):
        for color in ("rgba(0,0,0,0.5)", "#FFF", "transparent", "var(--color)"):
            with self.subTest(color=color):
                with self.assertRaises(ValueError):
                    rgb_hex(color)

    def test_missing_source_theme_fails_closed(self):
        from pathlib import Path
        with patch("audit_v3_focus_alpha_hosts.THEME_DIR",Path("/a/nonexistent/v3/token-source")):
            broken=audit()
        self.assertFalse(broken["passedResearchContract"])
        self.assertTrue(broken["errors"])

    def test_failing_light_example_cannot_be_reinterpreted_as_approved_ring(self):
        failing=next(c for c in self.report["cases"] if c["bothBelow3"])
        self.assertFalse(failing["eitherAtLeast3"])
        self.assertLess(max(failing["brandContrast"],failing["inverseContrast"]),3)

if __name__=="__main__":
    unittest.main()
