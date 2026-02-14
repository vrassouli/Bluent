using Bluent.UI.Utilities.Abstractions;
using Bluent.UI.Utilities.Services;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Utilities;

public partial class MdiTabToolbarItem : IDisposable
{
    private IMdiDocument? _document;
    [Parameter] public IMdiDocument? Document { get; set; }

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

    public void Dispose()
    {
        UnsetEvents();
    }

    private void UnsetEvents()
    {
        if (_document?.CommandManager is null)
            return;

        _document.CommandManager.CommandExecuted -= OnCommandExecuted;
        _document.CommandManager.SavePointChanged -= OnSaved;
    }

    private void SetEvents()
    {
        if (_document?.CommandManager is null)
            return;

        _document.CommandManager.CommandExecuted += OnCommandExecuted;
        _document.CommandManager.SavePointChanged += OnSaved;
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