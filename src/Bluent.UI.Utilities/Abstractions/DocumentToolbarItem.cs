namespace Bluent.UI.Utilities.Abstractions;

public abstract class DocumentToolbarItem
{
}

public sealed class DocumentToolbarDivider : DocumentToolbarItem
{
}

public sealed class DocumentToolbarCommand : DocumentToolbarItem
{
    public IconDefinition Icon { get; }
    public Func<Task> OnClick { get; set; }
    
    public string? Text { get; set; }
    public string? Tooltip { get; set; }
    public Func<bool> CanExecute { get; set; } = () => true;

    public DocumentToolbarCommand(IconDefinition icon, Func<Task> onClick)
    {
        Icon = icon;
        OnClick = onClick;
    }
}