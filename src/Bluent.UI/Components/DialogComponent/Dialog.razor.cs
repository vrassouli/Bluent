using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Bluent.UI.Components;

public partial class Dialog
{
    private bool _hiding;
    private bool _closeNotified;
    private ElementReference _root;
    private IJSObjectReference? _keyboardModule;
    private DotNetObjectReference<Dialog>? _keyboardReference;
    [Inject] private IServiceProvider Services { get; set; } = default!;
    private object? _result;
    [Parameter] public string? AccessibleName { get; set; }
    [Parameter] public string? CloseButtonLabel { get; set; }
    [Parameter] public bool IsModal { get; set; }
    [Parameter] public bool EnableModalKeyboard { get; set; }
    [Parameter] public string? InitialFocusTargetId { get; set; }
    [Parameter] public bool UseStandardTitleHeading { get; set; }
    internal string AccessibleHeadingId => $"{Id}_title";
    internal string AccessibleDescriptionId => $"{Id}_description";
    [Parameter] public string? AccessibleDescription { get; set; }
    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
    [Parameter] public DialogSize Size { get; set; } = DialogSize.Medium;
    [Parameter] public EventCallback<dynamic?> OnClose { get; set; }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        await base.OnAfterRenderAsync(firstRender);
        if (_hiding && !string.IsNullOrWhiteSpace(AccessibleName) && _keyboardModule is not null &&
            await _keyboardModule.InvokeAsync<bool>("hasZeroDialogAnimation", _root))
        {
            // A zero-duration animation is not guaranteed to fire animationend.
            // This fallback only applies to the explicit v3 interactive opt-in.
            await NotifyClosedOnceAsync();
        }
        if (!firstRender) return;
        if (!string.IsNullOrWhiteSpace(AccessibleName))
            await _root.FocusAsync();
        if (!string.IsNullOrWhiteSpace(AccessibleName) &&
            ((EnableModalKeyboard && IsModal) || !string.IsNullOrWhiteSpace(InitialFocusTargetId)))
        {
            var js = Services.GetService(typeof(IJSRuntime)) as IJSRuntime
                ?? throw new InvalidOperationException("Opt-in Dialog focus/keyboard features require IJSRuntime.");
            _keyboardModule = await js.InvokeAsync<IJSObjectReference>(
                "import", "./_content/Bluent.UI/v3/issue-418-dialog-focus.preview.js");
            if (EnableModalKeyboard && IsModal)
            {
                _keyboardReference = DotNetObjectReference.Create(this);
                await _keyboardModule.InvokeVoidAsync("registerModal", _root, _keyboardReference);
            }
            if (!string.IsNullOrWhiteSpace(InitialFocusTargetId))
                await _keyboardModule.InvokeVoidAsync("focusInitial", _root, InitialFocusTargetId);
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
                await _keyboardModule.InvokeVoidAsync("unregisterModal", Id);
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


    private async Task NotifyClosedOnceAsync()
    {
        if (!_hiding || _closeNotified) return;
        _closeNotified = true;
        await OnClose.InvokeAsync(_result);
    }

    private void AnimationEndedHandler()
    {
        if (!_hiding) return;
        // Preserve the legacy fire-and-forget dispatch in all non-opted-in
        // v2 paths; the once-only notification is v3 opt-in.
        if (string.IsNullOrWhiteSpace(AccessibleName))
            InvokeAsync(() => OnClose.InvokeAsync(_result));
        else
            _ = InvokeAsync(NotifyClosedOnceAsync);
    }
}
