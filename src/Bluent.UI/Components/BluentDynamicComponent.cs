using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace Bluent.UI.Components;

public class BluentDynamicComponent: IComponent
{
    private RenderHandle _renderHandle;
    private readonly RenderFragment _cachedRenderFragment;

    public BluentDynamicComponent()
    {
        _cachedRenderFragment = Render;
    }

    /// <summary>
    /// Gets or sets the type of the component to be rendered. The supplied type must
    /// implement <see cref="IComponent"/>.
    /// </summary>
    [Parameter]
    [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.All)]
    [EditorRequired]
    public Type Type { get; set; } = default!;

    [Parameter]
    public IDictionary<string, object>? Parameters { get; set; }
    
    [Parameter]
    public EventCallback<object> OnComponentCaptured { get; set; }

    /// <summary>
    /// Gets rendered component instance.
    /// </summary>
    public object? Instance { get; private set; }

    /// <inheritdoc />
    public void Attach(RenderHandle renderHandle)
    {
        _renderHandle = renderHandle;
    }

    /// <inheritdoc />
    public Task SetParametersAsync(ParameterView parameters)
    {
        // This manual parameter assignment logic will be marginally faster than calling
        // ComponentProperties.SetProperties.
        foreach (var entry in parameters)
        {
            if (entry.Name.Equals(nameof(Type), StringComparison.OrdinalIgnoreCase))
            {
                Type = (Type)entry.Value;
            }
            else if (entry.Name.Equals(nameof(Parameters), StringComparison.OrdinalIgnoreCase))
            {
                Parameters = (IDictionary<string, object>)entry.Value;
            }
            else if (entry.Name.Equals(nameof(OnComponentCaptured), StringComparison.OrdinalIgnoreCase))
            {
                OnComponentCaptured = (EventCallback<object>)entry.Value;
            }
            else
            {
                throw new InvalidOperationException(
                    $"{nameof(BluentDynamicComponent)} does not accept a parameter with the name '{entry.Name}'. To pass parameters to the dynamically-rendered component, use the '{nameof(Parameters)}' parameter.");
            }
        }

        if (Type is null)
        {
            throw new InvalidOperationException($"{nameof(BluentDynamicComponent)} requires a non-null value for the parameter {nameof(Type)}.");
        }

        _renderHandle.Render(_cachedRenderFragment);
        return Task.CompletedTask;
    }

    void Render(RenderTreeBuilder builder)
    {
        builder.OpenComponent(0, Type);

        if (Parameters != null)
        {
            foreach (var entry in Parameters)
            {
                builder.AddComponentParameter(1, entry.Key, entry.Value);
            }
        }

        builder.AddComponentReferenceCapture(2, ReferenceCaptured);

        builder.CloseComponent();
    }

    private void ReferenceCaptured(object component)
    {
        Instance = component;
        OnComponentCaptured.InvokeAsync(Instance);
    }
}