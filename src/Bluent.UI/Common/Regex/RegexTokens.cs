
namespace Bluent.UI.Common.Regex;

public abstract class RegexToken
{
    public string Value { get; protected set; }
    public Quantifier? Quantifier { get; protected set; }
    public List<RegexToken> Alternates { get; } = new List<RegexToken>();

    protected RegexToken(string value, Quantifier? quantifier)
    {
        Value = value;
        Quantifier = quantifier;
    }

    public override string ToString()
    {
        return Value;
    }

    internal void AddAlternate(RegexToken token)
    {
        Alternates.Add(token);
    }

    public virtual char? Sample => Value[0];
    
    public virtual List<LexPath> Paths
    {
        get
        {
            var instance = CreateNewInstance();
            var paths = new List<LexPath>();

            if (Quantifier != null)
            {
                if (Quantifier is OptionalQuantifier)
                {
                    paths.Add([null]);
                    paths.Add([instance]);
                }
                else if (Quantifier is ZeroOrMoreQuantifier)
                {
                    paths.Add([null]);
                    paths.Add([instance]);
                    paths.Add([instance, instance]);
                }
                else if (Quantifier is OneOrMoreQuantifier)
                {
                    paths.Add([instance]);
                    paths.Add([instance, instance]);
                }
                else if (Quantifier is RangeQuantifier range)
                {
                    for (var i = range.Min; i <= (range.Max ?? range.Min); i++)
                    {
                        var path = new LexPath();

                        for (var j = 0; j < i; j++)
                            path.Add(instance);

                        paths.Add(path);
                    }
                }
            }
            else
            {
                paths.Add([instance]);
            }

            return paths;
        }
    }

    protected abstract RegexToken CreateNewInstance();
}

public interface ILiteralToken
{
    char LiteralCharacter { get; }
}

public sealed class BeginningToken : RegexToken
{
    public BeginningToken() : base("^", null)
    {

    }

    protected override RegexToken CreateNewInstance() => new BeginningToken();
    public override char? Sample => null;
}

public sealed class EndToken : RegexToken
{
    public EndToken() : base("$", null)
    {

    }

    protected override RegexToken CreateNewInstance() => new EndToken();
    public override char? Sample => null;
}

public sealed class LiteralToken : RegexToken, ILiteralToken
{
    public LiteralToken(char value, Quantifier? quantifier) : this(value.ToString(), quantifier)
    {

    }
    public LiteralToken(string value, Quantifier? quantifier) : base(value, quantifier)
    {

    }

    public char LiteralCharacter => Value[0];

    protected override RegexToken CreateNewInstance() => new LiteralToken(Value, null);
}

public sealed class GroupToken : RegexToken
{
    public GroupToken(string value, Quantifier? quantifier, IEnumerable<RegexToken> tokens) : base(value, quantifier)
    {
        Tokens = tokens;
    }

    public IEnumerable<RegexToken> Tokens { get; }

    public override string ToString()
    {
        return $"({Value})";
    }

    protected override RegexToken CreateNewInstance() => new GroupToken(Value, null, Tokens);

    public override List<LexPath> Paths
    {
        get
        {
            var subPaths = RegexLexer.GeneratePath(Tokens);
            var instance = CreateNewInstance();
            var paths = new List<LexPath>();

            if (Quantifier != null)
            {
                if (Quantifier is OptionalQuantifier)
                {
                    paths.Add([null]);
                    paths.AddRange(subPaths);
                }
                else if (Quantifier is ZeroOrMoreQuantifier)
                {
                    //paths.Add([null]);
                    //paths.AddRange(subPaths);
                    //var path = new LexPath();
                    //path.AddRange(subPaths);
                    //paths.AddRange([..subPaths, ..subPaths]);
                }
                else if (Quantifier is OneOrMoreQuantifier)
                {
                    //paths.AddRange(subPaths);
                }
                else if (Quantifier is RangeQuantifier range)
                {
                    //for (var i = range.Min; i <= (range.Max ?? range.Min); i++)
                    //{
                    //    var path = new LexPath();

                    //    for (var j = 0; j < i; j++)
                    //        path.Add(instance);

                    //    paths.Add(path);
                    //}
                }
            }
            else
            {
                return subPaths;
            }

            return paths;
        }
    }
}

public abstract class CharacterClassToken : RegexToken
{
    public CharacterClassToken(string value, Quantifier? quantifier) : base(value, quantifier)
    {
    }
}

public sealed class RangeCharacterClassToken : CharacterClassToken
{
    public RangeCharacterClassToken(string value, Quantifier? quantifier) : base(value, quantifier)
    {
    }

    public override string ToString()
    {
        return $"[{Value}]";
    }
    protected override RegexToken CreateNewInstance() => new RangeCharacterClassToken(Value, null);
}

public sealed class WildcardCharacterClassToken : CharacterClassToken
{
    public WildcardCharacterClassToken(Quantifier? quantifier) : base(".", quantifier)
    {
    }
    protected override RegexToken CreateNewInstance() => new WildcardCharacterClassToken(null);
}

public sealed class ScapedCharacterClassToken : CharacterClassToken, ILiteralToken
{
    public ScapedCharacterClassToken(string value, Quantifier? quantifier) : base(value, quantifier)
    {
    }

    public override char? Sample => Value[1];

    public char LiteralCharacter => Value[1];

    protected override RegexToken CreateNewInstance() => new ScapedCharacterClassToken(Value, null);
}

public sealed class DigitCharacterClassToken : CharacterClassToken
{
    public DigitCharacterClassToken(Quantifier? quantifier) : base("\\d", quantifier)
    {
    }

    public override char? Sample => '1';
    protected override RegexToken CreateNewInstance() => new DigitCharacterClassToken(null);
}

public sealed class NotDigitCharacterClassToken : CharacterClassToken
{
    public NotDigitCharacterClassToken(Quantifier? quantifier) : base("\\D", quantifier)
    {
    }

    public override char? Sample => 'a';
    protected override RegexToken CreateNewInstance() => new NotDigitCharacterClassToken(null);
}

public sealed class WordCharacterClassToken : CharacterClassToken
{
    public WordCharacterClassToken(Quantifier? quantifier) : base("\\w", quantifier)
    {
    }

    public override char? Sample => 'w';
    protected override RegexToken CreateNewInstance() => new WordCharacterClassToken(null);
}

public sealed class NotWordCharacterClassToken : CharacterClassToken
{
    public NotWordCharacterClassToken(Quantifier? quantifier) : base("\\W", quantifier)
    {
    }

    public override char? Sample => ',';
    protected override RegexToken CreateNewInstance() => new NotWordCharacterClassToken(null);
}

public sealed class WhitespaceCharacterClassToken : CharacterClassToken, ILiteralToken
{
    public WhitespaceCharacterClassToken(Quantifier? quantifier) : base("\\s", quantifier)
    {
    }

    public override char? Sample => ' ';

    public char LiteralCharacter => ' ';

    protected override RegexToken CreateNewInstance() => new WhitespaceCharacterClassToken(null);
}

public sealed class NotWhitespaceCharacterClassToken : CharacterClassToken
{
    public NotWhitespaceCharacterClassToken(Quantifier? quantifier) : base("\\S", quantifier)
    {
    }

    public override char? Sample => 'a';
    protected override RegexToken CreateNewInstance() => new NotWhitespaceCharacterClassToken(null);
}
