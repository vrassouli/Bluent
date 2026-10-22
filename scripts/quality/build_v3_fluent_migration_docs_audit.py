import argparse, json, re
from pathlib import Path
import build_v3_fluent_blazor_extensions_audit as blazor_audit

ROOT=Path(__file__).resolve().parents[2]
Q=ROOT/'docs/v3/quality'
MATRIX=Q/'FLUENT-PARITY-RETRO-AUDIT.json'
TEMPLATE=ROOT/'docs/v3/COMPONENT-REFERENCE-TEMPLATE.md'
GENERAL=ROOT/'docs/compatibility/migration-and-upgrades.md'
JSON_OUT=Q/'FLUENT-PARITY-MIGRATION-DOCS-AUDIT.json'
MD_OUT=Q/'FLUENT-PARITY-MIGRATION-DOCS-AUDIT.md'
DATE='2026-10-22'
BASELINE='73155f02'
FAMILY_DOCS={
'Button':'button.md','Icon':'icon.md','Label':'label.md','Link':'link.md','Badge':'badge.md',
'TextField':'text-field.md','NumericField':'numeric-field.md','Checkbox':'checkbox.md','Switch':'switch.md',
'RadioGroup':'radio-group.md','SelectField':'select-field.md','DateField':'date-field.md','TimeField':'time-field.md',
'MaskedField':'masked-field.md','OtpField':'otp-field.md','Slider':'slider.md','RangeSlider':'range-slider.md','FileSelect':'file-select.md'}
RELATED_DOCS=[
'docs/compatibility/migration-and-upgrades.md',
'docs/v3/COMPONENT-REFERENCE-TEMPLATE.md',
'docs/v3/design/MIGRATION-IMPACT-LEDGER.md',
'docs/v3/architecture/css-migration-impact-ledger.md',
'docs/v3/design/COMPONENT-REFERENCE-MATRICES.md',
'docs/v3/quality/FLUENT-PARITY-RETRO-AUDIT.md',
'docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md',
'docs/v3/quality/FLUENT-REACT-9.74.10-18-API-CANDIDATES.md']
RELATED_PURPOSES={
'docs/compatibility/migration-and-upgrades.md':'Generic version-upgrade guidance and legacy 1.x-to-2.0.0 instructions; no approved family-by-family 2.x-to-v3 path.',
'docs/v3/COMPONENT-REFERENCE-TEMPLATE.md':'Reusable component-reference template with a 2.x-to-v3 compatibility section; not populated family guidance.',
'docs/v3/design/MIGRATION-IMPACT-LEDGER.md':'Design/architecture migration-impact ledger; not a consumer-facing component migration guide.',
'docs/v3/architecture/css-migration-impact-ledger.md':'CSS/token migration risks and owners; not component API migration instructions.',
'docs/v3/design/COMPONENT-REFERENCE-MATRICES.md':'Upstream reference matrices for a subset of families; not a complete 18-family migration guide.',
'docs/v3/quality/FLUENT-PARITY-RETRO-AUDIT.md':'Retrospective parity audit and gap matrix; not consumer-facing migration guidance.',
'docs/v3/quality/FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md':'Unapproved Web Components API-name candidates; not a migration guide.',
'docs/v3/quality/FLUENT-REACT-9.74.10-18-API-CANDIDATES.md':'Unapproved React API candidates; not a migration guide.'}
V3_MIGRATION=re.compile(r'(?im)^#{1,6}\s*(?:2\.x\s*(?:→|->|to)\s*v3|.*(?:2\.x|v2\.x).*(?:v3|version 3).*(?:compatib|migrat|upgrad)|.*(?:migrat|upgrad).*(?:v3|version 3))')
MIGRATION_WORDS=re.compile(r'(?i)\b(migration|migrate|upgrade|breaking change|compatibility|2\.x|v3)\b')
def readj(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def inspect_doc(family,filename,product_issue):
    p=ROOT/'docs/components'/filename
    if not p.is_file(): raise ValueError(f'Missing current component doc for {family}: {p}')
    text=p.read_text(encoding='utf-8-sig')
    lines=text.splitlines()
    headings=[x.strip() for x in lines if x.strip().startswith('#')]
    migration_headings=[h for h in headings if re.search(r'(?i)\b(?:migration|upgrade|compatibility|breaking change)\b',h)]
    v3_heads=[h for h in headings if V3_MIGRATION.match(h)]
    markers=[{'line':i,'excerpt':line.strip()[:180]} for i,line in enumerate(lines,1) if MIGRATION_WORDS.search(line)]
    return {'family':family,'productIssue':product_issue,'currentComponentDoc':'docs/components/'+filename,'currentDocExists':True,'lineCount':len(lines),'headings':headings,'migrationHeadings':migration_headings,'v3MigrationHeadings':v3_heads,'migrationMarkers':markers[:8],'hasFamilySpecificV3MigrationSection':bool(v3_heads),'docStatus':'current-component-reference-v3-migration-section-missing' if not v3_heads else 'v3-migration-section-present-review-required','gap':'No family-specific 2.x-to-v3 migration section is present in the current component reference.' if not v3_heads else 'A migration heading exists but still needs approved API/state-by-state review.','followUp':'After design/API approval, document unchanged/renamed/removed/intentional-extension members, before/after examples, styling/token changes, keyboard/RTL/accessibility changes, deprecations and verification steps.'}
def build():
    matrix=readj(MATRIX)
    mf={f['family']:f for f in matrix['families']}
    if set(FAMILY_DOCS)!=set(mf): raise ValueError('Migration-doc audit must cover exactly all 18 families')
    families=[]
    for name,filename in FAMILY_DOCS.items():
        item=inspect_doc(name,filename,mf[name]['productIssue'])
        report='docs/v3/quality/'+blazor_audit.A[name][4]
        if not (ROOT/report).is_file(): raise ValueError(f'Missing family audit report: {report}')
        item.update({'dimension':'migrationDocs','dimensionStatus':'audited_gaps','familyReport':report,'designApproval':mf[name]['designApproval'],'evidenceBundle':mf[name]['evidenceBundle']})
        families.append(item)
    if not TEMPLATE.is_file() or not GENERAL.is_file(): raise ValueError('Required general migration/template docs missing')
    template=TEMPLATE.read_text(encoding='utf-8-sig')
    general=GENERAL.read_text(encoding='utf-8-sig')
    related=[]
    for rel in RELATED_DOCS:
        p=ROOT/rel
        if not p.is_file(): raise ValueError(f'Missing related migration/reference document: {rel}')
        content=p.read_text(encoding='utf-8-sig')
        related.append({'path':rel,'exists':True,'lineCount':len(content.splitlines()),'mentionsV3Migration':'2.x → v3' in content or '2.x -> v3' in content or 'v2.x-to-v3' in content.lower(),'purpose':RELATED_PURPOSES[rel]})
    template_heading=bool(re.search(r'(?im)^#{1,6}\s*2\.x\s*(?:→|->|to)\s*v3\s+compatibility\s*$',template))
    generic_has_v3=bool(re.search(r'(?i)(migrating from 2\.x to v3|2\.x\s*→\s*v3|v2\.x-to-v3)',general))
    ledger={'issue':552,'audit':'Per-family 2.x-to-v3 migration-document coverage inventory','reviewedOn':DATE,'sourceBaseline':BASELINE,'familyCount':18,'dimension':'migrationDocs','dimensionStatus':'audited_gaps','parityAccepted':False,'noneApproved':True,'currentComponentDocs':18,'familySpecificV3MigrationSections':sum(f['hasFamilySpecificV3MigrationSection'] for f in families),'familiesWithCurrentDocsButNoV3MigrationSection':sum(not f['hasFamilySpecificV3MigrationSection'] for f in families),'referenceTemplateHasRequiredMigrationSection':template_heading,'genericMigrationGuideHasV3MigrationPath':generic_has_v3,'relatedDocs':related,'families':families,'runtimeScope':'Repository documentation inventory only. Current family reference pages exist for all 18, but no family-specific 2.x-to-v3 migration section was found. The reference template has a required migration section, but a template is not populated consumer guidance. API candidates and migration-risk ledgers are not approvals.','acceptanceBoundary':'All 18 migrationDocs dimensions are audited_gaps. Do not publish migration instructions for proposed API changes before the corresponding design/API decisions are approved. Every family design approval remains pending and evidenceBundle is null.'}
    lines=['# Migration-document coverage audit - Issue #552','','Review date: '+DATE+'. Source baseline: '+BASELINE+'.','','## Findings','','- Current component reference documents exist for **18/18 families** under docs/components.',
           f"- Family-specific 2.x-to-v3 migration sections found: **{ledger['familySpecificV3MigrationSections']}/18**.",
           '- The component-reference template contains a required “2.x → v3 compatibility” section, but it is a template, not 18 populated migration guides.',
           '- The generic migration-and-upgrades guide documents earlier-version migration and a general upgrade outline; it does not provide an approved family-by-family v3 migration path.',
           '- The design migration-impact and CSS migration-impact ledgers are risk/decision records, not consumer-facing component migration instructions.',
           '- Fluent API candidate inventories and the #552 parity matrix identify gaps but do not approve renamed/removed/extended public APIs.',
           '',
           '**Status: audited gaps, not accepted.** Existing component documentation is not absent; the missing deliverable is a reviewed, family-specific 2.x-to-v3 compatibility/migration section. Do not invent a migration path while v3 APIs and designs remain pending.','','## Family coverage','','| Family | Current component doc | Lines | Migration heading | V3 migration section | Gap |','|---|---|---:|---|---|---|']
    for f in families:
        lines.append(f"| {f['family']} | [{Path(f['currentComponentDoc']).name}](../../../{f['currentComponentDoc']}) | {f['lineCount']} | {'yes' if f['migrationHeadings'] else 'no'} | {'yes' if f['hasFamilySpecificV3MigrationSection'] else 'no'} | {f['gap']} |")
    lines+=['','## Shared migration/reference documents','','| Document | Role and limitation |','|---|---|']
    for d in related:
        lines.append(f"| [{Path(d['path']).name}](../../../{d['path']}) | {d['purpose']} |")
    lines+=['','## Required migration section per family','',
            'After design/API decisions are approved, the family migration section must document:',
            '1. Current 2.x API and approved v3 API, including unchanged, renamed, removed, intentional Bluent-only and not-applicable members.',
            '2. Before/after code examples for markup, parameters, events/binding and child content.',
            '3. Styling and token changes, asset/package changes, RTL/localization and accessibility behavior.',
            '4. Breaking changes, deprecations, compatibility shims, replacement patterns and any no-counterpart explanation.',
            '5. Required migration steps, validation/tests, render-mode caveats and links to the owning issue/PR.',
            '',
            '## Acceptance boundary','','All 18 migrationDocs dimensions are recorded as audited_gaps. No consumer-facing v3 migration path is approved or claimed. Keep this inventory separate from product implementation; do not modify current 2.x docs as if proposed v3 APIs were already final.','']
    return ledger,'\n'.join(lines)
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--write',action='store_true'); ap.add_argument('--check',action='store_true'); a=ap.parse_args()
    ledger,report=build()
    if a.write:
        JSON_OUT.write_text(json.dumps(ledger,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
        MD_OUT.write_text(report,encoding='utf-8')
    if a.check:
        if not JSON_OUT.exists() or readj(JSON_OUT)!=ledger: raise SystemExit('Migration-doc ledger stale')
        if not MD_OUT.exists() or MD_OUT.read_text(encoding='utf-8-sig')!=report: raise SystemExit('Migration-doc report stale')
    if not a.write and not a.check: print(f"Migration-doc audit: {ledger['familyCount']} families.")
if __name__=='__main__': main()
