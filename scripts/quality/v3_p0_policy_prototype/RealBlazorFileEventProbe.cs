using Microsoft.AspNetCore.Components.Forms;

internal sealed class SyntheticBrowserFile : IBrowserFile
{
    public string Name { get; init; }
    public DateTimeOffset LastModified { get; } = DateTimeOffset.UnixEpoch;
    public long Size => 64;
    public string ContentType => "text/plain";

    public SyntheticBrowserFile(string name) => Name = name;

    public Stream OpenReadStream(
        long maxAllowedSize = 512_000, CancellationToken cancellationToken = default)
    {
        if (maxAllowedSize < Size) throw new IOException("File too large");
        return new MemoryStream(new byte[Size], writable: false);
    }
}

internal static class RealBlazorFileEventProbe
{
    private static InputFileChangeEventArgs Event(params string[] names) =>
        new(names.Select(name => (IBrowserFile)new SyntheticBrowserFile(name)).ToArray());

    public static void Run(Action<bool, string> check)
    {
        var overBatch = Event("alpha.txt", "beta.md", "gamma.txt");
        check(overBatch.FileCount == 3, "real InputFileChangeEventArgs supplies three native file entries");
        check(overBatch.GetMultipleFiles(overBatch.FileCount).Count == 3,
            "GetMultipleFiles(FileCount) returns all three without aggregate policy");
        var multiFilePropertyRejected = false;
        try { _ = overBatch.File; }
        catch (InvalidOperationException) { multiFilePropertyRejected = true; }
        check(multiFilePropertyRejected,
            "actual File property is single-file-only; use GetMultipleFiles for multiple mode");
        var failed = false;
        try { _ = overBatch.GetMultipleFiles(2); }
        catch (InvalidOperationException) { failed = true; }
        check(failed, "actual GetMultipleFiles(remainingSlots) throws if batch exceeds slots; cannot silently truncate");

        // 2 -> remove alpha -> beta remains; two new native files in next picker event.
        var prior = new List<IBrowserFile> { new SyntheticBrowserFile("beta.md") };
        var next = Event("gamma.txt", "delta.md");
        check(next.FileCount == 2, "next actual native change reports full batch count");
        var insufficientCapacityThrows = false;
        try { _ = next.GetMultipleFiles(1); }
        catch (InvalidOperationException) { insufficientCapacityThrows = true; }
        check(insufficientCapacityThrows, "passing remaining capacity to GetMultipleFiles DOES NOT implement partial-accept policy");

        var rejected = FileSelectionModel.Apply(prior,
            next.GetMultipleFiles(next.FileCount), 2, OverflowPolicy.RejectBatch);
        check(rejected.ExceededMax && !rejected.Changed &&
              rejected.Accepted.Count == 0 && rejected.Selected.Count == 1 &&
              rejected.Selected[0].Name == "beta.md",
            "reject-batch preserves prior real IBrowserFile and dispatches no accepted change");

        var partiallyAccepted = FileSelectionModel.Apply(prior,
            next.GetMultipleFiles(next.FileCount), 2, OverflowPolicy.AcceptRemaining);
        check(partiallyAccepted.ExceededMax && partiallyAccepted.Changed &&
              partiallyAccepted.Accepted.Count == 1 &&
              partiallyAccepted.Accepted[0].Name == "gamma.txt" &&
              partiallyAccepted.Rejected.Count == 1 &&
              partiallyAccepted.Rejected[0].Name == "delta.md" &&
              partiallyAccepted.Selected.Count == 2,
            "accept-remaining requires reading full event batch then applying remaining capacity");

        var first = Event("alpha.txt");
        check(first.File.Name == "alpha.txt",
            "actual InputFileChangeEventArgs.File works for single-file replacement");
        var replacement = FileSelectionModel.Apply(
            new List<IBrowserFile> { new SyntheticBrowserFile("old.txt") },
            new List<IBrowserFile> { first.File }, 1, OverflowPolicy.RejectBatch,
            replaceSingle: true);
        check(replacement.Selected.Count == 1 &&
              replacement.Selected[0].Name == "alpha.txt",
            "single-select original behavior preserves real IBrowserFile instance");

        var exceedsFileStreamSize = false;
        try { using var bad = first.File.OpenReadStream(maxAllowedSize: 1); }
        catch (IOException) { exceedsFileStreamSize = true; }
        check(exceedsFileStreamSize,
            "IBrowserFile stream size limit is independent of MaxFiles collection capacity");
    }
}
