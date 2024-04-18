using Bluent.UI.Components;

public class DialogConfiguration
{
    public DialogConfiguration(bool modal = true, DialogSize size = DialogSize.Medium)
    {
        Modal = modal;
        Size = size;
    }

    public bool Modal { get; }
    public DialogSize Size { get; }
}
