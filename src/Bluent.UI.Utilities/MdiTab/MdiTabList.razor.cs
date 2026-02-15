using Bluent.UI.Utilities.Abstractions;
using Bluent.UI.Utilities.Services;
using Bluent.UI.Utilities.Services.Events;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Utilities;

public partial class MdiTabList : IAsyncDisposable
{
    private readonly List<OpenDocumentEventArgs> _openDocuments = new();
    private readonly List<IMdiTab> _tabs = new();
    private int _selectedIndex = -1;
    private IMdiTab? _selectedTab;

    [Parameter] public EventCallback<IMdiTab?> TabChanged { get; set; }
    [Parameter] public string? Class { get; set; } = "h-100 overflow-auto";
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
            InvokeAsync(() => CloseTab(tab));
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

    public async Task CloseTab(IMdiTab tab)
    {
        var document = _openDocuments.FirstOrDefault(x => x.Id == tab.TabId);
        if (document is not null)
        {
            var currentIndex = _openDocuments.IndexOf(document);
            _openDocuments.Remove(document);

            if (currentIndex >= _openDocuments.Count)
                _selectedIndex = _openDocuments.Count - 1;

            await NotifyTabChanged(true);
        }
    }

    internal void OnDocumentRendered(IMdiTab tab)
    {
        InvokeAsync(() => NotifyTabChanged());
    }

    private void OnTabAdded(int index)
    {
#if DEBUG
        Console.WriteLine($"OnTabAdded: {index}");
#endif

        _selectedIndex = index;
    }

    private Task OnSelectedIndexChanged(int index)
    {
#if DEBUG
        Console.WriteLine($"OnSelectedIndexChanged: {index}");
#endif
        _selectedIndex = index;

        return NotifyTabChanged();
    }

    private async Task NotifyTabChanged(bool forceStateChanged = false)
    {
        IMdiTab? selectedTab = null;

        if (_selectedIndex >= 0 && _selectedIndex < _tabs.Count)
            selectedTab = _tabs[_selectedIndex];

        if (selectedTab == _selectedTab)
            return;

        if (_selectedTab != null)
            _selectedTab.Document?.OnDeactivated();

        _selectedTab = selectedTab;

        await TabChanged.InvokeAsync(_selectedTab);
        _selectedTab?.Document?.OnActivated();

        if (forceStateChanged)
            StateHasChanged();
    }
}