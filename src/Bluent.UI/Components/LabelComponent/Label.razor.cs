using Bluent.UI.Components.LabelComponent.Resources;
using Bluent.UI.Extensions;
using Humanizer;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Localization;
using System.Linq.Expressions;

namespace Bluent.UI.Components;

public partial class Label
{
    [Parameter] public string? Text { get; set; }
    [Parameter] public Expression<Func<object?>>? ForExpression { get; set; }
    [Parameter] public string RequiredSymbol { get; set; } = "*";
    [Parameter] public RenderFragment? Info { get; set; }
    [Parameter] public string? InfoButtonAriaLabel { get; set; }
    [Parameter] public LabelSize Size { get; set; } = LabelSize.Medium;
    [Parameter] public LabelRequiredState Required { get; set; } = LabelRequiredState.Auto;

    [Inject] private IStringLocalizer<LabelResources> Localizer { get; set; } = default!;

    private bool IsRequired => Required switch
    {
        LabelRequiredState.Required => true,
        LabelRequiredState.NotRequired => false,
        _ => IsExpressionRequired()
    };

    private bool IsExpressionRequired()
    {
        return ForExpression?.IsRequired() ?? false;
    }

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-label";

        if (IsDisabled)
            yield return "disabled";

        if (Size != LabelSize.Medium)
            yield return Size.ToString().Kebaberize();
    }

    private string? GetPropertyName()
    {
        if (ForExpression == null)
            return null;

        return ForExpression.GetMemberName();
    }

    private string? GetDisplayName()
    {
        if (!string.IsNullOrEmpty(Text))
            return Text;

        if (ForExpression == null)
            return null;

        return ForExpression.GetDisplayName();
    }

    private string GetInfoButtonAccessibleName()
    {
        if (!string.IsNullOrWhiteSpace(InfoButtonAriaLabel))
            return InfoButtonAriaLabel;

        var displayName = GetDisplayName();
        return string.IsNullOrWhiteSpace(displayName)
            ? Localizer["MoreInformation"].Value
            : Localizer["InfoButtonAccessibleName", displayName].Value;
    }
}
