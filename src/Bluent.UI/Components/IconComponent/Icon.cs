using Bluent.UI.Icons;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components;

public class Icon : BluentUiComponentBase
{
    [Parameter, EditorRequired] public IconDefinition? Value { get; set; }
    [Parameter] public IconVariant Variant { get; set; } = IconVariant.Regular;

    private IconSource? Source => Value?.GetSource(Variant);

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-icon";

        if (Source is { Kind: IconSourceKind.CssClass } source)
            yield return source.Value;
    }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        if (Source is not { } source)
            return;

        switch (source.Kind)
        {
            case IconSourceKind.Svg:
                builder.OpenElement(0, "span");
                AddCommonAttributes(builder, 1);
                builder.AddContent(5, (MarkupString)source.Value);
                builder.CloseElement();
                break;

            case IconSourceKind.Image:
                builder.OpenElement(6, "img");
                AddCommonAttributes(builder, 7);
                builder.AddAttribute(11, "src", source.Value);
                builder.CloseElement();
                break;

            case IconSourceKind.CssClass:
                builder.OpenElement(12, "i");
                AddCommonAttributes(builder, 13);
                builder.CloseElement();
                break;

            default:
                throw new ArgumentOutOfRangeException(nameof(source.Kind), source.Kind, "Unsupported icon source kind.");
        }
    }

    private void AddCommonAttributes(RenderTreeBuilder builder, int sequence)
    {
        builder.AddMultipleAttributes(sequence, AdditionalAttributes);
        builder.AddAttribute(sequence + 1, "id", Id);
        builder.AddAttribute(sequence + 2, "class", GetComponentClass());
        builder.AddAttribute(sequence + 3, "style", Style);
    }
}
