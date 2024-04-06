using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public class Link : BluentComponentBase
{
    [Parameter, EditorRequired] public string Text { get; set; } = default!;
    [Parameter] public LinkAppearance Appearance { get; set; } = LinkAppearance.Default;
    [Parameter] public EventCallback OnClick { get; set; }

    private string? Href => AdditionalAttributes?.ContainsKey("href") == true ?
        AdditionalAttributes["href"]?.ToString() : null;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-link";

        if (Appearance != LinkAppearance.Default)
            yield return Appearance.ToString().Kebaberize();
    }

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, GetLinkTag());
        if (string.IsNullOrEmpty(Href))
            builder.AddAttribute(1, "type", "button");

        builder.AddMultipleAttributes(2, GetAdditionalAttributes());
        builder.AddAttribute(3, "id", Id);
        builder.AddAttribute(4, "class", GetComponentClass());
        builder.AddAttribute(5, "style", Style);
        builder.AddAttribute(6, "onclick", EventCallback.Factory.Create(this, ClickHandler));
        builder.AddContent(7, Text);
        builder.CloseElement();
    }

    private string GetLinkTag()
    {
        if (string.IsNullOrWhiteSpace(Href))
            return "button";

        return "a";
    }

    private Dictionary<string, object>? GetAdditionalAttributes()
    {
        if (AdditionalAttributes == null)
        {
            return null;
        }
        else
        {
            var dic = new Dictionary<string, object>();
            foreach (var item in AdditionalAttributes)
            {
                if (item.Key.Equals("href", StringComparison.InvariantCultureIgnoreCase) && IsDisabled)
                    continue;

                dic.Add(item.Key, item.Value);
            }

            return dic;
        }
    }

    private void ClickHandler()
    {
        InvokeAsync(OnClick.InvokeAsync);
    }
}
