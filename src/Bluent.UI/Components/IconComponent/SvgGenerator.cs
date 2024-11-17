namespace Bluent.UI.Components.IconComponent;

public class SvgGenerator
{
    private string? _content;
    private int? _elementWidth;
    private int? _elementHeight;
    private int? _viewboxWidth;
    private int? _viewboxHeight;

    public SvgGenerator Content(string content)
    {
        _content = content;

        return this;
    }

    public SvgGenerator Size(int size)
    {
        _elementWidth = size;
        _elementHeight = size;

        return this;
    }

    public SvgGenerator Width(int width)
    {
        _elementWidth = width;

        return this;
    }

    public SvgGenerator Height(int height)
    {
        _elementHeight = height;

        return this;
    }

    public SvgGenerator Viewbox(int size)
    {
        _viewboxWidth = size;
        _viewboxHeight = size;

        return this;
    }

    public SvgGenerator ViewboxWidth(int width)
    {
        _viewboxWidth = width;

        return this;
    }

    public SvgGenerator ViewboxHeight(int height)
    {
        _viewboxHeight = height;

        return this;
    }

    public override string ToString()
    {
        return Generate();
    }

    public static implicit operator string(SvgGenerator self)
    {
        return self.ToString();
    }

    private string Generate()
    {
        var w = _elementWidth ?? 24;
        var h = _elementHeight ?? 24;

        var vbw = _viewboxWidth ?? 24;
        var vbh = _viewboxHeight ?? 24;

        return $"<svg viewbox=\"0 0 {vbw} {vbh}\" width=\"{w}\" height=\"{h}\">{_content}</svg>";
    }
}
