using System.Linq.Expressions;
using System.Reflection;

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
    public static string? GetDisplayName<T>(this Expression<T> expression)
    {
        var member = expression.GetMemberInfo();

        return member?.GetDisplayName();
    }
}
