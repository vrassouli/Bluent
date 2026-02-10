namespace Bluent.UI.Utilities.Abstractions;

public interface IMdiTab
{
    string TabId { get; }
    IMdiDocument? Document { get; }
}