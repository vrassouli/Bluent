using Bluent.UI.Utilities.Abstractions;
using Bluent.UI.Utilities.Services;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Utilities;

public partial class MdiTabToolbarItem : IAsyncDisposable
{
    private IMdiDocument? _document;
    [Parameter] public IMdiDocument? Document { get; set; }
    [Inject] private IMdiService MdiService { get; set; } = default!;


    protected override void OnParametersSet()
    {
        if (_document != Document)
        {
            UnsetEvents();

            _document = Document;

            SetEvents();
        }

        base.OnParametersSet();
    }


    public ValueTask DisposeAsync()
    {
        UnsetEvents();
        
        return new ValueTask();
    }

    private void UnsetEvents()
    {
        if (MdiService is MdiService mdiService)
            mdiService.OnTabItemStateChanged -= OnTabItemStateChanged;
            
        if (_document?.CommandManager is not null)
        {
            _document.CommandManager.CommandExecuted -= OnCommandExecuted;
            _document.CommandManager.SavePointChanged -= OnSaved;
        }
    }

    private void SetEvents()
    {
        if (MdiService is MdiService mdiService)
            mdiService.OnTabItemStateChanged += OnTabItemStateChanged;

        if (_document?.CommandManager is not null)
        {
            _document.CommandManager.CommandExecuted += OnCommandExecuted;
            _document.CommandManager.SavePointChanged += OnSaved;
        }
    }

    private void OnTabItemStateChanged(object? sender, EventArgs e)
    {
        StateHasChanged();
    }

    private void OnSaved(object? sender, EventArgs e)
    {
        StateHasChanged();
    }

    private void OnCommandExecuted(object? sender, EventArgs e)
    {
        StateHasChanged();
    }
}