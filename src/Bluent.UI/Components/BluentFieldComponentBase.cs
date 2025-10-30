using Bluent.UI.Extensions;
using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public abstract class BluentFieldComponentBase<TValue> : BluentInputComponentBase<TValue>
{
    [Parameter] public RenderFragment? StartAddon { get; set; } 
    [Parameter] public RenderFragment? EndAddon { get; set; }
    [Parameter] public FieldSize Size { get; set; } = FieldSize.Medium;
    [Parameter] public string BindValueEvent { get; set; } = "onchange";

    protected override void OnParametersSet()
    {
        if (DisplayName is null && ValueExpression != null)
        {
            var display = ValueExpression.GetDisplayName();
            DisplayName = display;
        }

        base.OnParametersSet();
    }

    protected override IEnumerable<string> GetClasses()
    {
        yield return "bui-field";

        if (IsDisabled)
            yield return "disabled";

        if (Size != FieldSize.Medium)
            yield return Size.ToString().Kebaberize();
    }
}
