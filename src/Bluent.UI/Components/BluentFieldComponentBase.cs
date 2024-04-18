using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public abstract class BluentFieldComponentBase<TValue> : BluentInputComponentBase<TValue>
{
    [Parameter] public RenderFragment StartAddon { get; set; } = default!;
    [Parameter] public RenderFragment EndAddon { get; set; } = default!;
    [Parameter] public FieldSize Size { get; set; } = FieldSize.Medium;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-field";

        if (IsDisabled)
            yield return "disabled";

        if (Size != FieldSize.Medium)
            yield return Size.ToString().Kebaberize();
    }
}
