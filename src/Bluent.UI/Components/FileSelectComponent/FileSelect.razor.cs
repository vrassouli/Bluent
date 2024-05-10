using Bluent.UI.Components.FileSelectComponent;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.JSInterop;
using System.Reflection.Metadata;

namespace Bluent.UI.Components;

public partial class FileSelect
{
    private InputFile? _filePicker;
    private List<SelectedFile> _files = new();

    [Parameter] public string? Text { get; set; }
    [Parameter] public string? Icon { get; set; }
    [Parameter] public string? ActiveIcon { get; set; }
    [Parameter] public bool ShowFileInfo { get; set; } = true;
    [Parameter] public bool AllowRemove { get; set; } = true;
    [Parameter] public ButtonAppearance Appearance { get; set; } = ButtonAppearance.Default;
    [Parameter] public EventCallback<IEnumerable<SelectedFile>> OnChange { get; set; }
    [Parameter] public bool Multiple { get; set; }
    [Inject] private IJSRuntime Js { get; set; } = default!;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-file-select";
    }

    private async Task HandleOnClick()
    {
        if (_filePicker is null)
            return;

        await Js.InvokeVoidAsync("HTMLElement.prototype.click.call", _filePicker.Element);
    }

    private void HandleFileChanged(InputFileChangeEventArgs args)
    {
        if (Multiple)
        {
            var files = args.GetMultipleFiles(args.FileCount);
            _files.AddRange(files.Select(x => new SelectedFile(x)));
        }
        else
        {
            _files.Clear();
            _files.Add(new SelectedFile(args.File));
        }

        InvokeAsync(() => OnChange.InvokeAsync(_files));
    }

    private void HandleFileRemove(SelectedFile file)
    {
        _files.Remove(file);
        InvokeAsync(() => OnChange.InvokeAsync(_files));
    }

    public static string GetIcon(string fileExtension)
    {
        return fileExtension switch
        {
            ".7z" or
            ".zip" or
            ".rar" or
            ".tar" => $"/_content/Bluent.UI/assets/file-types/archive.svg",

            ".mp3" or
            ".wav" => $"/_content/Bluent.UI/assets/file-types/audio.svg",

            ".vb" or
            ".js" or
            ".html" or
            ".css" or
            ".scss" or
            ".cpp" or
            ".java" or
            ".py" or
            ".cs" => $"/_content/Bluent.UI/assets/file-types/code.svg",

            ".doc" or
            ".docx" => $"/_content/Bluent.UI/assets/file-types/docx.svg",

            ".exe" => $"/_content/Bluent.UI/assets/file-types/exe.svg",

            ".razor" or
            ".cshtml" or
            ".html" => $"/_content/Bluent.UI/assets/file-types/html.svg",

            ".pdf" => $"/_content/Bluent.UI/assets/file-types/pdf.svg",

            ".png" or
            ".svg" or
            ".jpg" or
            ".jpeg" or
            ".tif" or
            ".bpm" => $"/_content/Bluent.UI/assets/file-types/photo.svg",

            ".ppt" or
            ".pptx" => $"/_content/Bluent.UI/assets/file-types/pptx.svg",

            ".txt" or
            ".rtf" => $"/_content/Bluent.UI/assets/file-types/txt.svg",

            ".mkv" or
            ".mpeg" or
            ".mp4" => $"/_content/Bluent.UI/assets/file-types/video.svg",

            ".xsl" or
            ".xslx" => $"/_content/Bluent.UI/assets/file-types/xlsx.svg",

            ".xml" => $"/_content/Bluent.UI/assets/file-types/xml.svg",

            _ => $"/_content/Bluent.UI/assets/file-types/genericfile.svg"
        };
    }
}
