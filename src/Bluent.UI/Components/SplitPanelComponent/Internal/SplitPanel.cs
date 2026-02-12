using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components.SplitPanelComponent.Internal;

public class SplitPanel : ComponentBase
{
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public SplitArea SplitArea { get; set; }
    [CascadingParameter] public SplitPanelContainer Container { get; set; } = default!;

    private string AreaClass => $"{SplitArea}-panel".ToLower();

    private string? SizeStyle
    {
        get
        {
            return SplitArea switch
            {
                SplitArea.Header => Container.HeaderSize is null ? null : $"height: {Container.HeaderSize}px",
                SplitArea.Footer => Container.FooterSize is null ? null : $"height: {Container.FooterSize}px",
                SplitArea.StartSide => Container.StartSideSize is null ? null : $"width: {Container.StartSideSize}px",
                SplitArea.EndSide => Container.EndSideSize is null ? null : $"width: {Container.EndSideSize}px",
                
                SplitArea.Top => Container.TopSize is null ? null : $"height: {Container.TopSize}px",
                SplitArea.Bottom => Container.BottomSize is null ? null : $"height: {Container.BottomSize}px",
                SplitArea.Start => Container.StartSize is null ? null : $"width: {Container.StartSize}px",
                SplitArea.End => Container.EndSize is null ? null : $"width: {Container.EndSize}px",
                _ => null
            };
        }
    }

    protected override void OnInitialized()
    {
        if (Container == null!)
        {
            throw new InvalidOperationException($"{nameof(SplitPanel)} must be nested inside a {nameof(SplitPanelContainer)}.");
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
        builder.AddAttribute(++seq, nameof(CascadingValue<>.ChildContent), (RenderFragment)((cascadeBuilder) =>
        {
            cascadeBuilder.AddContent(0, ChildContent);
        }));
        builder.CloseComponent();
        builder.CloseElement();

        base.BuildRenderTree(builder);
    }

    public void SetAllowResize(bool allow) => Container.SetAllowResize(SplitArea, allow);

    public void ResetSize() => Container.ResetSize(SplitArea);
}
