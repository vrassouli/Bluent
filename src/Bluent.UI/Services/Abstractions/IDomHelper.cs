

using Bluent.Core;
using Bluent.UI.Interops.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

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
    ValueTask<DomRect?> GetBoundingClientRectAsync(string selector);
    Task RequestFullscreen(string selector);
    Task RegisterPointerMoveHandler<THandler>(THandler component)
        where THandler : IPointerMoveEventHandler, IBluentComponent;
    Task UnregisterPointerMoveHandler<THandler>(THandler component)
        where THandler : IPointerMoveEventHandler, IBluentComponent;
    Task RegisterPointerUpHandler<THandler>(THandler component)
        where THandler : IPointerUpEventHandler, IBluentComponent;
    Task UnregisterPointerUpHandler<THandler>(THandler component)
        where THandler : IPointerUpEventHandler, IBluentComponent;
}
