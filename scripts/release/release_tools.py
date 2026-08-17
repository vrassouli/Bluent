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
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
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

# Keep this list aligned with NuGet.org's documented trusted image hosts:
# https://learn.microsoft.com/nuget/nuget-org/package-readme-on-nuget-org
NUGET_TRUSTED_IMAGE_HOSTS = frozenset(
    {
        "api.codacy.com",
        "api.codeclimate.com",
        "api.dependabot.com",
        "api.reuse.software",
        "api.travis-ci.com",
        "app.codacy.com",
        "app.deepsource.com",
        "avatars.githubusercontent.com",
        "badgen.net",
        "badges.gitter.im",
        "camo.githubusercontent.com",
        "caniuse.bitsofco.de",
        "cdn.jsdelivr.net",
        "cdn.syncfusion.com",
        "ci.appveyor.com",
        "circleci.com",
        "cloudback.it",
        "codecov.io",
        "codefactor.io",
        "coveralls.io",
        "dev.azure.com",
        "devpod.sh",
        "flat.badgen.net",
        "gitlab.com",
        "i.imgur.com",
        "img.shields.io",
        "infragistics.com",
        "isitmaintained.com",
        "media.githubusercontent.com",
        "opencollective.com",
        "raw.github.com",
        "raw.githubusercontent.com",
        "snyk.io",
        "sonarcloud.io",
        "travis-ci.com",
        "travis-ci.org",
        "user-images.githubusercontent.com",
    }
)

MARKDOWN_IMAGE_PATTERN = re.compile(
    r"!\[[^\]]*\]\(\s*(?:<(?P<angled>[^>]+)>|(?P<plain>[^\s)]+))",
    re.MULTILINE,
)
REFERENCE_DEFINITION_PATTERN = re.compile(
    r"^[ \t]{0,3}\[(?P<label>[^\]]+)\]:[ \t]*"
    r"(?:<(?P<angled>[^>\n]+)>|(?P<plain>\S+))",
    re.MULTILINE,
)
REFERENCE_IMAGE_PATTERN = re.compile(
    r"!\[(?P<alt>[^\]]*)\]\[(?P<label>[^\]]*)\]"
)
SHORTCUT_IMAGE_PATTERN = re.compile(
    r"!\[(?P<label>[^\]]+)\](?![ \t]*(?:\(|\[))"
)


class ReadmeImageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.sources: list[str] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        if tag.lower() != "img":
            return
        for name, value in attrs:
            if name.lower() == "src" and value:
                self.sources.append(value.strip())


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


def meaningful_changelog_entries(section: str) -> list[str]:
    return [
        line
        for line in section.splitlines()
        if line.startswith("- ") and line != "- None."
    ]


def latest_dated_release(text: str) -> tuple[str, str] | None:
    for match in re.finditer(
        r"^## \[(?P<version>[^\]]+)\] - \d{4}-\d{2}-\d{2}\s*$",
        text,
        re.MULTILINE,
    ):
        version = match.group("version")
        if not SEMVER_PATTERN.fullmatch(version):
            continue
        section = changelog_section(text, version)
        if section is not None and meaningful_changelog_entries(section):
            return version, section
    return None


def extract_notes(args: argparse.Namespace) -> None:
    validate_version(args.version)
    text = args.changelog.read_text(encoding="utf-8-sig")
    section = changelog_section(text, args.version)
    source = args.version
    if section is None and args.allow_unreleased:
        section = changelog_section(text, "Unreleased")
        source = "Unreleased"
        if section is None or not meaningful_changelog_entries(section):
            latest = latest_dated_release(text)
            if latest is not None:
                source, section = latest
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
    meaningful = meaningful_changelog_entries(section)
    if not meaningful:
        fail(f"The [{source}] changelog section contains no release-note entries.")
    if source == "Unreleased":
        dry_run_notice = (
            "> Dry-run preview generated from the Unreleased section. A real "
            "publication requires a dated version section.\n\n"
        )
    elif source != args.version:
        dry_run_notice = (
            f"> Dry-run preview generated from [{source}] because the "
            "Unreleased section contains no entries. A real publication "
            "requires the exact requested version section.\n\n"
        )
    else:
        dry_run_notice = ""
    output = (
        f"# Bluent {args.version}\n\n"
        + dry_run_notice
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


def readme_image_sources(readme: str) -> list[str]:
    sources = [
        match.group("angled") or match.group("plain")
        for match in MARKDOWN_IMAGE_PATTERN.finditer(readme)
    ]
    references = {
        " ".join(match.group("label").split()).casefold(): (
            match.group("angled") or match.group("plain")
        )
        for match in REFERENCE_DEFINITION_PATTERN.finditer(readme)
    }
    unresolved: list[str] = []
    for match in REFERENCE_IMAGE_PATTERN.finditer(readme):
        label = match.group("label") or match.group("alt")
        normalized = " ".join(label.split()).casefold()
        if normalized not in references:
            unresolved.append(label)
        else:
            sources.append(references[normalized])
    for match in SHORTCUT_IMAGE_PATTERN.finditer(readme):
        label = match.group("label")
        normalized = " ".join(label.split()).casefold()
        if normalized not in references:
            unresolved.append(label)
        else:
            sources.append(references[normalized])
    if unresolved:
        fail(
            "README contains unresolved image references: "
            f"{', '.join(sorted(set(unresolved)))}."
        )
    parser = ReadmeImageParser()
    parser.feed(readme)
    sources.extend(parser.sources)
    return sources


def is_nuget_trusted_image_url(source: str) -> bool:
    try:
        parsed = urlsplit(source)
        port = parsed.port
    except ValueError:
        return False
    if (
        parsed.scheme.lower() != "https"
        or not parsed.hostname
        or parsed.username is not None
        or parsed.password is not None
        or port not in (None, 443)
    ):
        return False
    host = parsed.hostname.lower()
    if host in NUGET_TRUSTED_IMAGE_HOSTS:
        return True
    if host != "github.com":
        return False
    return re.fullmatch(
        r"/[^/]+/[^/]+/(?:actions/)?workflows/[^/]+/badge\.svg",
        parsed.path,
        re.IGNORECASE,
    ) is not None


def validate_readme_images(readme: str, package_id: str) -> list[str]:
    sources = readme_image_sources(readme)
    unsupported = [
        source for source in sources if not is_nuget_trusted_image_url(source)
    ]
    if unsupported:
        fail(
            f"{package_id} README contains image sources that NuGet.org will "
            f"not render: {', '.join(unsupported)}."
        )
    return sources


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
            consumer_web_assets = sorted(
                name
                for name in names
                if name.startswith("content/wwwroot/")
                or (
                    name.startswith("contentFiles/")
                    and "/wwwroot/" in name
                )
            )
            if consumer_web_assets:
                fail(
                    f"{package_id} contains consumer-owned web assets instead of "
                    "Razor static web assets: "
                    f"{', '.join(consumer_web_assets)}."
                )
            readme_path = required_fields["readme"]
            if readme_path not in names:
                fail(f"{package_id} does not contain {readme_path}.")
            try:
                readme = archive.read(readme_path).decode("utf-8-sig")
            except UnicodeDecodeError:
                fail(f"{package_id} {readme_path} is not valid UTF-8.")
            image_sources = validate_readme_images(readme, package_id)
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
                "readme_image_sources": image_sources,
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
