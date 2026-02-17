using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components.SplitPanelComponent.Internal;

public class SplitPanel : ComponentBase
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public SplitArea SplitArea { get; set; }
    [Parameter] public bool Floating { get; set; }
    [Parameter] public int? Size { get; set; }
    [CascadingParameter] public SplitPanelContainer Container { get; set; } = default!;

    private string AreaClass => $"{SplitArea}-panel".ToLower();

    private string? SizeStyle
    {
        get
        {
            if (Floating)
                return null;
            
            if (Size is null)
                return null;

            var style = SplitArea switch
            {
                SplitArea.Header or
                    SplitArea.Footer or
                    SplitArea.Top or
                    SplitArea.Bottom => "height",
                
                SplitArea.Start or
                    SplitArea.End or
                    SplitArea.StartSide or
                    SplitArea.EndSide => "width",
                
                _ => throw new ArgumentOutOfRangeException()
            };

            return $"{style}:{Size}px";
        }
    }

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
        builder.AddAttribute(++seq, "class", $"split-panel {AreaClass}");
        builder.AddAttribute(++seq, "style", $"{SizeStyle}");
        builder.OpenComponent<CascadingValue<SplitPanel>>(++seq);
        builder.AddAttribute(++seq, nameof(CascadingValue<>.IsFixed), true);
        builder.AddAttribute(++seq, nameof(CascadingValue<>.Value), this);
        builder.AddAttribute(++seq, nameof(CascadingValue<>.ChildContent),
            (RenderFragment)(cascadeBuilder => { cascadeBuilder.AddContent(0, ChildContent); }));
        builder.CloseComponent();
        builder.CloseElement();

        base.BuildRenderTree(builder);
    }

    public void SetAllowResize(bool allow) => Container.SetAllowResize(SplitArea, allow);

    public void ResetSize() => Container.ResetSize(SplitArea);

    internal void SetFloating(bool floating) => Container.SetFloating(SplitArea, floating);

    internal int? GetSize() => Container.GetSize(SplitArea);
    
    internal void SetSize(int size) => Container.SetSize(SplitArea, size);
}