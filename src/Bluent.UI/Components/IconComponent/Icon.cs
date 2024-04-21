using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public class Icon : BluentComponentBase
{
    [Parameter] public string? Content { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-icon";

        if (!string.IsNullOrEmpty(Content))
            yield return Content;
    }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "i");
        builder.AddMultipleAttributes(1, AdditionalAttributes);
        builder.AddAttribute(2, "id", Id);
        builder.AddAttribute(3, "class", GetComponentClass());
        builder.AddAttribute(4, "style", Style);
        builder.CloseElement();
    }
}
