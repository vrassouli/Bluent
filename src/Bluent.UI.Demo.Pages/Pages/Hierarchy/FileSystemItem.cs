namespace Bluent.UI.Demo.Pages.Pages.Hierarchy;

public abstract class FileSystemItem
{
    protected FileSystemItem(string name)
    {
        Name = name;
    }

    public string Name { get; set; }
}

public sealed class FileItem : FileSystemItem
{
    public FileItem(string name) : base(name)
    {
    }
}

public sealed class DirectoryItem : FileSystemItem
{
    public List<FileSystemItem> Files { get; set; } = [];
    public List<FileSystemItem> Directories { get; set; } = [];

    public DirectoryItem(string name) : base(name)
    {
        
    }
}