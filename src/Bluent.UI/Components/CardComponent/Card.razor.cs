using Humanizer;
using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class Card
{
    [Parameter] public CardOrientation Orientation { get; set; } = CardOrientation.Vertical;
    [Parameter] public CardSize Size { get; set; } = CardSize.Medium;
    [Parameter] public CardAppearance Appearance { get; set; } = CardAppearance.Filled;
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public bool Selected { get; set; }
    [Parameter] public EventCallback<bool> SelectedChanged { get; set; }

    protected bool IsActive => OnClick.HasDelegate || IsSelectable;
    protected bool IsSelectable => SelectedChanged.HasDelegate;

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
}
