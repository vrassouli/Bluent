using Bluent.Core;
using Bluent.UI.Components.PropertyEditorComponent;
using Bluent.UI.Utilities.Abstractions;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Demo.Pages.Pages.Mdi;

public partial class Doc1 : IMdiDocument, IDisposable
{
    private bool _loaded;

    public string Title => _loaded ? "Document 1" : "Waiting...";
    public string Icon => "icon-ic_fluent_tree_deciduous_20_regular";
    public List<DocumentToolbarItem> Items { get; }
    
    public int Counter { get; set; }

    [Parameter] public CommandManager CommandManager { get; set; } = default!;
    [Inject] private IMdiService MdiService { get; set; } = default!;

    public Doc1()
    {
        Items =
        [
            new DocumentToolbarCommand("icon-ic_fluent_save_20_regular", OnSaveAsync)
            {
                Text = "Save",
                Tooltip = "Save the document",
                ActiveIcon = "icon-ic_fluent_save_20_filled",
                CanExecute = CanSave
            }
        ];
    }

    #region Toolbar Commands

    private Task OnSaveAsync()
    {
        CommandManager.SetSavePoint();
        return Task.CompletedTask;
    }

    private bool CanSave() => CommandManager.HasChanges;

    #endregion

    protected override async Task OnInitializedAsync()
    {
        await LoadAsync();
        CommandManager.CommandExecuted += OnCommandExecuted;
        await base.OnInitializedAsync();
    }

    public void Dispose()
    {
        CommandManager.CommandExecuted -= OnCommandExecuted;
    }

    private void OnCommandExecuted(object? sender, EventArgs e)
    {
        StateHasChanged();
    }

    protected override void OnAfterRender(bool firstRender)
    {
#if DEBUG
        Console.WriteLine($"OnAfterRender {(firstRender ? "(first render)" : "")} ({GetType().Name})");
#endif
        base.OnAfterRender(firstRender);
    }

    private async Task LoadAsync()
    {
        // Simulate remote document loading...
        await Task.Delay(1000);
        _loaded = true;
        MdiService.TabItemStateHasChanged();
    }

    private void OnIncrease()
    {
        CommandManager.Do(new SetPropertyCommand(this, Counter + 1, GetType().GetProperty(nameof(Counter))!));
    }

    public void OnActivated()
    {
    }

    public void OnDeactivated()
    {
    }
}