import argparse, json
from pathlib import Path
import build_v3_fluent_blazor_extensions_audit as blazor_audit

ROOT=Path(__file__).resolve().parents[2]
Q=ROOT/'docs/v3/quality'
MATRIX=Q/'FLUENT-PARITY-RETRO-AUDIT.json'
CANDIDATES=Q/'FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json'
JSON_OUT=Q/'FLUENT-PARITY-ACCESSIBILITY-AUDIT.json'
MD_OUT=Q/'FLUENT-PARITY-ACCESSIBILITY-AUDIT.md'
DATE='2026-10-22'
BASELINE='73155f02'
A={
'Button':('The tested toggle specimen has a native button role and visible text; its browser snapshot records ariaPressed=None.','Toggle-state announcement is not represented by aria-pressed in the tested specimen; icon-only naming and native AT are not accepted.','Define toggle semantics and test accessible name, pressed/disabled state, focus indication and native screen-reader output.'),
'Icon':('Cross-icon evidence covers SVG rendering and inherited color, not native AT certification.','Decorative versus informative SVG semantics and icon-only accessible naming do not have a complete documented/tested contract.','Define decorative/meaningful icon rules; test aria-hidden, title/name propagation and icon-only controls with native AT.'),
'Label':('The browser demo renders labels; the sample label snapshot has an empty for attribute.','The current demo sample does not prove label-to-control association; required marker is not connected to native required/invalid state.','Use a real form fixture to test click-to-focus, dynamic target IDs, required/invalid state and localized marker announcements.'),
'Link':('Browser AX evidence exposes the demo anchor as a native link with text and href.','Modified clicks, visited/focus states and callback/default-navigation semantics are not fully accepted; no native AT test exists.','Test Enter, modifier clicks, link name/context, focus and navigation behavior in browser and native AT.'),
'Badge':('The empty badge specimen is a div with no role, accessible name or live region; count badges render visible text.','The design contract does not state when a badge is decorative versus an announced count; infinite animation lacks reduced-motion handling.','Document decorative/count semantics; test count announcements, surrounding context and reduced-motion behavior.'),
'TextField':('Browser AX exposes the tested field as a named textbox: Example text field.','The visible native input name attribute is empty; invalid/describedby association, validation announcements and form submission are not covered.','Test label, name, aria-describedby, aria-invalid, required state and validation announcements in a real EditForm.'),
'NumericField':('Browser AX exposes the tested numeric field as a named textbox: Nullable int.','It is exposed as textbox rather than spinbutton in the tested browser; confirm intended parity semantics and validate limits/Step announcements.','Compare role, value/limits, stepper keyboard and validation semantics against the pinned Fluent NumberField.'),
'Checkbox':('AX exposes a focusable native checkbox with its label.','Visual indeterminate is not native indeterminate; aria-checked is absent and AX reports checked=false, so mixed state is announced incorrectly.','Synchronize native indeterminate/aria-checked=mixed and test checked, mixed, disabled, required and reset announcements.'),
'Switch':('AX exposes a focusable checkbox with the label Light and checked state.','The tested switch is announced as checkbox rather than switch; state announcements and disabled behavior need explicit parity review.','Confirm intended role strategy, then test switch role/state announcements, keyboard, disabled and native AT.'),
'RadioGroup':('Individual radio inputs have names, but the group wrapper is ignored by browser AX.','The group has no accessible group name; radio name attributes are empty and arrow navigation can cross into another group.','Provide group naming/field name, isolate arrow-key navigation and verify one-tab-stop behavior with native AT.'),
'SelectField':('Browser AX exposes the native select as a named combobox: Select field.','Popup/listbox announcements, selected option changes, invalid/required descriptions and form-field name are not fully verified.','Test expanded/selected states, option count/name, validation associations and native screen-reader behavior.'),
'DateField':('Browser AX exposes the sample date field as a named textbox: Small date field.','Date-picker popup semantics, bounds, invalid state and date-format announcements are not covered by a native AT test.','Test picker navigation, selected date, min/max, invalid state and localized announcements with native AT.'),
'TimeField':('Browser AX exposes the sample time field as a named textbox: Time only.','Time-picker and locale-specific formatting/announcements are not accepted; invalid/describedby semantics remain untested.','Test time entry/picker, locale, seconds, validation and native AT in both themes and RTL.'),
'MaskedField':('Browser AX exposes a named textbox: Masked field.','Mask formatting has a reproduced input corruption and no complete invalid/describedby announcement test.','Fix mask behavior first, then test accessible name, helper/error text, caret, input mode and digit conversion.'),
'OtpField':('AX exposes a group named Verification code and four textboxes named Digit 1 of 4 through Digit 4 of 4.','Cell labels are hard-coded English; incomplete/invalid code state, native clipboard/IME, and form-submit announcements are not tested.','Localize group/cell labels and test incomplete/invalid state, paste/IME, focus movement and form submission with native AT.'),
'Slider':('Browser snapshot finds a div root and thumb; both have no role, tabindex or aria-valuenow.','No native slider semantics, keyboard focus or value announcement is exposed.','Add/define slider role, focusability, value/min/max/orientation and keyboard semantics, then test with native AT.'),
'RangeSlider':('Browser snapshot finds a div root and two thumbs; the thumbs have no role, tabindex or aria-valuenow.','Neither thumb exposes an independent slider role/value or keyboard focus; crossing and range announcements are undefined.','Define per-thumb role/value/labels, keyboard interaction and crossing policy; test range announcements with native AT.'),
'FileSelect':('Browser probes exercise file selection and upload; the file input and remove action have separate semantics.','The remove action has a glyph-only accessible name; native disabled state, file count announcement and upload error announcements are not accepted.','Give remove actions localized names, expose file count/errors, test disabled input and upload progress/errors with native AT.'),
}
TERMS=('aria-','role=','tabindex','tabIndex','InputFile','Label','For=','Required','Disabled','ValueExpression','EditContext','aria-label','aria-labelledby','aria-describedby','aria-invalid','aria-pressed','aria-valuenow','aria-valuemin','aria-valuemax','indeterminate','title=')
def readj(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def snippets(paths):
    out=[]
    for rel in paths:
        for n,line in enumerate((ROOT/rel).read_text(encoding='utf-8-sig',errors='replace').splitlines(),1):
            if any(t.lower() in line.lower() for t in TERMS):
                out.append({'path':rel,'line':n,'excerpt':line.strip()[:160]})
                if len(out)>=6: return out
    if not out:
        for rel in paths:
            for n,line in enumerate((ROOT/rel).read_text(encoding='utf-8-sig',errors='replace').splitlines(),1):
                if line.strip(): return [{'path':rel,'line':n,'excerpt':line.strip()[:160]}]
    return out
def build():
    matrix=readj(MATRIX); cand=readj(CANDIDATES)
    mf={f['family']:f for f in matrix['families']}; cf={f['family']:f for f in cand['families']}
    if set(A)!=set(mf) or set(A)!=set(cf): raise ValueError('Accessibility audit must cover exactly all 18 families')
    families=[]
    for name,(observed,gap,followup) in A.items():
        sources=blazor_audit.component_sources([c['name'] for c in cf[name]['components']])
        sn=snippets(sources); audit=blazor_audit.A[name]
        evidence=['evidence/'+x for x in audit[5]]
        for rel in evidence:
            if not (Q/rel).is_file(): raise ValueError(f'Missing browser evidence for {name}: {rel}')
        report='docs/v3/quality/'+audit[4]
        if not (ROOT/report).is_file(): raise ValueError(f'Missing family report for {name}')
        f=mf[name]
        families.append({'family':name,'productIssue':f['productIssue'],'dimension':'accessibility','dimensionStatus':'audited_gaps','observedSemantics':observed,'knownGap':gap,'followUp':followup,'sourceFiles':sources,'sourceSnippets':sn,'familyReport':report,'browserEvidence':evidence,'designApproval':f['designApproval'],'evidenceBundle':f['evidenceBundle']})
    ledger={'issue':552,'audit':'Accessibility semantics, names, roles and state announcements','reviewedOn':DATE,'sourceBaseline':BASELINE,'familyCount':18,'dimension':'accessibility','dimensionStatus':'audited_gaps','parityAccepted':False,'noneApproved':True,'runtimeScope':'Selected Chromium/Edge accessibility-tree snapshots and source review. Browser AX is not a native screen-reader test; forced-colors is emulated, not native OS high contrast. Keyboard probes cover selected paths only.','families':families,'acceptanceBoundary':'audited_gaps means semantics and acceptance gaps were inventoried; it is not an accessibility conformance claim or Fluent parity approval.'}
    lines=['# Accessibility semantics audit - Issue #552','','Review date: '+DATE+'. Source baseline: '+BASELINE+'.','','## Scope','','This audit inventories accessible names, roles, state announcements, native control semantics, labels, validation associations and remaining assistive-technology gates for all 18 pilot families. It uses selected browser accessibility-tree snapshots plus source review.','','**Status: audited gaps, not accepted.** Chromium/Edge AX snapshots are useful evidence but do not substitute for native screen-reader tests. Forced-colors emulation is not native OS high contrast.','','## Family findings','','| Family | Observed semantics | Known gap / evidence limit | Next acceptance step |','|---|---|---|---|']
    for f in families: lines.append(f"| [{f['family']}](#{f['family'].lower()}) | {f['observedSemantics']} | {f['knownGap']} | {f['followUp']} |")
    lines+=['','## Evidence and follow-up','']
    for f in families:
        lines += [f"### {f['family']} (#{f['productIssue']})",'',f"**Observed semantics:** {f['observedSemantics']}",'',f"**Known gap / evidence limit:** {f['knownGap']}",'',f"**Follow-up:** {f['followUp']}",'',"**Source files:** "+', '.join(f"[{Path(p).name}](../../../{p})" for p in f['sourceFiles']),'',"**Source anchors:** "+', '.join(f"[{Path(x['path']).name}:L{x['line']}](../../../{x['path']}#L{x['line']})" for x in f['sourceSnippets'][:3]),'',"**Browser evidence:** "+', '.join(f"[{Path(p).name}]({p})" for p in f['browserEvidence']),'',f"**Family audit:** [{Path(f['familyReport']).name}](../../../{f['familyReport']})",'']
    lines+=['## Acceptance boundary','','All 18 accessibility dimensions are recorded as audited_gaps. Every family design approval remains pending and evidenceBundle remains null. No product source, CSS or public API changed. Native screen-reader, real OS high-contrast, full keyboard and validation-announcement tests remain required before acceptance.','']
    return ledger,'\n'.join(lines)
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--write',action='store_true'); ap.add_argument('--check',action='store_true'); a=ap.parse_args()
    ledger,report=build()
    if a.write:
        JSON_OUT.write_text(json.dumps(ledger,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
        MD_OUT.write_text(report,encoding='utf-8')
    if a.check:
        if not JSON_OUT.exists() or readj(JSON_OUT)!=ledger: raise SystemExit('Accessibility ledger stale')
        if not MD_OUT.exists() or MD_OUT.read_text(encoding='utf-8-sig')!=report: raise SystemExit('Accessibility report stale')
    if not a.write and not a.check: print(f"Accessibility audit: {ledger['familyCount']} families.")
if __name__=='__main__': main()
