using Bluent.UI.Components;
using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.JSInterop;
using System.Globalization;
using System.Text.RegularExpressions;

namespace RegexSampleGeneratorTest;

public sealed class DateFieldCalendarRenderSemanticsTests
{
    [Test]
    public async Task DayCalendarUsesNativeDateButtonsAndKeepsFocusInsideTheAllowedRange()
    {
        var minimum = new DateTime(2026, 4, 9);
        var maximum = new DateTime(2026, 4, 10);
        var markup = await RenderCalendarAsync<DateTime?>(new Dictionary<string, object?>
        {
            [nameof(Calendar<DateTime?>.SelectedDate)] = minimum,
            [nameof(Calendar<DateTime?>.Culture)] = CultureInfo.GetCultureInfo("en-US"),
            [nameof(Calendar<DateTime?>.Min)] = minimum,
            [nameof(Calendar<DateTime?>.Max)] = maximum,
            [nameof(Calendar<DateTime?>.Class)] = "datefield-calendar"
        });

        var selectedButton = Regex.Match(markup, @"<button\b[^>]*aria-pressed=""true""[^>]*>");
        var dayButtons = Regex.Matches(markup, @"<button\b[^>]*aria-label=""[^""]+,\s*April\s+\d{1,2},\s+2026""[^>]*>");

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("dir=\"ltr\""));
            Assert.That(markup, Does.Contain("role=\"grid\""));
            Assert.That(markup, Does.Contain("aria-label=\"April 2026\""));
            Assert.That(selectedButton.Success, Is.True);
            Assert.That(selectedButton.Value, Does.Contain("tabindex=\"0\""));
            Assert.That(GetButtonTagContaining(markup, "aria-label=\"Friday, April 10, 2026\""), Does.Contain("aria-pressed=\"false\""));
            Assert.That(dayButtons.Count, Is.GreaterThanOrEqualTo(2));
            Assert.That(markup, Does.Contain(" disabled "));
            Assert.That(markup, Does.Not.Contain("aria-modal="));
        });
    }

    [Test]
    public async Task CalendarExposesTheCurrentViewAsItsAccessibleHeading()
    {
        var markup = await RenderCalendarAsync<DateTime?>(new Dictionary<string, object?>
        {
            ["Id"] = "datefield-dialog-calendar",
            [nameof(Calendar<DateTime?>.SelectedDate)] = new DateTime(2026, 4, 9),
            [nameof(Calendar<DateTime?>.Culture)] = CultureInfo.GetCultureInfo("en-US")
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("id=\"datefield-dialog-calendar-heading\""));
            Assert.That(markup, Does.Contain("aria-live=\"polite\""));
            Assert.That(markup, Does.Contain(">April 2026</h2>"));
        });
    }

    [Test]
    public async Task CalendarUsesCultureDirectionAndRendersEveryMonthInAThirteenMonthYear()
    {
        var culture = (CultureInfo)CultureInfo.GetCultureInfo("he-IL").Clone();
        culture.DateTimeFormat.Calendar = new HebrewCalendar();
        var selected = culture.DateTimeFormat.Calendar.ToDateTime(5784, 13, 1, 0, 0, 0, 0);

        var markup = await RenderCalendarAsync<DateTime?>(new Dictionary<string, object?>
        {
            [nameof(Calendar<DateTime?>.SelectedDate)] = selected,
            [nameof(Calendar<DateTime?>.Culture)] = culture,
            [nameof(Calendar<DateTime?>.Mode)] = CalendarMode.MonthSelect,
            [nameof(Calendar<DateTime?>.Min)] = selected.AddDays(-20),
            [nameof(Calendar<DateTime?>.Max)] = selected.AddDays(20)
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("dir=\"rtl\""));
            Assert.That(markup, Does.Contain("role=\"group\""));
            Assert.That(markup, Does.Contain("aria-label=\"Choose month\""));
            Assert.That(Regex.Matches(markup, @"<button\b").Count, Is.EqualTo(16),
                "The month view has 13 month choices plus its title and two navigation buttons.");
        });
    }

    [Test]
    public async Task CalendarDisablesMonthsThatDoNotIntersectTheSelectionRange()
    {
        var selected = new DateTime(2026, 4, 9);
        var markup = await RenderCalendarAsync<DateTime?>(new Dictionary<string, object?>
        {
            [nameof(Calendar<DateTime?>.SelectedDate)] = selected,
            [nameof(Calendar<DateTime?>.Culture)] = CultureInfo.GetCultureInfo("en-US"),
            [nameof(Calendar<DateTime?>.Mode)] = CalendarMode.MonthSelect,
            [nameof(Calendar<DateTime?>.Min)] = selected,
            [nameof(Calendar<DateTime?>.Max)] = selected.AddDays(1)
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("aria-label=\"April\" aria-pressed=\"true\" tabindex=\"0\""));
            Assert.That(GetButtonTagContaining(markup, "aria-label=\"January\""), Does.Contain(" disabled "));
            Assert.That(GetButtonTagContaining(markup, "aria-label=\"January\""), Does.Contain("aria-pressed=\"false\""));
            Assert.That(GetButtonTagContaining(markup, "aria-label=\"December\""), Does.Contain(" disabled "));
            Assert.That(markup, Does.Contain("tabindex=\"0\""));
        });
    }

    [Test]
    public async Task DateFieldFormatsDateTimeAndDateOnlyForEachSelectionPrecision()
    {
        var dateTime = new DateTime(2026, 4, 9, 18, 30, 0);
        var dateOnly = new DateOnly(2026, 4, 9);

        var day = await RenderDateFieldAsync<DateTime>(new Dictionary<string, object?>
        {
            [nameof(DateField<DateTime>.Value)] = dateTime,
            [nameof(DateField<DateTime>.Culture)] = CultureInfo.GetCultureInfo("en-US"),
            ["id"] = "day-field"
        });
        var month = await RenderDateFieldAsync<DateOnly>(new Dictionary<string, object?>
        {
            [nameof(DateField<DateOnly>.Value)] = dateOnly,
            [nameof(DateField<DateOnly>.Mode)] = CalendarMode.MonthSelect,
            [nameof(DateField<DateOnly>.Culture)] = CultureInfo.GetCultureInfo("en-US"),
            ["id"] = "month-field"
        });
        var year = await RenderDateFieldAsync<DateTime?>(new Dictionary<string, object?>
        {
            [nameof(DateField<DateTime?>.Value)] = dateTime,
            [nameof(DateField<DateTime?>.Mode)] = CalendarMode.YearSelect,
            [nameof(DateField<DateTime?>.Culture)] = CultureInfo.GetCultureInfo("en-US"),
            ["id"] = "year-field"
        });

        Assert.Multiple(() =>
        {
            Assert.That(day, Does.Contain("id=\"day-field\""));
            Assert.That(day, Does.Contain("value=\"2026/04/09\""));
            Assert.That(month, Does.Contain("id=\"month-field\""));
            Assert.That(month, Does.Contain("value=\"2026/04\""));
            Assert.That(year, Does.Contain("id=\"year-field\""));
            Assert.That(year, Does.Contain("value=\"2026\""));
            Assert.That(day, Does.Contain("dir=\"ltr\""));
            Assert.That(day, Does.Contain("aria-haspopup=\"dialog\""));
            Assert.That(day, Does.Contain("Choose a date"));
        });
    }

    [Test]
    public async Task CalendarTriggerCanBeHiddenOrReplacedByAConsumerEndAddon()
    {
        var hidden = await RenderDateFieldAsync<DateOnly?>(new Dictionary<string, object?>
        {
            [nameof(DateField<DateOnly?>.Value)] = new DateOnly(2026, 4, 9),
            [nameof(DateField<DateOnly?>.DisplayCalendar)] = false
        });
        var customAddon = (RenderFragment)(builder =>
        {
            builder.OpenElement(0, "span");
            builder.AddAttribute(1, "data-qa", "custom-date-addon");
            builder.AddContent(2, "Custom action");
            builder.CloseElement();
        });
        var replaced = await RenderDateFieldAsync<DateOnly?>(new Dictionary<string, object?>
        {
            [nameof(DateField<DateOnly?>.Value)] = new DateOnly(2026, 4, 9),
            [nameof(DateField<DateOnly?>.EndAddon)] = customAddon
        });

        Assert.Multiple(() =>
        {
            Assert.That(hidden, Does.Not.Contain("aria-haspopup=\"dialog\""));
            Assert.That(hidden, Does.Not.Contain("Choose a date"));
            Assert.That(replaced, Does.Contain("data-qa=\"custom-date-addon\""));
            Assert.That(replaced, Does.Not.Contain("Choose a date"));
        });
    }

    [Test]
    public async Task DateFieldPreservesNativeAttributesAndSharedFieldCustomization()
    {
        var markup = await RenderDateFieldAsync<DateOnly?>(new Dictionary<string, object?>
        {
            [nameof(DateField<DateOnly?>.Value)] = new DateOnly(2026, 4, 9),
            [nameof(DateField<DateOnly?>.Size)] = FieldSize.Large,
            [nameof(DateField<DateOnly?>.Class)] = "consumer-date-field",
            [nameof(DateField<DateOnly?>.Style)] = "max-width: 24rem",
            [nameof(DateField<DateOnly?>.StartAddon)] = (RenderFragment)(builder => builder.AddContent(0, "Start")),
            [nameof(DateField<DateOnly?>.AdditionalAttributes)] = new Dictionary<string, object>
            {
                ["id"] = "custom-date",
                ["aria-label"] = "Invoice date",
                ["aria-describedby"] = "invoice-date-help",
                ["autocomplete"] = "off",
                ["data-qa"] = "invoice-date"
            }
        });

        Assert.Multiple(() =>
        {
            Assert.That(markup, Does.Contain("bui-field"));
            Assert.That(markup, Does.Contain("large"));
            Assert.That(markup, Does.Contain("consumer-date-field"));
            Assert.That(markup, Does.Contain("style=\"max-width: 24rem\""));
            Assert.That(markup, Does.Contain("id=\"custom-date\""));
            Assert.That(markup, Does.Contain("aria-label=\"Invoice date\""));
            Assert.That(markup, Does.Contain("aria-describedby=\"invoice-date-help\""));
            Assert.That(markup, Does.Contain("autocomplete=\"off\""));
            Assert.That(markup, Does.Contain("data-qa=\"invoice-date\""));
            Assert.That(markup, Does.Contain("dir=\"ltr\""));
        });
    }

    [Test]
    public void DateFieldRejectsUnsupportedGenericTypesAndInvertedBounds()
    {
        Assert.ThrowsAsync<InvalidOperationException>(async () =>
            await RenderDateFieldAsync<int>(new Dictionary<string, object?>
            {
                [nameof(DateField<int>.Value)] = 1
            }));

        Assert.ThrowsAsync<ArgumentException>(async () =>
            await RenderDateFieldAsync<DateTime?>(new Dictionary<string, object?>
            {
                [nameof(DateField<DateTime?>.Value)] = new DateTime(2026, 4, 9),
                [nameof(DateField<DateTime?>.Min)] = new DateTime(2026, 4, 10),
                [nameof(DateField<DateTime?>.Max)] = new DateTime(2026, 4, 9)
            }));
    }

    private static string GetButtonTagContaining(string markup, string marker) =>
        markup.Split("<button", StringSplitOptions.RemoveEmptyEntries)
            .Select(part => part.Split('>')[0])
            .First(part => part.Contains(marker, StringComparison.Ordinal));

    private static Task<string> RenderCalendarAsync<TValue>(Dictionary<string, object?> parameters) =>
        RenderComponentAsync<Calendar<TValue>>(parameters);

    private static Task<string> RenderDateFieldAsync<TValue>(Dictionary<string, object?> parameters) =>
        RenderComponentAsync<DateField<TValue>>(parameters);

    private static async Task<string> RenderComponentAsync<TComponent>(Dictionary<string, object?> parameters)
        where TComponent : IComponent
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());
        var markup = string.Empty;

        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var component = await renderer.RenderComponentAsync<TComponent>(ParameterView.FromDictionary(parameters));
            await component.QuiescenceTask;
            markup = component.ToHtmlString();
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
        public ValueTask<TValue> InvokeAsync<TValue>(string identifier, object?[]? args) =>
            ValueTask.FromResult(default(TValue)!);

        public ValueTask<TValue> InvokeAsync<TValue>(
            string identifier,
            CancellationToken cancellationToken,
            object?[]? args) =>
            ValueTask.FromResult(default(TValue)!);
    }
}