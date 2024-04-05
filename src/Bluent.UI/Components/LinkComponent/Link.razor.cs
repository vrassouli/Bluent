using Humanizer;
using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class Link
{
    [Parameter, EditorRequired] public string Text { get; set; } = default!;
    [Parameter] public LinkAppearance Appearance { get; set; } = LinkAppearance.Default;

    private string? Href => AdditionalAttributes?.ContainsKey("href") == true ?
        AdditionalAttributes["href"]?.ToString() : null;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-link";

        if (Appearance != LinkAppearance.Default)
            yield return Appearance.ToString().Kebaberize();
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
}
