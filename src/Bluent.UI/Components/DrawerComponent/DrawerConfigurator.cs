namespace Bluent.UI.Components;

public class DrawerConfigurator
{
    private DrawerPosition _position = DrawerPosition.End;
    private DrawerSize _size = DrawerSize.Small;
    private bool _modal = true;
    private bool _showCloseButton = true;

    public DrawerConfigurator SetPosition(DrawerPosition position)
    {
        _position = position;

        return this;
    }

    public DrawerConfigurator SetSize(DrawerSize size)
    {
        _size = size;

        return this;
    }

    public DrawerConfigurator SetModal(bool modal)
    {
        _modal = modal;

        return this;
    }

    public DrawerConfigurator SetCloseButton(bool show)
    {
        _showCloseButton = show;

        return this;
    }

    internal DrawerConfiguration Configuration => new DrawerConfiguration(_position, _size, _modal);
    internal bool ShowCloseButton => _showCloseButton;
}
