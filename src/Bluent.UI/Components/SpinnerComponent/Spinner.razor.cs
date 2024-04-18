using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Spinner
{
    [Parameter] public SpinnerAppearance Appearance { get; set; } = SpinnerAppearance.Primary;
    [Parameter] public SpinnerLabelPosition LabelPosition { get; set; } = SpinnerLabelPosition.Below;
    [Parameter] public SpinnerSize Size { get; set; } = SpinnerSize.Medium;
    [Parameter] public string? Label { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-spinner";

        if (Appearance != SpinnerAppearance.Primary)
            yield return Appearance.ToString().Kebaberize();

        if (LabelPosition != SpinnerLabelPosition.Below)
            yield return LabelPosition.ToString().Kebaberize();

        if (Size != SpinnerSize.Medium)
            yield return Size.ToString().Kebaberize();
    }
}
