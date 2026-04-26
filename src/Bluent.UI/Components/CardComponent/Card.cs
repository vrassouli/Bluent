using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components;

public class Card : BluentUiComponentBase
{
    [Parameter] public CardOrientation Orientation { get; set; } = CardOrientation.Vertical;
    [Parameter] public CardSize Size { get; set; } = CardSize.Medium;
    [Parameter] public CardAppearance Appearance { get; set; } = CardAppearance.Filled;
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public bool Selected { get; set; }
    [Parameter] public EventCallback<bool> SelectedChanged { get; set; }
    [Parameter] public string? Href { get; set; }

    private bool IsLink => !string.IsNullOrEmpty(Href);
    protected bool IsActive => OnClick.HasDelegate || IsSelectable || IsLink;
    protected bool IsSelectable => SelectedChanged.HasDelegate;

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, GetCardTag());
        if (IsLink && !IsDisabled)
            builder.AddAttribute(1, "href", Href);

        builder.AddMultipleAttributes(2, AdditionalAttributes);
        builder.AddAttribute(3, "id", Id);
        builder.AddAttribute(4, "class", GetComponentClass());
        builder.AddAttribute(5, "style", Style);
        builder.AddAttribute(6, "onclick", EventCallback.Factory.Create(this, ClickHandler));
        builder.OpenRegion(8);
        
        builder.AddContent(9, ChildContent);
    
        builder.CloseRegion();
        builder.CloseElement();
        base.BuildRenderTree(builder);
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-card";

        if (IsActive)
            yield return "active";

        if (Selected)
            yield return "selected";

        if (Orientation != CardOrientation.Vertical)
            yield return Orientation.ToString().Kebaberize();

        if (Size != CardSize.Medium)
            yield return Size.ToString().Kebaberize();

        if (Appearance != CardAppearance.Filled)
            yield return Appearance.ToString().Kebaberize();
    }

    private void ClickHandler()
    {
        InvokeAsync(OnClick.InvokeAsync);

        if (IsSelectable)
        {
            Selected = !Selected;
            InvokeAsync(() => SelectedChanged.InvokeAsync(Selected));
        }
    }

    private string GetCardTag()
    {
        if (IsLink)
            return "a";

        return "div";
    }
}
