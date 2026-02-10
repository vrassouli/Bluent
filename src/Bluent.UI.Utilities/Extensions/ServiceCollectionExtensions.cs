using Bluent.UI.Utilities.Abstractions;
using Bluent.UI.Utilities.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Bluent.UI.Utilities.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBluentUtilities(this IServiceCollection services, ServiceLifetime lifetime = ServiceLifetime.Scoped)
    {
        services.AddService<IMdiService, MdiService>(lifetime);
        services.AddService<IBusyIndicator, BusyIndicator>(lifetime);

        return services;
    }
    
    
    private static void AddService<TService, TImplementation>(this IServiceCollection services, ServiceLifetime lifetime)
        where TService : class 
        where TImplementation : class, TService
    {
        var item = new ServiceDescriptor(typeof(TService), typeof(TImplementation), lifetime);

        services.Add(item);
    }
}
