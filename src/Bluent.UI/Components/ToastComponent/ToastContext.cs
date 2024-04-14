using Bluent.UI.Components.ToastComponent;
using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

internal class ToastContext
{
    public ToastContext(RenderFragment content, ToastConfiguration config)
    {
        Content = content;
        Config = config;
        ResultTCS = new TaskCompletionSource<dynamic?>();
    }

    public RenderFragment Content { get; }
    public ToastConfiguration Config { get; }
    internal TaskCompletionSource<dynamic?> ResultTCS { get; }
    internal Toast? ToastReference { get; set; }
}
