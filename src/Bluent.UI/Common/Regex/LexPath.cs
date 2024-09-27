
namespace Bluent.UI.Common.Regex;

public class LexPath : List<RegexToken?>
{
    public string GetSample()
    {
        var paths = RegexSampleGenerator.Generate(this.Where(x => x != null)!);

        if (paths.Count() > 1)
            throw new InvalidOperationException("A path is expected to have only one sample.");

        return paths.First();
    }

    internal char? GetLitteralAt(int position)
    {
        if (position < 0 || position >= this.Count)
            return null;

        var token = this[position];

        if (token is ILiteralToken literalToken)
            return literalToken.LiteralCharacter;

        return null;
    }
}
