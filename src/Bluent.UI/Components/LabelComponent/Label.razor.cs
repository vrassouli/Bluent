﻿using Bluent.UI.Extensions;
using Humanizer;
using Microsoft.AspNetCore.Components;
using System.Linq.Expressions;

namespace Bluent.UI.Components;

public partial class Label
{
    [Parameter] public string? Text { get; set; }
    [Parameter] public Expression<Func<object>>? ForExpression { get; set; }
    [Parameter] public string? Required { get; set; }
    [Parameter] public RenderFragment? Info { get; set; }
    [Parameter] public LabelSize Size { get; set; } = LabelSize.Medium;

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
}
