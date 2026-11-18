using Bluent.UI.Components;
using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.JSInterop;
using System.Linq.Expressions;
using System.Text.RegularExpressions;

namespace RegexSampleGeneratorTest;

public class RadioGroupRenderSemanticsTests
{
    [Test]
    public async Task GroupUsesNativeFieldsetLegendAndSharedNativeNameWithOptionValues()
    {
        var markup = await RenderGroupAsync(
            value: "Afternoon",
            label: "Delivery window",
            options:
            [
                new("Morning", "Morning"),
                new("Afternoon", "Afternoon"),
                new("Evening", "Evening")
            ],
            additionalAttributes: new Dictionary<string, object>
            {
                ["name"] = "deliveryWindow",
                ["aria-describedby"] = "delivery-help",
                ["data-qa"] = "delivery-group"
            });

        var inputs = GetInputTags(markup);
        var names = inputs.Select(input => GetAttribute(input, "name")).ToArray();

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("<fieldset"));
            Assert.That(markup, Does.Contain("<legend class=\"group-label\">Delivery window</legend>"));
            Assert.That(markup, Does.Not.Contain("role=\"radiogroup\""));
            Assert.That(names, Is.EqualTo(new[] { "deliveryWindow", "deliveryWindow", "deliveryWindow" }));
            Assert.That(GetAttribute(inputs[0], "value"), Is.EqualTo("Morning"));
            Assert.That(GetAttribute(inputs[1], "value"), Is.EqualTo("Afternoon"));
            Assert.That(GetAttribute(inputs[2], "value"), Is.EqualTo("Evening"));
            Assert.That(inputs[0], Does.Not.Contain(" checked"));
            Assert.That(inputs[1], Does.Contain("checked"));
            Assert.That(inputs[2], Does.Not.Contain(" checked"));
            Assert.That(markup, Does.Contain("aria-describedby=\"delivery-help\""));
            Assert.That(markup, Does.Contain("data-qa=\"delivery-group\""));
            Assert.That(markup, Does.Not.Contain("<fieldset name="));
            Assert.That(markup, Does.Contain("<span class=\"indicator\" aria-hidden=\"true\"></span>"));
        });
    }

    [Test]
    public async Task BoundGroupsUseInputBaseFieldNamesAndRemainIndependent()
    {
        var model = new TwoRadioFieldsModel();
        var markup = await RenderTwoGroupsAsync(model, bindToFields: true);
        var inputs = GetInputTags(markup);
        var names = inputs.Select(input => GetAttribute(input, "name")).ToArray();

        Assert.Multiple(() =>
        {
            Assert.That(names.Length, Is.EqualTo(4));
            Assert.That(names[0], Is.EqualTo("model.Delivery"));
            Assert.That(names[1], Is.EqualTo("model.Delivery"));
            Assert.That(names[2], Is.EqualTo("model.Contact"));
            Assert.That(names[3], Is.EqualTo("model.Contact"));
            Assert.That(names[0], Is.Not.EqualTo(names[2]));
            Assert.That(GetAttribute(inputs[0], "value"), Is.EqualTo("Morning"));
            Assert.That(GetAttribute(inputs[2], "value"), Is.EqualTo("Morning"));
        });
    }

    [Test]
    public async Task UnboundGroupsGetIndependentGeneratedNames()
    {
        var markup = await RenderTwoGroupsAsync(new TwoRadioFieldsModel(), bindToFields: false);
        var inputs = GetInputTags(markup);
        var firstGroupName = GetAttribute(inputs[0], "name");
        var secondGroupName = GetAttribute(inputs[2], "name");

        Assert.Multiple(() =>
        {
            Assert.That(firstGroupName, Is.Not.Empty);
            Assert.That(secondGroupName, Is.Not.Empty);
            Assert.That(firstGroupName, Is.EqualTo(GetAttribute(inputs[1], "name")));
            Assert.That(secondGroupName, Is.EqualTo(GetAttribute(inputs[3], "name")));
            Assert.That(firstGroupName, Is.Not.EqualTo(secondGroupName));
        });
    }

    [Test]
    public async Task RadioOwnsTypeNameValueCheckedAndNativeTabOrderAttributes()
    {
        var markup = await RenderGroupAsync(
            value: "Actual",
            label: "Choice",
            options:
            [
                new("Actual", "Actual", new Dictionary<string, object>
                {
                    ["name"] = "attacker-name",
                    ["type"] = "checkbox",
                    ["value"] = "attacker-value",
                    ["checked"] = "checked",
                    ["tabindex"] = "0",
                    ["aria-describedby"] = "choice-help"
                })
            ],
            additionalAttributes: new Dictionary<string, object>
            {
                ["name"] = "choice-group"
            });

        var input = GetInputTags(markup).Single();

        Assert.Multiple(() =>
        {
            Assert.That(GetAttribute(input, "type"), Is.EqualTo("radio"));
            Assert.That(GetAttribute(input, "name"), Is.EqualTo("choice-group"));
            Assert.That(GetAttribute(input, "value"), Is.EqualTo("Actual"));
            Assert.That(input, Does.Contain(" checked"));
            Assert.That(GetAttribute(input, "tabindex"), Is.Null);
            Assert.That(input, Does.Not.Contain("attacker-name"));
            Assert.That(input, Does.Not.Contain("attacker-value"));
            Assert.That(input, Does.Contain("aria-describedby=\"choice-help\""));
        });
    }

    [Test]
    public async Task GroupWithoutVisibleLabelCanExposeCallerAccessibleName()
    {
        var markup = await RenderGroupAsync(
            value: "Email",
            label: null,
            options: [new("Email", "Email")],
            additionalAttributes: new Dictionary<string, object>
            {
                ["aria-label"] = "Preferred contact method"
            });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("aria-label=\"Preferred contact method\""));
            Assert.That(markup, Does.Not.Contain("<legend"));
            Assert.That(GetAttribute(GetInputTags(markup).Single(), "aria-label"), Is.Null);
            Assert.That(markup, Does.Contain("<label for="));
        });
    }

    [Test]
    public async Task DisabledFieldsetAndDisabledOptionsRemainNativeDisabledControls()
    {
        var markup = await RenderGroupAsync(
            value: "Closed",
            label: "Availability",
            options:
            [
                new("Closed", "Closed", new Dictionary<string, object> { ["disabled"] = true }),
                new("Open", "Open")
            ],
            additionalAttributes: new Dictionary<string, object> { ["disabled"] = true });

        var inputs = GetInputTags(markup);

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("<fieldset disabled"));
            Assert.That(inputs[0], Does.Contain("disabled"));
            Assert.That(inputs[1], Does.Not.Contain(" disabled"));
        });
    }

    [Test]
    public async Task EditContextValidationStateChangesRerenderEveryOptionAsInvalid()
    {
        var model = new RadioValidationModel();
        var editContext = new EditContext(model);
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());

        var groupParameters = new Dictionary<string, object?>
        {
            [nameof(RadioGroup<string>.Value)] = model.Selection,
            [nameof(RadioGroup<string>.Label)] = "Delivery window",
            [nameof(RadioGroup<string>.ValueExpression)] = (Expression<Func<string?>>)(() => model.Selection),
            [nameof(RadioGroup<string>.ChildContent)] = BuildOptions<string>(
                [new("Morning", "Morning"), new("Evening", "Evening")])
        };

        RenderFragment childContent = builder =>
        {
            builder.OpenComponent<RadioGroup<string>>(0);
            var sequence = 1;
            foreach (var parameter in groupParameters)
                builder.AddAttribute(sequence++, parameter.Key, parameter.Value);
            builder.CloseComponent();
        };

        var wrapperParameters = new Dictionary<string, object?>
        {
            [nameof(CascadingValue<EditContext>.Value)] = editContext,
            [nameof(CascadingValue<EditContext>.ChildContent)] = childContent
        };

        var root = await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var component = await renderer.RenderComponentAsync<CascadingValue<EditContext>>(
                ParameterView.FromDictionary(wrapperParameters));
            await component.QuiescenceTask;
            return component;
        });

        var initialMarkup = await renderer.Dispatcher.InvokeAsync(() => root.ToHtmlString());
        Assert.That(GetInputTags(initialMarkup).All(input => GetAttribute(input, "aria-invalid") is null), Is.True);

        var messages = new ValidationMessageStore(editContext);
        await renderer.Dispatcher.InvokeAsync(() =>
        {
            messages.Add(() => model.Selection, "Choose a delivery window.");
            editContext.NotifyValidationStateChanged();
            return Task.CompletedTask;
        });
        await root.QuiescenceTask;

        var invalidMarkup = await renderer.Dispatcher.InvokeAsync(() => root.ToHtmlString());
        var inputs = GetInputTags(invalidMarkup);

        Assert.Multiple(() =>
        {
            Assert.That(inputs, Has.Length.EqualTo(2));
            Assert.That(inputs.All(input => GetAttribute(input, "aria-invalid") == "true"), Is.True);
        });
    }
    [Test]
    public async Task OrientationAndLabelPositionPreserveTheirExistingPublicContract()
    {
        var markup = await RenderGroupAsync(
            value: "High",
            label: "Priority",
            options:
            [
                new("High", "High"),
                new("Low", "Low")
            ],
            orientation: Orientation.Vertical,
            itemsLabelPosition: LabelPosition.Before);

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("class=\"bui-radio-group vertical"));
            Assert.That(markup, Does.Contain("class=\"bui-radio-box label-before"));
        });
    }

    [Test]
    public void PublicParameterSurfaceRemainsUnchanged()
    {
        var groupParameters = typeof(RadioGroup<string>).GetProperties()
            .Where(property => property.DeclaringType == typeof(RadioGroup<string>) &&
                               property.IsDefined(typeof(ParameterAttribute), inherit: true))
            .Select(property => property.Name)
            .OrderBy(name => name)
            .ToArray();

        var radioParameters = typeof(Radio<string>).GetProperties()
            .Where(property => property.DeclaringType == typeof(Radio<string>) &&
                               property.IsDefined(typeof(ParameterAttribute), inherit: true))
            .Select(property => property.Name)
            .OrderBy(name => name)
            .ToArray();

        Assert.Multiple(() =>
        {
            Assert.That(groupParameters, Is.EqualTo(new[] { "ChildContent", "ItemsLabelPosition", "Label", "Orientation" }));
            Assert.That(radioParameters, Is.EqualTo(new[] { "Label", "Value" }));
        });
    }

    private static async Task<string> RenderGroupAsync<TValue>(
        TValue? value,
        string? label,
        IReadOnlyList<RadioOption<TValue>> options,
        Dictionary<string, object>? additionalAttributes = null,
        Expression<Func<TValue?>>? valueExpression = null,
        EditContext? editContext = null,
        Orientation orientation = Orientation.Horizontal,
        LabelPosition itemsLabelPosition = LabelPosition.After)
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());

        var groupParameters = new Dictionary<string, object?>
        {
            [nameof(RadioGroup<TValue>.Value)] = value,
            [nameof(RadioGroup<TValue>.Label)] = label,
            [nameof(RadioGroup<TValue>.Orientation)] = orientation,
            [nameof(RadioGroup<TValue>.ItemsLabelPosition)] = itemsLabelPosition,
            [nameof(RadioGroup<TValue>.ChildContent)] = BuildOptions(options)
        };

        if (additionalAttributes is not null)
            groupParameters[nameof(RadioGroup<TValue>.AdditionalAttributes)] = additionalAttributes;

        if (valueExpression is not null)
            groupParameters[nameof(RadioGroup<TValue>.ValueExpression)] = valueExpression;

        string markup = string.Empty;
        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            if (editContext is null)
            {
                var component = await renderer.RenderComponentAsync<RadioGroup<TValue>>(ParameterView.FromDictionary(groupParameters));
                await component.QuiescenceTask;
                markup = component.ToHtmlString();
                return;
            }

            RenderFragment childContent = builder =>
            {
                builder.OpenComponent<RadioGroup<TValue>>(0);
                var sequence = 1;
                foreach (var parameter in groupParameters)
                    builder.AddAttribute(sequence++, parameter.Key, parameter.Value);
                builder.CloseComponent();
            };

            var wrapperParameters = new Dictionary<string, object?>
            {
                [nameof(CascadingValue<EditContext>.Value)] = editContext,
                [nameof(CascadingValue<EditContext>.ChildContent)] = childContent
            };
            var wrapper = await renderer.RenderComponentAsync<CascadingValue<EditContext>>(ParameterView.FromDictionary(wrapperParameters));
            await wrapper.QuiescenceTask;
            markup = wrapper.ToHtmlString();
        });

        return markup;
    }

    private static RenderFragment BuildOptions<TValue>(IReadOnlyList<RadioOption<TValue>> options) => builder =>
    {
        var sequence = 0;
        foreach (var option in options)
        {
            builder.OpenComponent<Radio<TValue>>(sequence++);
            builder.AddAttribute(sequence++, nameof(Radio<TValue>.Value), option.Value);
            builder.AddAttribute(sequence++, nameof(Radio<TValue>.Label), option.Label);
            if (option.AdditionalAttributes is not null)
                builder.AddAttribute(sequence++, nameof(Radio<TValue>.AdditionalAttributes), option.AdditionalAttributes);
            builder.CloseComponent();
        }
    };

    private static async Task<string> RenderTwoGroupsAsync(TwoRadioFieldsModel model, bool bindToFields)
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());

        var firstParameters = new Dictionary<string, object?>
        {
            [nameof(RadioGroup<string>.Value)] = "Morning",
            [nameof(RadioGroup<string>.Label)] = "Delivery",
            [nameof(RadioGroup<string>.ChildContent)] = BuildOptions<string>(
                [new("Morning", "Morning"), new("Evening", "Evening")])
        };
        var secondParameters = new Dictionary<string, object?>
        {
            [nameof(RadioGroup<string>.Value)] = "Morning",
            [nameof(RadioGroup<string>.Label)] = "Contact",
            [nameof(RadioGroup<string>.ChildContent)] = BuildOptions<string>(
                [new("Morning", "Morning"), new("Evening", "Evening")])
        };

        if (bindToFields)
        {
            firstParameters[nameof(RadioGroup<string>.ValueExpression)] = (Expression<Func<string?>>)(() => model.Delivery);
            secondParameters[nameof(RadioGroup<string>.ValueExpression)] = (Expression<Func<string?>>)(() => model.Contact);
        }

        RenderFragment page = builder =>
        {
            builder.OpenElement(0, "main");
            builder.OpenComponent<RadioGroup<string>>(1);
            var sequence = 2;
            foreach (var parameter in firstParameters)
                builder.AddAttribute(sequence++, parameter.Key, parameter.Value);
            builder.CloseComponent();
            builder.OpenComponent<RadioGroup<string>>(40);
            sequence = 41;
            foreach (var parameter in secondParameters)
                builder.AddAttribute(sequence++, parameter.Key, parameter.Value);
            builder.CloseComponent();
            builder.CloseElement();
        };

        string markup = string.Empty;
        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var wrapper = await renderer.RenderComponentAsync<RadioGroupTestHost>(
                ParameterView.FromDictionary(new Dictionary<string, object?> { [nameof(RadioGroupTestHost.Content)] = page }));
            await wrapper.QuiescenceTask;
            markup = wrapper.ToHtmlString();
        });

        return markup;
    }

    private static string[] GetInputTags(string markup) =>
        Regex.Matches(markup, "<input\\b[^>]*>", RegexOptions.IgnoreCase)
            .Select(match => match.Value)
            .ToArray();

    private static string? GetAttribute(string tag, string name)
    {
        var match = Regex.Match(tag, $@"\b{Regex.Escape(name)}=""([^""]*)""", RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value : null;
    }

    private static ServiceProvider CreateServices()
    {
        var services = new ServiceCollection();
        services.AddSingleton<ILoggerFactory>(NullLoggerFactory.Instance);
        services.AddSingleton<IJSRuntime, NoOpJsRuntime>();
        services.AddBluentUI();
        return services.BuildServiceProvider();
    }

    private sealed record RadioOption<TValue>(
        TValue Value,
        string Label,
        Dictionary<string, object>? AdditionalAttributes = null);

    private sealed class RadioValidationModel
    {
        public string Selection { get; set; } = "Morning";
    }

    private sealed class TwoRadioFieldsModel
    {
        public string? Delivery { get; set; }
        public string? Contact { get; set; }
    }

    private sealed class RadioGroupTestHost : ComponentBase
    {
        [Parameter] public RenderFragment? Content { get; set; }

        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            builder.AddContent(0, Content);
        }
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
}
