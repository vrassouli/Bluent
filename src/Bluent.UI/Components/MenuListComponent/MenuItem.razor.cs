using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class MenuItem
{
    [Parameter, EditorRequired] public string Title { get; set; } = default!;
    //[CascadingParameter] public MenuList Menu { get; set; } = default!;

    protected override void OnInitialized()
    {
        //if (Menu == null)
        //    throw new InvalidOperationException($"{nameof(MenuItem)} component should be used inside a {nameof(MenuList)} component.");

        base.OnInitialized();
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "menu-item";
    }
}
