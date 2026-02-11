using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.AspNetCore.Components.Web;

namespace Bluent.UI.Components.SplitPanelComponent.Internal;

public class PanelResizer : ComponentBase
{
    [Parameter] public SplitArea SplitArea { get; set; }
    [CascadingParameter] public SplitPanelContainer Container { get; set; } = default!;

    private string AreaClass => $"{SplitArea}-resizer".ToLower();

    private string GripIcon => SplitArea switch
    {
        SplitArea.Top or SplitArea.Bottom => "icon-ic_fluent_more_horizontal_20_regular",
        SplitArea.Start or SplitArea.End => "icon-ic_fluent_more_vertical_20_regular",
        _ => string.Empty
    };

    protected override void OnInitialized()
    {
        if (Container == null!)
        {
            throw new InvalidOperationException(
                $"{nameof(SplitPanel)} must be nested inside a {nameof(SplitPanelContainer)}.");
        }

        base.OnInitialized();
    }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        var seq = -1;

        builder.OpenElement(++seq, "div");
        builder.AddAttribute(++seq, "class", $"panel-resizer {AreaClass}");
        builder.AddAttribute(
            ++seq,
            "onpointerdown",
            EventCallback.Factory.Create<PointerEventArgs>(this, OnPointerDown));

        builder.OpenComponent<Icon>(++seq);
        builder.AddComponentParameter(++seq, nameof(Icon.Content), GripIcon);
        builder.CloseComponent();
        
        builder.CloseElement();
    }

    private async Task OnPointerDown(PointerEventArgs e)
    {
        await Container.StartResize(SplitArea, e);
    }
}