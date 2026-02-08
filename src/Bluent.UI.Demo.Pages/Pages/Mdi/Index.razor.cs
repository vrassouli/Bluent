using Bluent.UI.MDI.Services;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Demo.Pages.Pages.Mdi;

public partial class Index : ComponentBase
{
    [Inject] private IMdiService MdiService { get; set; } = default!;
    
    private void OpenDoc1()
    {
        MdiService.OpenDocument<Doc1>(id: "doc1_id");
    }

    private void OpenNewDoc2()
    {
        MdiService.OpenDocument<Doc2>();
    }
}