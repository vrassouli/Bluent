from __future__ import annotations
from pathlib import Path

class LabelContractError(ValueError):
    pass

def _require(text: str, needles: tuple[str, ...], origin: str) -> None:
    missing=[needle for needle in needles if needle not in text]
    if missing:
        raise LabelContractError(f'{origin} is missing required Label contract: {missing}')

def check_label_contract(root: Path) -> None:
    label_root=root/'src/Bluent.UI/Components/LabelComponent'
    razor=(label_root/'Label.razor').read_text(encoding='utf-8-sig')
    code=(label_root/'Label.razor.cs').read_text(encoding='utf-8-sig')
    sass=(root/'src/Bluent.UI/Styles/Components/_label.scss').read_text(encoding='utf-8-sig')
    compiled=(root/'src/Bluent.UI/Styles/Components/components.css').read_text(encoding='utf-8-sig')
    published=(root/'src/Bluent.UI/wwwroot/bluent.ui.components.min.css').read_text(encoding='utf-8-sig')
    english=(label_root/'Resources/LabelResources.resx').read_text(encoding='utf-8-sig')
    persian=(label_root/'Resources/LabelResources.fa-IR.resx').read_text(encoding='utf-8-sig')
    demo=(root/'src/Bluent.UI.Demo.Pages/Pages/Components/Labels.razor').read_text(encoding='utf-8-sig')

    _require(razor,(
        '@if (Info is null)',
        '<label for="@GetPropertyName()" @attributes="AdditionalAttributes" id="@Id" class="@GetComponentClass()" style="@Style">',
        '<span class="bui-label-with-info">',
        'data-bui-label-info-trigger="true"',
        'role="note" tabindex="-1"',
        'aria-hidden="true">@RequiredSymbol</span>'), 'Label.razor')
    if razor.count('<label ') != 2:
        raise LabelContractError('Label must keep a native label in both Info and non-Info branches')
    info_branch=razor.split('else',1)[1]
    if '</label>' not in info_branch:
        raise LabelContractError('The native label must close before the Info action')
    label_close=info_branch.index('</label>')
    if '<Button ' not in info_branch or info_branch.index('<Button ') < label_close:
        raise LabelContractError('The interactive Info trigger must be a sibling of the native label, never nested inside it')

    _require(code,(
        '[Parameter] public Expression<Func<object?>>? ForExpression { get; set; }',
        '[Parameter] public RenderFragment? Info { get; set; }',
        '[Parameter] public string? InfoButtonAriaLabel { get; set; }',
        '[Parameter] public LabelRequiredState Required { get; set; } = LabelRequiredState.Auto;',
        'ForExpression?.IsRequired() ?? false',
        'ForExpression.GetMemberName()',
        'IStringLocalizer<LabelResources>',
        'Localizer["InfoButtonAccessibleName", displayName].Value',
        'return InfoButtonAriaLabel;'), 'Label.razor.cs')
    _require(sass,(
        '--bui-v3-text-primary, var(--colorNeutralForeground1)',
        '--bui-v3-text-disabled, var(--colorNeutralForegroundDisabled)',
        '--bui-v3-text-danger-accessible, var(--colorPaletteRedForeground1)',
        'padding-inline-start', 'gap: var(--spacingHorizontalXS)'), 'Label Sass')
    for origin,css in (('compiled components.css',compiled),('published components.min.css',published)):
        _require(css,('.bui-label-with-info','--bui-v3-text-primary','--bui-v3-text-disabled','--bui-v3-text-danger-accessible','.bui-label-info-surface'),origin)
    _require(english,('name="MoreInformation"','More information','{0}, more information'),'English Label resources')
    _require(persian,('name="MoreInformation"','اطلاعات بیشتر','{0}، اطلاعات بیشتر'),'Persian Label resources')
    _require(demo,('for="label-demo-email"','id="label-demo-email"','required','InfoButtonAriaLabel','dir="rtl"','LabelRequiredState.NotRequired','visual only'),'Label demo')

def main() -> int:
    import argparse
    parser=argparse.ArgumentParser(description='Fail-closed Label semantics, localization and emitted token CSS contract.')
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2])
    args=parser.parse_args()
    check_label_contract(args.root)
    print('PASS #430 Label native association, sibling Info action, localised accessible name, visual-only states and source/compiled/published token fallbacks')
    return 0

if __name__=='__main__':
    raise SystemExit(main())
