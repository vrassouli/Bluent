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

public class SelectFieldRenderSemanticsTests
{
    [Test]
    public async Task ScalarSelectUsesNativeSelectAndPreservesTypedStringValue()
    {
        var model = new SelectFieldModel { Color = "Blue" };
        var markup = await RenderSelectAsync<string>(model.Color, () => model.Color,
            "<option value=\"Red\">Red</option><option value=\"Blue\">Blue</option>",
            new Dictionary<string, object>
            {
                ["id"] = "color", ["aria-label"] = "Color",
                ["aria-describedby"] = "color-help", ["data-qa"] = "select-color"
            });

        var select = GetSelectTag(markup);
        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("<select"));
            Assert.That(markup, Does.Contain("bui-select-field"));
            Assert.That(GetAttribute(select, "id"), Is.EqualTo("color"));
            Assert.That(GetAttribute(select, "name"), Is.EqualTo("model.Color"));
            Assert.That(GetAttribute(select, "aria-label"), Is.EqualTo("Color"));
            Assert.That(GetAttribute(select, "aria-describedby"), Is.EqualTo("color-help"));
            Assert.That(GetAttribute(select, "data-qa"), Is.EqualTo("select-color"));
            Assert.That(markup, Does.Contain("<option value=\"Red\">Red</option>"));
            Assert.That(markup, Does.Contain("<option value=\"Blue\">Blue</option>"));
            Assert.That(select, Does.Not.Contain(" multiple"));
        });
    }

    [Test]
    public async Task ScalarSelectPreservesTypedIntegerBinding()
    {
        var model = new SelectFieldModel { Priority = 2 };
        var markup = await RenderSelectAsync<int>(model.Priority, () => model.Priority,
            "<option value=\"1\">Low</option><option value=\"2\">Normal</option><option value=\"3\">High</option>",
            new Dictionary<string, object> { ["id"] = "priority" });

        var select = GetSelectTag(markup);
        Assert.Multiple(() =>
        {
            Assert.That(GetAttribute(select, "id"), Is.EqualTo("priority"));
            Assert.That(GetAttribute(select, "name"), Is.EqualTo("model.Priority"));
            Assert.That(markup, Does.Contain("<option value=\"2\">Normal</option>"));
        });
    }

    [Test]
    public async Task ArrayValueUsesNativeMultipleSelectAndRetainsOptionContent()
    {
        var model = new SelectFieldModel { Teams = ["ENG", "PRD"] };
        var markup = await RenderSelectAsync<string[]>(model.Teams, () => model.Teams,
            "<option value=\"ENG\">Engineering</option><option value=\"OPS\">Operations</option><option value=\"PRD\">Product</option>",
            new Dictionary<string, object> { ["id"] = "teams", ["aria-label"] = "Teams" });

        var select = GetSelectTag(markup);
        Assert.Multiple(() =>
        {
            Assert.That(select, Does.Contain("multiple"));
            Assert.That(GetAttribute(select, "id"), Is.EqualTo("teams"));
            Assert.That(GetAttribute(select, "name"), Is.EqualTo("model.Teams"));
            Assert.That(GetAttribute(select, "aria-label"), Is.EqualTo("Teams"));
            Assert.That(markup, Does.Contain("<option value=\"ENG\">Engineering</option>"));
            Assert.That(markup, Does.Contain("<option value=\"PRD\">Product</option>"));
        });
    }

    [Test]
    public async Task NumericArrayValueUsesNativeMultipleSelect()
    {
        var model = new SelectFieldModel { Codes = [1, 3] };
        var markup = await RenderSelectAsync<int[]>(model.Codes, () => model.Codes,
            "<option value=\"1\">One</option><option value=\"2\">Two</option><option value=\"3\">Three</option>",
            new Dictionary<string, object> { ["id"] = "codes" });

        Assert.That(GetSelectTag(markup), Does.Contain("multiple"));
        Assert.That(GetAttribute(GetSelectTag(markup), "name"), Is.EqualTo("model.Codes"));
    }

    [Test]
    public async Task BooleanArrayValuesUseLowercaseNativeOptionValues()
    {
        var model = new SelectFieldModel { Flags = [true] };
        var markup = await RenderSelectAsync<bool[]>(model.Flags, () => model.Flags,
            "<option value=\"true\">Enabled</option><option value=\"false\">Disabled</option>",
            new Dictionary<string, object> { ["id"] = "flags" });

        Assert.Multiple(() =>
        {
            Assert.That(GetSelectTag(markup), Does.Contain("multiple"));
            Assert.That(markup, Does.Contain("<option value=\"true\">Enabled</option>"));
            Assert.That(markup, Does.Contain("<option value=\"false\">Disabled</option>"));
        });
    }
    [Test]
    public async Task SelectPreservesDisabledRequiredAndOtherNativeAttributes()
    {
        var model = new SelectFieldModel { Color = "Blue" };
        var markup = await RenderSelectAsync<string>(model.Color, () => model.Color,
            "<option value=\"Blue\">Blue</option>",
            new Dictionary<string, object>
            {
                ["id"] = "locked-color", ["disabled"] = true,
                ["required"] = true, ["title"] = "Locked selection"
            });

        var select = GetSelectTag(markup);
        Assert.Multiple(() =>
        {
            Assert.That(select, Does.Contain("disabled"));
            Assert.That(select, Does.Contain("required"));
            Assert.That(GetAttribute(select, "title"), Is.EqualTo("Locked selection"));
        });
    }

    [Test]
    public async Task SelectSupportsOptGroupsAndEmptyPlaceholderValues()
    {
        var model = new SelectFieldModel { Color = "" };
        var markup = await RenderSelectAsync<string>(model.Color, () => model.Color,
            "<option value=\"\">Choose a color</option><optgroup label=\"Warm\"><option value=\"Red\">Red</option></optgroup>");

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("<optgroup label=\"Warm\">"));
            Assert.That(markup, Does.Contain("<option value=\"\">Choose a color</option>"));
        });
    }

    [Test]
    public async Task StartAndEndAddonsRemainOutsideTheNativeSelect()
    {
        var model = new SelectFieldModel { Color = "Blue" };
        var parameters = CreateParameters<string>(model.Color, () => model.Color, "<option value=\"Blue\">Blue</option>");
        parameters[nameof(SelectField<string>.StartAddon)] = (RenderFragment)(builder =>
        {
            builder.OpenElement(0, "span");
            builder.AddAttribute(1, "aria-hidden", "true");
            builder.AddContent(2, "Start");
            builder.CloseElement();
        });
        parameters[nameof(SelectField<string>.EndAddon)] = (RenderFragment)(builder =>
        {
            builder.OpenElement(0, "span");
            builder.AddAttribute(1, "aria-hidden", "true");
            builder.AddContent(2, "End");
            builder.CloseElement();
        });

        var markup = await RenderComponentAsync<string>(parameters);
        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("class=\"start-addon\""));
            Assert.That(markup, Does.Contain("class=\"end-addon\""));
            Assert.That(markup, Does.Contain(">Start</span>"));
            Assert.That(markup, Does.Contain(">End</span>"));
            Assert.That(markup.IndexOf("start-addon", StringComparison.Ordinal), Is.LessThan(markup.IndexOf("<select", StringComparison.Ordinal)));
            Assert.That(markup.IndexOf("end-addon", StringComparison.Ordinal), Is.GreaterThan(markup.IndexOf("</select>", StringComparison.Ordinal)));
        });
    }

    [Test]
    public async Task SizeClassConsumerClassAndStyleRemainOnTheSharedFieldShell()
    {
        var model = new SelectFieldModel { Color = "Blue" };
        var parameters = CreateParameters<string>(model.Color, () => model.Color, "<option value=\"Blue\">Blue</option>");
        parameters[nameof(SelectField<string>.Size)] = FieldSize.Large;
        parameters[nameof(SelectField<string>.Class)] = "consumer-class";
        parameters[nameof(SelectField<string>.Style)] = "max-width: 24rem";

        var markup = await RenderComponentAsync<string>(parameters);
        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("large"));
            Assert.That(markup, Does.Contain("bui-select-field"));
            Assert.That(markup, Does.Contain("consumer-class"));
            Assert.That(markup, Does.Contain("style=\"max-width: 24rem\""));
        });
    }

    [Test]
    public async Task EditContextValidationMarksTheNativeSelectInvalid()
    {
        var model = new SelectFieldModel { Color = "" };
        var editContext = new EditContext(model);
        var messages = new ValidationMessageStore(editContext);
        messages.Add(() => model.Color, "Choose a color.");
        editContext.NotifyValidationStateChanged();

        var parameters = CreateParameters<string>(model.Color, () => model.Color,
            "<option value=\"\">Choose a color</option><option value=\"Blue\">Blue</option>",
            new Dictionary<string, object> { ["id"] = "validated-color" });

        var markup = await RenderComponentAsync<string>(parameters, editContext);
        Assert.That(GetAttribute(GetSelectTag(markup), "aria-invalid"), Is.EqualTo("true"));
    }

    [Test]
    public async Task CallerNativeAndAccessibilityAttributesArePreserved()
    {
        var model = new SelectFieldModel { Color = "Blue" };
        var markup = await RenderSelectAsync<string>(model.Color, () => model.Color,
            "<option value=\"Blue\">Blue</option>",
            new Dictionary<string, object>
            {
                ["id"] = "described-color", ["aria-label"] = "Favorite color",
                ["aria-describedby"] = "color-description color-error",
                ["data-testid"] = "favorite-color", ["autocomplete"] = "off",
                ["form"] = "profile-form"
            });

        var select = GetSelectTag(markup);
        Assert.Multiple(() =>
        {
            Assert.That(GetAttribute(select, "aria-label"), Is.EqualTo("Favorite color"));
            Assert.That(GetAttribute(select, "aria-describedby"), Is.EqualTo("color-description color-error"));
            Assert.That(GetAttribute(select, "data-testid"), Is.EqualTo("favorite-color"));
            Assert.That(GetAttribute(select, "autocomplete"), Is.EqualTo("off"));
            Assert.That(GetAttribute(select, "form"), Is.EqualTo("profile-form"));
        });
    }

    [Test]
    public void DirectPublicParametersRemainOnlyChildContent()
    {
        var directParameters = typeof(SelectField<string>).GetProperties()
            .Where(property => property.DeclaringType == typeof(SelectField<string>))
            .Select(property => property.Name)
            .OrderBy(name => name)
            .ToArray();

        Assert.That(directParameters, Is.EqualTo(new[] { nameof(SelectField<string>.ChildContent) }));
    }

    private static Task<string> RenderSelectAsync<TValue>(
        TValue value, Expression<Func<TValue>> valueExpression, string options,
        Dictionary<string, object>? additionalAttributes = null) =>
        RenderComponentAsync<TValue>(CreateParameters(value, valueExpression, options, additionalAttributes));

    private static Dictionary<string, object?> CreateParameters<TValue>(
        TValue value, Expression<Func<TValue>> valueExpression, string options,
        Dictionary<string, object>? additionalAttributes = null)
    {
        var parameters = new Dictionary<string, object?>
        {
            [nameof(SelectField<TValue>.Value)] = value!,
            [nameof(SelectField<TValue>.ValueExpression)] = valueExpression,
            [nameof(SelectField<TValue>.ChildContent)] =
                (RenderFragment)(builder => builder.AddMarkupContent(0, options))
        };
        if (additionalAttributes is not null)
            parameters[nameof(SelectField<TValue>.AdditionalAttributes)] = additionalAttributes;
        return parameters;
    }

    private static async Task<string> RenderComponentAsync<TValue>(
        Dictionary<string, object?> parameters, EditContext? editContext = null)
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());
        var markup = string.Empty;

        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            if (editContext is null)
            {
                var component = await renderer.RenderComponentAsync<SelectField<TValue>>(ParameterView.FromDictionary(parameters));
                await component.QuiescenceTask;
                markup = component.ToHtmlString();
                return;
            }

            RenderFragment childContent = builder =>
            {
                builder.OpenComponent<SelectField<TValue>>(0);
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

    private static string GetSelectTag(string markup) =>
        Regex.Match(markup, "<select\\b[^>]*>", RegexOptions.IgnoreCase).Value;

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

    private sealed class SelectFieldModel
    {
        public string Color { get; set; } = string.Empty;
        public int Priority { get; set; }
        public string[] Teams { get; set; } = [];
        public int[] Codes { get; set; } = [];
        public bool[] Flags { get; set; } = [];
    }

    private sealed class NoOpJsRuntime : IJSRuntime
    {
        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, object?[]? args) =>
            ValueTask.FromResult(default(TValue)!);

        public ValueTask<TValue> InvokeAsync<TValue>(
            string identifier, CancellationToken cancellationToken, object?[]? args) =>
            ValueTask.FromResult(default(TValue)!);
    }
}
