namespace Bluent.UI.Components;

public class DndContext
{
    public object? Data { get; private set; }
    public object? Target { get; private set; }

    public event EventHandler? Started;
    public event EventHandler? Ended;
    
    public void SetData(object data)
    {
        Data = data;
        Started?.Invoke(this, EventArgs.Empty);
    }

    public void SeDropTarget(object target)
    {
        Target = target;
    }
    
    public void Clear()
    {
        if (Data != null)
            Ended?.Invoke(this, EventArgs.Empty);
        
        Data = null;
        Target = null;
    }

}
