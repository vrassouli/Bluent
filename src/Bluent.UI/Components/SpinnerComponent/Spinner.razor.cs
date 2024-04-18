using Humanizer;
using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class Spinner
{
    [Parameter] public SpinnerAppearance Appearance { get; set; } = SpinnerAppearance.Primary;
    [Parameter] public SpinnerLabelPosition LabelPosition { get; set; } = SpinnerLabelPosition.Below;
    [Parameter] public string? Label { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-spinner";

        if (Appearance != SpinnerAppearance.Primary)
            yield return Appearance.ToString().Kebaberize();

        if(LabelPosition != SpinnerLabelPosition.Below)
            yield return LabelPosition.ToString().Kebaberize();
    }
}
