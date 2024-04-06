﻿using Bluent.UI.Services;
using Bluent.UI.Services.Abstractions;
using Microsoft.Extensions.DependencyInjection;

namespace Bluent.UI.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBluentUI(this IServiceCollection services)
    {
        services.AddLocalization();

        services.AddSingleton<ITooltipService, TooltipService>();
        services.AddSingleton<IPopoverService, PopoverService>();

        return services;
    }
}
