using Humanizer;
using Microsoft.AspNetCore.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Components;

public partial class Avatar
{
    [Parameter] public string? Initials { get; set; }
    [Parameter] public string? Name { get; set; }
    [Parameter] public string? ImageSource { get; set; }
    [Parameter] public string? Icon { get; set; }
    [Parameter] public string? InitialsSeperator { get; set; }
    [Parameter] public bool AutoColor { get; set; }
    [Parameter] public EventCallback OnClick { get; set; }
    [Parameter] public AvatarSize Size { get; set; } = AvatarSize.Size32;
    [Parameter] public ColorPalette? Color { get; set; }
    [CascadingParameter] public Popover? Popover { get; set; }

    private string? DisplayInitials
    {
        get
        {
            var initials = GetInitials();

            if (!string.IsNullOrEmpty(initials))
                return GetDisplayInitials(initials);

            return null;
        }
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-avatar";

        if (Size != AvatarSize.Size32)
            yield return Size.ToString().Kebaberize();

        if (Popover != null || OnClick.HasDelegate)
            yield return "active";

        if (Color != null)
        {
            yield return $"color-{Color.ToString().Camelize()}-2";
            yield return $"color-bg-{Color.ToString().Camelize()}-2";
        }
        else if (AutoColor)
        {
            var color = GetAutomaticColor();
            yield return $"color-{color.ToString().Camelize()}-2";
            yield return $"color-bg-{color.ToString().Camelize()}-2";
        }
    }

    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender && Popover != null)
            Popover.SetTrigger(this);

        base.OnAfterRender(firstRender);
    }

    private string? GetInitials()
    {
        if (!string.IsNullOrEmpty(Initials))
            return Initials;

        if (!string.IsNullOrEmpty(Name))
            return string.Concat(Name.Split(' ', StringSplitOptions.RemoveEmptyEntries).Select(x => x[0]));

        return null;
    }

    private string GetDisplayInitials(string initials)
    {
        if (InitialsSeperator == null)
            return initials;

        return string.Join(InitialsSeperator, initials.ToArray());
    }

    private ColorPalette GetAutomaticColor()
    {
        var initials = GetInitials();
        if (initials != null)
        {
            var number = Encoding.Unicode.GetBytes(initials).Sum(b => b);
            var nColors = Enum.GetValues<ColorPalette>().Count();

            var color = (int)(number % nColors);

            return (ColorPalette)color;
        }

        return ColorPalette.Brand;
    }
}
