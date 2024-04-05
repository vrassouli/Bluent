﻿using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class SplitButton
{
    [Parameter] public string? Text { get; set; }
    [Parameter] public string? Icon { get; set; }
    [Parameter] public string? ActiveIcon { get; set; }
    [Parameter] public ButtonShape Shape { get; set; } = ButtonShape.Rounded;
    [Parameter] public ButtonAppearance Appearance { get; set; } = ButtonAppearance.Default;
    [Parameter] public ButtonSize Size { get; set; } = ButtonSize.Medium;
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter, EditorRequired] public RenderFragment? DropdownContent { get; set; }

    private bool IsDisabled =>  AdditionalAttributes?.ContainsKey("disabled") == true &&
                                AdditionalAttributes["disabled"] != null &&
                                AdditionalAttributes["disabled"] is bool b &&
                                b != false;


    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-split-button";
    }
}
