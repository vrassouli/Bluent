using Bluent.UI.MDI.Services;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.MDI;

public partial class MdiTabList : IAsyncDisposable
{
    private readonly List<OpenDocumentEventArgs> _openDocuments = new();
    private readonly List<IMdiTab> _tabs = new();
    private int _selectedIndex;

    [Inject] private IMdiService MdiService { get; set; } = default!;

    protected override void OnInitialized()
    {
        if (MdiService is MdiService mdiService)
        {
            mdiService.OnOpen += OnOpenDocument;
            mdiService.OnClose += OnCloseDocument;
            mdiService.OnTabItemStateChanged += OnTabItemStateChanged;
        }

        base.OnInitialized();
    }

    public ValueTask DisposeAsync()
    {
        if (MdiService is MdiService mdiService)
        {
            mdiService.OnOpen -= OnOpenDocument;
            mdiService.OnClose -= OnCloseDocument;
            mdiService.OnTabItemStateChanged -= OnTabItemStateChanged;
        }

        return ValueTask.CompletedTask;
    }

    private void OnOpenDocument(object? sender, OpenDocumentEventArgs e)
    {
        var currentIndex = _openDocuments.FindIndex(x => x.Id == e.Id);

        if (currentIndex < 0)
        {
            _openDocuments.Add(e);
            _selectedIndex = _openDocuments.Count - 1;
        }
        else
        {
            _selectedIndex = currentIndex;
        }

        InvokeAsync(StateHasChanged);
    }

    private void OnCloseDocument(object? sender, CloseDocumentEventArgs e)
    {
        var tab = _tabs.FirstOrDefault(x => x.TabId == e.Id);
        if (tab != null)
            CloseTab(tab);
    }

    private void OnTabItemStateChanged(object? sender, EventArgs e)
    {
        InvokeAsync(StateHasChanged);
    }

    public void Add(IMdiTab tab)
    {
        _tabs.Add(tab);
    }

    public void Remove(IMdiTab tab)
    {
        _tabs.Remove(tab);
    }

    public void CloseTab(IMdiTab tab)
    {
        _openDocuments.RemoveAll(x => x.Id == tab.TabId);
    }
}