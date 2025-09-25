namespace Bluent.UI.Components;

public partial class Switch
{
    protected override IEnumerable<string> GetClasses()
    {
        yield return "bui-switch";

        if (LabelPosition != LabelPosition.After)
            yield return "label-before";
    }

}
