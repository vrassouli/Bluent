using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components.DialogComponent;

internal class DialogContext
{
    public DialogContext(string title, RenderFragment content, DialogConfiguration config)
    {
        Title = title;
        Content = content;
        Config = config;
        ResultTCS = new TaskCompletionSource<dynamic?>();
    }

    public string Title { get; }
    public RenderFragment Content { get; }
    public DialogConfiguration Config { get; }
    internal TaskCompletionSource<dynamic?> ResultTCS { get; }
    internal Dialog? DialogReference { get; set; }
}
