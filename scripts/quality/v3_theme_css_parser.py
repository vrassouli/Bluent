#!/usr/bin/env python3
"""Strict parser for emitted Bluent theme CSS used by #418 draft generators.

Fail closed on a missing/wrong mode, extra rule, duplicate variable or malformed
declaration. Comments must not supply source token values. Not a general CSS
parser: the emitted source contract is one [data-bui-theme=mode] rule per file.
"""
from __future__ import annotations

import re
from pathlib import Path

COMMENTS = re.compile(r"/\*.*?\*/", re.S)
ROOT_RULE = re.compile(r"\s*\[data-bui-theme=(light|dark)\]\s*\{([^{}]*)\}\s*\Z", re.S)
DECL = re.compile(r"\s*(--[\w-]+)\s*:\s*([^;{}]+?)\s*;", re.S)


def read_theme_variables(path: Path, expected_mode: str) -> dict[str, str]:
    if expected_mode not in {"light", "dark"}:
        raise ValueError(f"Unexpected theme mode: {expected_mode}")
    source = COMMENTS.sub("", path.read_text(encoding="utf-8"))
    root = ROOT_RULE.fullmatch(source)
    if root is None or root.group(1) != expected_mode:
        raise ValueError(f"Expected one isolated [data-bui-theme={expected_mode}] rule: {path.name}")
    body = root.group(2)
    values: dict[str, str] = {}
    end = 0
    for match in DECL.finditer(body):
        if body[end:match.start()].strip():
            raise ValueError(f"Unexpected content before source variable: {path.name}")
        key, value = match.group(1), match.group(2).strip()
        if key in values:
            raise ValueError(f"Duplicate source variable: {path.name} {key}")
        if not value:
            raise ValueError(f"Empty source variable: {path.name} {key}")
        values[key] = value
        end = match.end()
    if body[end:].strip() or not values:
        raise ValueError(f"Malformed or empty source CSS: {path.name}")
    return values
