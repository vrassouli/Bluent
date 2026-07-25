using Bluent.UI.Components;
using Bluent.UI.Components.DialogComponent;
using Bluent.UI.Extensions;
using Bluent.UI.Services.Abstractions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace RegexSampleGeneratorTest;

public class DialogContainerTests
{
    [Test]
    public async Task OpeningSecondDialogKeepsFirstDialogOpen()
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(
            services,
            services.GetRequiredService<ILoggerFactory>());

        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var renderedContainer = await renderer.RenderComponentAsync<DialogContainer>();
            var dialogService = services.GetRequiredService<IDialogService>();

            var firstResult = dialogService.ShowAsync(TextContent("First dialog"));
            var secondResult = dialogService.ShowAsync(TextContent("Second dialog"));
            await renderedContainer.QuiescenceTask;

            var markup = renderedContainer.ToHtmlString();

            Assert.Multiple(() =>
            {
                Assert.That(CountOccurrences(markup, "class=\"dialog-wrapper\""), Is.EqualTo(2));
                Assert.That(CountOccurrences(markup, "class=\"bui-dialog "), Is.EqualTo(2));
                Assert.That(CountOccurrences(markup, "class=\"bui-overlay "), Is.EqualTo(2));
                Assert.That(markup, Does.Contain("First dialog"));
                Assert.That(markup, Does.Contain("Second dialog"));
                Assert.That(firstResult.IsCompleted, Is.False);
                Assert.That(secondResult.IsCompleted, Is.False);
            });
        });
    }

    [Test]
    public async Task NonModalDialogDoesNotAddAnotherOverlay()
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(
            services,
            services.GetRequiredService<ILoggerFactory>());

        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var renderedContainer = await renderer.RenderComponentAsync<DialogContainer>();
            var dialogService = services.GetRequiredService<IDialogService>();

            _ = dialogService.ShowAsync(TextContent("Modal dialog"));
            _ = dialogService.ShowAsync(
                TextContent("Non-modal dialog"),
                new DialogConfiguration(modal: false));
            await renderedContainer.QuiescenceTask;

            var markup = renderedContainer.ToHtmlString();

            Assert.Multiple(() =>
            {
                Assert.That(CountOccurrences(markup, "class=\"dialog-wrapper\""), Is.EqualTo(2));
                Assert.That(CountOccurrences(markup, "class=\"bui-overlay "), Is.EqualTo(1));
                Assert.That(markup, Does.Contain("--dialog-stack-index: 0"));
                Assert.That(markup, Does.Contain("--dialog-stack-index: 1"));
            });
        });
    }

    private static ServiceProvider CreateServices()
    {
        var services = new ServiceCollection();
        services.AddSingleton<ILoggerFactory>(NullLoggerFactory.Instance);
        services.AddBluentUI();

        return services.BuildServiceProvider();
    }

    private static RenderFragment TextContent(string text)
    {
        return builder => builder.AddContent(0, text);
    }

    private static int CountOccurrences(string value, string search)
    {
        return (value.Length - value.Replace(search, string.Empty).Length) / search.Length;
    }
}
