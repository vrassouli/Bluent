using Bluent.UI.Common.Regex;

namespace RegexSampleGeneratorTest;

public class LexerTests
{
    [SetUp]
    public void Setup()
    {
    }

    [Test]
    public void InvalidRangeCharacterClass_NotClosed_ThrowsException()
    {
        var pattern = @"a{2";
        Exception ex = Assert.Throws<RegularExpressionSyntaxErrorException>(() => RegexLexer.Lex(pattern));
        Assert.AreEqual(ex.Message, "Syntax error at 1. Range is not closed.");
    }

    [Test]
    public void InvalidRangeCharacterClass_OpenedBeforeClose_ThrowsException()
    {
        var pattern = @"a{2{3";
        Exception ex = Assert.Throws<RegularExpressionSyntaxErrorException>(() => RegexLexer.Lex(pattern));
        Assert.AreEqual(ex.Message, "Syntax error at 3. Unexpected '{' before appearing '}' for opened '{' at 1.");
    }

    [Test]
    public void InvalidNestedGroups_NotClosed_ThrowsException()
    {
        var pattern = @"a|(b";
        Exception ex = Assert.Throws<RegularExpressionSyntaxErrorException>(() => RegexLexer.Lex(pattern));
        Assert.AreEqual(ex.Message, "Syntax error at 2. Group is not closed");
    }

    [Test]
    public void InvalidNestedGroups_OpenedBeforeClose_ThrowsException()
    {
        var pattern = @"a|(b|(c)";
        Exception ex = Assert.Throws<RegularExpressionSyntaxErrorException>(() => RegexLexer.Lex(pattern));
        Assert.AreEqual(ex.Message, "Syntax error at 2. Group is not closed");
    }
}