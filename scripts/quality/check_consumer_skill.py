#!/usr/bin/env python3
"""Validate Bluent consumer-skill coverage without duplicating the API catalog.

The main UI source tree remains authoritative. This check derives public component
family source areas from `src/Bluent.UI/Components/*Component` and verifies that
canonical inventory/index routing cannot silently drift away from that surface.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INVENTORY = ROOT / "docs/components/inventory.md"
INDEX = ROOT / ".agents/skills/bluent/COMPONENT-INDEX.md"
SKILL_ROOT = ROOT / ".agents/skills/bluent"
MAIN_SOURCE_ROOT = ROOT / "src/Bluent.UI/Components"

# Public source areas intentionally classified as cross-component infrastructure
# rather than independent retrieval families. Keep this list explicit so a newly
# added *Component directory still fails validation until it is classified.
EXPLICIT_INFRA_SOURCE_DIRS = {
    "src/Bluent.UI/Components/ContainersComponent/",
}

REQUIRED_SKILL_FILES = (
    "SKILL.md",
    "COMPONENT-INDEX.md",
    "DECISION-GUIDE.md",
    "references/foundation/setup-assets.md",
    "references/foundation/theming.md",
    "references/foundation/rtl-localization.md",
    "references/foundation/forms-validation.md",
    "references/foundation/accessibility.md",
    "references/patterns/forms.md",
    "references/patterns/crud.md",
    "references/patterns/navigation.md",
    "references/patterns/overlays.md",
    "references/patterns/data-entry.md",
    "references/patterns/drag-drop.md",
)


def fail(message: str) -> None:
    print(f"consumer-skill validation error: {message}", file=sys.stderr)
    raise SystemExit(1)


def section(text: str, heading: str, next_heading: str) -> str:
    start_marker = f"## {heading}"
    end_marker = f"## {next_heading}"
    start = text.find(start_marker)
    if start < 0:
        fail(f"missing heading {start_marker!r} in inventory")
    end = text.find(end_marker, start + len(start_marker))
    if end < 0:
        fail(f"missing heading {end_marker!r} after {start_marker!r}")
    return text[start:end]


def main() -> None:
    if not INVENTORY.is_file():
        fail(f"missing {INVENTORY.relative_to(ROOT)}")
    if not INDEX.is_file():
        fail(f"missing {INDEX.relative_to(ROOT)}")

    for relative in REQUIRED_SKILL_FILES:
        path = SKILL_ROOT / relative
        if not path.is_file():
            fail(f"missing required skill file {path.relative_to(ROOT)}")

    inventory_text = INVENTORY.read_text(encoding="utf-8-sig")
    index_text = INDEX.read_text(encoding="utf-8-sig")
    main_inventory = section(inventory_text, "Main UI package", "Charts package")

    all_component_dirs = sorted(
        path.relative_to(ROOT).as_posix() + "/"
        for path in MAIN_SOURCE_ROOT.iterdir()
        if path.is_dir() and path.name.endswith("Component")
    )
    if not all_component_dirs:
        fail("no main UI *Component source directories found")

    unknown_infra = sorted(EXPLICIT_INFRA_SOURCE_DIRS - set(all_component_dirs))
    if unknown_infra:
        fail("explicit infrastructure paths no longer exist: " + ", ".join(unknown_infra))

    family_source_dirs = sorted(set(all_component_dirs) - EXPLICIT_INFRA_SOURCE_DIRS)

    missing_source_rows = [path for path in family_source_dirs if f"`{path}`" not in main_inventory]
    if missing_source_rows:
        fail("main UI source areas missing from inventory: " + ", ".join(missing_source_rows))

    inventory_source_paths = set(
        re.findall(r"`(src/Bluent\.UI/Components/[^`]+Component/)`", main_inventory)
    )
    stale_source_rows = sorted(inventory_source_paths - set(all_component_dirs))
    if stale_source_rows:
        fail("inventory references missing main UI source areas: " + ", ".join(stale_source_rows))

    table_rows = [
        line for line in main_inventory.splitlines()
        if line.startswith("|")
        and "`Bluent.UI`" in line
        and "src/Bluent.UI/Components/" in line
    ]
    not_verified = [line for line in table_rows if "| Source verified |" not in line and "| Runtime verified |" not in line]
    if not_verified:
        fail("main UI rows not source/runtime verified:\n" + "\n".join(not_verified))

    if len(table_rows) != len(family_source_dirs):
        fail(
            "main UI family row count does not match classified source surface: "
            f"{len(table_rows)} rows vs {len(family_source_dirs)} family source directories"
        )

    for infrastructure_path in EXPLICIT_INFRA_SOURCE_DIRS:
        component_name = Path(infrastructure_path.rstrip("/")).name.removesuffix("Component")
        if component_name not in main_inventory:
            fail(f"classified infrastructure {component_name} is not described in inventory")

    canonical_refs = sorted(set(re.findall(r"`(docs/components/[^`]+\.md)`", index_text)))
    if not canonical_refs:
        fail("component index contains no canonical component references")
    missing_refs = [ref for ref in canonical_refs if not (ROOT / ref).is_file()]
    if missing_refs:
        fail("component index routes to missing files: " + ", ".join(missing_refs))

    for required_heading in ("## Main UI", "## Charts", "## Diagrams", "## Utilities"):
        if required_heading not in index_text:
            fail(f"component index missing package route heading {required_heading!r}")

    if "Bluent-first" not in (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8-sig"):
        fail("SKILL.md no longer contains the Bluent-first policy")

    print(
        "consumer-skill coverage OK: "
        f"{len(family_source_dirs)} main UI families mapped, "
        f"{len(EXPLICIT_INFRA_SOURCE_DIRS)} main UI infrastructure source area(s) classified, "
        f"{len(canonical_refs)} canonical index routes resolved"
    )


if __name__ == "__main__":
    main()
