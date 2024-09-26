namespace Bluent.UI.Common.Regex;

public class RegexSampleGenerator
{
    public static IEnumerable<string> Generate(IEnumerable<RegexToken> tokens)
    {
        List<IEnumerable<string?>> tokenSamples = new List<IEnumerable<string?>>();
        for (int i = 0; i < tokens.Count(); i++)
        {
            var samples = GenerateSamples(tokens.ElementAt(i));

            tokenSamples.Add(samples);
        }

        return MixSamples(tokenSamples).Distinct();
    }

    private static IEnumerable<string> MixSamples(List<IEnumerable<string?>> tokenSamples, int index = 0, string? current = null)
    {
        if (index >= tokenSamples.Count())
            yield return current ?? string.Empty;
        else
        {
            var samples = tokenSamples.ElementAt(index);

            foreach (var sample in samples)
            {
                foreach (var mix in MixSamples(tokenSamples, index + 1, current + sample))
                    yield return mix;
            }
        }
    }

    private static IEnumerable<string?> GenerateSamples(RegexToken token)
    {
        var ch = token.Sample;

        if (ch != null && token.Quantifier != null)
        {
            if (token.Quantifier is OptionalQuantifier)
            {
                yield return null;
                yield return ch.ToString();
            }
            else if (token.Quantifier is RangeQuantifier range)
            {
                for (var i = range.Min; i <= (range.Max ?? range.Min); i++)
                    yield return new string(ch.Value, i);
            }
            else if (token.Quantifier is ZeroOrMoreQuantifier)
            {
                yield return null;
                yield return ch.ToString();
                yield return ch.ToString();
            }
            else if (token.Quantifier is OneOrMoreQuantifier)
            {
                yield return ch.ToString();
                yield return ch.ToString();
            }
        }
        else
        {
            yield return ch.ToString();
        }
    }
}
