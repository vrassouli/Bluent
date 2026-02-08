using Bluent.Core;
using Bluent.UI.MDI.Services;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.MDI;

public partial class MdiTab : IDisposable
{
    private CommandManager? _commandManager;
    private DynamicComponent? _componentRef;
    [Parameter, EditorRequired] public Type ComponentType { get; set; }
    [Parameter, EditorRequired] public string TabId { get; set; }
    [Parameter, EditorRequired] public Dictionary<string, object>? Parameters { get; set; }
    [Parameter, EditorRequired] public CommandManager? CommandManager { get; set; }
    [CascadingParameter] public MdiTabList Parent { get; set; } = default!;
    [Inject] private IMdiService MdiService { get; set; } = default!;
    
    public IMdiDocument? Document => _componentRef?.Instance as IMdiDocument;

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
    private string? Icon => (_componentRef?.Instance as IMdiDocument)?.Icon;

    protected override void OnInitialized()
    {
        Parent.Add(this);
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

    protected override void OnAfterRender(bool firstRender)
    {
#if DEBUG
        Console.WriteLine($"OnAfterRender {(firstRender ? "(first render)" : "")} ({GetType().Name})");
#endif
        base.OnAfterRender(firstRender);
    }

    private void CloseTab()
    {
        Parent.CloseTab(this);
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
            return  commandManager;
        }
 
        if (_commandManager is null)
            _commandManager = new CommandManager();
        
        return _commandManager;
    }
    
    
    private void OnCommandExecuted(object? sender, EventArgs e)
    {
        StateHasChanged();
        //MdiService.TabItemStateHasChanged();
    }

    private void OnSavePointChanged(object? sender, EventArgs e)
    {
        //MdiService.TabItemStateHasChanged();
    }
}