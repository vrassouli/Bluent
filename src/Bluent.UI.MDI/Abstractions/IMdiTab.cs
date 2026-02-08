namespace Bluent.UI.MDI.Services;

public interface IMdiTab
{
    string TabId { get; }
    IMdiDocument? Document { get; }
}