

namespace Bluent.UI.Services.Abstractions;

public interface IDomHelper
{
    ValueTask<bool> CanInstallPwaAsync();
    Task DownloadAsync(string fileName, Stream stream);
    Task EvalVoidAsync(string script);
    Task ExitFullscreen();
    ValueTask<string> GetBrowserInfoAsync();
    ValueTask<bool> InstallPwaAsync();
    void InvokeClickEvent(string selector);
    ValueTask<bool> IsPwaInstalledAsync();
    ValueTask<bool> MatchMediaAsync(string mediaQuery);
    Task RequestFullscreen(string selector);
}
