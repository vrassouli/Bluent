namespace Bluent.UI.Icons;

public readonly record struct IconSource
{
    private IconSource(IconSourceKind kind, string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Icon source value cannot be empty.", nameof(value));

        Kind = kind;
        Value = value;
    }

    public IconSourceKind Kind { get; }
    public string Value { get; }

    public static IconSource CssClass(string cssClass) => new(IconSourceKind.CssClass, cssClass);
    public static IconSource Svg(string svg) => new(IconSourceKind.Svg, svg);
    public static IconSource Image(string source) => new(IconSourceKind.Image, source);
}
