using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using System.Diagnostics.CodeAnalysis;

namespace Bluent.UI.Components;

public partial class TextField : IAsyncDisposable
{
    [Inject] private IJSRuntime JsRuntime { get; set; } = default!;

    [Parameter] public int? Rows { get; set; }
    [Parameter] public bool ResizeTextarea { get; set; }
    [Parameter] public bool GainFocus { get; set; }
    [Parameter] public bool DigitOnly { get; set; }
    [Parameter] public bool AsciiDigits { get; set; }
    [Parameter] public bool ArabicToPersianConversion { get; set; }

    private Task<IJSObjectReference>? _moduleTask;
    private IJSObjectReference? _module;
    private string? _sourceValueForSelection;
    private bool _selectionMappingRequired;
    private PendingTextSelection? _pendingSelection;
    private bool _disposed;

    protected string? ValueStringProxy
    {
        get => CurrentValueAsString;
        set
        {
            var normalized = TextFieldValuePipeline.Normalize(
                value,
                DigitOnly,
                AsciiDigits,
                ArabicToPersianConversion);

            _sourceValueForSelection = value;
            _selectionMappingRequired = !string.Equals(value, normalized, StringComparison.Ordinal);
            _pendingSelection = null;
            CurrentValueAsString = normalized;
        }
    }

    private async Task OnValueBoundAsync()
    {
        if (!_selectionMappingRequired || _disposed || Element is null)
            return;

        _selectionMappingRequired = false;
        var module = await GetModuleAsync();
        if (module is null || _disposed)
            return;

        var selection = await module.InvokeAsync<NativeTextSelection?>("getTextSelection", Element.Value);
        if (selection is null)
            return;

        var mapped = TextFieldValuePipeline.NormalizeWithSelection(
            _sourceValueForSelection,
            selection.Start,
            selection.End,
            DigitOnly,
            AsciiDigits,
            ArabicToPersianConversion);

        if (mapped.SelectionStart is not int start || mapped.SelectionEnd is not int end)
            return;

        _pendingSelection = new PendingTextSelection(start, end, selection.Direction);
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender && Element is not null)
        {
            var trackingModule = await GetModuleAsync();
            if (trackingModule is not null && !_disposed)
                await trackingModule.InvokeVoidAsync("trackTextSelection", Element.Value);

            if (GainFocus && !_disposed)
                await Element.Value.FocusAsync();
        }

        if (_pendingSelection is { } selection && Element is not null && !_disposed)
        {
            _pendingSelection = null;
            var module = await GetModuleAsync();
            if (module is not null && !_disposed)
            {
                await module.InvokeVoidAsync(
                    "setTextSelection",
                    Element.Value,
                    selection.Start,
                    selection.End,
                    selection.Direction);
            }
        }

        await base.OnAfterRenderAsync(firstRender);
    }

    private async Task<IJSObjectReference?> GetModuleAsync()
    {
        if (_disposed)
            return null;

        _moduleTask ??= JsRuntime.InvokeAsync<IJSObjectReference>(
            "import",
            "./_content/Bluent.UI/bluent.ui.js").AsTask();

        var module = await _moduleTask;
        if (_disposed)
        {
            await module.DisposeAsync();
            return null;
        }

        return _module ??= module;
    }

    async ValueTask IAsyncDisposable.DisposeAsync()
    {
        _disposed = true;
        _pendingSelection = null;

        try
        {
            if (_module is not null)
            {
                if (Element is not null)
                    await _module.InvokeVoidAsync("stopTrackingTextSelection", Element.Value);

                await _module.DisposeAsync();
            }
        }
        catch (JSDisconnectedException)
        {
            // InteractiveServer circuits can disconnect before component disposal.
        }
        finally
        {
            _module = null;
            _moduleTask = null;
        }
    }

    protected override IEnumerable<string> GetClasses()
    {
        foreach (var c in base.GetClasses())
            yield return c;

        yield return "bui-text-field";

        if (Rows != null && !ResizeTextarea)
            yield return "no-resize";
    }

    protected override bool TryParseValueFromString(string? value, out string? result, [NotNullWhen(false)] out string? validationErrorMessage)
    {
        result = value;
        validationErrorMessage = null;
        return true;
    }

    private sealed record NativeTextSelection(int Start, int End, string Direction);
    private sealed record PendingTextSelection(int Start, int End, string Direction);
}