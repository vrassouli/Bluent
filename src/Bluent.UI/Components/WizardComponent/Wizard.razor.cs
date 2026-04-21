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
    [Parameter] public bool SubmitWhenDone { get; set; }
    [Parameter] public bool CanCancel { get; set; }
    [Parameter] public bool AllowNext { get; set; } = true;
    [Parameter] public bool AllowPrevious { get; set; } = true;
    [Parameter] public int CurrentStep { get; set; }
    [Parameter] public EventCallback<int> CurrentStepChanged { get; set; }
    [Parameter] public EventCallback OnNext { get; set; }
    [Parameter] public EventCallback OnDone { get; set; }
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

    internal async Task<int> Add(WizardStep step, int? index)
    {
        if (index is null || index < 0 || index > _steps.Count)
        {
            _steps.Add(step);
            index = _steps.IndexOf(step);
        }
        else
        {
            _steps.Insert(index.Value, step);

            foreach (var nextStep in _steps.Skip(index.Value + 1))
            {
                await nextStep.UpdateIndex(_steps.IndexOf(nextStep));
            }
        }
        StateHasChanged();
        
        return index.Value;
    }

    internal void Remove(WizardStep step)
    {
        _steps.Remove(step);
        StateHasChanged();
    }
    
    internal void Update()
    {
        StateHasChanged();
    }

    internal bool IsCurrent(WizardStep step)
    {
        return CurrentStep == _steps.IndexOf(step);
    }

    private async Task NextHandler()
    {
        if (!IsLastStep)
            await OnNext.InvokeAsync();
        else if (IsLastStep && !SubmitWhenDone)
            await OnDone.InvokeAsync();
        
        SetCurrentStep(Math.Min(_steps.Count - 1, CurrentStep + 1));
    }

    private async Task PreviousHandler()
    {
        await OnPrevious.InvokeAsync();

        SetCurrentStep(Math.Max(0, CurrentStep - 1));
    }

    private void StepClickHandler(int index)
    {
        if (NavigateOnStepClick)
            SetCurrentStep(index);
    }

    private async Task CancelHandler()
    {
        await OnCancel.InvokeAsync();
    }

    private void SetCurrentStep(int index)
    {
        if (index > CurrentStep)
            _transitionDirection = "forward";
        else if (index < CurrentStep)
            _transitionDirection = "backward";
        else
            _transitionDirection = null;

        if (CurrentStep != index)
        {
            CurrentStep = index;
            CurrentStepChanged.InvokeAsync(CurrentStep);
        }
    }

}
