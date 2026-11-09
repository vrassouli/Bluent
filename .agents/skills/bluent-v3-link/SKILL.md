# Bluent v3 Link — task handoff

Use this Skill only for isolated v3 task #431. It is not the 2.x consumer API or a released v3 package. Implementation belongs on v3/issue-431-link; the PR targets bluent-v3 only.

## Retrieval order

1. Canonical reference: ../../../docs/v3/components/link.md
2. Issue #431 for approved behavior and current acceptance status.
3. Link source, SCSS and tests: ../../../src/Bluent.UI/Components/LinkComponent/Link.cs, ../../../src/Bluent.UI/Styles/Components/_link.scss, ../../../tests/RegexSampleGeneratorTest/LinkRenderSemanticsTests.cs.
4. Showcase /components/links and Component Lab /component-lab.
5. Owned Penpot behavior and state/theme/layout boards linked from the canonical reference.

## Contract

- Preserve required Text, nullable Href, Appearance (Default/Subtle) and OnClick. Do not add a public Disabled parameter.
- Non-blank Href is native navigation. Null/empty/whitespace Href is native button type=button action fallback.
- Enabled anchor navigation is never cancelled by OnClick.
- Disabled navigation has no href, role=link, aria-disabled=true, tabindex=0 and accessible name from Text. No activation path invokes OnClick.
- Disabled action is a native disabled button.
- Link-owned destination/type/click/disabled and disabled ARIA/focus semantics override case-insensitive conflicts. Preserve unrelated attributes and inherited Id/Class/Style.
- Keep focus-visible ring and forced-colors Highlight. Do not promote #418 candidates into public production tokens.

## Regression commands

~~~powershell
dotnet test tests/RegexSampleGeneratorTest/RegexSampleGeneratorTest.csproj --configuration Release --filter FullyQualifiedName~LinkRenderSemanticsTests
npx --yes sass@1.93.2 --no-source-map src/Bluent.UI/Styles/Components/components.scss src/Bluent.UI/Styles/Components/components.css
dotnet build Bluent.sln --configuration Release -warnaserror
dotnet test Bluent.sln --configuration Release --no-build
~~~

Before claiming browser completion, run the demo in Chrome and Edge for WebAssembly and published InteractiveServer. Test pointer/Enter/Space, Tab order, callback counts, target/rel, computed focus styles, light/dark, RTL and mobile. Keep native OS contrast and spoken screen-reader evidence separate from browser forced-colors emulation and AX inspection.

## Version routing

Use the existing 2.x consumer Skill and docs/components/link.md for released consumers. This Skill routes only experimental v3 work; do not describe the task branch or Penpot draft as a stable API or NuGet release.