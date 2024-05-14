using Humanizer;

namespace Bluent.UI.Components;

public partial class Toolbar
{
    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-toolbar";
        yield return Orientation.ToString().Kebaberize();
    }
/*    
    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "div");
        builder.AddMultipleAttributes(1, AdditionalAttributes);
        builder.AddAttribute(2, "id", Id);
        builder.AddAttribute(3, "class", GetComponentClass());
        builder.AddAttribute(4, "style", Style);

        builder.OpenComponent<CascadingValue<Toolbar>>(5);
        builder.AddComponentParameter(6, "IsFixed", true);
        builder.AddComponentParameter(7, "Value", this);
        builder.AddComponentParameter(8, "ChildContent", b => base.BuildRenderTree(b));
        builder.CloseComponent();

        builder.OpenRegion(5);
        base.BuildRenderTree(builder);
        builder.CloseRegion();

        builder.CloseElement();
    }
*/
}
