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
    public async Task ExplicitRootParametersWinOverDuplicateAttributesAcrossSourceKindsInHtmlRenderer()
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(
            services,
            services.GetRequiredService<ILoggerFactory>());

        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var cases = new[]
            {
                (Value: IconDefinition.FromSvg("<svg viewBox=\"0 0 1 1\"></svg>"), Tag: "span", ClassName: "bui-icon parameter-class"),
                (Value: IconDefinition.FromImage("https://example.test/icon.svg"), Tag: "img", ClassName: "bui-icon parameter-class"),
                (Value: IconDefinition.FromCss("font-source-class"), Tag: "i", ClassName: "bui-icon font-source-class parameter-class"),
            };

            foreach (var (value, tag, className) in cases)
            {
                var parameters = ParameterView.FromDictionary(
                    new Dictionary<string, object?>
                    {
                        [nameof(Icon.Value)] = value,
                        [nameof(Icon.Class)] = "parameter-class",
                        [nameof(Icon.Style)] = "width: 2em",
                        [nameof(Icon.AdditionalAttributes)] = new Dictionary<string, object>
                        {
                            ["id"] = "caller-id",
                            ["class"] = "attribute-class",
                            ["style"] = "color: red",
                            ["data-probe"] = "forwarded",
                        },
                    });

                var renderedIcon = await renderer.RenderComponentAsync<Icon>(parameters);
                var markup = renderedIcon.ToHtmlString();

                Assert.Multiple(() =>
                {
                    Assert.That(markup, Does.StartWith($"<{tag}"));
                    Assert.That(markup, Does.Contain("id=\"caller-id\""));
                    Assert.That(markup, Does.Contain($"class=\"{className}\""));
                    Assert.That(markup, Does.Contain("style=\"width: 2em\""));
                    Assert.That(markup, Does.Contain("data-probe=\"forwarded\""));
                    Assert.That(markup, Does.Not.Contain("attribute-class"));
                    Assert.That(markup, Does.Not.Contain("color: red"));
                    Assert.That(CountOccurrences(markup, "id="), Is.EqualTo(1));
                    Assert.That(CountOccurrences(markup, "class="), Is.EqualTo(1));
                    Assert.That(CountOccurrences(markup, "style="), Is.EqualTo(1));
                });
            }
        });
    }

    private static ServiceProvider CreateServices()
    {
        var services = new ServiceCollection();
        services.AddSingleton<ILoggerFactory>(NullLoggerFactory.Instance);
        services.AddBluentUI();

        return services.BuildServiceProvider();
    }

    private static int CountOccurrences(string value, string search)
    {
        return (value.Length - value.Replace(search, string.Empty).Length) / search.Length;
    }
}