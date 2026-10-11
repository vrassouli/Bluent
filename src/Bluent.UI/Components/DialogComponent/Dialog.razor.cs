using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Bluent.UI.Components;

public partial class Dialog
{
    private bool _hiding;
    private ElementReference _root;
    private IJSObjectReference? _keyboardModule;
    private DotNetObjectReference<Dialog>? _keyboardReference;
    [Inject] private IServiceProvider Services { get; set; } = default!;
    private object? _result;
    [Parameter] public string? AccessibleName { get; set; }
    [Parameter] public string? CloseButtonLabel { get; set; }
    [Parameter] public bool IsModal { get; set; }
    [Parameter] public bool EnableModalKeyboard { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
    [Parameter] public DialogSize Size { get; set; } = DialogSize.Medium;
    [Parameter] public EventCallback<dynamic?> OnClose { get; set; }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);
        if (!firstRender) return;
        if (!string.IsNullOrWhiteSpace(AccessibleName))
            await _root.FocusAsync();
        if (EnableModalKeyboard && IsModal && !string.IsNullOrWhiteSpace(AccessibleName))
        {
            var js = Services.GetService(typeof(IJSRuntime)) as IJSRuntime
                ?? throw new InvalidOperationException("Opt-in modal keyboard navigation requires IJSRuntime.");
            _keyboardModule = await js.InvokeAsync<IJSObjectReference>(
                "import", "./_content/Bluent.UI/v3/issue-418-dialog-focus.preview.js");
            _keyboardReference = DotNetObjectReference.Create(this);
            await _keyboardModule.InvokeVoidAsync("registerModal", _root, _keyboardReference);
        }
    }

    [JSInvokable]
    public void DismissOnEscape()
    {
        if (EnableModalKeyboard && IsModal && !_hiding)
            Close();
    }

    public override async ValueTask DisposeAsync()
    {
        try
        {
            if (_keyboardModule is not null)
                await _keyboardModule.InvokeVoidAsync("unregisterModal", _root);
        }
        catch (JSDisconnectedException) { }
        finally
        {
            _keyboardReference?.Dispose();
            if (_keyboardModule is not null)
            {
                try { await _keyboardModule.DisposeAsync(); }
                catch (JSDisconnectedException) { }
            }
            await base.DisposeAsync();
        }
    }
    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-dialog";
        if (Size != DialogSize.Medium)
            yield return Size.ToString().Kebaberize();
        if (_hiding)
            yield return "hide";
    }

    public void Close(dynamic? result = null)
    {
        _hiding = true;
        _result = result;
        StateHasChanged();
    }


    private void AnimationEndedHandler()
    {
        if (_hiding)
        {
            InvokeAsync(() => OnClose.InvokeAsync(_result));
        }
    }
}
