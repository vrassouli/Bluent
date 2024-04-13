using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components.DrawerComponent;

public class DrawerConfiguration
{
    public DrawerConfiguration(RenderFragment content,
                               string? title = null,
                               bool dismissable = true,
                               DrawerPosition position = DrawerPosition.End,
                               bool modal = true)
    {
        Content = content;
        Title = title;
        Dismissable = dismissable;
        Position = position;
        Modal = modal;
    }

    public RenderFragment Content { get; }
    public string? Title { get; }
    public bool Dismissable { get; }
    public DrawerPosition Position { get; }
    public bool Modal { get; }
}
