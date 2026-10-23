import argparse, json
from pathlib import Path
import build_v3_fluent_blazor_extensions_audit as blazor_audit

ROOT=Path(__file__).resolve().parents[2]
Q=ROOT/'docs/v3/quality'
MATRIX=Q/'FLUENT-PARITY-RETRO-AUDIT.json'
SNAPSHOT=Q/'evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-SNAPSHOT.json'
ADDENDUM=Q/'evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-ADDENDUM-2026-10-23.json'
JSON_OUT=Q/'FLUENT-PARITY-DESIGN-ARTIFACT-AUDIT.json'
MD_OUT=Q/'FLUENT-PARITY-DESIGN-ARTIFACT-AUDIT.md'
DATE='2026-10-23'
BASELINE='73155f02'
FOLLOWUP_TEXT={
'Button':'Extend the existing draft family designs to the full state/appearance/size/RTL matrix and obtain explicit Fluent parity approval.',
'Icon':'Expand the dedicated Icon review board into a complete reusable family variant set; resolve size/default, viewBox, SVG trust-boundary and accessible-name policies, then perform the matched Fluent comparison and review.',
'TextField':'Extend the native variants to focus, filled, invalid, disabled, RTL, high contrast and validation states; record Fluent counterpart and approve.',
'Checkbox':'Complete checked, mixed, disabled, focus, required and RTL variants with explicit Fluent state mapping and approval.',
'Switch':'Complete on/off, disabled, focus, RTL and forced-colors variants with an explicit Fluent role/state decision and approval.',
}
DEFAULT_FOLLOWUP='Create a family-specific editable Bluent component board and native variant set, map every required state to the pinned Fluent counterpart, include Light/Dark/RTL/focus/disabled/error/forced-colors and responsive cases, then obtain design approval before implementation.'

def readj(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def build():
    matrix=readj(MATRIX); snap=readj(SNAPSHOT); followup=readj(ADDENDUM)
    mf={f['family']:f for f in matrix['families']}
    rows={f['family']:f for f in snap['coverageRows']}
    pages={f['family']:f['pages'] for f in snap['familyDesignPages']}
    assets=set(snap['interpretation']['familySpecificDesignAssets'])
    missing=set(snap['interpretation']['familiesWithoutDedicatedFamilyPageOrLibraryAsset'])
    # Keep the 2026-10-22 read-only capture intact; apply explicitly dated later artifacts as an additive record.
    followup_family=followup['family']
    followup_page=dict(followup['page'], board=followup['board']['name'], boardId=followup['board']['id'], reviewOnly=True, variantSetComplete=followup['variantSetComplete'], editableChildren=followup['board']['editableChildren'], textNodes=followup['board']['textNodes'], invalidTextBounds=followup['board']['invalidTextBounds'], childrenOutsideBoard=followup['board']['childrenOutsideBoard'])
    if followup['file']!=snap['file'] or followup_family in assets or followup_family not in missing:
        raise ValueError('Penpot follow-up must add one previously missing family artifact in the same authoritative file')
    pages[followup_family]=[followup_page]
    assets.add(followup_family)
    missing.remove(followup_family)
    if set(rows)!=set(mf) or assets|missing!=set(mf) or assets&missing:
        raise ValueError('Penpot design snapshot must account for exactly all 18 families')
    if snap['coverageBoard']['metrics']['familyCount']!=18 or snap['coverageBoard']['metrics']['fluentApprovals']!='0 / 18':
        raise ValueError('Penpot coverage board metrics do not match the reviewed 18-family scope')
    if snap['localLibrary']['componentCount']!=len(snap['localLibrary']['componentNames']):
        raise ValueError('Penpot local component inventory count mismatch')
    if set(pages)!=assets: raise ValueError('Dedicated design pages must match family-specific design asset set')
    families=[]
    for name,f in mf.items():
        row=rows[name]
        report='docs/v3/quality/'+blazor_audit.A[name][4]
        if not (ROOT/report).is_file(): raise ValueError(f'Missing family audit report: {report}')
        family_pages=pages.get(name,[])
        families.append({'family':name,'productIssue':f['productIssue'],'dimension':'designArtifact','dimensionStatus':'audited_gaps','designArtifactStatus':('dedicated-review-board-incomplete-variant-coverage' if name==followup_family else 'draft-family-artifacts-present') if name in assets else 'coverage-row-only-no-dedicated-family-asset-in-current-record','designPages':family_pages,'coverageRow':row,'familyReport':report,'followUp':FOLLOWUP_TEXT.get(name,DEFAULT_FOLLOWUP),'designApproval':f['designApproval'],'evidenceBundle':f['evidenceBundle']})
    ledger={'issue':552,'audit':'Penpot design-artifact coverage and approval inventory','reviewedOn':DATE,'sourceBaseline':BASELINE,'familyCount':18,'dimension':'designArtifact','dimensionStatus':'audited_gaps','parityAccepted':False,'noneApproved':True,'penpotSnapshot':'evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-SNAPSHOT.json','penpotFile':snap['file'],'coveragePage':snap['coveragePage'],'coverageBoard':snap['coverageBoard'],'localLibrary':snap['localLibrary'],'familySpecificDesignAssetCount':len(assets),'familySpecificReusableVariantSetCount':len(snap['localLibrary']['familyTypesRepresented']),'familySpecificReusableVariantSetFamilies':sorted(snap['localLibrary']['familyTypesRepresented']),'familiesWithDedicatedReviewBoard':[followup_family],'familiesWithoutDedicatedFamilyAssetCount':len(missing),'familySpecificDesignAssets':sorted(assets),'familiesWithoutDedicatedFamilyAsset':sorted(missing),'families':families,'runtimeScope':'The original connected Penpot inventory is a read-only capture from 2026-10-22. A dated 2026-10-23 addendum records a later editable Icon review board (129 children, 68 valid text bounds, 0 children outside its board). The #552 coverage board remains an index, not a family design approval; the Icon board is incomplete for full variant coverage.','acceptanceBoundary':'Acceptance requires a family-specific editable artifact and explicit state/token mapping. Five family types have a dedicated editable artifact in the combined dated record; four have reusable local library variant sets and Icon has a review-only board with incomplete variant coverage. Thirteen families still have only a coverage row/general upstream reference. All 18 remain DESIGN PENDING, evidenceBundle is null, and no component design is approved.'}
    lines=['# Design-artifact coverage audit - Issue #552','','Review date: '+DATE+'. Source baseline: '+BASELINE+'.','','## Scope','','Inventory of the source-owned Penpot file Bluent v3 Design System, combining the original read-only snapshot ([PENPOT-ISSUE-552-DESIGN-ARTIFACT-SNAPSHOT.json](evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-SNAPSHOT.json)) with the dated additive Icon board record ([PENPOT-ISSUE-552-DESIGN-ARTIFACT-ADDENDUM-2026-10-23.json](evidence/PENPOT-ISSUE-552-DESIGN-ARTIFACT-ADDENDUM-2026-10-23.json)). The original coverage board and existing family designs were not changed by this inventory update.','','## Findings','', '- The #552 Fluent parity audit coverage DRAFT board exists on 03 · Quality & migration (page id '+snap['coveragePage']['id']+', board id '+snap['coverageBoard']['id']+').','- The board contains 18/18 family rows, 239 source-known API entries, and 0/18 Fluent approvals. It is a coverage/index artifact, not component-design approval.','- The local Penpot library contains 13 components spanning four family types: Button, TextField, Checkbox and Switch.','- A dedicated editable artifact now exists for 5/18 family types in the dated record: four have reusable local variant/library assets, and Icon has a review-only board with incomplete variant coverage. 13/18 still have no dedicated family-specific artifact; upstream Fluent reference pages and the #552 coverage row do not substitute for a Bluent family design.','- All family design approvals remain pending and all evidenceBundle values remain null.','','**Status: audited gaps, not accepted.** The inventory is not a visual parity verdict and does not authorize product implementation.','','## Family coverage','','| Family | Penpot artifact coverage | Existing design page count | Coverage-board gap | Approval |','|---|---|---:|---|---|']
    for f in families:
        lines.append(f"| {f['family']} | {f['designArtifactStatus']} | {len(f['designPages'])} | {f['coverageRow']['gap']} | pending |")
    lines+=['','## Existing family-specific draft pages','']
    for f in families:
        if not f['designPages']: continue
        lines += [f"### {f['family']} (#{f['productIssue']})",'']
        for p in f['designPages']:
            line='- **'+p['name']+'** — page id '+p['id']
            if p.get('board'): line+='; board '+p['board']+' (id '+p['boardId']+')'
            lines.append(line)
        lines += ['',f"**Follow-up:** {f['followUp']}",'']
    lines+=['## Families without a dedicated family-specific design artifact in the dated record','',', '.join(sorted(missing))+'.','','For each, create an editable Bluent family board and variant set tied to the pinned Fluent counterpart, covering the required visual and interactive states. Keep the current coverage row as traceability only.','','## Additional incomplete artifact','','Icon now has a dedicated editable review board, but it is explicitly **not** a complete reusable variant set. Required decisions (size/default, viewBox contract, trusted SVG boundary, decorative/informative semantics), matched Fluent render comparisons and native OS/assistive-technology checks remain open. See the dated addendum for exact IDs and structural measurements.','', '## Acceptance boundary','','All 18 designArtifact dimensions remain audited_gaps. Do not move any family to approved/accepted based on a coverage board, upstream references, a review draft or browser screenshots alone. Design review must confirm the family-specific editable artifact, complete state/token mapping and explicit approval first.','']
    return ledger,'\n'.join(lines)
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--write',action='store_true'); ap.add_argument('--check',action='store_true'); a=ap.parse_args()
    ledger,report=build()
    if a.write:
        JSON_OUT.write_text(json.dumps(ledger,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
        MD_OUT.write_text(report,encoding='utf-8')
    if a.check:
        if not JSON_OUT.exists() or readj(JSON_OUT)!=ledger: raise SystemExit('Design-artifact ledger stale')
        if not MD_OUT.exists() or MD_OUT.read_text(encoding='utf-8-sig')!=report: raise SystemExit('Design-artifact report stale')
    if not a.write and not a.check: print(f"Design-artifact audit: {ledger['familyCount']} families.")
if __name__=='__main__': main()
