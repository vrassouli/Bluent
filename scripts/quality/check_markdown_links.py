#!/usr/bin/env python3
"""Check repository-local links in maintained Markdown documents."""

from pathlib import Path
import re
import sys
from urllib.parse import unquote


ROOTS = (
    list(Path(".").glob("*.md"))
    + list(Path("docs").rglob("*.md"))
    + list(Path(".bluent").rglob("*.md"))
)
LINK_PATTERN = re.compile(r"(?<!!)\[[^\]]*\]\(([^)]+)\)")


def main() -> int:
    failures: list[str] = []
    for document in ROOTS:
        text = document.read_text(encoding="utf-8-sig")
        for raw_target in LINK_PATTERN.findall(text):
            target = raw_target.strip().split(maxsplit=1)[0].strip("<>")
            if not target or target.startswith(("#", "http://", "https://", "mailto:")):
                continue
            target = unquote(target.split("#", 1)[0])
            if not (document.parent / target).resolve().exists():
                failures.append(f"{document}: missing {target}")
    if failures:
        print("\n".join(failures), file=sys.stderr)
        return 1
    print(f"Checked local links in {len(ROOTS)} Markdown files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
