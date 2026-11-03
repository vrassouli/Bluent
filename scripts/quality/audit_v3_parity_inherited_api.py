#!/usr/bin/env python3
"""#552 audit locally inherited API without asserting external Blazor InputBase is complete.

Consumes direct API census; walks concrete known local class bases in repository.
Not a .NET compiler or parity test: resolve external framework bases separately.
"""
import argparse
import json
import re
import sys
from pathlib import Path

from audit_v3_parity_source_api import (
    COMPONENT_ROOT, OUTPUT as DIRECT_OUTPUT, PUBLIC_PARAMETER_RE,
    ROOT, build_inventory, strip_comments,
)

OUTPUT = ROOT / "docs/v3/quality/FLUENT-PARITY-18-INHERITED-API.json"
LOCAL_BASES = {
    "BluentComponentBase": ROOT / "src/Bluent.Core/BluentComponentBase.cs",
    "BluentUiComponentBase": COMPONENT_ROOT / "BluentUiComponentBase.cs",
    "BluentInputComponentBase": COMPONENT_ROOT / "BluentInputComponentBase.cs",
    "BluentFieldComponentBase": COMPONENT_ROOT / "BluentFieldComponentBase.cs",
    "Checkbox": COMPONENT_ROOT / "CheckBoxComponent/Checkbox.razor.cs",
}
KNOWN_INTERFACES = {"IPointerMoveEventHandler", "IAsyncDisposable", "IBluentComponent"}
RAZOR_BASE = COMPONENT_ROOT / "CheckBoxComponent/Checkbox.razor"


def first_parent(class_type):
    # Split only the FIRST base before interface declarations, ignoring
    # generic parameters that may contain commas.
    depth = 0
    for i, ch in enumerate(class_type):
        if ch == "<":
            depth += 1
        elif ch == ">":
            depth -= 1
        elif ch == "," and depth == 0:
            return class_type[:i].strip()
    return class_type.strip()


def short_name(class_type):
    return re.sub(r"<.*$", "", class_type).split(".")[-1].strip()


def local_base_def(class_name):
    source = LOCAL_BASES[class_name]
    raw = strip_comments(source.read_text(encoding="utf-8-sig"))
    params = []
    for m in PUBLIC_PARAMETER_RE.finditer(raw):
        attrs = m.group("attributes")
        kind = ("cascading" if "CascadingParameter" in attrs else
                "slot" if "RenderFragment" in m.group("type") else
                "event" if "EventCallback" in m.group("type") else "value")
        params.append({
            "name": m.group("name"),
            "type": " ".join(m.group("type").split()),
            "kind": kind,
            "declaredAt": source.relative_to(ROOT).as_posix(),
            "line": raw.count("\n", 0, m.start()) + 1,
        })
    # Checkbox<T> gets its inheritance from the Razor @inherits declaration.
    if class_name == "Checkbox":
        razor = RAZOR_BASE.read_text(encoding="utf-8-sig")
        m = re.search(r"(?m)^@inherits\s+([^\r\n]+)", razor)
        parent = m.group(1).strip() if m else None
    else:
        m = re.search(r"\bclass\s+\w+(?:<[^>{]+>)?\s*:\s*([^\r\n{]+)", raw)
        parent = first_parent(m.group(1)) if m else None
    return params, parent


def compute():
    direct = build_inventory()
    rows = []
    for family in direct["families"]:
        parts = []
        for component in family["components"]:
            queue = list(component["declaredBaseTypes"])
            inherited = []
            local_chain = []
            external_boundary = []
            implemented_interfaces = []
            visited = set()
            while queue:
                base = first_parent(queue.pop(0))
                name = short_name(base)
                if name in visited:
                    raise ValueError(f"{family['family']} cyclic class inheritance at {name}")
                visited.add(name)
                if name in KNOWN_INTERFACES:
                    implemented_interfaces.append(base)
                    continue
                if name not in LOCAL_BASES:
                    external_boundary.append(base)
                    continue
                params, parent = local_base_def(name)
                inherited.extend(params)
                local_chain.append(name)
                if parent:
                    queue.insert(0, parent)
            parts.append({
                "component": component["component"],
                "declaredParameterCount": component["declaredParameterCount"],
                "locallyInheritedCount": len(inherited),
                "localBaseChain": local_chain,
                "localInheritedParameters": inherited,
                "externalFrameworkBaseBoundary": external_boundary,
                "implementedInterfaces": implemented_interfaces,
                "inheritedContractStatus": "local_source_only_external_pending",
                "completePublicApiVerified": False,
            })
        rows.append({
            "family": family["family"],
            "productIssue": family["productIssue"],
            "components": parts,
            "fluentParityStatus": "not_reviewed",
        })
    return {
        "schemaVersion": 1, "auditIssue": 552,
        "sourceBaseline": direct["sourceBaseline"],
        "status": "local_inherited_source_only",
        "limitations": "Local class chain and declared attributes only; framework InputBase and component/rendered API not resolved or approved.",
        "families": rows,
    }


def validate(snapshot, computed):
    problems = []
    if snapshot != computed:
        if snapshot.get("status") != "local_inherited_source_only":
            problems.append("status cannot imply complete API")
        if len(snapshot.get("families", [])) != 18:
            problems.append("expected 18 families")
        for wanted in computed["families"]:
            actual = next((x for x in snapshot.get("families", [])
                           if x.get("family") == wanted["family"]), None)
            if actual != wanted:
                problems.append(f"{wanted['family']}: inherited source or completion-claim drift")
        if not problems:
            problems.append("snapshot metadata drift")
    return problems


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args(argv)
    expected = compute()
    if args.write:
        OUTPUT.write_text(json.dumps(expected, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"WROTE {OUTPUT.name}: 18 families with local base chains; external API still pending")
        return 0
    if not OUTPUT.exists():
        print(f"MISSING {OUTPUT}", file=sys.stderr)
        return 1
    findings = validate(json.loads(OUTPUT.read_text(encoding="utf-8")), expected)
    for finding in findings:
        print("FAIL:", finding)
    print(f"#552 inherited-source census {'FAIL' if findings else 'PASS'} (18 families; external framework pending)")
    return bool(findings)


if __name__ == "__main__":
    sys.exit(main())