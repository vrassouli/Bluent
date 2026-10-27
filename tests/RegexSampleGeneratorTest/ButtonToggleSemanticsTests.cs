using Bluent.UI.Components;
using Bluent.UI.Extensions;
using Bluent.UI.Icons;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace RegexSampleGeneratorTest;

public class ButtonToggleSemanticsTests
{
    [TestCase(true, "false", "true")]
    [TestCase(false, "true", "false")]
    public async Task BoundToggleStateWinsOverContradictoryCallerAriaPressed(
        bool toggled,
        string callerPressed,
        string expectedPressed)
    {
        var attributes = new Dictionary<string, object>
        {
            ["aria-pressed"] = callerPressed,
            ["data-qa"] = "toggle-state",
            ["title"] = "preserved",
        };

        var markup = await RenderButtonAsync(new Dictionary<string, object?>
        {
            [nameof(Button.Text)] = "Toggle",
            [nameof(Button.Toggled)] = toggled,
            [nameof(Button.AdditionalAttributes)] = attributes,
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain($"aria-pressed=\"{expectedPressed}\""));
            Assert.That(markup, Does.Not.Contain($"aria-pressed=\"{callerPressed}\""));
            Assert.That(CountOccurrences(markup, "aria-pressed="), Is.EqualTo(1));
            Assert.That(markup, Does.Contain("data-qa=\"toggle-state\""));
            Assert.That(markup, Does.Contain("title=\"preserved\""));
        });
    }

    [Test]
    public async Task ToggleStateOverrideMatchesCallerAttributeNameCaseInsensitively()
    {
        var markup = await RenderButtonAsync(new Dictionary<string, object?>
        {
            [nameof(Button.Toggled)] = true,
            [nameof(Button.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["Aria-Pressed"] = "false",
            },
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("aria-pressed=\"true\""));
            Assert.That(CountOccurrences(markup, "aria-pressed="), Is.EqualTo(1));
        });
    }

    [Test]
    public async Task NullTogglePreservesCallerAriaPressedWithoutGeneratingState()
    {
        var markup = await RenderButtonAsync(new Dictionary<string, object?>
        {
            [nameof(Button.Toggled)] = null,
            [nameof(Button.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["aria-pressed"] = "mixed",
            },
        });

        Assert.That(markup, Does.Contain("aria-pressed=\"mixed\""));
        Assert.That(CountOccurrences(markup, "aria-pressed="), Is.EqualTo(1));
    }

    [Test]
    public async Task NullToggleWithoutCallerStateDoesNotEmitAriaPressed()
    {
        var markup = await RenderButtonAsync(new Dictionary<string, object?>
        {
            [nameof(Button.Text)] = "Ordinary action",
            [nameof(Button.Toggled)] = null,
        });

        Assert.That(markup, Does.Not.Contain("aria-pressed="));
    }

    [Test]
    public async Task NavigationAnchorDoesNotReceiveGeneratedToggleState()
    {
        var markup = await RenderButtonAsync(new Dictionary<string, object?>
        {
            [nameof(Button.Text)] = "Navigate",
            [nameof(Button.Href)] = "/target",
            [nameof(Button.Toggled)] = true,
            [nameof(Button.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["aria-pressed"] = "mixed",
                ["data-qa"] = "link",
            },
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("<a "));
            Assert.That(markup, Does.Contain("href=\"/target\""));
            Assert.That(markup, Does.Contain("aria-pressed=\"mixed\""));
            Assert.That(markup, Does.Not.Contain("aria-pressed=\"true\""));
            Assert.That(markup, Does.Contain("data-qa=\"link\""));
        });
    }

    [Test]
    public async Task IconWithVisibleTextMarksRegularAndFilledGlyphsDecorative()
    {
        var markup = await RenderButtonAsync(new Dictionary<string, object?>
        {
            [nameof(Button.Text)] = "Default",
            [nameof(Button.Icon)] = IconDefinition.FromCss("cursor-click", "cursor-click-filled"),
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("active-icon"));
            Assert.That(markup, Does.Contain("aria-hidden=\"true\""));
            Assert.That(CountOccurrences(markup, "aria-hidden=\"true\""), Is.EqualTo(2));
        });
    }

    [Test]
    public async Task IconOnlyButtonPreservesCallerAccessibleNameWhileHidingGlyph()
    {
        var markup = await RenderButtonAsync(new Dictionary<string, object?>
        {
            [nameof(Button.Icon)] = IconDefinition.FromCss("cursor-click", "cursor-click-filled"),
            [nameof(Button.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["aria-label"] = "Open icon sample",
            },
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("aria-label=\"Open icon sample\""));
            Assert.That(CountOccurrences(markup, "aria-hidden=\"true\""), Is.EqualTo(2));
        });
    }

    [Test]
    public async Task DisabledNativeToggleStillExposesItsActualPressedState()
    {
        var markup = await RenderButtonAsync(new Dictionary<string, object?>
        {
            [nameof(Button.Toggled)] = true,
            [nameof(Button.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["disabled"] = true,
                ["aria-pressed"] = "false",
            },
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("disabled"));
            Assert.That(markup, Does.Contain("aria-pressed=\"true\""));
            Assert.That(CountOccurrences(markup, "aria-pressed="), Is.EqualTo(1));
        });
    }

    private static async Task<string> RenderButtonAsync(Dictionary<string, object?> parameters)
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(
            services,
            services.GetRequiredService<ILoggerFactory>());

        string markup = string.Empty;
        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var renderedButton = await renderer.RenderComponentAsync<Button>(
                ParameterView.FromDictionary(parameters));
            await renderedButton.QuiescenceTask;
            markup = renderedButton.ToHtmlString();
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

    private static int CountOccurrences(string value, string search)
    {
        return (value.Length - value.Replace(search, string.Empty).Length) / search.Length;
    }
}