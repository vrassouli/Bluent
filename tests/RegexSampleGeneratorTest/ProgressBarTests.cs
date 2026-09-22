using System.Globalization;
using Bluent.UI.Components;
using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace RegexSampleGeneratorTest;

[NonParallelizable]
public class ProgressBarTests
{
    [Test]
    public async Task DeterminateWidthUsesInvariantDecimalSeparator()
    {
        var originalCulture = CultureInfo.CurrentCulture;
        var originalUiCulture = CultureInfo.CurrentUICulture;

        try
        {
            CultureInfo.CurrentCulture = CultureInfo.GetCultureInfo("fa-IR");
            CultureInfo.CurrentUICulture = CultureInfo.GetCultureInfo("fa-IR");

            await using var services = CreateServices();
            await using var renderer = new HtmlRenderer(
                services,
                services.GetRequiredService<ILoggerFactory>());

            await renderer.Dispatcher.InvokeAsync(async () =>
            {
                var parameters = ParameterView.FromDictionary(
                    new Dictionary<string, object?>
                    {
                        [nameof(ProgressBar.Value)] = 83.95448f,
                    });

                var renderedProgressBar = await renderer.RenderComponentAsync<ProgressBar>(parameters);
                var markup = renderedProgressBar.ToHtmlString();

                Assert.Multiple(() =>
                {
                    Assert.That(markup, Does.Contain("width: 83.95448%"));
                    Assert.That(markup, Does.Not.Contain("83٫95448"));
                });
            });
        }
        finally
        {
            CultureInfo.CurrentCulture = originalCulture;
            CultureInfo.CurrentUICulture = originalUiCulture;
        }
    }

    private static ServiceProvider CreateServices()
    {
        var services = new ServiceCollection();
        services.AddSingleton<ILoggerFactory>(NullLoggerFactory.Instance);
        services.AddBluentUI();

        return services.BuildServiceProvider();
    }
}
