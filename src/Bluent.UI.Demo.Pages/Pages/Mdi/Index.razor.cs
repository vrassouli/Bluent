using Bluent.UI.Utilities.Abstractions;
using Bluent.UI.Utilities.Services;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Demo.Pages.Pages.Mdi;

public partial class Index : ComponentBase
{
    private IMdiTab? _tab;
    [Inject] private IMdiService MdiService { get; set; } = default!;
    
    private void OpenDoc1()
    {
        MdiService.OpenDocument<Doc1>(id: "doc1_id");
    }

    private void OpenNewDoc2()
    {
        MdiService.OpenDocument<Doc2>();
    }

    private void OnTabChanged(IMdiTab? tab)
    {
        _tab = tab;
        
        Console.WriteLine("Tab Changed to: " + tab?.Document?.Title);
    }
}