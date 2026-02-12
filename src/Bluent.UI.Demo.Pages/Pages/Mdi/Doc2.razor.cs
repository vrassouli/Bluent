using Bluent.Core;
using Bluent.UI.Components.PropertyEditorComponent;
using Bluent.UI.Utilities.Abstractions;
using Bluent.UI.Utilities.Services;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Demo.Pages.Pages.Mdi;

public partial class Doc2 : IMdiDocument, IDisposable
{
    private bool _loaded;

    public string Title => _loaded ? "Document 2" : "Waiting...";
    public string Icon => "icon-ic_fluent_vehicle_car_profile_20_regular";
    public List<DocumentToolbarItem> Items { get; }

    public int Counter { get; set; }

    [Parameter] public CommandManager CommandManager { get; set; } = default!;
    [Inject] private IMdiService MdiService { get; set; } = default!;
    
    public Doc2()
    {
        Items =
        [
            new DocumentToolbarCommand("icon-ic_fluent_add_circle_20_regular", OnIncreaseValue)
            {
                Text = "Increase",
                Tooltip = "Increase Value",
                ActiveIcon = "icon-ic_fluent_add_circle_20_filled",
                CanExecute = CanIncreaseValue
            },
            new DocumentToolbarCommand("icon-ic_fluent_subtract_circle_20_regular", OnDecreaseValue)
            {
                Text = "Decrease",
                Tooltip = "Decrease Value",
                ActiveIcon = "icon-ic_fluent_subtract_circle_20_filled",
                CanExecute = CanDecreaseValue
            }
        ];
    }
    
    #region Toolbar Commands

    private Task OnIncreaseValue()
    {
        CommandManager.Do(new SetPropertyCommand(this, Counter + 1, GetType().GetProperty(nameof(Counter))!));
        return Task.CompletedTask;
    }

    private bool CanIncreaseValue() => true;

    private Task OnDecreaseValue()
    {
        CommandManager.Do(new SetPropertyCommand(this, Counter - 1, GetType().GetProperty(nameof(Counter))!));
        return Task.CompletedTask;
    }

    private bool CanDecreaseValue() => true;

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

    public void OnActivated()
    {
    }

    public void OnDeactivated()
    {
    }

}