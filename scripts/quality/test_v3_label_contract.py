from __future__ import annotations
import unittest
from pathlib import Path
from check_v3_label_contract import LabelContractError, check_label_contract

ROOT=Path(__file__).resolve().parents[2]

class LabelContractTests(unittest.TestCase):
    def setUp(self):
        self.paths={
            'razor':ROOT/'src/Bluent.UI/Components/LabelComponent/Label.razor',
            'code':ROOT/'src/Bluent.UI/Components/LabelComponent/Label.razor.cs',
            'sass':ROOT/'src/Bluent.UI/Styles/Components/_label.scss',
            'compiled':ROOT/'src/Bluent.UI/Styles/Components/components.css',
            'published':ROOT/'src/Bluent.UI/wwwroot/bluent.ui.components.min.css',
            'persian':ROOT/'src/Bluent.UI/Components/LabelComponent/Resources/LabelResources.fa-IR.resx',
            'demo':ROOT/'src/Bluent.UI.Demo.Pages/Pages/Components/Labels.razor',
        }
        self.original={key:path.read_text(encoding='utf-8-sig') for key,path in self.paths.items()}

    def _check_mutation(self,key,old,new):
        self.paths[key].write_text(self.original[key].replace(old,new),encoding='utf-8')
        try:
            with self.assertRaises(LabelContractError):
                check_label_contract(ROOT)
        finally:
            self.paths[key].write_text(self.original[key],encoding='utf-8')

    def test_current_label_contract_passes(self):
        check_label_contract(ROOT)

    def test_info_action_cannot_be_nested_inside_label(self):
        self._check_mutation('razor','</label>\n        <Popover','<Popover')

    def test_required_marker_must_remain_hidden_from_accessibility_tree(self):
        self._check_mutation('razor','aria-hidden="true"','aria-hidden="false"')

    def test_info_button_needs_a_default_localized_name(self):
        self._check_mutation('code','Localizer["InfoButtonAccessibleName", displayName].Value','displayName')

    def test_custom_info_name_parameter_cannot_disappear(self):
        self._check_mutation('code','InfoButtonAriaLabel { get; set; }','InfoButtonAriaName { get; set; }')

    def test_dark_disabled_text_keeps_approved_token_and_fallback(self):
        self._check_mutation('sass','--bui-v3-text-disabled, var(--colorNeutralForegroundDisabled)','--colorNeutralForegroundDisabled')

    def test_required_marker_uses_approved_danger_role(self):
        self._check_mutation('sass','--bui-v3-text-danger-accessible, var(--colorPaletteRedForeground1)','--colorPaletteRedForeground1')

    def test_published_stylesheet_cannot_be_stale(self):
        self._check_mutation('published','--bui-v3-text-primary','--bui-v3-primary-stale')

    def test_rtl_example_is_kept_in_demo(self):
        self._check_mutation('demo','dir="rtl"','dir="ltr"')

    def test_persian_info_accessible_name_remains_available(self):
        self._check_mutation('persian','{0}، اطلاعات بیشتر','{0} اطلاعات')

if __name__=='__main__':
    unittest.main()
