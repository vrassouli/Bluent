using Bluent.UI.Components;
using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.JSInterop;
using System.Linq.Expressions;
using System.Text.RegularExpressions;

namespace RegexSampleGeneratorTest;

public class SwitchRenderSemanticsTests
{
    [Test]
    public async Task RendersOneNativeCheckboxWithSwitchRoleAndNativeCheckedState()
    {
        var offMarkup = await RenderSwitchAsync(new Dictionary<string, object?>
        {
            [nameof(Switch.Value)] = false,
            [nameof(Switch.Label)] = "Notifications"
        });
        var onMarkup = await RenderSwitchAsync(new Dictionary<string, object?>
        {
            [nameof(Switch.Value)] = true,
            [nameof(Switch.Label)] = "Notifications"
        });

        Assert.Multiple(() =>
        {
            Assert.That(Regex.Matches(offMarkup, "<input\\b").Count, Is.EqualTo(1));
            Assert.That(offMarkup, Does.Contain("type=\"checkbox\""));
            Assert.That(offMarkup, Does.Contain("role=\"switch\""));
            Assert.That(offMarkup, Does.Not.Contain("aria-checked="));
            Assert.That(offMarkup, Does.Not.Contain("checked=\""));
            Assert.That(onMarkup, Does.Match("\\bchecked(?:\\s|>)"));
            Assert.That(onMarkup, Does.Contain("role=\"switch\""));
            Assert.That(onMarkup, Does.Not.Contain("aria-checked="));
        });
    }

    [Test]
    public async Task AccessibleNameRemainsStableWhenTheBooleanValueChanges()
    {
        var offMarkup = await RenderSwitchAsync(new Dictionary<string, object?>
        {
            [nameof(Switch.Value)] = false,
            [nameof(Switch.Label)] = "Automatic updates"
        });
        var onMarkup = await RenderSwitchAsync(new Dictionary<string, object?>
        {
            [nameof(Switch.Value)] = true,
            [nameof(Switch.Label)] = "Automatic updates"
        });

        Assert.Multiple(() =>
        {
            Assert.That(offMarkup, Does.Contain(">Automatic updates</label>"));
            Assert.That(onMarkup, Does.Contain(">Automatic updates</label>"));
            Assert.That(offMarkup, Does.Not.Contain("UncheckedLabel"));
            Assert.That(onMarkup, Does.Not.Contain("UncheckedLabel"));
        });
    }

    [Test]
    public async Task GeneratedInputIdIsStableAndAssociatedWithTheVisibleLabelOutsideEditForm()
    {
        var markup = await RenderSwitchAsync(new Dictionary<string, object?>
        {
            [nameof(Switch.Value)] = false,
            [nameof(Switch.Label)] = "Email notifications"
        });
        var inputId = Regex.Match(markup, "<input[^>]*\\bid=\"([^\"]+)\"").Groups[1].Value;

        Assert.Multiple(() =>
        {
            Assert.That(inputId, Is.Not.Empty);
            Assert.That(markup, Does.Contain($"<label for=\"{inputId}\">"));
        });
    }

    [Test]
    public async Task CallerAccessibleNameAllowsOmittingVisibleLabel()
    {
        var markup = await RenderSwitchAsync(new Dictionary<string, object?>
        {
            [nameof(Switch.Value)] = false,
            [nameof(Switch.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["aria-label"] = "Enable automatic updates"
            }
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("role=\"switch\""));
            Assert.That(markup, Does.Contain("aria-label=\"Enable automatic updates\""));
            Assert.That(markup, Does.Not.Contain("<label"));
        });
    }

    [Test]
    public void MissingVisibleAndAccessibleNameIsRejected()
    {
        Assert.ThrowsAsync<InvalidOperationException>(async () =>
            await RenderSwitchAsync(new Dictionary<string, object?>
            {
                [nameof(Switch.Value)] = false
            }));
    }

    [TestCase(SwitchLabelPosition.After, "label-after")]
    [TestCase(SwitchLabelPosition.Before, "label-before")]
    [TestCase(SwitchLabelPosition.Above, "label-above")]
    public async Task SupportsTheThreeFluentLabelPlacements(SwitchLabelPosition position, string cssClass)
    {
        var markup = await RenderSwitchAsync(new Dictionary<string, object?>
        {
            [nameof(Switch.Value)] = false,
            [nameof(Switch.Label)] = "Location sharing",
            [nameof(Switch.LabelPosition)] = position
        });

        Assert.That(markup, Does.Contain(cssClass));
    }

    [Test]
    public async Task ReservedAttributesCannotOverrideNativeSwitchSemantics()
    {
        var markup = await RenderSwitchAsync(new Dictionary<string, object?>
        {
            [nameof(Switch.Value)] = false,
            [nameof(Switch.Label)] = "Notifications",
            [nameof(Switch.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["id"] = "switch-manual-id",
                ["TYPE"] = "text",
                ["ROLE"] = "checkbox",
                ["aria-checked"] = "mixed",
                ["checked"] = true,
                ["onchange"] = "malicious-handler",
                ["disabled"] = "false",
                ["required"] = true,
                ["aria-label"] = "Notifications preference",
                ["data-qa"] = "switch-1"
            }
        });
        var input = Regex.Match(markup, "<input[^>]*>").Value;

        Assert.Multiple(() =>
        {
            Assert.That(input, Does.Contain("id=\"switch-manual-id\""));
            Assert.That(input, Does.Contain("type=\"checkbox\""));
            Assert.That(input, Does.Contain("role=\"switch\""));
            Assert.That(input, Does.Not.Contain("aria-checked="));
            Assert.That(input, Does.Not.Contain("onchange="));
            Assert.That(input, Does.Not.Contain("disabled"));
            Assert.That(input, Does.Match("\\brequired(?:\\s|>)"));
            Assert.That(input, Does.Contain("aria-label=\"Notifications preference\""));
            Assert.That(input, Does.Contain("data-qa=\"switch-1\""));
            Assert.That(input, Does.Not.Contain("checked=\""));
        });
    }

    [Test]
    public async Task RequiredMarkerIsDecorativeAndNativeRequiredIsIndependent()
    {
        var markerOnly = await RenderSwitchAsync(new Dictionary<string, object?>
        {
            [nameof(Switch.Value)] = false,
            [nameof(Switch.Label)] = "Accept terms",
            [nameof(Switch.Required)] = "*"
        });
        var nativeRequired = await RenderSwitchAsync(new Dictionary<string, object?>
        {
            [nameof(Switch.Value)] = false,
            [nameof(Switch.Label)] = "Accept terms",
            [nameof(Switch.Required)] = "*",
            [nameof(Switch.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["required"] = true
            }
        });
        var markerOnlyInput = Regex.Match(markerOnly, "<input[^>]*>").Value;
        var nativeRequiredInput = Regex.Match(nativeRequired, "<input[^>]*>").Value;

        Assert.Multiple(() =>
        {
            Assert.That(markerOnly, Does.Contain("class=\"required\" aria-hidden=\"true\">*</span>"));
            Assert.That(markerOnlyInput, Does.Not.Contain("required"));
            Assert.That(nativeRequiredInput, Does.Match("\\brequired(?:\\s|>)"));
        });
    }

    [Test]
    public async Task NativeDisabledAndEditContextValidationAreReflectedOnTheSwitch()
    {
        var disabledMarkup = await RenderSwitchAsync(new Dictionary<string, object?>
        {
            [nameof(Switch.Value)] = true,
            [nameof(Switch.Label)] = "Managed setting",
            [nameof(Switch.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["disabled"] = true
            }
        });

        var model = new SwitchValidationModel();
        var editContext = new EditContext(model);
        var messages = new ValidationMessageStore(editContext);
        messages.Add(() => model.Enabled, "The setting is invalid.");
        editContext.NotifyValidationStateChanged();
        var invalidMarkup = await RenderSwitchAsync(new Dictionary<string, object?>
        {
            [nameof(Switch.Value)] = false,
            [nameof(Switch.ValueExpression)] = (Expression<Func<bool>>)(() => model.Enabled),
            [nameof(Switch.Label)] = "Managed setting"
        }, editContext);

        Assert.Multiple(() =>
        {
            Assert.That(disabledMarkup, Does.Contain("bui-switch label-after checked disabled"));
            Assert.That(Regex.Match(disabledMarkup, "<input[^>]*>").Value, Does.Match("\\bdisabled(?:\\s|>)"));
            Assert.That(invalidMarkup, Does.Contain("bui-switch label-after unchecked invalid"));
            Assert.That(Regex.Match(invalidMarkup, "<input[^>]*>").Value, Does.Contain("aria-invalid=\"true\""));
        });
    }

    private static async Task<string> RenderSwitchAsync(
        Dictionary<string, object?> parameters,
        EditContext? editContext = null)
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());

        var markup = string.Empty;
        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            if (editContext is null)
            {
                var component = await renderer.RenderComponentAsync<Switch>(ParameterView.FromDictionary(parameters));
                await component.QuiescenceTask;
                markup = component.ToHtmlString();
                return;
            }

            RenderFragment childContent = builder =>
            {
                builder.OpenComponent<Switch>(0);
                var sequence = 1;
                foreach (var parameter in parameters)
                    builder.AddAttribute(sequence++, parameter.Key, parameter.Value);
                builder.CloseComponent();
            };

            var wrapperParameters = new Dictionary<string, object?>
            {
                [nameof(CascadingValue<EditContext>.Value)] = editContext,
                [nameof(CascadingValue<EditContext>.ChildContent)] = childContent
            };
            var wrapper = await renderer.RenderComponentAsync<CascadingValue<EditContext>>(
                ParameterView.FromDictionary(wrapperParameters));
            await wrapper.QuiescenceTask;
            markup = wrapper.ToHtmlString();
        });

        return markup;
    }

    private static ServiceProvider CreateServices()
    {
        var services = new ServiceCollection();
        services.AddSingleton<ILoggerFactory>(NullLoggerFactory.Instance);
        services.AddSingleton<IJSRuntime, SwitchTestJSRuntime>();
        services.AddBluentUI();
        return services.BuildServiceProvider();
    }

    private sealed class SwitchValidationModel
    {
        public bool Enabled { get; set; }
    }
    private sealed class SwitchTestJSRuntime : IJSRuntime
    {
        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, object?[]? args)
            => new(default(TValue)!);

        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, CancellationToken cancellationToken, object?[]? args)
            => new(default(TValue)!);
    }
}
