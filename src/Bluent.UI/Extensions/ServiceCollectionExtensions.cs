using Bluent.UI.Interops;
using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Services;
using Bluent.UI.Services.Abstractions;
using Microsoft.Extensions.DependencyInjection;

namespace Bluent.UI.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBluentUI(this IServiceCollection services, ServiceLifetime lifetime = ServiceLifetime.Scoped)
    {
        services.AddLocalization();
        services.AddService<IBluentTheme, BluentTheme>(lifetime);
        services.AddService<IDomHelper, DomHelper>(lifetime);
        services.AddService<IDialogService, DialogService>(lifetime);
        services.AddService<IDrawerService, DrawerService>(lifetime);
        services.AddService<IPopoverService, PopoverService>(lifetime);
        services.AddService<IToastService, ToastService>(lifetime);
        services.AddService<ITooltipService, TooltipService>(lifetime);

        return services;
    }

    public static void AddService<TService, TImplementation>(this IServiceCollection services, ServiceLifetime lifetime)
        where TService : class 
        where TImplementation : class, TService
    {
        var item = new ServiceDescriptor(typeof(TService), typeof(TImplementation), lifetime);

        services.Add(item);
    }
}
