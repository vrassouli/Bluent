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

    [Parameter] public EventCallback<IMdiTab?> TabChanged { get; set; }
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

//     protected override void OnAfterRender(bool firstRender)
//     {
// #if DEBUG
//         Console.WriteLine($"OnAfterRender {(firstRender ? "(first render)" : "")} ({GetType().Name})");
// #endif
//         base.OnAfterRender(firstRender);
//     }

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

    private Task OnTabAdded(int index)
    {
        _selectedIndex = index;

        return NotifyTabChanged();
    }

    private Task OnSelectedIndexChanged(int index)
    {
#if DEBUG
        Console.WriteLine($"OnSelectedIndexChanged: {index}");
#endif
        if (_selectedIndex >= 0 && _selectedIndex < _tabs.Count)
        {
            var selectedTab = _tabs[_selectedIndex];
            selectedTab.Document?.OnDeactivated();
        }

        _selectedIndex = index;

        if (_selectedIndex >= 0 && _selectedIndex < _tabs.Count)
        {
            var selectedTab = _tabs[_selectedIndex];
            selectedTab.Document?.OnActivated();
        }

        return NotifyTabChanged();
    }

    private Task NotifyTabChanged()
    {
        if (_selectedIndex >= 0 && _selectedIndex < _tabs.Count)
        {
            var selectedTab = _tabs[_selectedIndex];
            return TabChanged.InvokeAsync(selectedTab);
        }
        else
        {
            return TabChanged.InvokeAsync(null);
        }
    }
}