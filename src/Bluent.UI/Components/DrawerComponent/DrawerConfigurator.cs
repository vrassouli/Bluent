namespace Bluent.UI.Components;

public class DrawerConfigurator
{
    private DrawerPosition _position = DrawerPosition.End;
    private bool _modal = true;
    private bool _showCloseButton = true;

    public DrawerConfigurator SetPosition(DrawerPosition position)
    {
        _position = position;

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

    internal DrawerConfiguration Configuration => new DrawerConfiguration(_position, _modal);
    internal bool ShowCloseButton => _showCloseButton;
}
