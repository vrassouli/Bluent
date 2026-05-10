namespace Bluent.UI.Components.DialogComponent;

public class DialogAction
{
    public DialogAction(string text, object? result, bool primary = false, string? formToSubmit = null, Action<Dialog, object?>? callback = null)
    {
        Text = text;
        Result = result;
        Primary = primary;
        FormToSubmit = formToSubmit;
        Callback = callback;
    }

    public string Text { get; }
    public object? Result { get; }
    public bool Primary { get; }
    public string? FormToSubmit { get; }
    public Action<Dialog, object?>? Callback { get; }
}
