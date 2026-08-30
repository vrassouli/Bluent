# Spacer

`Spacer` is Bluent's minimal flexible-space layout primitive. Use it inside a flex layout such as `Stack` when the intent is to consume remaining flex space between neighboring items.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<Stack>
    <Button Text="Back" />
    <Spacer />
    <Button Text="Save" Appearance="ButtonAppearance.Primary" />
</Stack>
```

## Public surface

`Spacer` does not define component-specific parameters or child content. It inherits the common Bluent component attributes such as `Class`, `Style`, `Id`, and unmatched HTML attributes.

Its current render output is an empty `<div>` whose component class list includes `flex-fill`.

## Behavior

- The component exists only to consume flexible space in a flex layout.
- It does not render text, children, separators, or semantic content.
- It does not require JavaScript or an interactive render mode for its own behavior.
- Prefer `Spacer` over inserting an ad-hoc empty `<div>` when the desired behavior is specifically Bluent flexible spacing.

## Accessibility

`Spacer` is purely presentational and currently renders a plain empty `<div>`. Do not use it to carry accessible names, landmarks, status text, or interactive behavior.

## Evidence boundary

Source verified from `src/Bluent.UI/Components/SpacerComponent/Spacer.razor`. Do not infer gap sizing, fixed width/height, orientation, or child-content APIs that do not exist in the current source.
