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

    [Test]
    public async Task OptInTitleDialogsReferenceExactlyTheirOwnHeadings()
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());
        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var container = await renderer.RenderComponentAsync<DialogContainer>();
            var dialogService = services.GetRequiredService<IDialogService>();
            _ = dialogService.ShowAsync<EmptyDialogBody>(
                "First real heading", null,
                options => options.SetAccessibleDialog("Outdated fallback", "Close dialog"));
            _ = dialogService.ShowAsync<EmptyDialogBody>(
                "Second real heading", null,
                options => options.SetAccessibleDialog("Other fallback", "Close dialog"));
            await container.QuiescenceTask;

            var html = container.ToHtmlString();
            var refs = System.Text.RegularExpressions.Regex.Matches(
                html, "aria-labelledby=\"([^\"]+)\"");
            Assert.That(refs.Count, Is.EqualTo(2), html);
            Assert.That(refs[0].Groups[1].Value, Is.Not.EqualTo(refs[1].Groups[1].Value));
            foreach (System.Text.RegularExpressions.Match match in refs)
                Assert.That(CountOccurrences(html, "id=\"" + match.Groups[1].Value + "\""),
                            Is.EqualTo(1), html);
            Assert.Multiple(() =>
            {
                Assert.That(html, Does.Contain("First real heading"));
                Assert.That(html, Does.Contain("Second real heading"));
                Assert.That(html, Does.Not.Contain("Outdated fallback\""));
                Assert.That(html, Does.Not.Contain("Other fallback\""));
            });
        });
    }

    [Test]
    public async Task OptInCustomContentWithoutHeaderRetainsExplicitNameOnly()
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());
        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var container = await renderer.RenderComponentAsync<DialogContainer>();
            var dialogService = services.GetRequiredService<IDialogService>();
            _ = dialogService.ShowAsync(TextContent("Custom, no h2"),
                new DialogConfiguration(modal: false) { AccessibleName = "پنجره سفارشی" });
            await container.QuiescenceTask;
            var html = container.ToHtmlString();
            Assert.Multiple(() =>
            {
                Assert.That(html, Does.Contain("role=\"dialog\""));
                Assert.That(System.Net.WebUtility.HtmlDecode(html), Does.Contain("aria-label=\"پنجره سفارشی\""));
                Assert.That(html, Does.Not.Contain("aria-labelledby="));
            });
        });
    }

    [Test]
    public async Task OptedInTitleAndCustomDialogsDescribeOnlyTheirOwnVisibleNodes()
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());
        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var container = await renderer.RenderComponentAsync<DialogContainer>();
            var service = services.GetRequiredService<IDialogService>();
            _ = service.ShowAsync<EmptyDialogBody>("Titled content", null,
                options => options.SetAccessibleDialog("Titled content", "Close")
                                  .SetAccessibleDescription("Visible explanatory text"));
            _ = service.ShowAsync(TextContent("Custom body"), new DialogConfiguration(modal: false)
            {
                AccessibleName = "پنجره سفارشی",
                AccessibleDescription = "توضیح سفارشی"
            });
            await container.QuiescenceTask;
            var html = System.Net.WebUtility.HtmlDecode(container.ToHtmlString());
            var refs = System.Text.RegularExpressions.Regex.Matches(html, "aria-describedby=\"([^\"]+)\"");
            Assert.That(refs.Count, Is.EqualTo(2), html);
            Assert.That(refs[0].Groups[1].Value, Is.Not.EqualTo(refs[1].Groups[1].Value));
            foreach (System.Text.RegularExpressions.Match match in refs)
                Assert.That(CountOccurrences(html, "id=\"" + match.Groups[1].Value + "\""),
                    Is.EqualTo(1), html);
            Assert.Multiple(() =>
            {
                Assert.That(html, Does.Contain("Visible explanatory text"));
                Assert.That(html, Does.Contain("توضیح سفارشی"));
                Assert.That(html, Does.Contain("Titled content"));
                Assert.That(html, Does.Contain("aria-label=\"پنجره سفارشی\""));
                Assert.That(CountOccurrences(html, "class=\"bui-v3-dialog-description\""), Is.EqualTo(2));
            });
        });
    }

    [Test]
    public async Task LegacyDialogWithoutV3OptInKeepsOriginalUnnamedAndNoKeyboardAttributes()
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());
        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var container = await renderer.RenderComponentAsync<DialogContainer>();
            _ = services.GetRequiredService<IDialogService>().ShowAsync(TextContent("Legacy default behavior"));
            await container.QuiescenceTask;

            var html = container.ToHtmlString();
            Assert.Multiple(() =>
            {
                Assert.That(html, Does.Contain("Legacy default behavior"));
                Assert.That(html, Does.Not.Contain("role=\"dialog\""));
                Assert.That(html, Does.Not.Contain("aria-modal=\"true\""));
                Assert.That(html, Does.Not.Contain("aria-labelledby="));
                Assert.That(html, Does.Not.Contain("aria-describedby="));
                Assert.That(html, Does.Not.Contain("data-bui-v3-keyboard-modal"));
                Assert.That(html, Does.Not.Contain("bui-v3-dialog-description"));
            });
        });
    }

    [Test]
    public async Task LegacyDialogHasNoImplicitDescriptionMarkup()
    {
        await using var services = CreateServices();
        await using var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());
        await renderer.Dispatcher.InvokeAsync(async () =>
        {
            var container = await renderer.RenderComponentAsync<DialogContainer>();
            _ = services.GetRequiredService<IDialogService>().ShowAsync(TextContent("Legacy content"));
            await container.QuiescenceTask;
            var html = container.ToHtmlString();
            Assert.Multiple(() =>
            {
                Assert.That(html, Does.Not.Contain("aria-describedby="));
                Assert.That(html, Does.Not.Contain("bui-v3-dialog-description"));
            });
        });
    }
    [Test]
    public async Task PageLocalV3DialogMustCompletePendingResultWhenHostIsDisposed()
    {
        await using var services = CreateServices();
        var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());
        Task<dynamic?>? pending = null;
        try
        {
            await renderer.Dispatcher.InvokeAsync(async () =>
            {
                var container = await renderer.RenderComponentAsync<DialogContainer>();
                pending = services.GetRequiredService<IDialogService>().ShowAsync(
                    TextContent("Navigate away with pending v3 Dialog"),
                    new DialogConfiguration(modal: true)
                    {
                        AccessibleName = "Route-local active Dialog",
                        EnableModalKeyboard = true
                    });
                await container.QuiescenceTask;
                Assert.That(pending.IsCompleted, Is.False);
            });
        }
        finally
        {
            await renderer.DisposeAsync();
        }

        Assert.That(pending, Is.Not.Null);
        Assert.That(pending!.IsCompleted, Is.True,
            "When the route-local DialogContainer is disposed, an awaited opted-in Dialog task must not hang.");
        Assert.That((object?)await pending, Is.Null);
    }
    [Test]
    public async Task PageLocalHostDisposalCompletesAllOptInResultsAndLeavesLegacyContractAlone()
    {
        await using var services = CreateServices();
        var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());
        Task<dynamic?>? named = null, keyboardOnly = null, legacy = null;
        try
        {
            await renderer.Dispatcher.InvokeAsync(async () =>
            {
                var container = await renderer.RenderComponentAsync<DialogContainer>();
                var dialogService = services.GetRequiredService<IDialogService>();
                named = dialogService.ShowAsync(TextContent("Named"), new DialogConfiguration { AccessibleName = "Name" });
                keyboardOnly = dialogService.ShowAsync(TextContent("Keyboard"), new DialogConfiguration { EnableModalKeyboard = true });
                legacy = dialogService.ShowAsync(TextContent("Legacy"));
                await container.QuiescenceTask;
                Assert.That(named.IsCompleted || keyboardOnly.IsCompleted || legacy.IsCompleted, Is.False);
            });
        }
        finally
        {
            await renderer.DisposeAsync();
        }

        Assert.Multiple(() =>
        {
            Assert.That(named!.IsCompletedSuccessfully, Is.True);
            Assert.That(keyboardOnly!.IsCompletedSuccessfully, Is.True);
            Assert.That(legacy!.IsCompleted, Is.False,
                "Existing v2 non-opt-in lifetime behavior must not change on the isolated research branch.");
        });
        Assert.That((object?)await named!, Is.Null);
        Assert.That((object?)await keyboardOnly!, Is.Null);
    }
    public sealed class EmptyDialogBody : ComponentBase { }
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
