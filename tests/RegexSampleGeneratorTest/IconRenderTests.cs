using Bluent.UI.Components;
using Bluent.UI.Extensions;
using Bluent.UI.Icons;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace RegexSampleGeneratorTest;

public class IconRenderTests
{
    [Test]
    public async Task CssSourceUsesInlineElementAndKeepsConsumerAttributes()
    {
        var markup = await RenderIconAsync(new Dictionary<string, object?>
        {
            [nameof(Icon.Value)] = IconDefinition.FromCss("icon-search-regular", "icon-search-filled"),
            [nameof(Icon.Variant)] = IconVariant.Filled,
            [nameof(Icon.Class)] = "custom-icon",
            [nameof(Icon.Style)] = "width:28px;height:28px;color:rebeccapurple;",
            [nameof(Icon.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["role"] = "img",
                ["aria-label"] = "Search",
                ["data-qa"] = "search-glyph",
                ["title"] = "Search",
            },
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.StartWith("<i "));
            Assert.That(markup, Does.Contain("class=\"bui-icon icon-search-filled custom-icon"));
            Assert.That(markup, Does.Contain("style=\"width:28px;height:28px;color:rebeccapurple;\""));
            Assert.That(markup, Does.Contain("role=\"img\""));
            Assert.That(markup, Does.Contain("aria-label=\"Search\""));
            Assert.That(markup, Does.Contain("data-qa=\"search-glyph\""));
            Assert.That(markup, Does.Contain("title=\"Search\""));
        });
    }

    [Test]
    public async Task FilledVariantFallsBackToRegularSourceWhenFilledIsUnavailable()
    {
        var markup = await RenderIconAsync(new Dictionary<string, object?>
        {
            [nameof(Icon.Value)] = IconDefinition.FromCss("icon-only-regular"),
            [nameof(Icon.Variant)] = IconVariant.Filled,
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.StartWith("<i "));
            Assert.That(markup, Does.Contain("icon-only-regular"));
            Assert.That(markup, Does.Not.Contain("icon-only-filled"));
        });
    }

    [Test]
    public async Task SvgSourceUsesSpanRootAndPreservesTrustedViewBoxMarkup()
    {
        const string svg = """
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 12h20" />
            </svg>
            """;

        var markup = await RenderIconAsync(new Dictionary<string, object?>
        {
            [nameof(Icon.Value)] = IconDefinition.FromSvg(svg),
            [nameof(Icon.Class)] = "document-icon",
            [nameof(Icon.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["role"] = "img",
                ["aria-label"] = "Document",
                ["data-source"] = "svg",
            },
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.StartWith("<span "));
            Assert.That(markup, Does.Contain("class=\"bui-icon document-icon"));
            Assert.That(markup, Does.Contain("<svg"));
            Assert.That(markup, Does.Contain("viewBox=\"0 0 24 24\""));
            Assert.That(markup, Does.Contain("fill=\"currentColor\""));
            Assert.That(markup, Does.Contain("<path d=\"M2 12h20\""));
            Assert.That(markup, Does.Contain("role=\"img\""));
            Assert.That(markup, Does.Contain("aria-label=\"Document\""));
        });
    }

    [Test]
    public async Task ImageSourceUsesImgRootAndForwardsNativeAltAndDecorativeIntent()
    {
        var informativeMarkup = await RenderIconAsync(new Dictionary<string, object?>
        {
            [nameof(Icon.Value)] = IconDefinition.FromImage("/assets/icons/powerpoint.svg"),
            [nameof(Icon.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["alt"] = "PowerPoint file",
                ["data-source"] = "image",
            },
        });

        var decorativeMarkup = await RenderIconAsync(new Dictionary<string, object?>
        {
            [nameof(Icon.Value)] = IconDefinition.FromImage("/assets/icons/powerpoint.svg"),
            [nameof(Icon.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["alt"] = string.Empty,
                ["aria-hidden"] = "true",
            },
        });

        Assert.Multiple(() =>
        {
            Assert.That(informativeMarkup, Does.StartWith("<img "));
            Assert.That(informativeMarkup, Does.Contain("src=\"/assets/icons/powerpoint.svg\""));
            Assert.That(informativeMarkup, Does.Contain("alt=\"PowerPoint file\""));
            Assert.That(informativeMarkup, Does.Contain("data-source=\"image\""));
            Assert.That(decorativeMarkup, Does.Contain("alt=\"\""));
            Assert.That(decorativeMarkup, Does.Contain("aria-hidden=\"true\""));
        });
    }

    [Test]
    public async Task RegularAndFilledSvgSourcesFollowTheRequestedVariant()
    {
        const string regular = "<svg viewBox=\"0 0 10 10\"><path id=\"regular\" /></svg>";
        const string filled = "<svg viewBox=\"0 0 10 10\"><path id=\"filled\" /></svg>";

        var regularMarkup = await RenderIconAsync(new Dictionary<string, object?>
        {
            [nameof(Icon.Value)] = IconDefinition.FromSvg(regular, filled),
        });
        var filledMarkup = await RenderIconAsync(new Dictionary<string, object?>
        {
            [nameof(Icon.Value)] = IconDefinition.FromSvg(regular, filled),
            [nameof(Icon.Variant)] = IconVariant.Filled,
        });

        Assert.Multiple(() =>
        {
            Assert.That(regularMarkup, Does.Contain("id=\"regular\""));
            Assert.That(regularMarkup, Does.Not.Contain("id=\"filled\""));
            Assert.That(filledMarkup, Does.Contain("id=\"filled\""));
            Assert.That(filledMarkup, Does.Not.Contain("id=\"regular\""));
        });
    }

    [Test]
    public void PublicContractKeepsOnlyRegularAndFilledWithoutSizeOrColorParameters()
    {
        Assert.That(Enum.GetNames<IconVariant>(), Is.EqualTo(new[] { "Regular", "Filled" }));

        var publicPropertyNames = typeof(Icon).GetProperties(
            System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public)
            .Select(property => property.Name)
            .ToArray();

        Assert.That(publicPropertyNames, Does.Not.Contain("Size"));
        Assert.That(publicPropertyNames, Does.Not.Contain("Color"));
    }
    private static async Task<string> RenderIconAsync(Dictionary<string, object?> parameters)
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(
            services,
            services.GetRequiredService<ILoggerFactory>());

        string markup = string.Empty;
        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var renderedIcon = await renderer.RenderComponentAsync<Icon>(
                ParameterView.FromDictionary(parameters));
            await renderedIcon.QuiescenceTask;
            markup = renderedIcon.ToHtmlString();
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