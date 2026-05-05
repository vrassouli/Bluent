namespace Bluent.UI.Utilities;

public class HierarchyItem
{
    public string Name { get; set; }
    public object? Data { get; set; }

    public HierarchyItem(string name, object? data = null)
    {
        Name = name;
        Data = data;
    }
}