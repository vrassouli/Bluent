using Bluent.UI.Components.DrawerComponent;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Services.Abstractions;

public interface IDrawerService
{
    Task<dynamic?> OpenAsync(DrawerConfiguration config);
}