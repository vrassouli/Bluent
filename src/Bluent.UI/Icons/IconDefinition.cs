namespace Bluent.UI.Icons;

public readonly record struct IconDefinition(IconSource Regular, IconSource? Filled = null)
{
    public IconSource GetSource(IconVariant variant) =>
        variant == IconVariant.Filled && Filled.HasValue
            ? Filled.Value
            : Regular;

    public static IconDefinition FromCss(string regularClass, string? filledClass = null) =>
        new(
            IconSource.CssClass(regularClass),
            string.IsNullOrWhiteSpace(filledClass) ? null : IconSource.CssClass(filledClass));

    public static IconDefinition FromSvg(string regularSvg, string? filledSvg = null) =>
        new(
            IconSource.Svg(regularSvg),
            string.IsNullOrWhiteSpace(filledSvg) ? null : IconSource.Svg(filledSvg));

    public static IconDefinition FromImage(string regularSource, string? filledSource = null) =>
        new(
            IconSource.Image(regularSource),
            string.IsNullOrWhiteSpace(filledSource) ? null : IconSource.Image(filledSource));
}
