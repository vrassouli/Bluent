using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public abstract class BluentComponentBase : ComponentBase, IDisposable
{
    //private CancellationTokenSource? _cancellationTokenSource;
    private Guid? _id;
    //private bool _shouldRender = true;
    //private int _busyCount;
    //public bool IsBusy => _busyCount > 0;
    [Parameter(CaptureUnmatchedValues = true)] public Dictionary<string, object>? AdditionalAttributes { get; set; }
    [Parameter] public string? Class { get; set; }
    [Parameter] public string? Style { get; set; }

    //protected CancellationTokenSource CancellationTokenSource
    //{
    //    get
    //    {
    //        _cancellationTokenSource ??= new CancellationTokenSource();

    //        return _cancellationTokenSource;
    //    }
    //}

    public string Id
    {
        get
        {
            var providedId = GetUserProvidedId();

            if (!string.IsNullOrEmpty(providedId))
                return providedId;

            _id ??= Guid.NewGuid();

            return $"_{_id}".Replace('-', '_');
        }
    }

    private string? GetUserProvidedId()
    {
        return AdditionalAttributes?.TryGetValue("id", out var attribute) is true ? attribute.ToString() : null;
    }

    //protected override bool ShouldRender()
    //{
    //    // Check the flag, and if it is false, return false
    //    // this is a one-time flag, and will be reset to true, for future renders.
    //    if (!_shouldRender)
    //    {
    //        _shouldRender = true;
    //        return false;
    //    }

    //    return base.ShouldRender();
    //}

    //protected void ShouldNotRender()
    //{
    //    _shouldRender = false;
    //}

    //protected void CancelToken()
    //{
    //    if (_cancellationTokenSource != null)
    //    {
    //        _cancellationTokenSource.Cancel();

    //        DestroyCancelationToken();
    //    }
    //}

    //protected void DestroyCancelationToken()
    //{
    //    if (_cancellationTokenSource != null)
    //    {
    //        _cancellationTokenSource.Dispose();
    //        _cancellationTokenSource = null;
    //    }
    //}

    //public void SetBusy(bool stateChanged = false)
    //{
    //    Interlocked.Increment(ref _busyCount);
    //    if (stateChanged)
    //        StateHasChanged();
    //}

    //public void SetIdeal(bool stateChanged = false)
    //{
    //    Interlocked.Decrement(ref _busyCount);
    //    //_busyCount--;

    //    if (stateChanged)
    //        StateHasChanged();
    //}

    public string GetComponentClass() => $"{string.Join(' ', GetClasses())} {Class}";
    public abstract IEnumerable<string> GetClasses();

    public virtual void Dispose()
    {
        //DestroyCancelationToken();
    }
}
