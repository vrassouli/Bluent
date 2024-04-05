using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace Bluent.UI.Extensions;

public static class MemberInfoExtensions
{
    public static string GetDisplayName(this MemberInfo member)
    {
        var display = member.GetCustomAttribute<DisplayAttribute>();
        if (display != null && !string.IsNullOrEmpty(display.Name))
            return display.Name;

        var displayName = member.GetCustomAttribute<DisplayNameAttribute>();
        if (displayName != null && !string.IsNullOrEmpty(displayName.DisplayName))
            return displayName.DisplayName;

        return member.Name;
    }
}
