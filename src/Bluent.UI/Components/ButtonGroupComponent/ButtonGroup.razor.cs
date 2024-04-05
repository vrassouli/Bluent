using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class ButtonGroup
{
    [Parameter] public RenderFragment? ChildContent { get;set; }
    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-button-group";
    }
}
