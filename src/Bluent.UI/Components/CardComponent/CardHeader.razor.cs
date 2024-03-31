using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class CardHeader
{
    [Parameter] public RenderFragment? Image { get; set; }
    [Parameter] public RenderFragment? Header { get; set; }
    [Parameter] public RenderFragment? Description { get; set; }
    [Parameter] public RenderFragment? Action { get; set; }
    public override IEnumerable<string> GetClasses()
    {
        yield return "card-header";
    }
}
