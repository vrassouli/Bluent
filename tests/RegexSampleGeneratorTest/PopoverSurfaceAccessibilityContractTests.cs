using Bluent.UI.Components;
using Bluent.UI.Components.PopoverComponent;
using Bluent.UI.Extensions;
using Bluent.UI.Services;
using Bluent.UI.Services.Abstractions;
using System.Reflection;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace RegexSampleGeneratorTest;

public sealed class PopoverSurfaceAccessibilityContractTests
{
    [Test]
    public void NameRequiresANameableRoleAndOnlyOneNameSource()
    {
        Assert.Throws<ArgumentException>(() => PopoverSurfaceAccessibilityContract.Validate(null, "Calendar", null));
        Assert.Throws<ArgumentException>(() => PopoverSurfaceAccessibilityContract.Validate("generic", "Calendar", null));
        Assert.Throws<ArgumentException>(() => PopoverSurfaceAccessibilityContract.Validate("dialog", "Calendar", "calendar-heading"));
        Assert.Throws<ArgumentException>(() => PopoverSurfaceAccessibilityContract.Validate("dialog panel", null, null));
        Assert.Throws<ArgumentException>(() => PopoverSurfaceAccessibilityContract.Validate("dialogg", null, null));
        Assert.Throws<ArgumentException>(() => PopoverSurfaceAccessibilityContract.Validate("command", null, null));
        Assert.Throws<ArgumentException>(() => PopoverSurfaceAccessibilityContract.Validate("window", null, null));
        Assert.Throws<ArgumentException>(() => PopoverSurfaceAccessibilityContract.Validate("directory", null, null));
        Assert.Throws<ArgumentException>(() => PopoverSurfaceAccessibilityContract.Validate("caption", "Caption", null));
        Assert.Throws<ArgumentException>(() => PopoverSurfaceAccessibilityContract.Validate("generic", "Named generic", null));
        Assert.Throws<ArgumentException>(() => PopoverSurfaceAccessibilityContract.Validate("dialog", null, null));
        Assert.Throws<ArgumentException>(() => PopoverSurfaceAccessibilityContract.Validate("tooltip", null, null));
        Assert.Throws<ArgumentException>(() => PopoverSurfaceAccessibilityContract.Validate("dialog", " ", null));
    }

    [Test]
    public void ExplicitRoleAndEitherNameSourceAreAccepted()
    {
        Assert.DoesNotThrow(() => PopoverSurfaceAccessibilityContract.Validate("group", null, null));
        Assert.DoesNotThrow(() => PopoverSurfaceAccessibilityContract.Validate("generic", null, null));
        Assert.DoesNotThrow(() => PopoverSurfaceAccessibilityContract.Validate("tooltip", "Help", null));
        Assert.DoesNotThrow(() => PopoverSurfaceAccessibilityContract.Validate("alert", null, null));
        Assert.DoesNotThrow(() => PopoverSurfaceAccessibilityContract.Validate("list", null, null));
        Assert.DoesNotThrow(() => PopoverSurfaceAccessibilityContract.Validate("status", null, null));
        Assert.DoesNotThrow(() => PopoverSurfaceAccessibilityContract.Validate("dialog", "Calendar", null));
        Assert.DoesNotThrow(() => PopoverSurfaceAccessibilityContract.Validate("dialog", null, "calendar-heading calendar-subtitle"));
    }

    [Test]
    public async Task SurfaceForwardsExplicitRoleAndNameToActualDetachedRoot()
    {
        var markup = await RenderSurfaceAsync(new PopoverConfiguration(
            new PopoverSettings("calendar-trigger", Placement.Bottom, 6, 5),
            displayArrow: false,
            PopoverAppearance.Default,
            keepSurface: true)
        {
            SurfaceRole = "dialog",
            SurfaceAriaLabelledBy = "calendar-heading"
        });

        Assert.That(markup, Does.Contain("id=\"calendar-trigger_surface\""));
        Assert.That(markup, Does.Contain("role=\"dialog\""));
        Assert.That(markup, Does.Contain("aria-labelledby=\"calendar-heading\""));
        Assert.That(markup, Does.Not.Contain("aria-modal="));
        Assert.That(markup, Does.Not.Contain("aria-haspopup="));
    }

    [Test]
    public async Task UnconfiguredSurfaceRemainsRolelessAndUnnamed()
    {
        var markup = await RenderSurfaceAsync(new PopoverConfiguration(
            new PopoverSettings("generic-trigger", Placement.Bottom, 6, 5),
            displayArrow: false,
            PopoverAppearance.Default,
            keepSurface: true));

        Assert.That(markup, Does.Contain("id=\"generic-trigger_surface\""));
        Assert.That(markup, Does.Not.Contain("role="));
        Assert.That(markup, Does.Not.Contain("aria-label="));
        Assert.That(markup, Does.Not.Contain("aria-labelledby="));
    }

    [Test]
    public async Task ParentParameterChangesRefreshTheRegisteredDetachedSurface()
    {
        await using var services = new ServiceCollection()
            .AddSingleton<ILoggerFactory>(NullLoggerFactory.Instance)
            .AddBluentUI()
            .BuildServiceProvider();
        var service = (Bluent.UI.Services.PopoverService)services.GetRequiredService<IPopoverService>();
        var popover = new Popover();
        typeof(Popover).GetProperty("PopoverService", BindingFlags.Instance | BindingFlags.NonPublic)!
            .SetValue(popover, service);

        var settings = new PopoverSettings("live-trigger", Placement.Bottom, 6, 5);
        var configuration = new PopoverConfiguration(settings, false, PopoverAppearance.Default, true);
        typeof(Popover).GetField("_configuration", BindingFlags.Instance | BindingFlags.NonPublic)!
            .SetValue(popover, configuration);
        typeof(Popover).GetField("_settings", BindingFlags.Instance | BindingFlags.NonPublic)!
            .SetValue(popover, settings);
        typeof(Popover).GetField("_triggerAlreadySet", BindingFlags.Instance | BindingFlags.NonPublic)!
            .SetValue(popover, true);

        var refreshes = 0;
        service.OnRefreshSurface += (_, args) =>
        {
            Assert.That(args.TriggerId, Is.EqualTo("live-trigger"));
            refreshes++;
        };

        typeof(Popover).GetProperty(nameof(Popover.SurfaceRole))!
            .SetValue(popover, "dialog");
        typeof(Popover).GetProperty(nameof(Popover.SurfaceAriaLabelledBy))!
            .SetValue(popover, "calendar-heading");
        typeof(Popover).GetProperty(nameof(Popover.Surface))!
            .SetValue(popover, (RenderFragment)(builder => builder.AddContent(0, "updated calendar")));
        await InvokeOnParametersSetAsync(popover);

        Assert.Multiple(() =>
        {
            Assert.That(configuration.SurfaceRole, Is.EqualTo("dialog"));
            Assert.That(configuration.SurfaceAriaLabelledBy, Is.EqualTo("calendar-heading"));
            Assert.That(refreshes, Is.EqualTo(1));
            Assert.That(typeof(PopoverSettings).GetProperty("SurfaceRole"), Is.Null,
                "DOM-only semantics must stay out of JS-serialized positioning settings.");
        });
    }

    private static Task InvokeOnParametersSetAsync(Popover popover)
    {
        var method = typeof(Popover).GetMethod("OnParametersSet", BindingFlags.Instance | BindingFlags.NonPublic)!;
        method.Invoke(popover, null);
        return Task.CompletedTask;
    }

    private static async Task<string> RenderSurfaceAsync(PopoverConfiguration config)
    {
        await using var services = new ServiceCollection()
            .AddSingleton<ILoggerFactory>(NullLoggerFactory.Instance)
            .AddBluentUI()
            .BuildServiceProvider();
        await using var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());
        var context = new PopoverContext(builder => builder.AddContent(0, "surface content"), config);
        string html = string.Empty;
        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var rendered = await renderer.RenderComponentAsync<PopoverSurface>(ParameterView.FromDictionary(
                new Dictionary<string, object?> { [nameof(PopoverSurface.Context)] = context }));
            await rendered.QuiescenceTask;
            html = rendered.ToHtmlString();
        });
        return html;
    }
}
