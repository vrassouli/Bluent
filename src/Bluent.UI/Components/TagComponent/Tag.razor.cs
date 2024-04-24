using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class Tag
{
    [Parameter] public string Title { get; set; } = default!;
    [Parameter] public bool Dismissable { get; set; }
    [Parameter] public string? Icon { get; set; }
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public EventCallback OnDismiss { get; set; }
    
    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-tag";
    }
}
