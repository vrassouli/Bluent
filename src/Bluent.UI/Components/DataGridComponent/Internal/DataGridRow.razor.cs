using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components.DataGridComponent.Internal;

public partial class DataGridRow<TItem> where TItem : class
{
    [Parameter, EditorRequired] public IEnumerable<DataGridColumn<TItem>> Columns { get; set; } = default!;
    [Parameter] public TItem? Item { get; set; }
}
