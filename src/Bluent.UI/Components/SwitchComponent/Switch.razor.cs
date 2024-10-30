namespace Bluent.UI.Components;

public partial class Switch
{
    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-switch";

        if (LabelPosition != CheckboxLabelPosition.After)
            yield return "label-before";
    }

}
