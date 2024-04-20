using Humanizer;
using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class Avatar
{
    [Parameter] public string? Initials { get; set; }
    [Parameter] public string? Name { get; set; }
    [Parameter] public string? ImageSource { get; set; }
    [Parameter] public string? Icon { get; set; }
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public AvatarSize Size { get; set; } = AvatarSize.Size32;
    [CascadingParameter] public Popover? Popover { get; set; }

    private string? DisplayInitial
    {
        get
        {
            if(!string.IsNullOrEmpty(Initials))
                return Initials;

            if(!string.IsNullOrEmpty(Name)) 
                return string.Concat(Name.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(x => x[0]));
            
            return null;
        }
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-avatar";

        if (Size != AvatarSize.Size32)
            yield return Size.ToString().Kebaberize();

        if (Popover != null || OnClick.HasDelegate)
            yield return "active";
    }

    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender && Popover != null)
            Popover.SetTrigger(this);

        base.OnAfterRender(firstRender);
    }
}
