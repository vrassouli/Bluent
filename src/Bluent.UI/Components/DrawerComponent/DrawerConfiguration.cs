namespace Bluent.UI.Components;

public class DrawerConfiguration
{
    public DrawerConfiguration(DrawerPosition position = DrawerPosition.End,
                               DrawerSize size = DrawerSize.Small,
                               bool modal = true)
    {
        Position = position;
        Size = size;
        Modal = modal;
    }

    public DrawerPosition Position { get; }
    public DrawerSize Size { get; }
    public bool Modal { get; }
}
