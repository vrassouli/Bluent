#!/usr/bin/env python3
"""#423: v3 Skill version-routing contract, links, and maturity boundaries.

Checks only supported static invariants; this cannot certify future component
APIs, actual Penpot parity, or agent behavior.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
SKILL_DIR = ROOT / ".agents/skills/bluent-v3"
REQUIRED = (
    SKILL_DIR / "SKILL.md",
    SKILL_DIR / "COMPONENT-ROUTER.md",
    SKILL_DIR / "FAMILY-SKILL-TEMPLATE.md",
    ROOT / "docs/v3/skills/README.md",
)
LEGACY = ROOT / ".agents/skills/bluent/SKILL.md"
V3_INDEX = ROOT / "docs/v3/README.md"
LINK = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")
VERSION = re.compile(r"\b2\.x\b")
RISKS = re.compile(r"\b(?:not released|no released|not a released|not shipped)\b", re.I)


def validate_document(path: Path, body: str) -> list[str]:
    errors = []
    local_links = 0
    for destination in LINK.findall(body):
        destination = destination.split("#", 1)[0].strip()
        if not destination or destination.startswith(("http://", "https://", "mailto:")):
            continue
        local_links += 1
        target = (path.parent / destination).resolve()
        if not target.is_relative_to(ROOT) or not target.is_file():
            errors.append(f"{path.relative_to(ROOT)}: bad link {destination}")
    if local_links < 2:
        errors.append(f"{path.relative_to(ROOT)}: missing canonical local retrieval links")
    if not RISKS.search(body):
        errors.append(f"{path.relative_to(ROOT)}: missing unreleased v3 warning")
    return errors


def validate_skill_text(body: str) -> list[str]:
    errors = []
    if not VERSION.search(body) or "NuGet" not in body:
        errors.append("Router must distinguish installed 2.x NuGet consumers")
    for phrase in ("bluent-v3", "Penpot", "source", "Review", "Backlog", "Done"):
        if phrase not in body:
            errors.append(f"Router lacks required version/design/status gate: {phrase}")
    if not re.search(r"\b(?:never|do not)\b.{0,95}\b(?:invent|recommend installing|claim)\b", body, re.I | re.S):
        errors.append("Router missing anti-fabrication guardrail")
    return errors


def validate_repo() -> list[str]:
    errors = []
    for path in REQUIRED:
        if not path.is_file():
            errors.append(f"Missing required file {path.relative_to(ROOT)}")
            continue
        errors.extend(validate_document(path, path.read_text(encoding="utf-8")))
    if LEGACY.is_file() and V3_INDEX.is_file():
        router = REQUIRED[0].read_text(encoding="utf-8")
        errors.extend(validate_skill_text(router))
        index = V3_INDEX.read_text(encoding="utf-8")
        if "skills/README.md" not in index:
            errors.append("Canonical v3 index does not link approved Skills authoring")
        legacy = LEGACY.read_text(encoding="utf-8")
        if "This skill is maintained from the Bluent" not in legacy:
            errors.append("Existing 2.x legacy skill unexpected; confirm old Skill source")
    else:
        errors.append("Missing legacy skill or canonical v3 documentation index")
    return errors


if __name__ == "__main__":
    failures = validate_repo()
    for finding in failures:
        print("FAIL: " + finding, file=sys.stderr)
    print(f"v3 Skills contract: {'PASS' if not failures else 'FAIL'} ({len(REQUIRED)} reviewed files, {len(failures)} errors)")
    raise SystemExit(1 if failures else 0)
