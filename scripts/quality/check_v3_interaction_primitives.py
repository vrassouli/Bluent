"""#420 source-only guard for JS interop async/lifetime legacy debts.

This is NOT proof of focus, keyboard, runtime cleanup, or accessibility.
New unsafe patterns must not silently enter the v3 component foundation.
"""
from __future__ import annotations
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
INTEROPS=ROOT/"src/Bluent.UI/Interops"
DOM_HELPER=ROOT/"src/Bluent.UI/Services/DomHelper.cs"

LEGACY_ASYNC_VOID={
    "OverflowInterop.cs":frozenset({"CheckOverflow"}),
    "PopoverInterop.cs":frozenset({"SetPopover","ShowSurface"}),
}
LEGACY_BROAD_CATCH_MAX={
    "BluentTheme.cs":1,
"OptFieldInterop.cs":1,
    "DomHelper.cs":4,
}
ASYNC_VOID=re.compile(r"\basync\s+void\s+([A-Za-z_]\w*)\s*\(")
BROAD_CATCH=re.compile(r"catch\s*\(\s*Exception\s*\)")

class InteractionContractError(ValueError):
    pass

def source_snapshot(root:Path=ROOT)->dict[str,str]:
    files=sorted((root/"src/Bluent.UI/Interops").glob("*.cs"))
    sources={p.name:p.read_text(encoding="utf-8-sig") for p in files}
    helper=root/"src/Bluent.UI/Services/DomHelper.cs"
    if helper.exists(): sources[helper.name]=helper.read_text(encoding="utf-8-sig")
    return sources

def audit(sources:dict[str,str])->dict[str,dict]:
    results={}
    for name,text in sorted(sources.items()):
        observed=set(ASYNC_VOID.findall(text))
        unexpected=observed-LEGACY_ASYNC_VOID.get(name,frozenset())
        if unexpected:
            raise InteractionContractError(name+" new fire-and-forget async void methods: "+",".join(sorted(unexpected)))
        broad=len(BROAD_CATCH.findall(text))
        if broad>LEGACY_BROAD_CATCH_MAX.get(name,0):
            raise InteractionContractError(name+" new blanket Exception catch; use specific exceptions and finally cleanup")
        has_reference="DotNetObjectReference" in text
        if has_reference and not re.search(r"\.\s*Dispose\s*\(",text):
            raise InteractionContractError(name+" owns DotNetObjectReference but has no disposal call")
        results[name]={
            "legacyAsyncVoid":sorted(observed),
            "legacyBroadExceptionCatches":broad,
            "hasDotNetObjectReference":has_reference,
            "hasLazyJsModuleTask":"Lazy<Task<IJSObjectReference>>" in text,
        }
    if "PopoverInterop.cs" not in results or "DataGridInterop.cs" not in results:
        raise InteractionContractError("baseline interop source missing")
    return results

def main()->None:
    result=audit(source_snapshot())
    print("PASS #420 SOURCE-only interop legacy ledger:",len(result),"files")
    for name,row in result.items():
        if row["legacyAsyncVoid"] or row["legacyBroadExceptionCatches"]:
            print(name+": async void="+",".join(row["legacyAsyncVoid"])+
                  " broad catch="+str(row["legacyBroadExceptionCatches"]))
    print("WARNING: existing async void and blanket catch debts remain; not runtime/AT validation")

if __name__=="__main__":
    main()
