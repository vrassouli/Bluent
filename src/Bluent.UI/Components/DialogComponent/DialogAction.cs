namespace Bluent.UI.Components.DialogComponent;

public class DialogAction
{
    public DialogAction(string text, object? result, bool primary = false, string? formToSumbit = null, Action<Dialog, object?>? callback = null)
    {
        Text = text;
        Result = result;
        Primary = primary;
        FormToSumbit = formToSumbit;
        Callback = callback;
    }

    public string Text { get; }
    public object? Result { get; }
    public bool Primary { get; }
    public string? FormToSumbit { get; }
    public Action<Dialog, object?>? Callback { get; }
}
