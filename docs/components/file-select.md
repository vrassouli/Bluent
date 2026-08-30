# FileSelect

`FileSelect` wraps Blazor `InputFile` with a Bluent Button-based picker, optional selected-file cards, removal, file-type icons, and single/multiple selection callbacks.

## When to use
Use it for browser file selection in Bluent UI. It selects browser files; it does not upload them to a server by itself.

## Package and namespace
`Bluent.UI`, namespace `Bluent.UI.Components`.

## Minimal verified example
```razor
<FileSelect Text="Choose file"
            Accept=".pdf,.docx"
            OnFileSelected="HandleFile" />
```

## Public API
- `Text`: `string?` button text.
- `Icon`: `IconDefinition?`.
- `Accept`: `string?`, forwarded to Blazor `InputFile`.
- `ShowFileInfo`: `bool`, default `true`.
- `AllowRemove`: `bool`, default `true`.
- `Disabled`: `bool`.
- `Appearance`: `ButtonAppearance`, default `Default`.
- `Shape`: `ButtonShape`, default `Rounded`.
- `MaxFiles`: `int`, default `1`; values greater than 1 enable the underlying `multiple` input.
- `OnChange`: `EventCallback<IEnumerable<SelectedFile>>`.
- `OnFileSelected`, `OnFileRemoved`: `EventCallback<SelectedFile>`.
- public `Remove(SelectedFile)` and `Clear()` methods.
- static `GetIcon(string fileExtension)` returns the built-in file-type icon mapping.

`SelectedFile` wraps the browser file selected by Blazor input infrastructure.

## Behavior and composition
The real picker is `InputFile`. The visible Bluent `Button` programmatically invokes its click through `IDomHelper`. When `ShowFileInfo` is enabled, selected files render as horizontal Cards with type icon, filename, humanized size, and optional delete Button.

Single-file selection calls `Clear()` before adding the replacement file, so removal/change callbacks may run as part of replacing an existing file.

## Services / JS / assets
The component injects `IDomHelper` and `IJSRuntime`; the visible Button uses shared Bluent interaction infrastructure. Built-in file-type images are packaged under `_content/Bluent.UI/assets/file-types/`. Use normal `AddBluentUI()` and packaged CSS setup.

## Accessibility and keyboard
The source retains a real Blazor file input and uses a visible Button to activate it. The delete action is an icon-only Button and therefore needs an accessible name if the surrounding rendering does not supply one; the current source does not add an explicit `aria-label` to that delete Button. File-input/browser accessibility behavior should be runtime verified.

## RTL/localization
`Text` is application supplied. Filename/size presentation is source observed; no FileSelect-specific RTL runtime evidence is recorded. Humanized file-size text comes from Humanizer behavior rather than a Bluent localization resource in this component.

## Common mistakes / limitations
- `FileSelect` does not upload or persist file bytes; consumers still read `IBrowserFile` streams and send/store them.
- `Accept` is a browser picker hint/constraint surface, not server-side file validation.
- `MaxFiles > 1` enables multiple selection, but application-level total-size/type validation remains consumer responsibility.
- Runtime picker/cancel/multiple-selection edge cases were not newly browser-tested in this documentation pass.

## Source and verification
- `src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor`
- `src/Bluent.UI/Components/FileSelectComponent/FileSelect.razor.cs`
- `src/Bluent.UI/Components/FileSelectComponent/SelectedFile.cs`
- source verified against the #406 PR branch on 2026-08-29.
