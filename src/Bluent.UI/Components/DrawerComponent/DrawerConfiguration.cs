using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public class DrawerConfiguration
{
    public DrawerConfiguration(DrawerPosition position = DrawerPosition.End,
                               bool modal = true)
    {
        Position = position;
        Modal = modal;
    }

    public DrawerPosition Position { get; }
    public bool Modal { get; }
}
