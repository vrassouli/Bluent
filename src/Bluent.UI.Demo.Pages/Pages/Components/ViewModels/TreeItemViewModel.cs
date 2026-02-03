namespace Bluent.UI.Demo.Pages.Components.ViewModels;

public class TreeItemViewModel
{
    public string Title { get; set; }
    public List<TreeItemViewModel> Children { get; set; }

    public TreeItemViewModel(string title)
    {
        Title = title;
        Children = new List<TreeItemViewModel>();
    }
    
    override public string ToString() => Title;
}
