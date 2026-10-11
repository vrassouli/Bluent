using Bluent.UI.Components;

namespace RegexSampleGeneratorTest;

public class PortalThemeScopeTests
{
    [Test]
    public void NoExplicitDialogScopePreservesExistingBehavior()
    {
        var config = new DialogConfiguration();
        Assert.That(config.ThemeScope, Is.Null);
        Assert.That(config.AccessibleName, Is.Null);
        Assert.That(config.CloseButtonLabel, Is.Null);
        Assert.That(config.Modal, Is.True);
        Assert.That(config.Size, Is.EqualTo(DialogSize.Medium));
    }

    [Test]
    public void AccessibleDialogConfigurationSupportsExplicitPersianLabels()
    {
        var config = new DialogConfiguration(modal: false)
        {
            AccessibleName = "پنجره آزمایشی",
            CloseButtonLabel = "بستن پنجره"
        };
        Assert.Multiple(() =>
        {
            Assert.That(config.AccessibleName, Is.EqualTo("پنجره آزمایشی"));
            Assert.That(config.CloseButtonLabel, Is.EqualTo("بستن پنجره"));
            Assert.That(config.Modal, Is.False);
            Assert.That(config.ThemeScope, Is.Null);
        });
    }

    [TestCase("", "Close dialog")]
    [TestCase("Dialog title", "")]
    public void AccessibleDialogConfiguratorRejectsEmptyText(string name, string label)
    {
        Assert.That(() => new DialogConfigurator().SetAccessibleDialog(name, label),
                    Throws.TypeOf<ArgumentException>());
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

    [TestCase("default")]
    [TestCase("excel")]
    [TestCase("office")]
    [TestCase("outlook")]
    [TestCase("powerapps")]
    [TestCase("powerbi")]
    [TestCase("powerpoint")]
    [TestCase("stream")]
    [TestCase("teams")]
    [TestCase("word")]
    public void SupportedSourceBrandsAreAccepted(string brand)
    {
        var scope = new PortalThemeScope("dark", brand: brand);
        Assert.That(scope.Brand, Is.EqualTo(brand));
    }

    [Test]
    public void BrandIsPartOfImmutableScopeValue()
    {
        var excel = new PortalThemeScope("light", brand: "excel");
        var word = new PortalThemeScope("light", brand: "word");
        Assert.Multiple(() =>
        {
            Assert.That(excel, Is.Not.EqualTo(word));
            Assert.That(new PortalThemeScope("dark").Brand, Is.Null);
        });
    }

    [TestCase("fake")]
    [TestCase("EXCEL")]
    [TestCase("unknown")]
    public void UnsupportedBrandIsRejected(string brand)
    {
        Assert.That(() => new PortalThemeScope("dark", brand: brand),
                    Throws.TypeOf<ArgumentOutOfRangeException>());
    }
    [Test]
    public void DialogReturnFocusRequiresExplicitLauncher()
    {
        var legacy = new DialogConfiguration();
        var optedIn = new DialogConfiguration(modal: false)
        {
            ReturnFocusTargetId = "v3-show-service-dialog"
        };
        Assert.Multiple(() =>
        {
            Assert.That(legacy.ReturnFocusTargetId, Is.Null);
            Assert.That(optedIn.ReturnFocusTargetId, Is.EqualTo("v3-show-service-dialog"));
        });
    }

    [TestCase("")]
    [TestCase(" ")]
    public void DialogConfiguratorRejectsEmptyReturnFocusTarget(string id)
    {
        Assert.That(() => new DialogConfigurator().SetReturnFocusTargetId(id),
                    Throws.TypeOf<ArgumentException>());
    }

    [Test]
    public void PopoverAccessibleTriggerStateIsExplicitOptIn()
    {
        var settings = new PopoverSettings("trigger", Placement.Bottom, 6, 5);
        Assert.That(settings.AccessibleTriggerState, Is.False);
        settings.AccessibleTriggerState = true;
        Assert.That(settings.AccessibleTriggerState, Is.True);
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
