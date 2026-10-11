using Bluent.UI.Components;

namespace RegexSampleGeneratorTest;

public class PortalThemeScopeTests
{
    [Test]
    public void NoExplicitDialogScopePreservesExistingBehavior()
    {
        var config = new DialogConfiguration();
        Assert.That(config.ThemeScope, Is.Null);
        Assert.That(config.Modal, Is.True);
        Assert.That(config.Size, Is.EqualTo(DialogSize.Medium));
    }

    [Test]
    public void ScopedDialogSnapshotIsExplicitAndImmutable()
    {
        var scope = new PortalThemeScope("dark", "rtl", "compact");
        var config = new DialogConfiguration(modal: false) { ThemeScope = scope };

        Assert.Multiple(() =>
        {
            Assert.That(config.ThemeScope, Is.SameAs(scope));
            Assert.That(config.Modal, Is.False);
            Assert.That(config.ThemeScope!.Mode, Is.EqualTo("dark"));
            Assert.That(config.ThemeScope.Direction, Is.EqualTo("rtl"));
            Assert.That(config.ThemeScope.Density, Is.EqualTo("compact"));
            Assert.That(config.ThemeScope.UseV3Tokens, Is.True);
        });
    }

    [Test]
    public void EqualScopesAreValueEqualAndIndependentOfGlobalState()
    {
        var first = new PortalThemeScope("light");
        var second = new PortalThemeScope("light");
        Assert.That(first, Is.EqualTo(second));
        Assert.That(new PortalThemeScope("dark"), Is.Not.EqualTo(new PortalThemeScope("light")));
        Assert.That(new PortalThemeScope("light", useV3Tokens: false).UseV3Tokens, Is.False);
    }

    [TestCase("system", "ltr", "comfortable")]
    [TestCase("dark", "auto", "comfortable")]
    [TestCase("dark", "ltr", "very-small")]
    public void InvalidScopeInputsAreRejected(string mode, string direction, string density)
    {
        Assert.That(() => new PortalThemeScope(mode, direction, density),
                    Throws.TypeOf<ArgumentOutOfRangeException>());
    }
}
