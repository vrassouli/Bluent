

using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services.Abstractions;

public interface IDomHelper
{
    ValueTask<bool> CanInstallPwaAsync();
    Task DownloadAsync(string fileName, Stream stream);
    Task EvalVoidAsync(string script);
    Task ExitFullscreen();
    ValueTask<string> GetBrowserInfoAsync();
    ValueTask<string> GetOsInfoAsync();
    ValueTask<bool> InstallPwaAsync();
    Task InvokeClickEvent(string selector);
    Task InvokeClickEvent(ElementReference element);
    ValueTask<bool> IsMobileAsync();
    ValueTask<bool> IsPwaInstalledAsync();
    ValueTask<bool> MatchMediaAsync(string mediaQuery);
    Task RequestFullscreen(string selector);
}
