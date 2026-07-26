#!/usr/bin/env python3

import json
import re
import tempfile
import unittest
import zipfile
from argparse import Namespace
from contextlib import contextmanager
from pathlib import Path
import sys
from xml.etree import ElementTree

sys.path.insert(0, str(Path(__file__).parent))
import release_tools


class ReleaseToolsTests(unittest.TestCase):
    PACKAGE_VERSION = "1.2.3"
    REPOSITORY_COMMIT = "0123456789abcdef"

    @staticmethod
    def _write_package(
        directory: Path,
        package_file_id: str,
        *,
        package_id: str | None = None,
        version: str = PACKAGE_VERSION,
        repository_commit: str = REPOSITORY_COMMIT,
        include_readme: bool = True,
        dependency_versions: dict[str, str] | None = None,
    ) -> None:
        package_id = package_id or package_file_id
        dependency_versions = dependency_versions or {
            dependency: version
            for dependency in release_tools.PACKAGE_DEPENDENCIES[package_file_id]
        }

        package = ElementTree.Element("package")
        metadata = ElementTree.SubElement(package, "metadata")
        for name, value in (
            ("id", package_id),
            ("version", version),
            ("authors", "Bluent test"),
            ("description", "Synthetic package-validator fixture."),
            ("projectUrl", "https://github.com/vrassouli/Bluent"),
            ("readme", "README.md"),
        ):
            ElementTree.SubElement(metadata, name).text = value
        license_element = ElementTree.SubElement(
            metadata, "license", {"type": "expression"}
        )
        license_element.text = "Apache-2.0"
        ElementTree.SubElement(
            metadata,
            "repository",
            {
                "type": "git",
                "url": "https://github.com/vrassouli/Bluent.git",
                "commit": repository_commit,
            },
        )
        dependencies = ElementTree.SubElement(metadata, "dependencies")
        group = ElementTree.SubElement(
            dependencies, "group", {"targetFramework": "net10.0"}
        )
        for dependency_id, dependency_version in sorted(
            dependency_versions.items()
        ):
            ElementTree.SubElement(
                group,
                "dependency",
                {"id": dependency_id, "version": dependency_version},
            )

        package_path = directory / f"{package_file_id}.{version}.nupkg"
        with zipfile.ZipFile(
            package_path, "w", compression=zipfile.ZIP_DEFLATED
        ) as archive:
            archive.writestr(
                f"{package_file_id}.nuspec",
                ElementTree.tostring(package, encoding="utf-8", xml_declaration=True),
            )
            if include_readme:
                archive.writestr("README.md", f"# {package_id}\n")
            archive.writestr(f"lib/net10.0/{package_file_id}.dll", b"fixture")

    @contextmanager
    def _package_fixture(self, **overrides: dict[str, object]):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for package_id in release_tools.PACKAGE_DEPENDENCIES:
                self._write_package(
                    root,
                    package_id,
                    **overrides.get(package_id, {}),
                )
            yield Namespace(
                directory=root,
                version=self.PACKAGE_VERSION,
                commit=self.REPOSITORY_COMMIT,
                report=root / "package-validation.json",
            )

    def test_accepts_stable_and_prerelease_versions(self) -> None:
        release_tools.validate_version("1.2.3")
        release_tools.validate_version("2.0.0-preview.1")

    def test_rejects_ambiguous_nuget_versions(self) -> None:
        for version in ("v1.2.3", "1.02.3", "1.2", "1.2.3+build.1"):
            with self.subTest(version=version):
                with self.assertRaises(ValueError):
                    release_tools.validate_version(version)

    def test_changelog_section_stops_at_next_level_two_heading(self) -> None:
        text = """# Changelog

## [Unreleased]

### Added

- A change.

## Release History

Historical prose.
"""
        section = release_tools.changelog_section(text, "Unreleased")
        self.assertIsNotNone(section)
        self.assertNotIn("Release History", section)

    def test_publish_notes_require_exact_version_section(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            changelog = root / "CHANGELOG.md"
            changelog.write_text(
                "## [Unreleased]\n\n### Added\n\n- A change.\n",
                encoding="utf-8",
            )
            with self.assertRaises(ValueError):
                release_tools.extract_notes(
                    Namespace(
                        changelog=changelog,
                        version="1.2.3",
                        output=root / "notes.md",
                        allow_unreleased=False,
                    )
                )

    def test_dry_run_uses_latest_release_when_unreleased_is_empty(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            changelog = root / "CHANGELOG.md"
            output = root / "notes.md"
            changelog.write_text(
                """## [Unreleased]

### Added

- None.

## [1.2.3] - 2026-07-26

### Fixed

- A released fix.
""",
                encoding="utf-8",
            )
            release_tools.extract_notes(
                Namespace(
                    changelog=changelog,
                    version="0.0.0-ci.1",
                    output=output,
                    allow_unreleased=True,
                )
            )
            notes = output.read_text(encoding="utf-8")
            self.assertIn("generated from [1.2.3]", notes)
            self.assertIn("- A released fix.", notes)

    def test_accepts_nuget_trusted_readme_image_sources(self) -> None:
        readme = """\
![NuGet](https://img.shields.io/nuget/v/Bluent.UI.svg)
![Demo](https://raw.githubusercontent.com/owner/repo/commit/demo.jpg)
![Build][build-badge]
<img src="https://i.imgur.com/example.png" alt="Example">

[build-badge]: https://github.com/owner/repo/actions/workflows/build.yml/badge.svg
"""
        self.assertEqual(
            release_tools.validate_readme_images(readme, "Bluent.UI"),
            [
                "https://img.shields.io/nuget/v/Bluent.UI.svg",
                "https://raw.githubusercontent.com/owner/repo/commit/demo.jpg",
                "https://github.com/owner/repo/actions/workflows/build.yml/badge.svg",
                "https://i.imgur.com/example.png",
            ],
        )

    def test_rejects_unsupported_readme_image_sources(self) -> None:
        sources = (
            "docs/demo.jpg",
            "http://img.shields.io/example.svg",
            "https://example.com/example.png",
        )
        for source in sources:
            with self.subTest(source=source):
                with self.assertRaisesRegex(
                    ValueError, "NuGet.org will not render"
                ):
                    release_tools.validate_readme_images(
                        f"![Example]({source})", "Bluent.UI"
                    )

    def test_package_validator_accepts_valid_synthetic_packages(self) -> None:
        with self._package_fixture() as args:
            release_tools.validate_packages(args)

            report = json.loads(args.report.read_text(encoding="utf-8"))
            self.assertEqual(report["version"], self.PACKAGE_VERSION)
            self.assertEqual(
                {package["id"] for package in report["packages"]},
                set(release_tools.PACKAGE_DEPENDENCIES),
            )

    def test_package_validator_rejects_wrong_package_id(self) -> None:
        with self._package_fixture(
            **{"Bluent.UI.Core": {"package_id": "Bluent.Wrong"}}
        ) as args:
            with self.assertRaisesRegex(
                ValueError,
                re.escape("has unexpected package ID 'Bluent.Wrong'"),
            ):
                release_tools.validate_packages(args)

    def test_package_validator_rejects_wrong_version(self) -> None:
        with self._package_fixture(
            **{"Bluent.UI": {"version": "9.9.9"}}
        ) as args:
            with self.assertRaisesRegex(
                ValueError,
                re.escape(
                    "Bluent.UI has version '9.9.9', expected "
                    f"'{self.PACKAGE_VERSION}'"
                ),
            ):
                release_tools.validate_packages(args)

    def test_package_validator_rejects_missing_readme(self) -> None:
        with self._package_fixture(
            **{"Bluent.UI": {"include_readme": False}}
        ) as args:
            with self.assertRaisesRegex(
                ValueError,
                re.escape("Bluent.UI does not contain README.md"),
            ):
                release_tools.validate_packages(args)

    def test_package_validator_rejects_mismatched_repository_commit(self) -> None:
        with self._package_fixture(
            **{"Bluent.UI": {"repository_commit": "wrong-commit"}}
        ) as args:
            with self.assertRaisesRegex(
                ValueError,
                re.escape(
                    "Bluent.UI repository commit does not match "
                    f"{self.REPOSITORY_COMMIT}"
                ),
            ):
                release_tools.validate_packages(args)

    def test_package_validator_rejects_unaligned_bluent_dependency(self) -> None:
        with self._package_fixture(
            **{
                "Bluent.UI": {
                    "dependency_versions": {"Bluent.UI.Core": "9.9.9"}
                }
            }
        ) as args:
            with self.assertRaisesRegex(
                ValueError,
                re.escape(
                    "Bluent.UI requires Bluent.UI.Core at ['9.9.9'], "
                    f"expected exact version {self.PACKAGE_VERSION}"
                ),
            ):
                release_tools.validate_packages(args)


if __name__ == "__main__":
    unittest.main()
