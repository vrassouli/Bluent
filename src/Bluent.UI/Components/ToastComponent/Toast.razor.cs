using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Toast
{
    private int? _duration;
    private bool _hiding;
    private object? _hideResult;
    private Timer? _timer;

    [Parameter] public RenderFragment? ChildContent { get; set; } = default!;
    [Parameter] public int? Duration { get; set; } = 2500;
    [Parameter] public ToastPlacement Placement { get; set; } = ToastPlacement.BottomEnd;
    [Parameter] public EventCallback<dynamic?> OnHide { get; set; }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-toast";
        if (_hiding)
            yield return "hide";
    }

    protected override void OnParametersSet()
    {
        if (_duration != Duration)
        {
            SetTimer();
            _duration = Duration;
        }

        base.OnParametersSet();
    }

    public void Hide(dynamic? result)
    {
        _hiding = true;
        _hideResult = result;
        StateHasChanged();
    }

    private void AnimationEndedHandler()
    {
        if (_hiding)
        {
            InvokeAsync(() => OnHide.InvokeAsync(_hideResult));
        }
    }

    private void SetTimer()
    {
        DisposeTimer();
        if (Duration != null)
        {
            _timer = new Timer(OnTimerTick, null, Duration.Value, Timeout.Infinite);            
        }
    }

    private void OnTimerTick(object? state)
    {
        Hide(null);
    }

    private void DisposeTimer()
    {
        _timer?.Dispose();
    }

    public override void Dispose()
    {
        DisposeTimer();
        base.Dispose();
    }
}
