using Bluent.UI.Icons;

namespace Bluent.UI.Demo.Pages.Components;

public partial class Icons
{
    private const string CustomSvg = """
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm2 10h-4v-1.5h1.25V12H10v-1.5h2.75v5H14V17Z" />
        </svg>
        """;

    public IconDefinition CustomSvgIcon { get; } = IconDefinition.FromSvg(CustomSvg);
    public IconDefinition PowerPointIcon { get; } = IconDefinition.FromImage("/assets/icons/powerpoint.svg");
}
