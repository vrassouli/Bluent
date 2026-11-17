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

namespace RegexSampleGeneratorTest;

public class CheckboxRenderSemanticsTests
{
    [Test]
    public async Task BooleanCheckboxUsesOneNativeInputAndAnAssociatedVisibleLabel()
    {
        var markup = await RenderCheckboxAsync<bool>(new Dictionary<string, object?>
        {
            [nameof(Checkbox<bool>.Value)] = false,
            [nameof(Checkbox<bool>.Label)] = "Email notifications"
        });

        var inputId = System.Text.RegularExpressions.Regex.Match(markup, @"<input[^>]*id=""([^""]+)""").Groups[1].Value;

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("type=\"checkbox\""));
            Assert.That(inputId, Is.Not.Empty);
            Assert.That(markup, Does.Contain($"<label for=\"{inputId}\"><span id=\"{inputId}-label\">Email notifications</span></label>"));
            Assert.That(markup, Does.Not.Contain("aria-checked="));
            Assert.That(System.Text.RegularExpressions.Regex.Matches(markup, "<input").Count, Is.EqualTo(1));
        });
    }

    [Test]
    public async Task NullableNullRendersMixedVisualAndDoesNotAuthorAriaChecked()
    {
        var markup = await RenderCheckboxAsync<bool?>(new Dictionary<string, object?>
        {
            [nameof(Checkbox<bool?>.Value)] = null,
            [nameof(Checkbox<bool?>.Label)] = "Select all rows"
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("bui-checkbox indeterminate"));
            Assert.That(markup, Does.Contain("<svg class=\"indeterminate-state standard\""));
            Assert.That(markup, Does.Not.Contain("aria-checked="));
            Assert.That(markup, Does.Not.Contain("role=\"checkbox\""));
        });
    }

    [Test]
    public async Task StateSpecificLabelsUseTheExistingFallbackContract()
    {
        var checkedMarkup = await RenderCheckboxAsync<bool>(new Dictionary<string, object?>
        {
            [nameof(Checkbox<bool>.Value)] = true,
            [nameof(Checkbox<bool>.Label)] = "Default label",
            [nameof(Checkbox<bool>.UncheckedLabel)] = "Unchecked label",
            [nameof(Checkbox<bool>.IndeterminateLabel)] = "Mixed label"
        });
        var uncheckedMarkup = await RenderCheckboxAsync<bool>(new Dictionary<string, object?>
        {
            [nameof(Checkbox<bool>.Value)] = false,
            [nameof(Checkbox<bool>.Label)] = "Default label",
            [nameof(Checkbox<bool>.UncheckedLabel)] = "Unchecked label",
            [nameof(Checkbox<bool>.IndeterminateLabel)] = "Mixed label"
        });
        var mixedMarkup = await RenderCheckboxAsync<bool?>(new Dictionary<string, object?>
        {
            [nameof(Checkbox<bool?>.Value)] = null,
            [nameof(Checkbox<bool?>.Label)] = "Default label",
            [nameof(Checkbox<bool?>.IndeterminateLabel)] = "Mixed label"
        });
        var fallbackMarkup = await RenderCheckboxAsync<bool>(new Dictionary<string, object?>
        {
            [nameof(Checkbox<bool>.Value)] = false,
            [nameof(Checkbox<bool>.Label)] = "Default label"
        });

        Assert.Multiple(() =>
        {
            Assert.That(checkedMarkup, Does.Contain(">Default label</span>"));
            Assert.That(uncheckedMarkup, Does.Contain(">Unchecked label</span>"));
            Assert.That(mixedMarkup, Does.Contain(">Mixed label</span>"));
            Assert.That(fallbackMarkup, Does.Contain(">Default label</span>"));
        });
    }

    [Test]
    public async Task DecorativeRequiredMarkerStaysInsideTheLabelButIsNotPartOfItsReferencedName()
    {
        var markup = await RenderCheckboxAsync<bool>(new Dictionary<string, object?>
        {
            [nameof(Checkbox<bool>.Value)] = false,
            [nameof(Checkbox<bool>.Label)] = "Accept terms",
            [nameof(Checkbox<bool>.Required)] = "*"
        });

        var inputId = System.Text.RegularExpressions.Regex.Match(markup, @"<input[^>]*id=""([^""]+)""").Groups[1].Value;
        var label = System.Text.RegularExpressions.Regex.Match(markup, @"<label\b[^>]*>(.*?)</label>");

        Assert.Multiple(() =>
        {
            Assert.That(label.Success, Is.True);
            Assert.That(label.Groups[1].Value, Does.Contain($"<span id=\"{inputId}-label\">Accept terms</span>"));
            Assert.That(label.Groups[1].Value, Does.Contain("<span class=\"required\" aria-hidden=\"true\">*</span>"));
            Assert.That(markup, Does.Contain($"aria-labelledby=\"{inputId}-label\""));
            Assert.That(markup, Does.Not.Contain("aria-required="));
            Assert.That(markup, Does.Not.Contain("required=\"*\""));
        });
    }

    [Test]
    public async Task CallerAccessibleNameTakesPrecedenceOverTheGeneratedRequiredLabelName()
    {
        var markup = await RenderCheckboxAsync<bool>(new Dictionary<string, object?>
        {
            [nameof(Checkbox<bool>.Value)] = false,
            [nameof(Checkbox<bool>.Label)] = "Accept terms",
            [nameof(Checkbox<bool>.Required)] = "*",
            [nameof(Checkbox<bool>.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["aria-label"] = "Accept the service terms"
            }
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("aria-label=\"Accept the service terms\""));
            Assert.That(markup, Does.Not.Contain("aria-labelledby="));
            Assert.That(markup, Does.Contain("aria-hidden=\"true\""));
        });
    }

    [Test]
    public async Task RequiredMarkerIsNotRenderedWithoutAVisibleLabel()
    {
        var markup = await RenderCheckboxAsync<bool>(new Dictionary<string, object?>
        {
            [nameof(Checkbox<bool>.Value)] = false,
            [nameof(Checkbox<bool>.Required)] = "*",
            [nameof(Checkbox<bool>.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["aria-label"] = "Accept terms"
            }
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("aria-label=\"Accept terms\""));
            Assert.That(markup, Does.Not.Contain("class=\"required\""));
            Assert.That(markup, Does.Not.Contain("<label"));
        });
    }

    [Test]
    public async Task CircularLargeAndLabelBeforePreserveThePublicCustomizationContract()
    {
        var markup = await RenderCheckboxAsync<bool?>(new Dictionary<string, object?>
        {
            [nameof(Checkbox<bool?>.Value)] = null,
            [nameof(Checkbox<bool?>.Label)] = "Mixed circular",
            [nameof(Checkbox<bool?>.Circular)] = true,
            [nameof(Checkbox<bool?>.Size)] = CheckboxSize.Large,
            [nameof(Checkbox<bool?>.LabelPosition)] = LabelPosition.Before,
            [nameof(Checkbox<bool?>.Class)] = "consumer-class",
            [nameof(Checkbox<bool?>.Style)] = "max-width: 18rem"
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("bui-checkbox large label-before indeterminate circular"));
            Assert.That(markup, Does.Contain("consumer-class"));
            Assert.That(markup, Does.Contain("style=\"max-width: 18rem\""));
            Assert.That(markup, Does.Contain("<svg class=\"indeterminate-state circular\""));
        });
    }

    [TestCase(true, true)]
    [TestCase(false, false)]
    [TestCase("true", true)]
    [TestCase("false", false)]
    public async Task NativeDisabledAttributeUsesHtmlBooleanSemantics(object attributeValue, bool disabled)
    {
        var markup = await RenderCheckboxAsync<bool>(new Dictionary<string, object?>
        {
            [nameof(Checkbox<bool>.Value)] = true,
            [nameof(Checkbox<bool>.Label)] = "Disabled value",
            [nameof(Checkbox<bool>.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["Disabled"] = attributeValue
            }
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup.Contains(" disabled", StringComparison.Ordinal), Is.EqualTo(disabled));
            Assert.That(markup.Contains("bui-checkbox checked disabled", StringComparison.Ordinal), Is.EqualTo(disabled));
        });
    }

    [Test]
    public async Task ValidationMessageMarksTheNativeInputInvalidAndAddsTheErrorState()
    {
        var model = new CheckboxValidationModel();
        var editContext = new EditContext(model);
        var messages = new ValidationMessageStore(editContext);
        messages.Add(() => model.Accepted, "Acceptance is required.");
        editContext.NotifyValidationStateChanged();

        var markup = await RenderCheckboxAsync<bool>(new Dictionary<string, object?>
        {
            [nameof(Checkbox<bool>.Value)] = false,
            [nameof(Checkbox<bool>.ValueExpression)] = (Expression<Func<bool>>)(() => model.Accepted),
            [nameof(Checkbox<bool>.Label)] = "Accept terms"
        }, editContext);

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("aria-invalid=\"true\""));
            Assert.That(markup, Does.Contain("bui-checkbox unchecked invalid"));
        });
    }

    [Test]
    public async Task CallerAriaInvalidAndDescriptiveAttributesArePreserved()
    {
        var markup = await RenderCheckboxAsync<bool>(new Dictionary<string, object?>
        {
            [nameof(Checkbox<bool>.Value)] = false,
            [nameof(Checkbox<bool>.Label)] = "Email notifications",
            [nameof(Checkbox<bool>.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["aria-label"] = "Email notification preference",
                ["aria-describedby"] = "email-help",
                ["aria-invalid"] = "true",
                ["data-qa"] = "email-checkbox",
                ["name"] = "emailNotifications"
            }
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("aria-label=\"Email notification preference\""));
            Assert.That(markup, Does.Contain("aria-describedby=\"email-help\""));
            Assert.That(markup, Does.Contain("aria-invalid=\"true\""));
            Assert.That(markup, Does.Contain("data-qa=\"email-checkbox\""));
            Assert.That(markup, Does.Contain("name=\"emailNotifications\""));
            Assert.That(markup, Does.Contain("bui-checkbox unchecked invalid"));
        });
    }

    [Test]
    public async Task ExplicitFalseAriaInvalidDoesNotSetTheErrorState()
    {
        var markup = await RenderCheckboxAsync<bool>(new Dictionary<string, object?>
        {
            [nameof(Checkbox<bool>.Value)] = false,
            [nameof(Checkbox<bool>.Label)] = "Example",
            [nameof(Checkbox<bool>.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["aria-invalid"] = "false"
            }
        });

        Assert.That(markup, Does.Not.Contain("bui-checkbox unchecked invalid"));
    }

    [Test]
    public void NonBooleanGenericValueIsRejected()
    {
        Assert.ThrowsAsync<InvalidOperationException>(async () =>
        {
            await RenderCheckboxAsync<int>(new Dictionary<string, object?>
            {
                [nameof(Checkbox<int>.Value)] = 1,
                [nameof(Checkbox<int>.Label)] = "Invalid"
            });
        });
    }

    private static async Task<string> RenderCheckboxAsync<TValue>(
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
                var component = await renderer.RenderComponentAsync<Checkbox<TValue>>(ParameterView.FromDictionary(parameters));
                await component.QuiescenceTask;
                markup = component.ToHtmlString();
                return;
            }

            RenderFragment childContent = builder =>
            {
                builder.OpenComponent<Checkbox<TValue>>(0);
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
        services.AddSingleton<IJSRuntime, NoOpJsRuntime>();
        services.AddBluentUI();
        return services.BuildServiceProvider();
    }

    private sealed class NoOpJsRuntime : IJSRuntime
    {
        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, object?[]? args)
            => ValueTask.FromResult(default(TValue)!);

        public ValueTask<TValue> InvokeAsync<TValue>(
            string identifier,
            CancellationToken cancellationToken,
            object?[]? args)
            => ValueTask.FromResult(default(TValue)!);
    }

    private sealed class CheckboxValidationModel
    {
        public bool Accepted { get; set; }
    }
}
