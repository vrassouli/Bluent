using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Skeleton
{
    [Parameter] public SkeletonShape Shape { get; set; } = SkeletonShape.Rectangle;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-skeleton";

        if (Shape != SkeletonShape.Rectangle)
            yield return Shape.ToString().Kebaberize();
    }
}
