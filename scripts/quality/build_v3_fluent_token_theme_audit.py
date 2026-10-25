import argparse, json, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
Q=ROOT/'docs/v3/quality'
STYLE_ROOT=ROOT/'src/Bluent.UI/Styles'
MATRIX=Q/'FLUENT-PARITY-RETRO-AUDIT.json'
CANDIDATES=Q/'FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json'
JSON_OUT=Q/'FLUENT-PARITY-TOKEN-THEME-AUDIT.json'
MD_OUT=Q/'FLUENT-PARITY-TOKEN-THEME-AUDIT.md'
DATE='2026-10-22'
BASELINE='73155f02'

STYLE_MAP={
'Button':['Components/_button.scss'],
'Icon':[],
'Label':['Components/_label.scss'],
'Link':['Components/_link.scss'],
'Badge':['Components/_badge.scss'],
'TextField':['Components/_field.scss'],
'NumericField':['Components/_field.scss'],
'Checkbox':['Components/_checkbox.scss'],
'Switch':['Components/_switch.scss'],
'RadioGroup':['Components/_radio-group.scss','Components/_radio.scss'],
'SelectField':['Components/_field.scss','Components/_dropdown-select.scss'],
'DateField':['Components/_field.scss','Components/_calendar.scss'],
'TimeField':['Components/_field.scss'],
'MaskedField':['Components/_field.scss'],
'OtpField':['Components/_otp-field.scss'],
'Slider':['Components/_slider.scss'],
'RangeSlider':['Components/_range-slider.scss'],
'FileSelect':['Components/_file-select.scss'],
}
EVIDENCE={
'Button':['BLUENT-BUTTON-STATE-CHROME.json','BLUENT-BLAZOR-FOCUS-CHROME.json'],
'Icon':['BLUENT-CROSS-ICON-CHROME.json'],
'Label':['BLUENT-LABEL-LINK-BADGE-CHROME.json'],
'Link':['BLUENT-LABEL-LINK-BADGE-CHROME.json'],
'Badge':['BLUENT-LABEL-LINK-BADGE-CHROME.json'],
'TextField':['BLUENT-LAB-P0-CHROME.json'],
'NumericField':['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json'],
'Checkbox':['BLUENT-CONTROL-SEMANTICS-CHROME.json','BLUENT-CONTROL-SEMANTICS-EDGE.json'],
'Switch':['BLUENT-CONTROL-SEMANTICS-CHROME.json','BLUENT-CONTROL-SEMANTICS-EDGE.json'],
'RadioGroup':['BLUENT-CONTROL-SEMANTICS-CHROME.json','BLUENT-CONTROL-SEMANTICS-EDGE.json'],
'SelectField':['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json'],
'DateField':['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json'],
'TimeField':['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json'],
'MaskedField':['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json'],
'OtpField':['BLUENT-TYPED-FIELDS-CHROME.json','BLUENT-TYPED-FIELDS-EDGE.json'],
'Slider':['BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json','BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json'],
'RangeSlider':['BLUENT-LAB-P0-POINTER-SCROLL-CHROME.json','BLUENT-LAB-P0-POINTER-SCROLL-SERVER-CHROME.json'],
'FileSelect':['BLUENT-LAB-P0-FILE-UPLOAD-CHROME.json','BLUENT-LAB-P0-FILE-UPLOAD-SERVER-CHROME.json'],
}
NOTES={
'Button':'Uses Fluent-named semantic color, typography, spacing and radius tokens, but outline is reset and focus/forced-colors parity needs explicit state-by-state verification.',
'Icon':'No dedicated family SCSS was found in the reviewed style map; rendered SVG color depends on inherited currentColor and parent theme context.',
'Label':'Foreground styling uses semantic color tokens; required-marker contrast and theme behavior are not native AT or computed-Fluent parity acceptance.',
'Link':'Foreground/background styles use semantic token references; hover, focus, visited and high-contrast behavior still need comparison with the pinned Fluent runtime.',
'Badge':'Uses semantic status tokens; its infinite shadow animation has no component-specific reduced-motion rule. This is a motion/acceptance gap, not evidence of a color-token mismatch.',
'TextField':'Shared field styling uses semantic tokens plus local --fui-text-field-* properties and a fixed 32px minimum height; density and focus behavior need design comparison.',
'NumericField':'Shares field tokens and local sizing properties; Step has no effective behavior and the style inventory does not prove numeric-state parity.',
'Checkbox':'Uses semantic theme tokens and local --bui-checkbox-* properties; mixed/checked/disabled/forced-colors combinations remain unaccepted.',
'Switch':'Uses semantic tokens for track/thumb states; no component-specific forced-colors override was found in the family stylesheet.',
'RadioGroup':'Group styles rely on the radio subcomponent stylesheet; selected, disabled, focus and forced-colors values need per-state comparison.',
'SelectField':'Shares field tokens and dropdown-select styling; native popup rendering and high-contrast behavior cannot be established from SCSS inventory.',
'DateField':'Shares field and calendar styling; calendar popup, selected dates, bounds and dark/forced-colors states need direct browser comparison.',
'TimeField':'Shares field styling; locale formatting defects are separate from color-token usage and still affect parity.',
'MaskedField':'Shares field styling; input-state tokens do not resolve the mask/bind-event behavior defects.',
'OtpField':'Uses custom cell borders/backgrounds alongside theme tokens; focused, filled, error and disabled cells need full theme/state comparison.',
'Slider':'Uses custom --bui-slider-* properties and gradients; rail/thumb tokens and forced-colors visibility need explicit verification.',
'RangeSlider':'Uses custom --bui-slider-* properties; two-thumb active/inactive rails and high-contrast states need explicit verification.',
'FileSelect':'Family stylesheet has little/no direct color styling and delegates visuals to child controls; card, remove-action and focus theme parity must be checked compositionally.',
}
THEME_SOURCES=[
'src/Bluent.UI/Styles/Themes/theme/light-theme.scss',
'src/Bluent.UI/Styles/Themes/theme/dark-theme.scss',
'src/Bluent.UI/Styles/Themes/theme/light/color-palette.scss',
'src/Bluent.UI/Styles/Themes/theme/dark/color-palette.scss',
'src/Bluent.UI/Styles/Themes/theme/light/brand-palette.scss',
'src/Bluent.UI/Styles/Themes/theme/dark/brand-palette.scss',
'src/Bluent.UI/Styles/Themes/theme/light/status-color-palette.scss',
'src/Bluent.UI/Styles/Themes/theme/dark/status-color-palette.scss',
]
THEME_PREFIXES=('--colorNeutral','--colorBrand','--colorPalette','--colorTransparent','--font','--lineHeight','--spacing','--strokeWidth','--duration','--curve','--borderRadius','--shadow')
LOCAL_PREFIXES=('--bui-','--fui-','--badge-','--slider-','--button-')
VAR_RE=re.compile(r'var\(\s*(--[\w-]+)')
RAW_COLOR_RE=re.compile(r'(?i)(#[0-9a-f]{3,8}\b|rgba?\s*\(|hsla?\s*\(|\b(?:white|black)\b)')
COLOR_PROP_RE=re.compile(r'(?i)\b(color|background(?:-color)?|border(?:-[\w-]+)?|outline(?:-[\w-]+)?|fill|stroke|box-shadow|background-image|filter)\s*:')
THEME_RULE_RE=re.compile(r'(?i)forced-colors|forced-color-adjust')
MOTION_RULE_RE=re.compile(r'(?i)prefers-reduced-motion')
SNIPPET_TERMS=('var(--color','--bui-','--fui-','#','rgba(','forced-colors','prefers-reduced-motion')

def readj(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def component_sources(names):
    base=ROOT/'src/Bluent.UI/Components'; out=[]
    for name in names:
        matches=[p for p in base.rglob('*') if p.is_file() and p.name in {f'{name}.razor',f'{name}.razor.cs',f'{name}.cs'}]
        if not matches: raise ValueError(f'No component source file for {name}')
        out.extend(p.relative_to(ROOT).as_posix() for p in matches)
    return sorted(set(out))
def scan_family(style_files, component_files, global_source):
    refs=set(); raw=[]; snippets=[]; forced=0; reduced=0; color_decls=0
    files=[ROOT/p for p in style_files+component_files]
    for path in files:
        rel=path.relative_to(ROOT).as_posix()
        for n,line in enumerate(path.read_text(encoding='utf-8-sig',errors='replace').splitlines(),1):
            found=VAR_RE.findall(line); refs.update(found)
            if COLOR_PROP_RE.search(line):
                if re.search(r'var\(\s*--color',line,re.I): color_decls+=1
                if RAW_COLOR_RE.search(line):
                    raw.append({'path':rel,'line':n,'excerpt':line.strip()[:180]})
            if THEME_RULE_RE.search(line): forced+=1
            if MOTION_RULE_RE.search(line): reduced+=1
            if len(snippets)<8 and any(t.lower() in line.lower() for t in SNIPPET_TERMS):
                snippets.append({'path':rel,'line':n,'excerpt':line.strip()[:160]})
    theme=sorted(x for x in refs if x.startswith(THEME_PREFIXES))
    local=sorted(x for x in refs if x.startswith(LOCAL_PREFIXES))
    unresolved=[]
    for token in local:
        if not re.search(re.escape(token)+r'\s*:',global_source):
            unresolved.append(token)
    if not snippets:
        for path in files:
            for n,line in enumerate(path.read_text(encoding='utf-8-sig',errors='replace').splitlines(),1):
                if line.strip():
                    snippets.append({'path':path.relative_to(ROOT).as_posix(),'line':n,'excerpt':line.strip()[:160]})
                    break
            if snippets: break
    return {'themeTokenRefs':theme,'localCustomProps':local,'unresolvedLocalProps':unresolved,'rawColorDeclarations':raw,'tokenizedColorDeclarationCount':color_decls,'componentForcedColorsRuleLines':forced,'componentReducedMotionRuleLines':reduced,'sourceSnippets':snippets}

def build():
    matrix=readj(MATRIX); cand=readj(CANDIDATES)
    mf={f['family']:f for f in matrix['families']}; cf={f['family']:f for f in cand['families']}
    if set(STYLE_MAP)!=set(mf) or set(STYLE_MAP)!=set(cf) or set(NOTES)!=set(mf) or set(EVIDENCE)!=set(mf):
        raise ValueError('Token/theme audit must cover exactly all 18 matrix families')
    for rel in THEME_SOURCES:
        if not (ROOT/rel).is_file(): raise ValueError(f'Missing theme source {rel}')
    global_source='\n'.join(p.read_text(encoding='utf-8-sig',errors='replace') for p in (ROOT/'src/Bluent.UI').rglob('*') if p.is_file() and p.suffix.lower() in {'.scss','.css','.razor','.cs'})
    families=[]
    for name,rel_styles in STYLE_MAP.items():
        styles=['src/Bluent.UI/Styles/'+p for p in rel_styles]
        for rel in styles:
            if not (ROOT/rel).is_file(): raise ValueError(f'Missing style source for {name}: {rel}')
        components=component_sources([c['name'] for c in cf[name]['components']])
        metrics=scan_family(styles,components,global_source)
        for ev in EVIDENCE[name]:
            if not (Q/'evidence'/ev).is_file(): raise ValueError(f'Missing browser evidence for {name}: {ev}')
        f=mf[name]
        families.append({'family':name,'productIssue':f['productIssue'],'dimension':'tokenTheme','dimensionStatus':'audited_gaps','styleFiles':styles,'componentSourceFiles':components,'hasDedicatedFamilyStylesheet':bool(styles),'themeTokenRefs':metrics['themeTokenRefs'],'localCustomProps':metrics['localCustomProps'],'unresolvedLocalProps':metrics['unresolvedLocalProps'],'tokenizedColorDeclarationCount':metrics['tokenizedColorDeclarationCount'],'rawColorDeclarations':metrics['rawColorDeclarations'],'componentForcedColorsRuleLines':metrics['componentForcedColorsRuleLines'],'componentReducedMotionRuleLines':metrics['componentReducedMotionRuleLines'],'sourceSnippets':metrics['sourceSnippets'],'sourceNote':NOTES[name],'browserEvidence':['evidence/'+x for x in EVIDENCE[name]],'designApproval':f['designApproval'],'evidenceBundle':f['evidenceBundle']})
    ledger={'issue':552,'audit':'Token/theme source inventory and acceptance gaps','reviewedOn':DATE,'sourceBaseline':BASELINE,'familyCount':18,'dimension':'tokenTheme','dimensionStatus':'audited_gaps','parityAccepted':False,'noneApproved':True,'themeSourceFiles':THEME_SOURCES,'themeTokenPrefixes':list(THEME_PREFIXES),'runtimeScope':'Static SCSS/source inventory plus selected existing browser evidence. It does not compare computed values against the pinned Fluent runtime and does not certify native OS high contrast or assistive technology.','families':families,'acceptanceBoundary':'audited_gaps means source usage and known evidence gaps were inventoried; token naming is not proof of value, contrast, state or Fluent parity.'}
    lines=['# Token and theme source audit - Issue #552','','Review date: '+DATE+'. Source baseline: '+BASELINE+'.','','## Scope','','This audit inventories token references and local CSS custom properties in the 18 pilot families, checks for raw color literals and component-local forced-colors/reduced-motion rules, and links the existing browser evidence. The light/dark theme mixins generate Fluent-named semantic color, typography, spacing, stroke, duration, curve, radius and shadow tokens.','','**Status: audited gaps, not accepted.** Matching token names do not prove computed-value parity with the pinned Fluent runtime. This report does not claim native OS high-contrast or screen-reader certification.','','## Summary','','| Family | Style files | Theme token refs | Local custom props | Raw color declarations | Component forced-colors lines | Reduced-motion lines |','|---|---|---:|---:|---:|---:|---:|']
    for f in families:
        lines.append(f"| {f['family']} | {len(f['styleFiles'])} | {len(f['themeTokenRefs'])} | {len(f['localCustomProps'])} | {len(f['rawColorDeclarations'])} | {f['componentForcedColorsRuleLines']} | {f['componentReducedMotionRuleLines']} |")
    lines+=['','## Theme sources','']
    for rel in THEME_SOURCES: lines.append(f"- [{Path(rel).name}](../../../{rel})")
    lines+=['','## Family findings','']
    for f in families:
        lines += [f"### {f['family']} (#{f['productIssue']})",'',f"**Source note:** {f['sourceNote']}",'',
                  '**Style files:** '+(', '.join(f"[{Path(p).name}](../../../{p})" for p in f['styleFiles']) if f['styleFiles'] else 'No dedicated family SCSS; color is inherited from component/parent rendering.'),
                  '',
                  '**Theme tokens:** '+(', '.join(f['themeTokenRefs'][:18]) if f['themeTokenRefs'] else 'No direct global theme-token reference found in the family stylesheet set.'),
                  '',
                  '**Local custom properties:** '+(', '.join(f['localCustomProps'][:18]) if f['localCustomProps'] else 'None found in the reviewed family style set.'),
                  '',
                  '**Unresolved local property references:** '+(', '.join(f['unresolvedLocalProps']) if f['unresolvedLocalProps'] else 'None detected by repository-wide source search.'),
                  '',
                  '**Raw color declarations:** '+(f"{len(f['rawColorDeclarations'])} found; "+', '.join(f"{Path(x['path']).name}:L{x['line']}" for x in f['rawColorDeclarations'][:5]) if f['rawColorDeclarations'] else 'None found in the reviewed family stylesheet set.'),
                  '',
                  f"**Component-specific forced-colors rule lines:** {f['componentForcedColorsRuleLines']}; **reduced-motion rule lines:** {f['componentReducedMotionRuleLines']}.",
                  '',
                  '**Browser evidence:** '+', '.join(f"[{Path(p).name}]({p})" for p in f['browserEvidence']),
                  '',
                  '**Decision boundary:** Source token inventory only; compare computed Light/Dark values and states with the pinned Fluent runtime and verify responsive RTL, forced colors and native AT before acceptance.',
                  '']
    lines+=['## Acceptance boundary','','All 18 tokenTheme dimensions are recorded as audited_gaps. Global light/dark token mixins exist, but this inventory is not a pixel/contrast parity result. Every family design approval remains pending and evidenceBundle remains null. No product source, CSS or public API changed.','']
    return ledger,'\n'.join(lines)
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--write',action='store_true'); ap.add_argument('--check',action='store_true'); a=ap.parse_args()
    ledger,report=build()
    if a.write:
        JSON_OUT.write_text(json.dumps(ledger,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
        MD_OUT.write_text(report,encoding='utf-8')
    if a.check:
        if not JSON_OUT.exists() or readj(JSON_OUT)!=ledger: raise SystemExit('Token/theme ledger stale')
        if not MD_OUT.exists() or MD_OUT.read_text(encoding='utf-8-sig')!=report: raise SystemExit('Token/theme report stale')
    if not a.write and not a.check: print(f"Token/theme audit: {ledger['familyCount']} families.")
if __name__=='__main__': main()
