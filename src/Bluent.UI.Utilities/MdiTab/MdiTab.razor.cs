using Bluent.Core;
using Bluent.UI.Components;
using Bluent.UI.Utilities.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Utilities;

public partial class MdiTab : IDisposable
{
    private CommandManager? _commandManager;

    //private DynamicComponent? _componentRef;
    private object? _instance;

    [Parameter, EditorRequired] public Type ComponentType { get; set; }
    [Parameter, EditorRequired] public string TabId { get; set; }
    [Parameter, EditorRequired] public Dictionary<string, object>? Parameters { get; set; }
    [Parameter, EditorRequired] public CommandManager? CommandManager { get; set; }
    [Parameter] public string? Class { get; set; }
    [CascadingParameter] public MdiTabList Parent { get; set; } = default!;
    [CascadingParameter] public Popover? Popover { get; set; }

    [Inject] private IMdiService MdiService { get; set; } = default!;

    public IMdiDocument? Document => _instance as IMdiDocument;

    private string Title
    {
        get
        {
            var title = Document?.Title ?? "Opening...";
            var cmdManager = GetCommandManager();

            if (cmdManager.HasChanges)
            {
                title += "*";
            }

            return title;
        }
    }

    private string? Icon => (_instance as IMdiDocument)?.Icon;

    protected override void OnInitialized()
    {
        if (Popover is null)
        {
            // See Tab.cs from Bluent.UI
            Parent.Add(this);
        }

        var commandManager = GetCommandManager();
        commandManager.CommandExecuted += OnCommandExecuted;
        commandManager.SavePointChanged += OnSavePointChanged;

        base.OnInitialized();
    }

    public void Dispose()
    {
        Parent.Remove(this);

        var commandManager = GetCommandManager();
        commandManager.CommandExecuted -= OnCommandExecuted;
        commandManager.SavePointChanged -= OnSavePointChanged;
    }

    private async Task CloseTab()
    {
        await Parent.CloseTab(this);
    }

    private IDictionary<string, object>? GetParameters()
    {
        var commandManager = GetCommandManager();

        if (Parameters is null)
        {
            return new Dictionary<string, object>
            {
                { nameof(CommandManager), commandManager }
            };
        }

        Parameters[nameof(CommandManager)] = commandManager;
        return Parameters;
    }

    private CommandManager GetCommandManager()
    {
        if (CommandManager is not null)
            return CommandManager;

        if (Parameters is not null &&
            Parameters.TryGetValue(nameof(CommandManager), out var cmdMan) &&
            cmdMan is CommandManager commandManager)
        {
            return commandManager;
        }

        if (_commandManager is null)
            _commandManager = new CommandManager();

        return _commandManager;
    }

    private void OnCommandExecuted(object? sender, EventArgs e)
    {
        StateHasChanged();
    }

    private void OnSavePointChanged(object? sender, EventArgs e)
    {
        StateHasChanged();
    }

    private void OnComponentCaptured(object componentInstance)
    {
        _instance = componentInstance;

        Parent.OnDocumentRendered(this);
    }
}