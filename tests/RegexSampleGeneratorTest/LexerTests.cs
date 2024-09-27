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
        Assert.That(ex.Message == "Syntax error at 1. Range is not closed.");
    }

    [Test]
    public void InvalidRangeCharacterClass_OpenedBeforeClose_ThrowsException()
    {
        var pattern = @"a{2{3";
        Exception ex = Assert.Throws<RegularExpressionSyntaxErrorException>(() => RegexLexer.Lex(pattern));
        Assert.That(ex.Message == "Syntax error at 3. Unexpected '{' before appearing '}' for opened '{' at 1.");
    }

    [Test]
    public void InvalidNestedGroups_NotClosed_ThrowsException()
    {
        var pattern = @"a|(b";
        Exception ex = Assert.Throws<RegularExpressionSyntaxErrorException>(() => RegexLexer.Lex(pattern));
        Assert.That(ex.Message == "Syntax error at 2. Group is not closed");
    }

    [Test]
    public void InvalidNestedGroups_OpenedBeforeClose_ThrowsException()
    {
        var pattern = @"a|(b|(c)";
        Exception ex = Assert.Throws<RegularExpressionSyntaxErrorException>(() => RegexLexer.Lex(pattern));
        Assert.That(ex.Message == "Syntax error at 2. Group is not closed");
    }

    [Test]
    public void EmptyPattern_ReturnsNoTokens()
    {
        var pattern = "";
        var tokens = RegexLexer.Lex(pattern);

        Assert.That(tokens.Count() == 0);
    }

    [Test]
    public void OptionalGroup_ReturnsTwoPaths()
    {
        var pattern = "^(\\d\\.)?\\a$";
        var tokens = RegexLexer.Lex(pattern);

        Assert.That(tokens.Count() == 4);

        var paths = RegexLexer.ToPaths(pattern);
        Assert.That(paths.Count() == 2);
        Assert.That(paths[0].Count() == 3);
        Assert.That(paths[1].Count() == 5);
    }

    //[Test]
    //public void OptionalGroup_TimeSpanFormat_ReturnsTwoPaths()
    //{
    //    var pattern = @"^(\d{1,3}\.)?\d{1,2}:\d{1,2}:\d{1,2}$";
    //    var tokens = RegexLexer.Lex(pattern);

    //    Assert.That(tokens.Count() == 8);

    //    var paths = RegexLexer.ToPaths(pattern);
    //    Assert.AreEqual(paths.Count(), 2);
    //    Assert.AreEqual(paths[0].Count(), 3);
    //    Assert.AreEqual(paths[1].Count(), 5);
    //}

    //[Test]
    //public void ZeroOrMoreGroup_ReturnsTwoPaths()
    //{
    //    var pattern = "^(\\d\\.?)*\\a$";
    //    var tokens = RegexLexer.Lex(pattern);

    //    Assert.That(tokens.Count() == 4);

    //    var paths = RegexLexer.ToPaths(pattern);
    //    Assert.AreEqual(paths.Count(), 2);
    //    Assert.AreEqual(paths[0].Count(), 3);
    //    Assert.AreEqual(paths[1].Count(), 5);
    //}

    [Test]
    public void BeginingAndEndToken_IgnoredInSamples()
    {
        var pattern = "^\\d$";
        var tokens = RegexLexer.Lex(pattern);
        Assert.That(tokens.Count() == 3);

        var paths = RegexLexer.ToPaths(pattern);
        Assert.That(paths.Count() == 1);
        Assert.That(paths[0].GetSample() == "1");
    }

    [Test]
    public void BeginingAndEndToken_WithRangeQuantifier2And3_ReturnsTwoPaths()
    {
        var pattern = "^09\\d{2,3}$";
        var tokens = RegexLexer.Lex(pattern);
        Assert.That(tokens.Count() == 5);

        var paths = RegexLexer.ToPaths(pattern);
        Assert.That(paths.Count() == 2);
        Assert.That(paths[0].GetSample() == "0911");
        Assert.That(paths[1].GetSample() == "09111");
    }

    [Test]
    public void TokenPath_NoQuantifier_ReturnsOnePath()
    {
        var pattern = "a";
        var tokens = RegexLexer.Lex(pattern);

        Assert.That(tokens.Count() == 1);

        var token = tokens.ElementAt(0);
        var paths = token.Paths;

        Assert.That(paths.Count() == 1);
        // Path 1
        Assert.That(paths[0].Count() == 1);
        Assert.That(paths[0][0] != null);
        Assert.That(paths[0].GetSample() == "a");
    }

    [Test]
    public void TokenPath_OptionalQuantifier_ReturnsTwoPathsWithFirstNull()
    {
        var pattern = "a?";
        var tokens = RegexLexer.Lex(pattern);

        Assert.That(tokens.Count() == 1);

        var token = tokens.ElementAt(0);
        var paths = token.Paths;

        Assert.That(paths.Count() == 2);

        // Path 1
        Assert.That(paths[0].Count() == 1);
        Assert.That(paths[0][0] == null);
        Assert.That(paths[0].GetSample() == "");

        // Path 2
        Assert.That(paths[1].Count() == 1);
        Assert.That(paths[1][0] != null);
        Assert.That(paths[1].GetSample() == "a");
    }

    [Test]
    public void TokenPath_ZeroOrMoreQuantifier_ReturnsThreePathsWithFirstNull()
    {
        var pattern = "a*";
        var tokens = RegexLexer.Lex(pattern);

        Assert.That(tokens.Count() == 1);

        var token = tokens.ElementAt(0);
        var paths = token.Paths;

        Assert.That(paths.Count() == 3);
        // Path 1
        Assert.That(paths[0].Count() == 1);
        Assert.That(paths[0][0] == null);
        Assert.That(paths[0].GetSample() == "");

        // Path 2
        Assert.That(paths[1].Count() == 1);
        Assert.That(paths[1][0] != null);
        Assert.That(paths[1].GetSample() == "a");

        // Path 3
        Assert.That(paths[2].Count() == 2);
        Assert.That(paths[2][0] != null);
        Assert.That(paths[2].GetSample() == "aa");
    }

    [Test]
    public void TokenPath_OneOrMoreQuantifier_ReturnsTwoPathsWithoutNull()
    {
        var pattern = "a+";
        var tokens = RegexLexer.Lex(pattern);

        Assert.That(tokens.Count() == 1);

        var token = tokens.ElementAt(0);
        var paths = token.Paths;

        Assert.That(paths.Count() == 2);

        // Path 1
        Assert.That(paths[0].Count() == 1);
        Assert.That(paths[0][0] != null);
        Assert.That(paths[0].GetSample() == "a");

        // Path 2
        Assert.That(paths[0].Count() == 1);
        Assert.That(paths[1][0] != null);
        Assert.That(paths[1].GetSample() == "aa");
    }

    [Test]
    public void TokenPath_RangeQuantifier2And4_ReturnsThreePathsWithoutNull()
    {
        var pattern = "a{2,4}";
        var tokens = RegexLexer.Lex(pattern);

        Assert.That(tokens.Count() == 1);

        var token = tokens.ElementAt(0);
        var paths = token.Paths;

        Assert.That(paths.Count() == 3);

        // Path 1
        Assert.That(paths[0].Count() == 2);
        Assert.That(paths[0].All(x => x != null));
        Assert.That(paths[0].GetSample() == "aa");

        // Path 2
        Assert.That(paths[1].Count() == 3);
        Assert.That(paths[1].All(x => x != null));
        Assert.That(paths[1].GetSample() == "aaa");

        // Path 3
        Assert.That(paths[2].Count() == 4);
        Assert.That(paths[2].All(x => x != null));
        Assert.That(paths[2].GetSample() == "aaaa");
    }

    [Test]
    public void PatternPath_OneToken_ReturnOnePath()
    {
        var pattern = "a";

        var paths = RegexLexer.ToPaths(pattern);

        Assert.That(paths.Count() ==     1);
        Assert.That(paths[0].Count() == 1);
    }

    [Test]
    public void PatternPath_TwoTokens_ReturnOnePath()
    {
        var pattern = "ab";

        var paths = RegexLexer.ToPaths(pattern);

        Assert.That(paths.Count() == 1);
        Assert.That(paths[0].Count() == 2);
    }

    [Test]
    public void PatternPath_TwoTokensWithOptionalQuantifier_ReturnTwoPath()
    {
        var pattern = "ab?";

        var paths = RegexLexer.ToPaths(pattern);

        Assert.That(paths.Count() == 2);
        Assert.That(paths[0].Count() == 1);
        Assert.That(paths[1].Count() == 2);
    }

    [Test]
    public void PatternPath_TwoTokensWithOptionalQuantifierAndRangeQuantifier_ReturnSixPath()
    {
        var pattern = @"ab?c{1,3}";

        var paths = RegexLexer.ToPaths(pattern);

        Assert.That(paths.Count() == 6);
        Assert.That(paths[0].Count() == 2);
        Assert.That(paths[1].Count() ==  3);
        Assert.That(paths[2].Count() ==  4);
        Assert.That(paths[3].Count() ==  3);
        Assert.That(paths[4].Count() == 4);
        Assert.That(paths[5].Count() == 5);
    }

    //[Test]
    //public void IPAddress()
    //{
    //    var pattern = "\\d{1,3}\\.\\d{1,3}";
    //    var tokens = RegexLexer.Lex(pattern);

    //    Assert.That(tokens.Count() == 0);
    //}

    //[Test]
    //public void IPAddress_SampleGeneration()
    //{
    //    var pattern = "\\d{1,3}\\.\\d{1,3}";
    //    var tokens = RegexLexer.Lex(pattern);
    //    var samples = RegexSampleGenerator.Generate(tokens);

    //    Assert.That(tokens.Count() == 0);
    //}
}