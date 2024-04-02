using Bluent.UI.Interops;
using Bluent.UI.Interops.Abstractions;
using Bluent.UI.Services;
using Bluent.UI.Services.Abstractions;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBluentUI(this IServiceCollection services)
    {
        services.AddSingleton<ITooltipInteropService, TooltipInteropService>();
        services.AddSingleton<ITooltipService, TooltipService>();
        services.AddSingleton<IPopoverService, PopoverService>();

        return services;
    }
}
