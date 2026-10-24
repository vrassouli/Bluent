#!/usr/bin/env python3
"""#552 direct + local-inherited Bluent API -> WC 3.1.3 NAME-CANDIDATE census.

Matching spelling is NOT evidence of semantic/API equivalence.
"""
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "docs/v3/quality"
DIRECT = BASE / "FLUENT-PARITY-18-SOURCE-API.json"
INHERITED = BASE / "FLUENT-PARITY-18-INHERITED-API.json"
UPSTREAM = BASE / "FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.json"
RESULT = BASE / "FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.json"
REPORT = BASE / "FLUENT-WC-3.1.3-18-API-NAME-CANDIDATES.md"


def normalize(identifier):
    a = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1-\2", identifier)
    a = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", a)
    return a.replace("_", "-").lower()


def generate(direct, inherited, upstream):
    direct_rows = {f["family"]: f for f in direct["families"]}
    inherited_rows = {f["family"]: f for f in inherited["families"]}
    refs = {d["tag"]: d for d in upstream["referencedTagDetails"]}
    families = []
    for family in upstream["families"]:
        name = family["family"]
        declared = direct_rows[name]["components"]
        inherited_components = {c["component"]: c for c in inherited_rows[name]["components"]}
        components = []
        for component in declared:
            comp_name = component["component"]
            local = inherited_components[comp_name]
            direct_params = component["parameters"]
            inherited_params = local["localInheritedParameters"]
            combined = [("declared", p) for p in direct_params] + [("local_inherited", p) for p in inherited_params]
            if len(set((p["name"] for _, p in combined))) != len(combined):
                raise ValueError("Ambiguous duplicate source parameter names " + name + "/" + comp_name)
            entries = []
            for origin, param in combined:
                candidate_name = normalize(param["name"])
                candidates = []
                for tag in family["referencedTags"]:
                    element = refs[tag]
                    for group in ("attributes", "events", "slots"):
                        if candidate_name in element[group]:
                            candidates.append({"tag": tag, "memberKind": group, "member": candidate_name})
                entries.append({
                    "name": param["name"],
                    "kind": param["kind"],
                    "csharpType": param["type"],
                    "origin": origin,
                    "sourceFile": param["declaredAt"],
                    "sourceLine": param["line"],
                    "normalizedName": candidate_name,
                    "spellingCandidates": candidates,
                    "comparisonStatus": "not_reviewed",
                    "featureSupport": "not_inferred",
                })
            components.append({
                "name": comp_name,
                "sourceDirectCount": len(direct_params),
                "sourceLocalInheritedCount": len(inherited_params),
                "externalFrameworkBoundary": local.get("externalFrameworkBaseBoundary", []),
                "parameters": entries,
            })
        families.append({
            "family": name,
            "productIssue": family["productIssue"],
            "wave": family["wave"],
            "counterpartKind": family["counterpartKind"],
            "referencedTags": family["referencedTags"],
            "components": components,
            "semanticReview": "pending",
            "designApproval": "pending",
            "apiParity": "not_reviewed",
        })
    total = sum(len(c["parameters"]) for f in families for c in f["components"])
    candidates = sum(bool(p["spellingCandidates"]) for f in families for c in f["components"] for p in c["parameters"])
    return {
        "schemaVersion": 1,
        "auditIssue": 552,
        "sourceBaseline": direct["sourceBaseline"],
        "upstreamNpm": "@fluentui/web-components@3.1.3",
        "upstreamCemSha256": upstream["cemSha256"],
        "scope": "Source direct + locally inherited parameter name matches against pinned CEM attributes/events/slots only; exact names are NOT feature or parity claims.",
        "families": families,
        "totals": {
            "families": len(families),
            "components": sum(len(f["components"]) for f in families),
            "parameters": total,
            "parametersWithAtLeastOneSpellingCandidate": candidates,
            "parametersWithoutSpellingCandidate": total-candidates,
            "approvedParameterMappings": 0,
        },
        "parityAccepted": False,
    }


def render(data):
    totals = data["totals"]
    lines = [
        "# #552 — Unreviewed API name candidates for 18 historical Bluent pilots",
        "",
        "**Machine-generated source-triage queue, not a Fluent parity matrix or supported-property table.**",
        "This combines the existing *direct* and *locally inherited* Bluent component parameters "
        "with the pinned published `@fluentui/web-components@3.1.3` custom-element metadata. "
        "The upstream catalog contains 42 tags; only already identified related tags are examined for each family.",
        "",
        f'Total: **{totals["families"]} families**, **{totals["components"]} component classes**, **{totals["parameters"]} source-known C# parameter occurrences**. '
        f'Potential exact-spelling matches: **{totals["parametersWithAtLeastOneSpellingCandidate"]}**, '
        f'no exact spelling match: **{totals["parametersWithoutSpellingCandidate"]}**. '
        '**Approved equivalences: 0**.',
        "",
        "| Family | Owner | Parameters | Name-match candidates | No name-match candidate |",
        "| --- | --- | ---: | ---: | ---: |",
    ]
    for family in data["families"]:
        entries=[p for c in family["components"] for p in c["parameters"]]
        matched=sum(bool(p["spellingCandidates"]) for p in entries)
        lines.append(f'| {family["family"]} | #{family["productIssue"]} | {len(entries)} | {matched} | {len(entries)-matched} |')
    lines.extend([
        "",
        "## Interpretation and the remaining mandatory work",
        "",
        "- `spellingCandidates` compares lower-kebab C# parameter names with CEM **attribute/event/slot names**; it does not understand semantic equivalence, enum values, event callback ordering, accessibility, defaulting, bindings, CSS or rendered DOM.",
        "- A missing spelling candidate is **not evidence of a missing feature** (C# inheritance, HTML global attributes, Blazor abstractions, different API naming and intentional extensions require review). A matching spelling candidate is **not evidence of support or parity**.",
        "- Framework `InputBase<TValue>` members, generic constraints, public methods, design token properties, actual WC Storybook behavior and native OS/AT remain outside this local-source parameter census.",
        "- Each owning component issue must manually classify each API capability as Supported / Missing / Bluent extension / N/A with evidence; future accepted mappings belong in a **separate reviewed ledger**, not by changing these research statuses.",
        "- [Exact WC tag and attr catalog](FLUENT-WC-3.1.3-18-FAMILY-CROSSWALK.md), [source API census](FLUENT-PARITY-18-API-CENSUS.md) and [canonical 18-family backlog](https://github.com/vrassouli/Bluent/blob/v3/issue-421-component-lab/docs/v3/quality/FLUENT-PARITY-RETRO-AUDIT.md) are distinct evidence layers.",
        "",
        "Reproduce source-only snapshot: `python scripts/quality/build_v3_wc_api_candidates.py --write`; protect it with `--check` and existing source-census tests. No product, Penpot approval or stable `Dev` changes.",
        "",
    ])
    return "\n".join(lines)


def verify(data, direct, inherited, upstream):
    source = generate(direct, inherited, upstream)
    if data != source or data.get("parityAccepted") is not False or data["totals"]["approvedParameterMappings"] != 0:
        raise ValueError("Candidate source snapshot/acceptance drift")
    if data["totals"]["parameters"] != data["totals"]["parametersWithAtLeastOneSpellingCandidate"] + data["totals"]["parametersWithoutSpellingCandidate"]:
        raise ValueError("Candidate counts do not partition all source params")


def main():
    import argparse
    parser=argparse.ArgumentParser()
    grp=parser.add_mutually_exclusive_group(required=True)
    grp.add_argument("--write",action="store_true")
    grp.add_argument("--check",action="store_true")
    args=parser.parse_args()
    direct=json.loads(DIRECT.read_text(encoding="utf-8-sig"))
    inherited=json.loads(INHERITED.read_text(encoding="utf-8-sig"))
    upstream=json.loads(UPSTREAM.read_text(encoding="utf-8-sig"))
    data=generate(direct,inherited,upstream)
    if args.write:
        RESULT.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        REPORT.write_text(render(data),encoding="utf-8")
    else:
        current=json.loads(RESULT.read_text(encoding="utf-8-sig"))
        verify(current,direct,inherited,upstream)
        if REPORT.read_text(encoding="utf-8-sig")!=render(current):
            raise ValueError("Name candidate report drift")
    print("PASS source-known API names:",data["totals"])


if __name__=="__main__":
    main()
