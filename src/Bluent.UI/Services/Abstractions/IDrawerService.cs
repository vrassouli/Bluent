using Bluent.UI.Components;

namespace Bluent.UI.Services.Abstractions;

public interface IDrawerService
{
    Task<dynamic?> OpenAsync(DrawerConfiguration config);
}