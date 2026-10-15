"""#420 production bundle/source sync gate.

Assures both ESM and window global generated assets shipped by the library
correspond to checked-in generated scripts, and newly added popover Escape
behavior is present in the authored source. This does not replace browser
keyboard or native assistive technology verification.
"""
from __future__ import annotations

import argparse
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
NAMES=("bluent.ui.js","bluent.ui.js.map","bluent.ui.global.js","bluent.ui.global.js.map")

class BundleContractError(ValueError):
    pass

def same_generated_assets(dist:Path, shipped:Path)->None:
    for name in NAMES:
        left=dist/name;right=shipped/name
        if not left.is_file() or not right.is_file():
            raise BundleContractError(f"missing generated bundle {name}")
        # Windows git working trees sometimes expand LF to CRLF; compare
        # normalized content, never ignore an actual JS or map difference.
        a=left.read_bytes().replace(b"\r\n",b"\n")
        b=right.read_bytes().replace(b"\r\n",b"\n")
        if a!=b:
            raise BundleContractError(f"{name}: published JS is stale relative to webpack dist")

def check_implementation_typescript(src:str)->None:
    required=("_openSurfaces: PopoverSettings[]",
              "event.key !== 'Escape'",
              "this.hideSurface(current)",
              "this.getTrigger(current)",
              "?.focus()",
              "document.addEventListener('keydown', this._onDocumentKeyDown)",
              "document.removeEventListener('keydown', this._onDocumentKeyDown)",
              "this._openSurfaces.splice(",
              "public dispose(): void",
              "this.unbindTrigger(id)",
              "this.unbindOutsideClick(id)",
              "this._autoUpdates.get(triggerId)?.()",
              "this._triggerResizeObservers.get(triggerId)?.disconnect()",
              "this._surfaceResizeObservers.get(triggerId)?.disconnect()")
    for term in required:
        if term not in src:
            raise BundleContractError("Missing popover Escape/focus contract: "+term)

def main()->None:
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--dist",type=Path,default=ROOT/"src/Bluent.UI.Scripts/dist")
    cli.add_argument("--wwwroot",type=Path,default=ROOT/"src/Bluent.UI/wwwroot")
    args=cli.parse_args()
    check_implementation_typescript((ROOT/"src/Bluent.UI.Scripts/src/Popover/Popover.ts").read_text(encoding="utf-8-sig"))
    same_generated_assets(args.dist,args.wwwroot)
    print("PASS #420 Popover TS Escape/Focus source; 4 ESM/global JS bundles and maps match shipped static web assets")

if __name__=="__main__":
    main()
