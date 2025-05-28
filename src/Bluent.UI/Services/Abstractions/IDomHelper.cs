

namespace Bluent.UI.Services.Abstractions;

public interface IDomHelper
{
    Task DownloadAsync(string fileName, Stream stream);
    Task EvalVoidAsync(string script);
    Task ExitFullscreen();
    void InvokeClickEvent(string selector);
    ValueTask<bool> MatchMediaAsync(string mediaQuery);
    Task RequestFullscreen(string selector);
}
