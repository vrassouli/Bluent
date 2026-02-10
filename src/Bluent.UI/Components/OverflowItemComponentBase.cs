using Bluent.UI.Components.OverflowComponent;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components;

public abstract class OverflowItemComponentBase : BluentUiComponentBase/*, IOverflowItem*/
{
    [CascadingParameter] public OverflowRenderContext? RenderContext { get; set; }
    [CascadingParameter] public Overflow Overflow { get; set; } = default!;


    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        if (RenderContext != null)
        {
            if (RenderContext.RenderOverflowMenuItem)
            {
                RenderOverflowMenuItem(builder);
            }
            else
            {
                RenderOverflowItem(builder);
            }
        }

        base.BuildRenderTree(builder);
    }

    protected abstract void RenderOverflowMenuItem(RenderTreeBuilder builder);
    protected abstract void RenderOverflowItem(RenderTreeBuilder builder);
}
