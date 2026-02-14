namespace Bluent.UI.Utilities;

public class HierarchyItemSelection : HierarchyPathSelection
{
    public string Name { get; }

    public string FullPath
    {
        get
        {
            if (string.IsNullOrEmpty(Path))
                return Name;

            return $"{Path}/{Name}";
        }
    }
    
    public HierarchyItemSelection(string? path, string name) : base(path)
    {
        Name = name;
    }
}