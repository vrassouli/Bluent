// Issue #420 — TEST-ONLY policy models; NO public Bluent component API.
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

enum OverflowPolicy { RejectBatch, AcceptRemaining }

record SelectionResult<T>(
    IReadOnlyList<T> Selected,
    IReadOnlyList<T> Accepted,
    IReadOnlyList<T> Rejected,
    bool Changed,
    bool ExceededMax
);

static class FileSelectionModel
{
    public static SelectionResult<T> Apply<T>(
        IReadOnlyList<T> current,
        IReadOnlyList<T> batch,
        int maxFiles,
        OverflowPolicy policy,
        bool replaceSingle = false,
        bool disabled = false)
    {
        if (maxFiles < 1) throw new ArgumentOutOfRangeException(nameof(maxFiles));
        if (current.Count > maxFiles) throw new ArgumentException("Current count already exceeds MaxFiles");
        if (disabled || batch.Count == 0)
            return new(current.ToArray(), Array.Empty<T>(), batch.ToArray(), false, false);

        // Existing MaxFiles=1 public behavior: one selected file replaces the old one.
        if (maxFiles == 1 && replaceSingle)
        {
            if (batch.Count > 1)
                return new(current.ToArray(), Array.Empty<T>(), batch.ToArray(), false, true);
            return new(batch.ToArray(), batch.ToArray(), Array.Empty<T>(), true, false);
        }

        var remaining = maxFiles - current.Count;
        var overflow = batch.Count > remaining;
        if (overflow && policy == OverflowPolicy.RejectBatch)
            return new(current.ToArray(), Array.Empty<T>(), batch.ToArray(), false, true);

        var accepted = batch.Take(Math.Max(remaining, 0)).ToArray();
        var rejected = batch.Skip(accepted.Length).ToArray();
        return new(current.Concat(accepted).ToArray(), accepted, rejected,
            accepted.Length > 0, overflow);
    }
}

static class SliderCoordinateModel
{
    public static double FromClientX(
        double clientX, double railLeft, double railWidth,
        double thumbSize, double min, double max, bool rtl)
    {
        if (!double.IsFinite(clientX) || !double.IsFinite(railLeft) ||
            !double.IsFinite(railWidth) || !double.IsFinite(thumbSize) ||
            !double.IsFinite(min) || !double.IsFinite(max) ||
            railWidth <= thumbSize || thumbSize < 0 || max <= min)
            throw new ArgumentException("Invalid viewport geometry/value bounds");

        var fraction = Math.Clamp((clientX - railLeft - thumbSize / 2) /
                                  (railWidth - thumbSize), 0, 1);
        if (rtl) fraction = 1 - fraction;
        return min + fraction * (max - min);
    }
}

static class ToggleSemanticsModel
{
    // PROPOSAL: explicit caller-supplied AdditionalAttributes are never overwritten.
    // Caller is responsible if an explicit value contradicts its current Toggled state.
    public static IReadOnlyDictionary<string, object?> Resolve(
        bool? toggled, IReadOnlyDictionary<string, object?> caller)
    {
        var merged = new Dictionary<string, object?>(caller, StringComparer.OrdinalIgnoreCase);
        if (toggled.HasValue && !merged.ContainsKey("aria-pressed"))
            merged["aria-pressed"] = toggled.Value ? "true" : "false";
        return merged;
    }
}

static class Check
{
    public static int Count { get; private set; }
    public static void That(bool ok, string why)
    {
        if (!ok) throw new InvalidOperationException("FAIL: " + why);
        Count++;
    }
    public static void Equal<T>(T expected, T actual, string why) where T : notnull =>
        That(EqualityComparer<T>.Default.Equals(expected, actual), why +
        $" expected {expected}, actual {actual}");
}

internal sealed class NativeAttributeOrderProbe : ComponentBase
{
    [Parameter] public bool? Toggled { get; set; }
    [Parameter] public bool CallerAttributesLast { get; set; }
    [Parameter] public Dictionary<string, object>? Incoming { get; set; }
    protected override void BuildRenderTree(RenderTreeBuilder b)
    {
        b.OpenElement(0, "button");
        if (CallerAttributesLast)
        {
            if (Toggled.HasValue) b.AddAttribute(1, "aria-pressed", Toggled.Value ? "true" : "false");
            b.AddMultipleAttributes(2, Incoming);
        }
        else
        {
            b.AddMultipleAttributes(1, Incoming);
            if (Toggled.HasValue) b.AddAttribute(2, "aria-pressed", Toggled.Value ? "true" : "false");
        }
        b.AddContent(3, "Toggle");
        b.CloseElement();
    }
}
internal static class Program {
    public static async Task Main() {
var empty = Array.Empty<string>();
var pair = new[] { "alpha.txt", "beta.md" };
var triple = new[] { "alpha.txt", "beta.md", "gamma.txt" };

foreach (var policy in Enum.GetValues<OverflowPolicy>())
{
    var normal = FileSelectionModel.Apply(empty, pair, 2, policy);
    Check.Equal(2, normal.Selected.Count, "select two");
    Check.Equal(2, normal.Accepted.Count, "two accepted");
    Check.That(!normal.ExceededMax, "exact capacity is not overflow");

    var singleBatch = FileSelectionModel.Apply(empty, triple, 2, policy);
    Check.Equal(policy == OverflowPolicy.RejectBatch ? 0 : 2,
        singleBatch.Selected.Count, "policy-specific single-batch count");
    Check.That(singleBatch.Selected.Count <= 2, "single batch cannot exceed MaxFiles");
    Check.That(singleBatch.ExceededMax, "single-batch overflow flagged");

    var remaining = new[] { "beta.md" }; // 2 -> remove alpha -> 1
    var accumulated = FileSelectionModel.Apply(remaining,
        new[] { "gamma.txt", "delta.md" }, 2, policy);
    Check.That(accumulated.Selected.Count <= 2, "cumulative cannot exceed MaxFiles");
    Check.That(accumulated.ExceededMax, "cumulative overflow flagged");
    Check.Equal(policy == OverflowPolicy.RejectBatch ? 1 : 2,
        accumulated.Selected.Count, "policy-specific accumulated count");
    Check.Equal(policy == OverflowPolicy.RejectBatch ? 0 : 1,
        accumulated.Accepted.Count, "only accepted files trigger selected callback");
    Check.Equal(policy == OverflowPolicy.RejectBatch ? 2 : 1,
        accumulated.Rejected.Count, "rejected file count");
    Check.Equal(policy == OverflowPolicy.RejectBatch ? false : true,
        accumulated.Changed, "OnChange should emit only on actual change");
}
var single = FileSelectionModel.Apply(new[] { "alpha.txt" },
    new[] { "replacement.txt" }, 1, OverflowPolicy.RejectBatch, replaceSingle: true);
Check.Equal("replacement.txt", single.Selected.Single(), "single-mode replacement");
Check.Equal(1, single.Selected.Count, "single-mode one file");
var disabled = FileSelectionModel.Apply(empty, pair, 2,
    OverflowPolicy.AcceptRemaining, disabled: true);
Check.That(!disabled.Changed && disabled.Accepted.Count == 0,
    "disabled selection not accepted");
var noChange = FileSelectionModel.Apply(empty, empty, 2, OverflowPolicy.RejectBatch);
Check.That(!noChange.Changed && !noChange.ExceededMax, "empty selection no callback");
var invalidRejected = false;
try { _ = FileSelectionModel.Apply(empty, pair, 0, OverflowPolicy.RejectBatch); }
catch (ArgumentOutOfRangeException) { invalidRejected = true; }
Check.That(invalidRejected, "invalid MaxFiles not silently treated as unlimited");

// #552 real Chrome reported screenX = clientX + 18px on eight pointerdown samples.
var correct = SliderCoordinateModel.FromClientX(0.75 * 324 + 10 + 100, 100, 344,
    20, -50, 50, rtl: false);
var incorrect = SliderCoordinateModel.FromClientX(0.75 * 324 + 10 + 118, 100, 344,
    20, -50, 50, rtl: false);
Check.That(Math.Abs(correct - 25) < 0.001, "viewport/clientX maps intended 75% correctly");
Check.That(incorrect - correct > 5.5, "screen-relative offset creates measurable wrong value");
Check.Equal(-50.0, SliderCoordinateModel.FromClientX(-300, 100, 344, 20, -50, 50, false),
    "LTR clamps left");
Check.Equal(50.0, SliderCoordinateModel.FromClientX(1300, 100, 344, 20, -50, 50, false),
    "LTR clamps right");
Check.Equal(50.0, SliderCoordinateModel.FromClientX(-300, 100, 344, 20, -50, 50, true),
    "RTL inversion under proposal");
Check.Equal(-50.0, SliderCoordinateModel.FromClientX(1300, 100, 344, 20, -50, 50, true),
    "RTL right endpoint");
var invalidGeometryRejected = false;
try { _ = SliderCoordinateModel.FromClientX(10, 0, 20, 20, 0, 100, false); }
catch (ArgumentException) { invalidGeometryRejected = true; }
Check.That(invalidGeometryRejected, "degenerate rail guard");

var none = ToggleSemanticsModel.Resolve(null,
    new Dictionary<string, object?>());
Check.That(!none.ContainsKey("aria-pressed"), "ordinary Button no bogus pressed semantics");
var off = ToggleSemanticsModel.Resolve(false,
    new Dictionary<string, object?>());
Check.Equal("false", (string)off["aria-pressed"]!, "toggled false aria pressed");
var on = ToggleSemanticsModel.Resolve(true,
    new Dictionary<string, object?>());
Check.Equal("true", (string)on["aria-pressed"]!, "toggled true aria pressed");
var overrideAttrs = ToggleSemanticsModel.Resolve(true,
    new Dictionary<string, object?> { ["ARIA-PRESSED"] = "mixed", ["aria-label"] = "Save" });
Check.Equal("mixed", (string)overrideAttrs["aria-pressed"]!, "caller override precedence proposal");
Check.Equal("Save", (string)overrideAttrs["aria-label"]!, "unrelated caller attributes preserved");
Check.Equal(2, overrideAttrs.Count, "no case-insensitive duplicate aria pressed");

// The real ASP.NET Core 10 HtmlRenderer resolves RenderTreeBuilder duplicates;
// a pure Dictionary model alone cannot tell which attribute actually wins.
var services = new ServiceCollection().AddLogging().BuildServiceProvider();
await using var renderer = new HtmlRenderer(services, services.GetRequiredService<ILoggerFactory>());
async Task<string> Render(bool? toggled, bool callerLast, Dictionary<string, object>? incoming = null) =>
    await renderer.Dispatcher.InvokeAsync(async () =>
        (await renderer.RenderComponentAsync<NativeAttributeOrderProbe>(ParameterView.FromDictionary(
            new Dictionary<string, object?> {
                ["Toggled"] = toggled, ["CallerAttributesLast"] = callerLast,
                ["Incoming"] = incoming
            }))).ToHtmlString());
var nativeDefault = await Render(null, false);
var nativeOn = await Render(true, false);
var nativeOverrideEarlier = await Render(true, false,
    new Dictionary<string, object> { ["aria-pressed"] = "mixed", ["data-qa"] = "kept" });
var nativeOverrideLater = await Render(true, true,
    new Dictionary<string, object> { ["aria-pressed"] = "mixed", ["data-qa"] = "kept" });
Console.WriteLine("ACTUAL BLAZOR renderer attribute collision, library-last: " + nativeOverrideEarlier);
Console.WriteLine("ACTUAL BLAZOR renderer attribute collision, consumer-last: " + nativeOverrideLater);
Check.That(!nativeDefault.Contains("aria-pressed", StringComparison.OrdinalIgnoreCase),
    "real rendered ordinary native Button omits pressed");
Check.That(nativeOn.Contains("aria-pressed=\"true\"", StringComparison.OrdinalIgnoreCase),
    "real rendered toggle gets pressed=true");
Check.That(nativeOverrideEarlier.Contains("data-qa=\"kept\""),
    "real renderer keeps unrelated consumer attribute");
Check.That(nativeOverrideLater.Contains("data-qa=\"kept\""),
    "real renderer keeps unrelated consumer attr in reverse order");
Check.That(nativeOverrideEarlier.Contains("aria-pressed=\"true\"", StringComparison.OrdinalIgnoreCase),
    "actual Blazor explicit library attribute wins if placed AFTER caller attributes");
Check.That(nativeOverrideLater.Contains("aria-pressed=\"mixed\"", StringComparison.OrdinalIgnoreCase),
    "actual Blazor caller-provided pressed value wins if placed AFTER library default");
Check.Equal(1, Regex.Matches(nativeOverrideEarlier, "aria-pressed", RegexOptions.IgnoreCase).Count,
    "rendered element has no duplicate aria-pressed when library wins");
Check.Equal(1, Regex.Matches(nativeOverrideLater, "aria-pressed", RegexOptions.IgnoreCase).Count,
    "rendered element has no duplicate aria-pressed when caller wins");
RealBlazorFileEventProbe.Run(Check.That);
// Real Blazor HTML emission for the proposed over-capacity feedback and
// filename-specific remove actions, without changing the product FileSelect.
async Task<string> RenderFeedback(string[] selected, string? error, string verb = "Remove") =>
    await renderer.Dispatcher.InvokeAsync(async () =>
        (await renderer.RenderComponentAsync<FileSelectionFeedbackProbe>(ParameterView.FromDictionary(
            new Dictionary<string, object?> {
                ["SelectedNames"] = selected, ["Error"] = error, ["RemoveVerb"] = verb
            }))).ToHtmlString());
var rejectedHtml = await RenderFeedback(new[] { "beta.md" },
    "You can select at most 2 files. No new files were added.");
Check.That(rejectedHtml.Contains("role=\"alert\""),
    "rejected batch feedback has native accessible alert role");
Check.That(rejectedHtml.Contains("No new files were added."),
    "visible rejection explains atomic reject policy");
Check.That(rejectedHtml.Contains("aria-label=\"Remove beta.md\""),
    "real Blazor HTML assigns descriptive per-file remove button name");
Check.That(!rejectedHtml.Contains("gamma.txt") && !rejectedHtml.Contains("delta.md"),
    "old accepted file remains; over-limit new files absent from rendered cards");
var successHtml = await RenderFeedback(new[] { "alpha.txt", "beta.md" }, null);
Check.That(!successHtml.Contains("role=\"alert\""),
    "success should not display stale file-capacity error");
Check.That(Regex.Matches(successHtml, "aria-label=", RegexOptions.IgnoreCase).Count == 2,
    "exact-capacity success renders two accessible remove actions");
var escapedHtml = await RenderFeedback(new[] { "x<evil>&.txt" }, null, "حذف");
Console.WriteLine("REAL FILE RENDER " + escapedHtml);
Check.That(escapedHtml.Contains("aria-label=\"&#x62D;&#x630;&#x641; x&lt;evil&gt;&amp;.txt\""),
    "actual Blazor renderer HTML-escapes untrusted file names in localized accessible label");
Check.That(System.Net.WebUtility.HtmlDecode(escapedHtml).Contains("aria-label=\"حذف x<evil>&.txt\""),
    "decoded accessible label keeps intended RTL/Persian language and filename");
Check.That(!escapedHtml.Contains("<evil>"),
    "untrusted filename is emitted as encoded text not interpreted markup");
Console.WriteLine($"PASS #420 proposed policies: {Check.Count} executable .NET assertions. " +
    "This is QA-only modeling, not shipped component code, accepted API/design, or OS/AT.");


    }
}
