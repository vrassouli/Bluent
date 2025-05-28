using Bluent.UI.Interops;
using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Services;
using Bluent.UI.Services.Abstractions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Bluent.UI.Extensions;

public static class ServiceCollectionExtensions
{
    #region Scoped Service

    public static IServiceCollection AddBluentUI(this IServiceCollection services)
    {
        services.AddLocalization();

        AddBluentThemeAsScoped(services);
        AddBluentDialogServiceAsScoped(services);
        AddBluentDrawerServiceAsScoped(services);
        AddBluentPopoverServiceAsScoped(services);
        AddBluentToastServiceAsScoped(services);
        AddBluentTooltipServiceAsScoped(services);

        return services;
    }

    public static void AddBluentTooltipServiceAsScoped(IServiceCollection services)
    {
        services.AddScoped<ITooltipService, TooltipService>();
    }

    public static void AddBluentToastServiceAsScoped(IServiceCollection services)
    {
        services.AddScoped<IToastService, ToastService>();
    }

    public static void AddBluentPopoverServiceAsScoped(IServiceCollection services)
    {
        services.AddScoped<IPopoverService, PopoverService>();
    }

    public static void AddBluentDrawerServiceAsScoped(IServiceCollection services)
    {
        services.AddScoped<IDrawerService, DrawerService>();
    }

    public static void AddBluentDialogServiceAsScoped(IServiceCollection services)
    {
        services.AddScoped<IDialogService, DialogService>();
    }

    public static void AddBluentThemeAsScoped(IServiceCollection services)
    {
        services.AddScoped<IBluentTheme, BluentTheme>();
    }

    #endregion

    #region Singleton Service

    public static IServiceCollection AddBluentUIAsSingleton(this IServiceCollection services)
    {
        services.AddLocalization();

        AddBluentThemeAsSingleton(services);
        AddBluentDialogServiceAsSingleton(services);
        AddBluentDrawerServiceAsSingleton(services);
        AddBluentPopoverServiceAsSingleton(services);
        AddBluentToastServiceAsSingleton(services);
        AddBluentTooltipServiceAsSingleton(services);

        return services;
    }

    public static void AddBluentTooltipServiceAsSingleton(IServiceCollection services)
    {
        services.AddSingleton<ITooltipService, TooltipService>();
    }

    public static void AddBluentToastServiceAsSingleton(IServiceCollection services)
    {
        services.AddSingleton<IToastService, ToastService>();
    }

    public static void AddBluentPopoverServiceAsSingleton(IServiceCollection services)
    {
        services.AddSingleton<IPopoverService, PopoverService>();
    }

    public static void AddBluentDrawerServiceAsSingleton(IServiceCollection services)
    {
        services.AddSingleton<IDrawerService, DrawerService>();
    }

    public static void AddBluentDialogServiceAsSingleton(IServiceCollection services)
    {
        services.AddSingleton<IDialogService, DialogService>();
    }

    public static void AddBluentThemeAsSingleton(IServiceCollection services)
    {
        services.AddSingleton<IBluentTheme, BluentTheme>();
    }

    #endregion
}
