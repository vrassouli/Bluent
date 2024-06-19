using Humanizer;
using Microsoft.AspNetCore.Components;

namespace Bluent.UI.Components;

public partial class Wizard
{
    private List<WizardStep> _steps = new();
    private string? _transitionDirection;

    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public Orientation Orientation { get; set; } = Orientation.Horizontal;
    [Parameter] public bool DisplayStepTitles { get; set; } = true;
    [Parameter] public string? StepTitleClass { get; set; }
    [Parameter] public bool DisplayNavigationButtons { get; set; } = true;
    [Parameter] public bool NavigateOnStepClick { get; set; }
    [Parameter] public string LabelNext { get; set; } = "Next";
    [Parameter] public string LabelPrevious { get; set; } = "Previous";
    [Parameter] public string LabelCancel { get; set; } = "Cancel";
    [Parameter] public string LabelDone { get; set; } = "Done";
    [Parameter] public bool SubmitWhenDown { get; set; }
    [Parameter] public bool CanCancel { get; set; }
    [Parameter] public bool AllowNext { get; set; } = true;
    [Parameter] public bool AllowPrevious { get; set; } = true;
    [Parameter] public int CurrentStep { get; set; }
    [Parameter] public EventCallback<int> CurrentStepChanged { get; set; }
    [Parameter] public EventCallback OnNext { get; set; }
    [Parameter] public EventCallback OnPrevious { get; set; }
    [Parameter] public EventCallback OnCancel { get; set; }

    private bool IsLastStep => CurrentStep >= _steps.Count - 1;
    private bool IsFirstStep => CurrentStep <= 0;
    private bool CanGoNext => AllowNext;
    private bool CanGoPrev => !IsFirstStep && AllowPrevious;

    public override IEnumerable<string> GetClasses()
    {
        yield return "bui-wizard";

        if (Orientation != Orientation.Horizontal)
            yield return Orientation.ToString().Kebaberize();
    }

    internal void Add(WizardStep step)
    {
        _steps.Add(step);
        StateHasChanged();
    }

    internal void Remove(WizardStep step)
    {
        _steps.Remove(step);
        StateHasChanged();
    }

    internal bool IsCurrent(WizardStep step)
    {
        return CurrentStep == _steps.IndexOf(step);
    }

    private void NextHandler()
    {
        SetCurrentStep(Math.Min(_steps.Count - 1, CurrentStep + 1));

        OnNext.InvokeAsync();
    }

    private void PreviousHandler()
    {
        SetCurrentStep(CurrentStep = Math.Max(0, CurrentStep - 1));

        OnPrevious.InvokeAsync();
    }

    private void StepClickHandler(int index)
    {
        if (NavigateOnStepClick)
            SetCurrentStep(index);
    }

    private void CancelHandler()
    {
        OnCancel.InvokeAsync();
    }

    private void SetCurrentStep(int index)
    {
        if (index > CurrentStep)
            _transitionDirection = "forward";
        else if (index < CurrentStep)
            _transitionDirection = "backward";
        else
            _transitionDirection = null;

        CurrentStep = index;
        CurrentStepChanged.InvokeAsync(CurrentStep);
    }
}
