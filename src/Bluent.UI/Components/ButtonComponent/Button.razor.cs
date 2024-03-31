using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class Button
{
    [Parameter] public string? Text { get; set; }
    [Parameter] public string? Icon { get; set; }
    [Parameter] public ButtonShape Shape { get; set; } = ButtonShape.Rounded;
    [Parameter] public ButtonAppearance Appearance { get; set; } = ButtonAppearance.Default;
    [Parameter] public ButtonSize Size { get; set; } = ButtonSize.Medium;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-button";

        if (string.IsNullOrEmpty(Text) && !string.IsNullOrEmpty(Icon))
            yield return "icon";

        if (Shape != ButtonShape.Rounded)
            yield return Shape.ToString().ToLower();

        if (Appearance != ButtonAppearance.Default)
            yield return Appearance.ToString().ToLower();

        if (Size != ButtonSize.Medium)
            yield return Size.ToString().ToLower();
    }
}
