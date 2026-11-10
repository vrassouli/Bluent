using Bluent.UI.Components;
using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace RegexSampleGeneratorTest;

public class LinkRenderSemanticsTests
{
    [TestCase(null)]
    [TestCase("")]
    [TestCase("   ")]
    public async Task NullEmptyAndWhitespaceHrefUseNativeActionButton(string? href)
    {
        var markup = await RenderLinkAsync(new Dictionary<string, object?>
        {
            [nameof(Link.Text)] = "Run action",
            [nameof(Link.Href)] = href,
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("<button"));
            Assert.That(markup, Does.Contain("type=\"button\""));
            Assert.That(markup, Does.Not.Contain("<a "));
            Assert.That(markup, Does.Not.Contain("href="));
        });
    }

    [Test]
    public async Task EnabledNavigationUsesNativeAnchorAndPreservesBrowserAttributes()
    {
        var markup = await RenderLinkAsync(new Dictionary<string, object?>
        {
            [nameof(Link.Text)] = "Read documentation",
            [nameof(Link.Href)] = "/docs",
            [nameof(Link.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["target"] = "_blank",
                ["rel"] = "noopener",
                ["data-qa"] = "docs-link",
                ["title"] = "Open documentation",
            },
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("<a "));
            Assert.That(markup, Does.Contain("href=\"/docs\""));
            Assert.That(markup, Does.Not.Contain("type=\"button\""));
            Assert.That(markup, Does.Contain("target=\"_blank\""));
            Assert.That(markup, Does.Contain("rel=\"noopener\""));
            Assert.That(markup, Does.Contain("data-qa=\"docs-link\""));
            Assert.That(markup, Does.Contain("title=\"Open documentation\""));
        });
    }

    [Test]
    public async Task DisabledNavigationRemainsNamedFocusableAndDoesNotExposeDestination()
    {
        var markup = await RenderLinkAsync(new Dictionary<string, object?>
        {
            [nameof(Link.Text)] = "Archived destination",
            [nameof(Link.Href)] = "/archive",
            [nameof(Link.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["Disabled"] = true,
                ["href"] = "/caller-override",
                ["Href"] = "/second-override",
                ["type"] = "button",
                ["Role"] = "button",
                ["Aria-disabled"] = "false",
                ["TabIndex"] = -1,
                ["data-qa"] = "disabled-navigation",
            },
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("<a "));
            Assert.That(markup, Does.Not.Contain("href="));
            Assert.That(markup, Does.Not.Contain("type=\"button\""));
            Assert.That(markup, Does.Contain("role=\"link\""));
            Assert.That(markup, Does.Contain("aria-disabled=\"true\""));
            Assert.That(markup, Does.Contain("tabindex=\"0\""));
            Assert.That(markup, Does.Not.Contain("role=\"button\""));
            Assert.That(markup, Does.Not.Contain("aria-disabled=\"false\""));
            Assert.That(markup, Does.Not.Contain("tabindex=\"-1\""));
            Assert.That(markup, Does.Contain("data-qa=\"disabled-navigation\""));
            Assert.That(markup, Does.Contain("Archived destination"));
        });
    }

    [Test]
    public async Task DisabledActionUsesNativeDisabledButtonAndOwnsNativeAttributes()
    {
        var markup = await RenderLinkAsync(new Dictionary<string, object?>
        {
            [nameof(Link.Text)] = "Refresh",
            [nameof(Link.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["Disabled"] = true,
                ["Href"] = "/should-not-navigate",
                ["Type"] = "submit",
                ["role"] = "link",
                ["aria-disabled"] = "false",
                ["tabindex"] = "0",
                ["data-qa"] = "disabled-action",
            },
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("<button"));
            Assert.That(markup, Does.Contain("type=\"button\""));
            Assert.That(markup, Does.Contain("disabled"));
            Assert.That(markup, Does.Not.Contain("href="));
            Assert.That(markup, Does.Not.Contain("role=\"link\""));
            Assert.That(markup, Does.Not.Contain("aria-disabled=\"false\""));
            Assert.That(markup, Does.Not.Contain("tabindex=\"0\""));
            Assert.That(markup, Does.Contain("data-qa=\"disabled-action\""));
        });
    }

    [Test]
    public async Task ExplicitFalseDisabledDoesNotDisableActionFallback()
    {
        var markup = await RenderLinkAsync(new Dictionary<string, object?>
        {
            [nameof(Link.Text)] = "Refresh",
            [nameof(Link.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["Disabled"] = false,
            },
        });

        Assert.That(markup, Does.Not.Contain("disabled"));
        Assert.That(markup, Does.Contain("<button"));
    }

    [Test]
    public async Task SubtleAppearanceRemainsAnAppearanceClass()
    {
        var markup = await RenderLinkAsync(new Dictionary<string, object?>
        {
            [nameof(Link.Text)] = "More information",
            [nameof(Link.Href)] = "/information",
            [nameof(Link.Appearance)] = LinkAppearance.Subtle,
        });

        Assert.That(markup, Does.Contain("subtle"));
        Assert.That(markup, Does.Contain("href=\"/information\""));
    }

    private static async Task<string> RenderLinkAsync(Dictionary<string, object?> parameters)
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(
            services,
            services.GetRequiredService<ILoggerFactory>());

        string markup = string.Empty;
        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var renderedLink = await renderer.RenderComponentAsync<Link>(
                ParameterView.FromDictionary(parameters));
            await renderedLink.QuiescenceTask;
            markup = renderedLink.ToHtmlString();
        });

        return markup;
    }

    private static ServiceProvider CreateServices()
    {
        var services = new ServiceCollection();
        services.AddSingleton<ILoggerFactory>(NullLoggerFactory.Instance);
        services.AddBluentUI();
        return services.BuildServiceProvider();
    }
}