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

    public virtual char Sample => Value[0];
}

public sealed class LiteralToken : RegexToken
{
    public LiteralToken(char value, Quantifier? quantifier) : base(value.ToString(), quantifier)
    {

    }
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
}

public sealed class WildcardCharacterClassToken : CharacterClassToken
{
    public WildcardCharacterClassToken(Quantifier? quantifier) : base(".", quantifier)
    {
    }
}

public sealed class ScapedCharacterClassToken : CharacterClassToken
{
    public ScapedCharacterClassToken(string value, Quantifier? quantifier) : base(value, quantifier)
    {
    }

    public override char Sample => Value[1];
}

public sealed class DigitCharacterClassToken : CharacterClassToken
{
    public DigitCharacterClassToken(Quantifier? quantifier) : base("\\d", quantifier)
    {
    }

    public override char Sample => '1';
}

public sealed class NotDigitCharacterClassToken : CharacterClassToken
{
    public NotDigitCharacterClassToken(Quantifier? quantifier) : base("\\D", quantifier)
    {
    }

    public override char Sample => 'a';
}

public sealed class WordCharacterClassToken : CharacterClassToken
{
    public WordCharacterClassToken(Quantifier? quantifier) : base("\\w", quantifier)
    {
    }

    public override char Sample => 'w';
}

public sealed class NotWordCharacterClassToken : CharacterClassToken
{
    public NotWordCharacterClassToken(Quantifier? quantifier) : base("\\W", quantifier)
    {
    }

    public override char Sample => ',';
}

public sealed class WhitespaceCharacterClassToken : CharacterClassToken
{
    public WhitespaceCharacterClassToken(Quantifier? quantifier) : base("\\s", quantifier)
    {
    }

    public override char Sample => ' ';
}

public sealed class NotWhitespaceCharacterClassToken : CharacterClassToken
{
    public NotWhitespaceCharacterClassToken(Quantifier? quantifier) : base("\\S", quantifier)
    {
    }

    public override char Sample => 'a';
}
