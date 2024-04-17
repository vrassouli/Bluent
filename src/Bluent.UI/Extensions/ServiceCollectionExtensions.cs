using Bluent.UI.Interops;
using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Services;
using Bluent.UI.Services.Abstractions;
using Microsoft.Extensions.DependencyInjection;

namespace Bluent.UI.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBluentUI(this IServiceCollection services)
    {
        services.AddLocalization();

        services.AddSingleton<IBluentTheme, BluentTheme>();
        services.AddSingleton<IDialogService, DialogService>();
        services.AddSingleton<IDrawerService, DrawerService>();
        services.AddSingleton<IPopoverService, PopoverService>();
        services.AddSingleton<IToastService, ToastService>();
        services.AddSingleton<ITooltipService, TooltipService>();

        return services;
    }
}
