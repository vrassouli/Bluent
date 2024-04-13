using Bluent.UI.Components.DrawerComponent;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Services.EventArguments;

internal class OpenDrawerEventArgs : EventArgs
{

    public OpenDrawerEventArgs(DrawerContext context)
    {
        Context = context;
    }

    public DrawerContext Context { get; }
}
