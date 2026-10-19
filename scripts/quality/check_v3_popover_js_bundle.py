"""#420 production bundle/source sync gate.

Assures both ESM and window global generated assets shipped by the library
correspond to checked-in generated scripts, and newly added popover Escape
behavior is present in the authored source. This does not replace browser
keyboard or native assistive technology verification.
"""
from __future__ import annotations

import argparse
import re
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
              "this._surfaceResizeObservers.get(triggerId)?.disconnect()",
              "private readonly _pendingHides",
              "this.cancelPendingHide(settings.triggerId)",
              "if (duration <= 0)",
              "window.setTimeout(complete,",
              "event.target === surface",
              "surface.classList.contains('show') && !this._disposed",
              "settings.triggerEvents?.includes('click')",
              "!trigger.hasAttribute('aria-expanded')",
              "!trigger.hasAttribute('aria-controls')",
              "this.bindDisclosure(settings, trigger)",
              "this.setDisclosureExpanded(settings, true)",
              "this.setDisclosureExpanded(settings, false)",
              "this._managedTriggerAria.delete(triggerId)",
              "public destroyPopover(triggerId: string)",
              "this.cleanupGeometry(triggerId, true)",
              "this.unbindTrigger(triggerId)")
    for term in required:
        if term not in src:
            raise BundleContractError("Missing popover Escape/focus contract: "+term)

def check_popover_reduced_motion_style(authored: str, compiled: str, minified: str) -> None:
    if "@media (prefers-reduced-motion: reduce)" not in authored:
        raise BundleContractError("Missing Popover authored OS reduced motion media query")
    if "transition-duration: 0s;" not in authored or "transition-delay: 0s;" not in authored:
        raise BundleContractError("Popover authored reduced motion must disable transition and delay")
    pattern = r"@media\(prefers-reduced-motion:reduce\)\{\.bui-popover-surface\{transition-duration:0s;transition-delay:0s;?\}\}"
    for origin, css in (("Sass compiled components.css", compiled),
                        ("Published components.min.css", minified)):
        normalized = re.sub(r"\s+", "", css)
        if not re.search(pattern, normalized):
            raise BundleContractError(f"{origin}: missing rendered Popover reduced-motion declaration")

def check_popover_right_end_style(authored: str, compiled: str, minified: str) -> None:
    """Reject malformed Sass nesting and stale RightEnd placement CSS."""
    if "&.right-end" not in authored or "&right-end" in authored:
        raise BundleContractError("Popover authored RightEnd Sass nesting is malformed")
    good = r"\.bui-popover-surface\.right-end"
    wrong = ".bui-popover-surfaceright-end"
    for label,css in (("compiled",compiled),("published",minified)):
        if wrong in css or not re.search(good + r"\s*\{\s*transform\s*:\s*translateX\(-10px\)",css):
            raise BundleContractError(f"Popover {label} RightEnd transform selector missing or stale")


def check_overlay_reduced_motion_style(authored: str, compiled: str, published: str) -> None:
    """Require actual v3 overlay motion suppression in source AND shipped CSS."""
    if not re.search(r"@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.bui-overlay\s*\{\s*animation-duration:\s*0s;\s*animation-delay:\s*0s", authored):
        raise BundleContractError("authored Bluent Overlay lacks reduced-motion animation override")
    for label,css in (("compiled",compiled),("published",published)):
        if not re.search(r"@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.bui-overlay\s*\{\s*animation-duration:\s*0s;\s*animation-delay:\s*0s",css):
            raise BundleContractError(label+" Overlay lacks shipped reduced-motion animation override")

def main()->None:
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--dist",type=Path,default=ROOT/"src/Bluent.UI.Scripts/dist")
    cli.add_argument("--wwwroot",type=Path,default=ROOT/"src/Bluent.UI/wwwroot")
    args=cli.parse_args()
    check_implementation_typescript((ROOT/"src/Bluent.UI.Scripts/src/Popover/Popover.ts").read_text(encoding="utf-8-sig"))
    same_generated_assets(args.dist,args.wwwroot)
    authored = (ROOT/"src/Bluent.UI/Styles/Components/_popover.scss").read_text(encoding="utf-8-sig")
    compiled = (ROOT/"src/Bluent.UI/Styles/Components/components.css").read_text(encoding="utf-8-sig")
    minified = (ROOT/"src/Bluent.UI/wwwroot/bluent.ui.components.min.css").read_text(encoding="utf-8-sig")
    check_popover_reduced_motion_style(authored, compiled, minified)
    check_popover_right_end_style(authored, compiled, minified)
    overlay_authored = (ROOT/"src/Bluent.UI/Styles/Components/_overlay.scss").read_text(encoding="utf-8-sig")
    check_overlay_reduced_motion_style(overlay_authored, compiled, minified)
    print("PASS #420 Popover TS/JS and Sass reduced motion source: 4 ESM/global JS+maps and component CSS match shipped assets")

if __name__=="__main__":
    main()
