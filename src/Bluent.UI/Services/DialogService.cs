using Bluent.UI.Components;
using Bluent.UI.Components.DialogComponent;
using Bluent.UI.Components.DialogComponent.Resources;
using Bluent.UI.Services.Abstractions;
using Bluent.UI.Services.EventArguments;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Localization;

namespace Bluent.UI.Services;

internal class DialogService : IDialogService
{
    private readonly IStringLocalizer<MessageBox> _messageBoxLocalizer;

    public event EventHandler<ShowDialogEventArgs>? ShowDialog;

    public DialogService(IStringLocalizer<MessageBox> messageBoxLocalizer)
    {
        _messageBoxLocalizer = messageBoxLocalizer;
    }

    public Task<dynamic?> ShowAsync(RenderFragment content, DialogConfiguration? config = null)
    {
        var context = new DialogContext(content, config ?? new());

        ShowDialog?.Invoke(this, new ShowDialogEventArgs(context));

        return context.ResultTCS.Task;
    }

    public Task<dynamic?> ShowAsync<TContentComponent>(string title,
                                                       IDictionary<string, object?>? parameters = null,
                                                       Action<DialogConfigurator>? configBuilder = null)
        where TContentComponent : ComponentBase
    {
        var configurator = new DialogConfigurator();
        configBuilder?.Invoke(configurator);

        var content = GetContentFragment<TContentComponent>(title,
                                                            parameters,
                                                            configurator.ShowCloseButton,
                                                            configurator.Actions);

        return ShowAsync(content, configurator.Configuration);
    }

    public Task<dynamic?> ShowAsync<TContentComponent>(IDictionary<string, object?>? parameters = null,
                                                       DialogConfiguration? config = null) where TContentComponent : ComponentBase
    {
        var content = GetContentFragment<TContentComponent>(parameters);

        return ShowAsync(content, config);
    }

    public Task<MessageBoxResult> ShowMessageBox(string title, string message)
    {
        return ShowMessageBox(title, message, MessageBoxButton.Ok);
    }

    public async Task<MessageBoxResult> ShowMessageBox(string title, string message, MessageBoxButton buttons, MessageBoxButton? primaryButton = null)
    {
        var content = GetContentFragment<MessageBoxDefaultContent>(title,
            new Dictionary<string, object?>
            {
                { nameof(MessageBoxDefaultContent.Message), message }
            },
            true,
            GetMessageBoxButtons(buttons, primaryButton));

        var result = await ShowAsync(content);
        if (result is MessageBoxResult msgResult)
            return msgResult;

        return MessageBoxResult.Cancel;
    }

    private RenderFragment GetContentFragment<TContentComponent>(IDictionary<string, object?>? parameters) where TContentComponent : ComponentBase
    {
        return builder =>
        {
            builder.OpenComponent<TContentComponent>(0);
            builder.AddMultipleAttributes(1, parameters!);
            builder.CloseComponent();
        };
    }

    private RenderFragment GetContentFragment<TContentComponent>(string title,
                                                                 IDictionary<string, object?>? parameters,
                                                                 bool showCloseButton,
                                                                 List<DialogAction> actions) where TContentComponent : ComponentBase
    {
        return builder =>
        {
            builder.OpenComponent<DialogDefaultContent>(0);
            builder.AddAttribute(1, nameof(DialogDefaultContent.Title), title);
            builder.AddAttribute(2, nameof(DialogDefaultContent.ShowCloseButton), showCloseButton);
            builder.AddAttribute(3, nameof(DialogDefaultContent.ContentComponentType), typeof(TContentComponent));
            builder.AddAttribute(4, nameof(DialogDefaultContent.ContentParameters), parameters);
            builder.AddAttribute(4, nameof(DialogDefaultContent.Actions), actions);
            builder.CloseComponent();
        };
    }

    private List<DialogAction> GetMessageBoxButtons(MessageBoxButton buttons, MessageBoxButton? primaryButton)
    {
        var primary = primaryButton ?? GetDefaultPrimaryButton(buttons);

        var list = new List<DialogAction>();

        if ((buttons & MessageBoxButton.Ok) == MessageBoxButton.Ok)
            list.Add(new DialogAction(_messageBoxLocalizer["Ok"], MessageBoxResult.Ok, primary == MessageBoxButton.Ok));

        if ((buttons & MessageBoxButton.Yes) == MessageBoxButton.Yes)
            list.Add(new DialogAction(_messageBoxLocalizer["Yes"], MessageBoxResult.Yes, primary == MessageBoxButton.Yes));

        if ((buttons & MessageBoxButton.Cancel) == MessageBoxButton.Cancel)
            list.Add(new DialogAction(_messageBoxLocalizer["Cancel"], MessageBoxResult.Cancel, primary == MessageBoxButton.Cancel));

        if ((buttons & MessageBoxButton.No) == MessageBoxButton.No)
            list.Add(new DialogAction(_messageBoxLocalizer["No"], MessageBoxResult.No, primary == MessageBoxButton.No));

        if ((buttons & MessageBoxButton.Retry) == MessageBoxButton.Retry)
            list.Add(new DialogAction(_messageBoxLocalizer["Retry"], MessageBoxResult.Retry, primary == MessageBoxButton.Retry));

        if ((buttons & MessageBoxButton.Abort) == MessageBoxButton.Abort)
            list.Add(new DialogAction(_messageBoxLocalizer["Abort"], MessageBoxResult.Abort, primary == MessageBoxButton.Abort));

        return list;
    }

    private MessageBoxButton GetDefaultPrimaryButton(MessageBoxButton buttons)
    {
        var flags = Enum.GetValues<MessageBoxButton>();

        var primary = flags.Max();
        foreach (var flag in flags)
        {
            if ((flag & buttons) == flag && flag < primary)
            {
                primary = flag;
                break;
            }
        }

        return primary;
    }
}
