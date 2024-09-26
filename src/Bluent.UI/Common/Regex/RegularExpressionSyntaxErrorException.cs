namespace Bluent.UI.Common.Regex;

public class RegularExpressionSyntaxErrorException : Exception
{
    public RegularExpressionSyntaxErrorException(int position) : this(position, $"Syntax error at {position}.")
    {
    }
    public RegularExpressionSyntaxErrorException(int position, string message) : base(message)
    {
        Position = position;
    }

    public int Position { get; }
}
