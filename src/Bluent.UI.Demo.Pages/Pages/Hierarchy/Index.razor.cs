using Bluent.UI.Utilities;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Demo.Pages.Pages.Hierarchy;

public partial class Index : ComponentBase
{
    private List<FileSystemItem> _fileSystemItems;
    private HierarchyTreeBrowser? _tree;

    public Index()
    {
        _fileSystemItems =
        [
            new DirectoryItem("Dir1")
            {
                Files =
                [
                    new FileItem("File1"),
                    new FileItem("File2")
                ],
                Directories =
                [
                    new DirectoryItem("Dir1.1"),
                    new DirectoryItem("Dir1.2")
                    {
                        Files = [new FileItem("File3")],
                        Directories = [new DirectoryItem("Dir1.2.1")]
                    },
                    new DirectoryItem("Dir1.3")
                ]
            },
            new DirectoryItem("Dir2")
            {
                Files =
                [
                    new FileItem("File1"),
                    new FileItem("File2")
                ],
                Directories =
                [
                    new DirectoryItem("Dir2.1"),
                    new DirectoryItem("Dir2.2")
                ]
            },
            new FileItem("File3")
        ];
    }

    private ValueTask<List<HierarchyItem>> ReadList(string? path)
    {
        var list = new List<HierarchyItem>();

        if (string.IsNullOrEmpty(path))
        {
            foreach (var item in _fileSystemItems.OrderBy(x => x is not DirectoryItem).ThenBy(x => x.Name))
            {
                if (item is FileItem fileItem)
                    list.Add(new HierarchyItem(fileItem.Name));
                else if (item is DirectoryItem directoryItem)
                    list.Add(new HierarchyRootItem(directoryItem.Name));
            }
        }
        else
        {
            var directory = FindDirectory(_fileSystemItems, path);
            if (directory != null)
            {
                foreach (var fileItem in directory.Directories.OrderBy(x => x.Name))
                    list.Add(new HierarchyRootItem(fileItem.Name));
                
                foreach (var fileItem in directory.Files.OrderBy(x => x.Name))
                    list.Add(new HierarchyItem(fileItem.Name));
            }
        }
        
        return new ValueTask<List<HierarchyItem>>(list);
    }

    private void OnCreateFolder(HierarchyPathSelection pathSelection)
    {
        if (pathSelection.Path is null)
            return;
        
        CreateDirectory(_fileSystemItems, pathSelection.Path);
    }

    private void CreateDirectory(List<FileSystemItem> directories, string path)
    {
        var parts = path.Split('/', '\\', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        
        if (parts.Length > 0)
        {
            var dirName = parts[0];
            
            var directory = directories.FirstOrDefault(d => d.Name == dirName);

            if (directory is DirectoryItem directoryItem)
            {
                if (parts.Length == 1)
                    return; // already exists!
                
                var subDirectoryPath = string.Join("/", parts.Skip(1));
                CreateDirectory(directoryItem.Directories, subDirectoryPath);
            }
            else
            {
                directories.Add(new DirectoryItem(dirName));
            }
        }
    }

    private DirectoryItem? FindDirectory(List<FileSystemItem> directories, string path)
    {
        var parts = path.Split('/', '\\', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        if (parts.Length > 0)
        {
            var root = parts[0];
            
            var directory = directories.FirstOrDefault(d => d.Name == root);

            if (directory is DirectoryItem directoryItem)
            {
                if (parts.Length == 1)
                    return directoryItem;

                var subDirectoryPath = string.Join("/", parts.Skip(1));
                return FindDirectory(directoryItem.Directories, subDirectoryPath);
            }
        }

        return null;
    }

    private void OnRenameItem((HierarchyPathSelection pathSelection, string name) item)
    {
        
    }
}