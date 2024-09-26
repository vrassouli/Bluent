namespace Bluent.UI.Common.Regex;

public class RegexLexer
{
    public static IEnumerable<RegexToken> Lex(string pattern)
    {
        var tokens = new List<RegexToken>();

        for (int pos = 0; pos < pattern.Length;)
        {
            var c = pattern[pos];
            RegexToken? token = null;

            switch (c)
            {
                case '(': // Opening group
                    token = GetGroupToken(pattern, pos);
                    break;

                case '[': // Opening range character class
                    token = GetRangeCharacterClassToken(pattern, pos);
                    break;

                case '.': // Wildcard
                    token = GetWildcardCharacterClassToken(pattern, pos);
                    break;

                case '\\': // Wildcard
                    token = GetScappedCharacterClassToken(pattern, pos);
                    break;

                case '|': // skip alternation
                    break;

                default:
                    token = GetLiterlToken(pattern, pos);
                    break;
            }

            if (token != null)
            {
                if (!IsAlternated(pattern, pos))
                {
                    tokens.Add(token);
                }
                else
                {
                    tokens.LastOrDefault()?.AddAlternate(token);
                }

                pos += token.ToString().Length;
                if (token.Quantifier != null)
                    pos += token.Quantifier.Length;
            }
            else
            {
                pos++;
            }
        }

        return tokens;
    }

    private static bool IsAlternated(string pattern, int pos)
    {
        if (pos <= 0 || pos > pattern.Length)
            return false;

        return pattern[pos - 1] == '|';
    }

    private static LiteralToken GetLiterlToken(string pattern, int position)
    {
        var quantifier = GetQuantifier(pattern, position + 1);
        return new LiteralToken(pattern[position], quantifier);
    }

    private static WildcardCharacterClassToken GetWildcardCharacterClassToken(string pattern, int position)
    {
        var quantifier = GetQuantifier(pattern, position + 1);

        return new WildcardCharacterClassToken(quantifier);
    }

    private static RegexToken GetRangeCharacterClassToken(string pattern, int position)
    {
        var rangeValue = GetRangeCharacterClassValue(pattern, position);
        position += rangeValue.Length + 1;
        var quantifier = GetQuantifier(pattern, position + 1);

        return new RangeCharacterClassToken(rangeValue, quantifier);
    }

    private static RegexToken GetGroupToken(string pattern, int position)
    {
        var groupValue = GetGroupValue(pattern, position);
        position += groupValue.Length + 1;
        var quantifier = GetQuantifier(pattern, position + 1);
        var groupToken = Lex(groupValue);

        return new GroupToken(groupValue, quantifier, groupToken);
    }

    private static Quantifier? GetQuantifier(string pattern, int position)
    {
        if (position < 0 || position >= pattern.Length)
            return null;

        var c = pattern[position];

        return c switch
        {
            '+' => new OneOrMoreQuantifier(),
            '*' => new ZeroOrMoreQuantifier(),
            '?' => new OptionalQuantifier(),
            '{' => RangeQuantifier.TryParse(GetRangeQuantifierValue(pattern, position)),
            _ => null
        };
    }

    private static CharacterClassToken GetScappedCharacterClassToken(string pattern, int position)
    {
        var nextChar = pattern[position + 1];
        var quantifier = GetQuantifier(pattern, position + 2);

        return nextChar switch
        {
            'd' => new DigitCharacterClassToken(quantifier),
            'w' => new WordCharacterClassToken(quantifier),
            's' => new WhitespaceCharacterClassToken(quantifier),
            _ => new ScapedCharacterClassToken($"\\{nextChar}", quantifier)
        };
    }

    private static string GetGroupValue(string pattern, int groupStart)
    {
        var groupEnd = FindGroupClosing(pattern, groupStart);

        var value = pattern.Substring(groupStart + 1, groupEnd - groupStart - 1);

        return value;
    }

    private static int FindGroupClosing(string pattern, int groupStart)
    {
        var skipCount = 0;
        for (int i = groupStart + 1; i < pattern.Length; i++)
        {
            var c = pattern[i];

            if (c == '(')
                skipCount++;
            else if (c == ')' && skipCount > 0)
                skipCount--;
            else if (c == ')' && skipCount == 0)
                return i;
        }

        throw new RegularExpressionSyntaxErrorException(groupStart, $"Syntax error at {groupStart}. Group is not closed");
    }

    private static string GetRangeQuantifierValue(string pattern, int opening)
    {
        var closing = FindRangeQuantifierClosing(pattern, opening);

        var value = pattern.Substring(opening + 1, closing - opening - 1);

        return value;
    }

    private static int FindRangeQuantifierClosing(string pattern, int opening)
    {
        for (int i = opening + 1; i < pattern.Length; i++)
        {
            var c = pattern[i];

            if (c == '{')
                throw new RegularExpressionSyntaxErrorException(opening, $"Syntax error at {i}. Unexpected '{{' before appearing '}}' for opened '{{' at {opening}.");

            else if (c == '}')
                return i;
        }

        throw new RegularExpressionSyntaxErrorException(opening, $"Syntax error at {opening}. Range is not closed.");
    }

    private static string GetRangeCharacterClassValue(string pattern, int opening)
    {
        var closing = FindRangeCharacterClassClosing(pattern, opening);

        var value = pattern.Substring(opening + 1, closing - opening - 1);

        return value;
    }

    private static int FindRangeCharacterClassClosing(string pattern, int opening)
    {
        for (int i = opening + 1; i < pattern.Length; i++)
        {
            var c = pattern[i];

            if (c == '[')
                throw new RegularExpressionSyntaxErrorException(opening, $"Syntax error at {i}. Unexpected '[' before appearing ']' for opened '[' at {opening}.");

            else if (c == ']')
                return i;
        }

        throw new RegularExpressionSyntaxErrorException(opening, $"Syntax error at {opening}. Range is not closed");
    }

    private static bool IsScaped(string pattern, int index)
    {
        if (index <= 0)
            return false;

        if (index > pattern.Length)
            throw new IndexOutOfRangeException();

        return pattern[index - 1] == '\\';
    }
}
