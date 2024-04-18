using Bluent.UI.Components;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services.Abstractions;

public interface IDrawerService
{
    Task<dynamic?> ShowAsync(RenderFragment content, DrawerConfiguration? config = null);
    Task<dynamic?> ShowAsync<TContentComponent>(IDictionary<string, object?>? parameters = null,
                                                DrawerConfiguration? config = null) where TContentComponent : ComponentBase;
    Task<dynamic?> ShowAsync<TContentComponent>(string title,
                                                IDictionary<string, object?>? parameters = null,
                                                Action<DrawerConfigurator>? builder = null) where TContentComponent : ComponentBase;
}