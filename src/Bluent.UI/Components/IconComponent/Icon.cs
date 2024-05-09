using Bluent.UI.Components.IconComponent;
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

    bool IsSvg => Content?.StartsWith("<svg", StringComparison.InvariantCultureIgnoreCase) == true;
    bool IsPath => Content?.Contains("/") == true;
    bool IsCssClass => !IsSvg && !IsPath;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-icon";

        if (IsCssClass && !string.IsNullOrEmpty(Content))
            yield return Content;
    }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        if (IsSvg)
        {
            builder.OpenElement(0, "div");
            builder.AddMultipleAttributes(1, AdditionalAttributes);
            builder.AddAttribute(2, "id", Id);
            builder.AddAttribute(3, "class", GetComponentClass());
            builder.AddAttribute(4, "style", Style);
            if (!string.IsNullOrEmpty(Content))
                builder.AddContent(5, (MarkupString)Content);
            builder.CloseElement();
        }
        else if (IsPath)
        {
            builder.OpenElement(6, "img");
            builder.AddMultipleAttributes(7, AdditionalAttributes);
            builder.AddAttribute(8, "id", Id);
            builder.AddAttribute(9, "class", GetComponentClass());
            builder.AddAttribute(10, "style", Style);
            builder.AddAttribute(11, "src", Content);
            builder.CloseElement();
        }
        else
        {
            builder.OpenElement(12, "i");
            builder.AddMultipleAttributes(13, AdditionalAttributes);
            builder.AddAttribute(14, "id", Id);
            builder.AddAttribute(15, "class", GetComponentClass());
            builder.AddAttribute(16, "style", Style);
            builder.CloseElement();
        }
    }

    public static SvgGenerator FromContent(string content) =>
        new SvgGenerator().Content(content);
}
