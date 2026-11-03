#!/usr/bin/env python3
"""#552 pin factual public CEM features for the released Fluent WC 3.1.3 package.

Pass the EXTRACTED official custom-elements.json with --manifest. When checking
the checked-in snapshot, validation uses its fingerprint/known contracts only.
Do not use as visual/behavioral/OS AT evidence.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/v3/quality/FLUENT-WC-3.1.3-P0-MANIFEST.json"
INTEGRITY = "sha512-1jl4CHoFFSfevkr8l7F+dKNJzyMWBZqwQfB/khNZtwyY0rv87799mpDWSVu0QeiZAFEbqCtnAOnXWsxJ/kek+Q=="
TAG_OWNER = {
    "fluent-button": 428,
    "fluent-toggle-button": 428,
    "fluent-compound-button": 428,
    "fluent-menu-button": 428,
    "fluent-slider": 442,
}
NOT_FOUND_TAGS = {"fluent-range-slider":443, "fluent-file-select":444}


def extract(manifest):
    tags = {}
    for mod in manifest["modules"]:
        for declaration in mod.get("declarations", []):
            tag = declaration.get("tagName")
            if not tag:
                continue
            if tag in tags:
                raise ValueError(f"duplicate tag {tag}")
            tags[tag] = declaration
    findings = []
    for tag, issue in TAG_OWNER.items():
        if tag not in tags:
            raise ValueError(f"official tag unexpectedly missing: {tag}")
        item = tags[tag]
        findings.append({
            "tag":tag,
            "productIssue":issue,
            "manifestStatus":"published_custom_element",
            "attributes":sorted([x["name"] for x in item.get("attributes",[]) if "name" in x]),
            "slots":sorted([x.get("name","") for x in item.get("slots",[])]),
            "events":sorted([x["name"] for x in item.get("events",[]) if "name" in x]),
            "cssParts":sorted([x["name"] for x in item.get("cssParts",[]) if "name" in x]),
        })
    for tag, issue in NOT_FOUND_TAGS.items():
        findings.append({
            "tag":tag,
            "productIssue":issue,
            "manifestStatus":"not_in_this_release_tag_catalog",
            "attributes":[],
            "slots":[],
            "events":[],
            "cssParts":[],
        })
    return {
        "auditIssue":552,
        "package":"@fluentui/web-components",
        "version":"3.1.3",
        "integrity":INTEGRITY,
        "manifestSource":"npm tarball root custom-elements.json",
        "sourceBaseline":"2c37dbef516230606306549458721d6bda03a8ab",
        "status":"pinned_release_manifest_only",
        "limitations":"No API equivalence inferred from matching names; absence of a tag in THIS release does not prove nonexistence in all Fluent libraries. No behavior/screenshots/OS AT.",
        "actualTagCount":len(tags),
        "observations":findings,
        "parityAccepted":False,
    }


def validate(data):
    errors = []
    if (data.get("version"),data.get("integrity"),data.get("status")) != ("3.1.3",INTEGRITY,"pinned_release_manifest_only"):
        errors.append("official package provenance and limited scope are mandatory")
    if data.get("parityAccepted") is not False:
        errors.append("CEM cannot approve Fluent parity")
    obs = {x.get("tag"): x for x in data.get("observations",[])}
    if len(obs)!=7 or set(obs)!=(set(TAG_OWNER)|set(NOT_FOUND_TAGS)):
        errors.append("exact P0 release tag census (5 present + 2 absent)")
    for tag,issue in TAG_OWNER.items():
        item=obs.get(tag,{})
        if item.get("productIssue")!=issue or item.get("manifestStatus")!="published_custom_element":
            errors.append(f"{tag}: missing owning issue or wrong status")
    for tag,issue in NOT_FOUND_TAGS.items():
        item=obs.get(tag,{})
        if item.get("productIssue")!=issue or item.get("manifestStatus")!="not_in_this_release_tag_catalog":
            errors.append(f"{tag}: not-in-this-release boundary must remain explicit")
    slider=obs.get("fluent-slider",{})
    if not {"min","max","step","orientation","value"}.issubset(slider.get("attributes",[])):
        errors.append("slider must preserve package-declared min/max/step/orientation/value")
    toggle=obs.get("fluent-toggle-button",{})
    if not {"pressed","mixed"}.issubset(toggle.get("attributes",[])):
        errors.append("toggle button pressed/mixed attribute taxonomy drift")
    return errors


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--manifest", help="path to extracted official tarball custom-elements.json")
    p.add_argument("--write",action="store_true")
    a=p.parse_args()
    if a.write and not a.manifest:
        p.error("--write requires --manifest")
    if a.manifest:
        fresh=extract(json.loads(Path(a.manifest).read_text(encoding="utf-8")))
        if a.write:
            errors=validate(fresh)
            if errors:raise SystemExit("; ".join(errors))
            OUT.write_text(json.dumps(fresh,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
            print("WROTE",OUT.name)
            return 0
        saved=json.loads(OUT.read_text(encoding="utf-8"))
        if fresh!=saved:
            raise SystemExit("FAIL: pinned @fluentui/web-components 3.1.3 source/manifest changed")
    saved=json.loads(OUT.read_text(encoding="utf-8"))
    errors=validate(saved)
    for error in errors:print("FAIL:",error)
    if errors: return 1
    print("PASS: pinned WC 3.1.3 CEM, 5 present P0 tags, 2 not published in this release; no parity signoff")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
