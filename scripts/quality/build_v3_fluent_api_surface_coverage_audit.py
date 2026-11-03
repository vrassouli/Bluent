import argparse
import json
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
Q=ROOT/'docs/v3/quality'
CANDIDATES=Q/'FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json'
MATRIX=Q/'FLUENT-PARITY-RETRO-AUDIT.json'
WAVES={w:Q/f'FLUENT-PARITY-WAVE-{w}-API-REVIEW.json' for w in 'ABCD'}
JSON_OUT=Q/'FLUENT-PARITY-API-SURFACE-COVERAGE.json'
MD_OUT=Q/'FLUENT-PARITY-API-SURFACE-COVERAGE.md'
DATE='2026-10-24'
ALLOWED={'Supported','Missing','Bluent extension','N/A'}
EXPECTED={'A':82,'B':71,'C':40,'D':46}

def readj(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

def build():
    matrix=readj(MATRIX)
    candidate=readj(CANDIDATES)
    mf={x['family']:x for x in matrix['families']}
    cf={x['family']:x for x in candidate['families']}
    if len(mf)!=18 or set(mf)!=set(cf):
        raise ValueError('Candidate ledger must match the canonical 18-family matrix')
    source={}
    kind_counts=Counter()
    for family,fd in cf.items():
        for component in fd['components']:
            for p in component['parameters']:
                key=(family,component['name'],p['name'])
                if key in source:
                    raise ValueError(f'Duplicate source occurrence: {key}')
                source[key]=p
                kind_counts[p.get('kind','unknown')]+=1
    review={}
    family_wave={}
    waves={}
    out_of_band=[]
    for wave,path in WAVES.items():
        data=readj(path)
        if data.get('auditIssue')!=552 or data.get('parityAccepted') is not False:
            raise ValueError(f'Wave {wave} must remain non-accepted research')
        counts=Counter()
        count=0
        family_names=[]
        for fam in data['families']:
            name=fam['family']
            if name not in mf or name in family_wave:
                raise ValueError(f'Unexpected/duplicate family in Wave {wave}: {name}')
            family_wave[name]=wave
            family_names.append(name)
            local=Counter()
            for p in fam['parameters']:
                key=(name,p['component'],p['name'])
                if key not in source:
                    raise ValueError(f'Review occurrence absent from source candidate ledger: {key}')
                if key in review:
                    raise ValueError(f'Duplicate review occurrence: {key}')
                disposition=p.get('reviewDisposition')
                if disposition not in ALLOWED or not p.get('mapping','').strip() or not p.get('rationale','').strip():
                    raise ValueError(f'Missing/invalid disposition, mapping or rationale: {key}')
                if p.get('sourceCandidateStatus')!='not_reviewed':
                    raise ValueError(f'Source-candidate status must be kept separate from research disposition: {key}')
                review[key]={'wave':wave,'family':name,**p}
                local[disposition]+=1
                counts[disposition]+=1
                count+=1
            if fam.get('parameterCount')!=len(fam['parameters']) or fam.get('reviewedParameterCount')!=len(fam['parameters']) or fam.get('dispositionCounts')!={disp:local[disp] for disp in ALLOWED}:
                raise ValueError(f'Wave {wave} family counters mismatch: {name}')
            if fam.get('apiReviewStatus')!='audited_gaps' or fam.get('designApproval')!='pending' or fam.get('evidenceBundle') is not None:
                raise ValueError(f'Wave {wave} overstates acceptance for {name}')
        if count!=EXPECTED[wave] or data.get('parameterOccurrenceCount')!=count:
            raise ValueError(f'Wave {wave} expected {EXPECTED[wave]} occurrences, found {count}')
        ob=data.get('outOfBandPublicApi',[])
        out_of_band.extend({'wave':wave,**x} for x in ob)
        waves[wave]={'parameterOccurrenceCount':count,'families':sorted(family_names),
            'dispositionCounts':dict(sorted(counts.items())),'outOfBandPublicApiEntryCount':len(ob),
            'ledger':path.name,'report':path.with_suffix('.md').name}
    if set(review)!=set(source):
        uncovered=sorted(set(source)-set(review))
        extra=sorted(set(review)-set(source))
        raise ValueError(f'Candidate/review ledgers differ; uncovered={uncovered[:3]}, extra={extra[:3]}')
    if len(source)!=239 or len(review)!=239 or len(family_wave)!=18:
        raise ValueError('Expected exactly 239 occurrences across 18 families')
    dispositions=Counter(x['reviewDisposition'] for x in review.values())
    families=[]
    missing=[]
    for name,m in mf.items():
        rows=[x for x in review.values() if x['family']==name]
        counts=Counter(x['reviewDisposition'] for x in rows)
        wave=family_wave[name]
        wf=next(x for x in readj(WAVES[wave])['families'] if x['family']==name)
        cand=cf[name]
        families.append({'family':name,'productIssue':m['productIssue'],'wave':wave,
            'componentCount':len(cand['components']),'sourceOccurrenceCount':len(rows),
            'dispositionCounts':dict(sorted(counts.items())),'counterpartKind':wf['counterpartKind'],
            'referencedTags':wf.get('referencedTags',[]),'apiReviewStatus':wf['apiReviewStatus'],
            'designApproval':wf['designApproval'],'evidenceBundle':wf['evidenceBundle'],
            'partialReport':m['partialAuditReport']})
        for x in rows:
            if x['reviewDisposition']=='Missing':
                missing.append({'family':name,'productIssue':m['productIssue'],'component':x['component'],
                    'parameter':x['name'],'csharpType':x['csharpType'],'sourceFile':x['sourceFile'],
                    'sourceLine':x['sourceLine'],'mapping':x['mapping'],'rationale':x['rationale'],
                    'followUp':x.get('followUp',''),'wave':wave})
    ledger={'auditIssue':552,'reviewedOn':DATE,'audit':'Cross-wave source-known API occurrence disposition coverage',
        'upstreamReference':candidate['upstreamNpm'],'familyCount':18,'sourceCandidateOccurrenceCount':239,
        'reviewedOccurrenceCount':239,'reviewedOccurrenceCoverage':1.0,
        'waveOccurrenceCounts':{w:waves[w]['parameterOccurrenceCount'] for w in 'ABCD'},
        'candidateKindCounts':dict(sorted(kind_counts.items())),
        'reviewDispositionCounts':dict(sorted(dispositions.items())),
        'outOfBandPublicApiEntryCount':len(out_of_band),'outOfBandPublicApiEntries':out_of_band,
        'missingParameterCount':len(missing),'missingParameters':missing,'waves':waves,'families':families,
        'apiReviewAcceptance':'audited_gaps','parityAccepted':False,'noneApproved':True,
        'designApprovalsPendingCount':18,'evidenceBundlesPendingCount':18,
        'limitations':[
            'These dispositions are source-to-pinned-CEM research, not maintainer approval or proof runtime behavior is correct.',
            'RenderFragment/EventCallback entries are declaration mappings; child-content rendering, DOM event ordering, keyboard/pointer operation and Blazor binding remain separate runtime gates.',
            'This rollup does not certify exhaustive Bluent CSS properties, CSS parts/states, token relations, emitted DOM behavior or the full framework InputBase<TValue> surface.',
            'Out-of-band rows are ledger entries, not unique API counts; shared InputBase<TValue> notes repeat in Waves B-D and require separate emitted-API/form validation.',
            'All 18 families remain audited_gaps with approval pending and evidenceBundle null. No visual, behavior, accessibility, native OS/AT or Fluent parity acceptance is inferred.']}
    lines=['# API surface disposition coverage - Issue #552','',
        f'Review date: {DATE}. Pinned upstream reference: {candidate["upstreamNpm"]}.','',
        '## Scope and acceptance boundary','',
        'This report reconciles the four Wave A-D review ledgers with the 18-family source-candidate inventory. It verifies that each source-known candidate occurrence has one explicit disposition, mapping and rationale in exactly one wave ledger. This is an API occurrence audit, not a public-API completeness certificate or Fluent parity verdict.','',
        f'- Reconciled occurrences: **{len(review)}/{len(source)}**.',
        f'- Dispositions: **{dispositions["Supported"]} Supported**, **{dispositions["Missing"]} Missing**, **{dispositions["Bluent extension"]} Bluent extension**, **{dispositions["N/A"]} N/A**.',
        f'- Kinds: {", ".join(f"{n} {k}" for k,n in sorted(kind_counts.items()))}.',
        f'- Out-of-band ledger rows: **{len(out_of_band)}**; repeated shared-framework notes are not unique API counts.','',
        'Acceptance remains audited_gaps; none of the 18 families is approved. Reconciled means each candidate was dispositioned in the research ledger, not that an owner accepted it or runtime behavior matches Fluent.','',
        '## Wave coverage','','| Wave | Families | Occurrences | Supported | Missing | Bluent extension | N/A | Out-of-band rows |',
        '|---|---|---:|---:|---:|---:|---:|---:|']
    for wave in 'ABCD':
        x=waves[wave]; c=x['dispositionCounts']
        lines.append(f"| {wave} | {', '.join(x['families'])} | {x['parameterOccurrenceCount']} | {c.get('Supported',0)} | {c.get('Missing',0)} | {c.get('Bluent extension',0)} | {c.get('N/A',0)} | {x['outOfBandPublicApiEntryCount']} |")
    lines += ['', '## Per-family coverage','','| Family | Issue | Occurrences | Supported | Missing | Bluent extension | N/A | Upstream mapping | Approval |','|---|---:|---:|---:|---:|---:|---:|---|---|']
    for f in families:
        c=f['dispositionCounts']
        lines.append(f"| {f['family']} | #{f['productIssue']} | {f['sourceOccurrenceCount']} | {c.get('Supported',0)} | {c.get('Missing',0)} | {c.get('Bluent extension',0)} | {c.get('N/A',0)} | {f['counterpartKind']} ({', '.join(f['referencedTags']) or 'no dedicated tag'}) | pending |")
    lines += ['', '## Source-confirmed Missing dispositions','','| Family | Parameter | Source | Finding | Owner follow-up |','|---|---|---|---|---|']
    for x in missing:
        src=f"[{Path(x['sourceFile']).name}](../../../{x['sourceFile']}#L{x['sourceLine']})"
        rationale=x['rationale'].replace('|','/')
        follow=(x['followUp'] or 'Review on the owning issue after design/API gates.').replace('|','/')
        lines.append(f"| {x['family']} (#{x['productIssue']}) | {x['component']}.{x['parameter']} ({x['csharpType']}) | {src} | {rationale} | {follow} |")
    lines += ['', '## Out-of-band API inventory (not included in 239 occurrences)','',
        'These records preserve surfaces outside the locally declared/inherited Parameter census. Repeated framework entries remain per-wave; do not count them as unique members.','',
        '| Wave | Surface | Declared scope | Disposition |','|---|---|---|---|']
    for x in out_of_band:
        lines.append(f"| {x['wave']} | {x['name']} | {x['scope'].replace('|','/')} | {x['disposition']} |")
    lines += ['', '## Explicit remaining gaps','',
        '- CLR/framework boundary: inherited InputBase<TValue> binding/validation is out-of-band in Waves B-D. Final emitted API and EditContext/form behavior are not certified.',
        '- Events and slots: declarations are mapped, but that does not establish rendered child-content behavior or DOM event ordering. Runtime tests remain separate.',
        '- CSS surface: exhaustive Bluent custom properties, parts/states, token relationships and matched rendered-state comparisons are not certified by these ledgers.',
        '- Missing declarations: the 11 entries above are source-confirmed gaps in current review research. Remediation belongs to each owning issue after design-first/workflow gates; no product source changed in #552.',
        '- Parity and approvals: all 18 matrix families remain audited_gaps; approval is pending and evidence bundles are null. Native OS high contrast and manual AT remain separate gates.','',
        '## Reproducibility','','Run python scripts/quality/build_v3_fluent_api_surface_coverage_audit.py --check and python -m unittest discover -s scripts/quality -p test_v3_fluent_api_surface_coverage_audit.py -v. The builder fails closed on missing/duplicate candidates, absent mappings/rationales, count drift or an acceptance claim.','',
        'Sources: FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json; Wave A-D API review ledgers; FLUENT-PARITY-RETRO-AUDIT.json.']
    return ledger,'\n'.join(lines)+'\n'

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--write',action='store_true'); ap.add_argument('--check',action='store_true')
    args=ap.parse_args(); ledger,report=build()
    if args.write:
        JSON_OUT.write_text(json.dumps(ledger,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
        MD_OUT.write_text(report,encoding='utf-8')
    if args.check:
        if not JSON_OUT.exists() or readj(JSON_OUT)!=ledger: raise SystemExit('API surface coverage ledger stale')
        if not MD_OUT.exists() or MD_OUT.read_text(encoding='utf-8-sig')!=report: raise SystemExit('API surface coverage report stale')
    if not args.write and not args.check:
        print(f"API surface audit: {ledger['reviewedOccurrenceCount']}/{ledger['sourceCandidateOccurrenceCount']} occurrences reconciled; parity remains unaccepted.")
if __name__=='__main__': main()
