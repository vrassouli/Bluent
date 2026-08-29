# Skeleton

`Skeleton` is Bluent's visual loading-placeholder primitive. Use it to reserve the approximate shape of content that has not loaded yet.

## Package and namespace

```razor
@using Bluent.UI.Components
```

Package: `Bluent.UI`

## Basic usage

```razor
<Skeleton Style="width: 12rem; height: 1.5rem;" />
<Skeleton Shape="SkeletonShape.Circle"
          Style="width: 3rem; height: 3rem;" />
```

## Public API

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `Shape` | `SkeletonShape` | `Rectangle` | `Rectangle` or `Circle`. |

The component inherits normal Bluent `Class`, `Style`, `Id`, tooltip, and unmatched-attribute support. It does not define `ChildContent`.

## Render behavior

Current source renders an empty wrapper `<div>` with class `bui-skeleton`; `Circle` adds the corresponding shape class. Width/height are not component-specific parameters, so consumers normally size the placeholder through `Style`, `Class`, or surrounding layout/CSS.

The skeleton animation/appearance is CSS-driven and requires no JavaScript from the component itself.

## Accessibility

`Skeleton` is only a visual placeholder in current source. It does not add busy/status/live-region semantics and contains no semantic placeholder content. Do not expose critical information only through skeleton shapes; use appropriate surrounding loading/status semantics when assistive-technology notification is required.

## Evidence boundary

Source verified from `Skeleton.razor`, `Skeleton.razor.cs`, and `SkeletonShape.cs`. Do not invent width/height parameters, child content, row counts, text variants, animation toggles, or automatic loading-state semantics.
