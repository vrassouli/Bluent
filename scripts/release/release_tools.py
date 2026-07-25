#!/usr/bin/env python3
"""Deterministic release validation helpers for Bluent."""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
import zipfile
from pathlib import Path
from xml.etree import ElementTree


PACKAGE_DEPENDENCIES = {
    "Bluent.UI.Core": set(),
    "Bluent.UI": {"Bluent.UI.Core"},
    "Bluent.UI.Charts": {"Bluent.UI.Core"},
    "Bluent.UI.Diagrams": {"Bluent.UI.Core"},
    "Bluent.UI.Utilities": {"Bluent.UI"},
}

SEMVER_PATTERN = re.compile(
    r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)"
    r"(?:-((?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*)"
    r"(?:\.(?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*))*))?$"
)


def fail(message: str) -> None:
    raise ValueError(message)


def validate_version(version: str) -> None:
    if not SEMVER_PATTERN.fullmatch(version):
        fail(
            f"'{version}' is not an accepted SemVer version. Use "
            "MAJOR.MINOR.PATCH with an optional prerelease suffix and no "
            "leading zeros or build metadata."
        )


def changelog_section(text: str, heading: str) -> str | None:
    pattern = re.compile(
        rf"^## \[{re.escape(heading)}\](?: - \d{{4}}-\d{{2}}-\d{{2}})?\s*$"
        rf"(?P<body>.*?)(?=^## |\Z)",
        re.MULTILINE | re.DOTALL,
    )
    match = pattern.search(text)
    if match is None:
        return None
    return match.group(0).strip() + "\n"


def extract_notes(args: argparse.Namespace) -> None:
    validate_version(args.version)
    text = args.changelog.read_text(encoding="utf-8-sig")
    section = changelog_section(text, args.version)
    source = args.version
    if section is None and args.allow_unreleased:
        section = changelog_section(text, "Unreleased")
        source = "Unreleased"
    if section is None:
        fail(
            f"CHANGELOG.md has no section for [{args.version}]. A publish run "
            "requires an exact dated version section."
        )
    if not re.search(
        r"^### (Added|Changed|Deprecated|Removed|Fixed|Security)\s*$",
        section,
        re.MULTILINE,
    ):
        fail(f"The [{source}] changelog section has no recognized change category.")
    meaningful = [
        line
        for line in section.splitlines()
        if line.startswith("- ") and line != "- None."
    ]
    if not meaningful:
        fail(f"The [{source}] changelog section contains no release-note entries.")
    output = (
        f"# Bluent {args.version}\n\n"
        + (
            "> Dry-run preview generated from the Unreleased section. A real "
            "publication requires a dated version section.\n\n"
            if source == "Unreleased"
            else ""
        )
        + "\n".join(section.splitlines()[1:]).strip()
        + "\n"
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(output, encoding="utf-8")
    print(f"Generated {args.output} from CHANGELOG.md [{source}].")


def nuspec_root(package: Path) -> ElementTree.Element:
    with zipfile.ZipFile(package) as archive:
        nuspecs = [name for name in archive.namelist() if name.endswith(".nuspec")]
        if len(nuspecs) != 1:
            fail(f"{package.name} contains {len(nuspecs)} .nuspec files; expected one.")
        return ElementTree.fromstring(archive.read(nuspecs[0]))


def child_text(metadata: ElementTree.Element, name: str) -> str:
    element = metadata.find(f"{{*}}{name}")
    return "" if element is None or element.text is None else element.text.strip()


def validate_packages(args: argparse.Namespace) -> None:
    validate_version(args.version)
    packages = sorted(args.directory.glob("*.nupkg"))
    packages = [
        package for package in packages if not package.name.endswith(".symbols.nupkg")
    ]
    if len(packages) != len(PACKAGE_DEPENDENCIES):
        fail(
            f"Found {len(packages)} primary packages in {args.directory}; "
            f"expected exactly {len(PACKAGE_DEPENDENCIES)}."
        )

    report: dict[str, object] = {
        "version": args.version,
        "repository_commit": args.commit,
        "packages": [],
    }
    seen: set[str] = set()
    for package in packages:
        root = nuspec_root(package)
        metadata = root.find("{*}metadata")
        if metadata is None:
            fail(f"{package.name} has no nuspec metadata element.")
        package_id = child_text(metadata, "id")
        package_version = child_text(metadata, "version")
        if package_id not in PACKAGE_DEPENDENCIES:
            fail(f"{package.name} has unexpected package ID '{package_id}'.")
        if package_id in seen:
            fail(f"Package ID '{package_id}' appears more than once.")
        seen.add(package_id)
        if package_version != args.version:
            fail(
                f"{package_id} has version '{package_version}', expected "
                f"'{args.version}'."
            )

        required_fields = {
            "authors": child_text(metadata, "authors"),
            "description": child_text(metadata, "description"),
            "license": child_text(metadata, "license"),
            "projectUrl": child_text(metadata, "projectUrl"),
            "repository": metadata.find("{*}repository"),
            "readme": child_text(metadata, "readme"),
        }
        missing = [
            name for name, value in required_fields.items() if value is None or value == ""
        ]
        if missing:
            fail(f"{package_id} is missing required metadata: {', '.join(missing)}.")
        license_element = metadata.find("{*}license")
        if (
            license_element is None
            or license_element.attrib.get("type") != "expression"
            or (license_element.text or "").strip() != "Apache-2.0"
        ):
            fail(f"{package_id} must use the Apache-2.0 license expression.")
        repository = metadata.find("{*}repository")
        if repository is None or repository.attrib.get("commit") != args.commit:
            fail(
                f"{package_id} repository commit does not match {args.commit}. "
                "Pack with RepositoryCommit set."
            )

        dependency_versions: dict[str, set[str]] = {}
        for dependency in metadata.findall(".//{*}dependency"):
            dependency_id = dependency.attrib.get("id", "")
            dependency_versions.setdefault(dependency_id, set()).add(
                dependency.attrib.get("version", "")
            )
        expected_internal = PACKAGE_DEPENDENCIES[package_id]
        actual_internal = set(dependency_versions).intersection(PACKAGE_DEPENDENCIES)
        if actual_internal != expected_internal:
            fail(
                f"{package_id} internal dependencies are {sorted(actual_internal)}, "
                f"expected {sorted(expected_internal)}."
            )
        for dependency_id in expected_internal:
            versions = dependency_versions[dependency_id]
            if versions != {args.version}:
                fail(
                    f"{package_id} requires {dependency_id} at {sorted(versions)}, "
                    f"expected exact version {args.version}."
                )

        with zipfile.ZipFile(package) as archive:
            names = set(archive.namelist())
            if "README.md" not in names:
                fail(f"{package_id} does not contain README.md.")
            if not any(
                name.startswith("lib/net10.0/") and name.endswith(".dll")
                for name in names
            ):
                fail(f"{package_id} has no net10.0 library assembly.")
            static_assets = sorted(
                name for name in names if name.startswith("staticwebassets/")
            )

        report["packages"].append(
            {
                "file": package.name,
                "id": package_id,
                "version": package_version,
                "internal_dependencies": {
                    dependency: sorted(dependency_versions[dependency])
                    for dependency in sorted(expected_internal)
                },
                "static_web_asset_count": len(static_assets),
            }
        )

    if seen != set(PACKAGE_DEPENDENCIES):
        fail(f"Package IDs were {sorted(seen)}, expected {sorted(PACKAGE_DEPENDENCIES)}.")
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"Validated five aligned packages. Report: {args.report}")


def preflight_nuget(args: argparse.Namespace) -> None:
    validate_version(args.version)
    conflicts: list[str] = []
    for package_id in PACKAGE_DEPENDENCIES:
        url = (
            "https://api.nuget.org/v3-flatcontainer/"
            f"{package_id.lower()}/index.json"
        )
        try:
            with urllib.request.urlopen(url, timeout=30) as response:
                versions = json.load(response).get("versions", [])
        except urllib.error.HTTPError as error:
            if error.code == 404:
                versions = []
            else:
                raise
        if args.version.lower() in {version.lower() for version in versions}:
            conflicts.append(f"{package_id} {args.version}")
    if conflicts:
        fail(
            "Refusing publication because these immutable NuGet versions "
            f"already exist: {', '.join(conflicts)}."
        )
    print(f"NuGet preflight passed: {args.version} is unused for all five package IDs.")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)

    version_parser = subparsers.add_parser("validate-version")
    version_parser.add_argument("version")

    notes_parser = subparsers.add_parser("extract-notes")
    notes_parser.add_argument("--changelog", type=Path, required=True)
    notes_parser.add_argument("--version", required=True)
    notes_parser.add_argument("--output", type=Path, required=True)
    notes_parser.add_argument("--allow-unreleased", action="store_true")

    package_parser = subparsers.add_parser("validate-packages")
    package_parser.add_argument("--directory", type=Path, required=True)
    package_parser.add_argument("--version", required=True)
    package_parser.add_argument("--commit", required=True)
    package_parser.add_argument("--report", type=Path, required=True)

    preflight_parser = subparsers.add_parser("preflight-nuget")
    preflight_parser.add_argument("--version", required=True)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        if args.command == "validate-version":
            validate_version(args.version)
            print(f"Validated release version {args.version}.")
        elif args.command == "extract-notes":
            extract_notes(args)
        elif args.command == "validate-packages":
            validate_packages(args)
        elif args.command == "preflight-nuget":
            preflight_nuget(args)
    except (OSError, ValueError, zipfile.BadZipFile, ElementTree.ParseError) as error:
        print(f"release validation failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
