using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Extensions;

internal static class ExpressionExtensions
{
    public static string? GetMemberName<T>(this Expression<T> expression)
    {
        return expression.GetMemberInfo()?.Name;
    }
    public static MemberInfo? GetMemberInfo<T>(this Expression<T> expression)
    {
        return expression.Body switch
        {
            MemberExpression m => m.Member,
            UnaryExpression u when u.Operand is MemberExpression m => m.Member,
            _ => null
        };
    }
}
