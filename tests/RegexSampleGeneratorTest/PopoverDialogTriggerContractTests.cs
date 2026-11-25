using Bluent.UI.Components;
using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace RegexSampleGeneratorTest;

public sealed class PopoverDialogTriggerContractTests
{
    [Test]
    public async Task GenericButtonPreservesDialogPopupTypeForNonMenuPopoverConsumers()
    {
        var markup = await RenderButtonAsync(new Dictionary<string, object?>
        {
            [nameof(Button.Text)] = "Open calendar",
            [nameof(Button.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["aria-haspopup"] = "dialog",
                ["aria-label"] = "Open calendar",
                ["data-qa"] = "date-picker-trigger",
            },
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("aria-haspopup=\"dialog\""));
            Assert.That(markup, Does.Contain("aria-label=\"Open calendar\""));
            Assert.That(markup, Does.Contain("data-qa=\"date-picker-trigger\""));
            Assert.That(CountOccurrences(markup, "aria-haspopup="), Is.EqualTo(1));
            Assert.That(markup, Does.Not.Contain("aria-expanded="),
                "Popover.AccessibleTriggerState owns expanded state; consumers must not author a competing value.");
            Assert.That(markup, Does.Not.Contain("aria-controls="),
                "Popover.AccessibleTriggerState supplies the persistent controls relationship at runtime.");
        });
    }

    private static async Task<string> RenderButtonAsync(Dictionary<string, object?> parameters)
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());

        string markup = string.Empty;
        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var rendered = await renderer.RenderComponentAsync<Button>(ParameterView.FromDictionary(parameters));
            await rendered.QuiescenceTask;
            markup = rendered.ToHtmlString();
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

    private static int CountOccurrences(string value, string search) =>
        (value.Length - value.Replace(search, string.Empty).Length) / search.Length;
}
