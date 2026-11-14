#!/usr/bin/env python3
"""Read-only #418 boundary check of a LOCALLY BUILT v3 Bluent.UI .nupkg.

Does not pack, sign, upload, publish, edit binaries, or touch Dev/v2.
The v3 opt-in Dialog runtime *must* carry its imported JS dependency;
the v3 Styling Lab token CSS comes from Demo.Pages and must NOT ship in UI.\nThe single opt-in, source-reviewed Danger toggle stylesheet MAY ship with the v3\nbranch package ONLY; stable v2 assets are unchanged.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import sys
from zipfile import ZipFile

BRANDS = (
    "default", "excel", "office", "outlook", "powerapps",
    "powerbi", "powerpoint", "stream", "teams", "word",
)
DIALOG_JS = "staticwebassets/v3/issue-418-dialog-focus.preview.js"
DANGER_CSS = "staticwebassets/v3/danger-toggle.opt-in.preview.css"
BROWSER_PREVIEW_NAMES = (
    "issue-418.opt-in.preview.css",
    "issue-418-opt-in.preview.css",
    "issue-418-accessibility.preview.css",
    "issue-418-portal.preview.css",
)
EXPECTED_LEGACY = {
    "staticwebassets/bluent.ui.components.min.css",
    *(f"staticwebassets/bluent.ui.theme.{b}.min.css" for b in BRANDS),
}
# Preserve original Fluent icon assets and fail on new text fonts in ANY
# NuGet directory, not just wwwroot/fonts in the source tree.
FONT_SUFFIXES = {".woff", ".woff2", ".ttf", ".otf", ".eot"}
ALLOWED_ICON_FONTS = {
    f"staticwebassets/fonts/icons/FluentSystemIcons-Resizable.{ext}"
    for ext in ("woff", "woff2", "ttf")
}
def unexpected_packaged_font_assets(members: set[str]) -> list[str]:
    return sorted(n for n in members
        if Path(n.lower()).suffix in FONT_SUFFIXES
        and n not in ALLOWED_ICON_FONTS)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("nupkg", type=Path, help="Local v3 task-branch NuGet package; never a stable publication")
    args = ap.parse_args()
    pkg = args.nupkg
    errors = []
    if not pkg.is_file() or pkg.suffix != ".nupkg":
        errors.append(f"Expected existing .nupkg: {pkg}")
        members: set[str] = set()
    else:
        with ZipFile(pkg) as archive:
            members = set(archive.namelist())
            invalid = archive.testzip()
            if invalid:
                errors.append(f"Corrupt ZIP member: {invalid}")
    missing = sorted(EXPECTED_LEGACY - members)
    if missing:
        errors.append(f"Missing legacy CSS bundle/theme assets: {missing}")
    if DIALOG_JS not in members:
        errors.append("Opt-in v3 Dialog JS is missing but actual Dialog code imports it")
    if DANGER_CSS not in members:
        errors.append("Scoped v3 Danger toggle stylesheet missing from Bluent.UI package")
    # The *content* of the opted-in CSS is a security/compatibility boundary.
    # A present but empty/stale/tampered CSS member is not evidence that a
    # NuGet consumer receives the same Penpot-audited file as the v3 lab.
    source_danger_css = (
        Path(__file__).resolve().parents[2]
        / "src/Bluent.UI/wwwroot/v3/danger-toggle.opt-in.preview.css"
    )
    danger_css_identical = False
    if DANGER_CSS in members and source_danger_css.is_file() and pkg.is_file():
        with ZipFile(pkg) as archive:
            danger_css_identical = (
                archive.read(DANGER_CSS) == source_danger_css.read_bytes()
            )
        if not danger_css_identical:
            errors.append("Packaged v3 Danger toggle CSS differs from reviewed source bytes")
    elif DANGER_CSS in members:
        errors.append("Reviewed v3 Danger toggle CSS source missing")

    unexpected = sorted(
        n for n in members
        if any(marker in n.lower() for marker in BROWSER_PREVIEW_NAMES)
        or (n.startswith("staticwebassets/v3/") and n not in (DIALOG_JS, DANGER_CSS))
    )
    if unexpected:
        errors.append(f"Demo-only/unapproved assets crossed library package boundary: {unexpected}")
    unapproved_fonts = unexpected_packaged_font_assets(members)
    if unapproved_fonts:
        errors.append("Unexpected bundled text/unapproved font assets in NuGet: "
                      + str(unapproved_fonts))

    # Source-to-package contract: the JS must be gated behind a dedicated
    # opt-in modal or explicit focus target, not auto-imported for v2 Dialogs.
    root = Path(__file__).resolve().parents[2]
    dialog = (root / "src/Bluent.UI/Components/DialogComponent/Dialog.razor.cs").read_text(encoding="utf-8")
    container = (root / "src/Bluent.UI/Components/DialogComponent/DialogContainer.razor.cs").read_text(encoding="utf-8")
    if "((EnableModalKeyboard && IsModal) || !string.IsNullOrWhiteSpace(InitialFocusTargetId))" not in dialog:
        errors.append("Dialog has lost its explicit JS-import opt-in gate")
    if "if (_pendingFocusTargetId is not { } targetId)" not in container:
        errors.append("DialogContainer has lost its opt-in focus-return guard")
    result = {
        "pass": not errors,
        "classification": "Read-only local v3 package boundary; NOT a stable release, NuGet upload, or final API approval",
        "nupkg": pkg.name,
        "legacyThemeCount": len(BRANDS),
        "legacyBundlesPresent": not missing,
        "optInDialogDependencyPresent": DIALOG_JS in members,
        "optInDangerCssPresent": DANGER_CSS in members,
        "optInDangerCssSourceIdentical": danger_css_identical,
        "demoOnlyCssOrUnexpectedV3Assets": unexpected,
        "unapprovedFontAssets": unapproved_fonts,
        "allowedLegacyIconFontsPresent": sorted(members & ALLOWED_ICON_FONTS),
        "zipMemberCount": len(members),
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["pass"] else 1

if __name__ == "__main__":
    sys.exit(main())
