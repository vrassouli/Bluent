using Bluent.UI.MDI.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Bluent.UI.MDI.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBluentMdi(this IServiceCollection services, ServiceLifetime lifetime = ServiceLifetime.Scoped)
    {
        services.AddService<IMdiService, MdiService>(lifetime);

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
