using System.Runtime.ExceptionServices;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Bluent.UI.Utilities;

/// <summary>
/// Base class for Blazor components providing DI, busy state, cancellation, and async request handling utilities.
/// </summary>
public abstract class RequestComponentBase : ComponentBase, IDisposable
{
    /// <summary>
    /// Logger for error reporting and diagnostics.
    /// </summary>
    [Inject] private ILogger<RequestComponentBase> Logger { get; set; } = default!;
    /// <summary>
    /// Factory for creating service scopes.
    /// </summary>
    [Inject] private IServiceScopeFactory ServiceScopeFactory { get; set; } = default!;

    // Tracks the number of ongoing busy operations.
    private int _busyCount;
    // Holds the current DI service scope for the component.
    private IServiceScope? _currentScope;
    // Manages cancellation for async operations.
    private CancellationTokenSource? _cts;

    /// <summary>
    /// Indicates if the component is currently busy (has ongoing operations).
    /// </summary>
    public bool IsBusy => Volatile.Read(ref _busyCount) > 0;

    /// <summary>
    /// Gets the current service scope, creating one if needed.
    /// </summary>
    private IServiceScope CurrentScope => _currentScope ??= CreateServiceScope();

    /// <summary>
    /// Gets the current cancellation token, renewing if necessary.
    /// </summary>
    protected CancellationToken CancellationToken => _cts?.Token ?? RenewCancellationToken();

    #region Service Scope

    /// <summary>
    /// Creates a new DI service scope.
    /// </summary>
    protected IServiceScope CreateServiceScope() => ServiceScopeFactory.CreateScope();

    /// <summary>
    /// Gets a required service from the current scope.
    /// </summary>
    protected TService GetRequiredService<TService>() where TService : notnull
        => GetRequiredService<TService>(CurrentScope);

    /// <summary>
    /// Gets all services of type TService from the current scope.
    /// </summary>
    protected IEnumerable<TService> GetServices<TService>() where TService : notnull
        => CurrentScope.ServiceProvider.GetServices<TService>();

    /// <summary>
    /// Retrieves a service of the specified type from the current dependency injection scope.
    /// </summary>
    /// <remarks>This method uses the current scope's <see cref="IServiceProvider"/> to resolve the service. 
    /// Ensure that the requested service type is registered in the dependency injection container.</remarks>
    /// <typeparam name="TService">The type of the service to retrieve. Must be a non-nullable reference type.</typeparam>
    /// <returns>An instance of the specified service type if it is registered in the current scope; otherwise, <see
    /// langword="null"/>.</returns>
    protected TService? GetService<TService>() where TService : notnull
        => CurrentScope.ServiceProvider.GetService<TService>();

    /// <summary>
    /// Gets a required service from a specified scope.
    /// </summary>
    protected TService GetRequiredService<TService>(IServiceScope scope) where TService : notnull
        => scope.ServiceProvider.GetRequiredService<TService>();

    #endregion

    #region Busy State

    /// <summary>
    /// Marks the component as busy. Optionally triggers StateHasChanged.
    /// </summary>
    /// <param name="stateChanged">If true, triggers UI update.</param>
    protected virtual void SetBusy(bool stateChanged = false)
    {
        Interlocked.Increment(ref _busyCount);
        if (stateChanged)
            _ = InvokeAsync(StateHasChanged);
    }

    /// <summary>
    /// Marks the component as ideal (not busy). Optionally triggers StateHasChanged.
    /// </summary>
    /// <param name="stateChanged">If true, triggers UI update.</param>
    protected virtual void SetIdeal(bool stateChanged = false)
    {
        var v = Interlocked.Decrement(ref _busyCount);
        if (v < 0)
            Interlocked.Exchange(ref _busyCount, 0); // Prevent negative busy count

        if (stateChanged)
            _ = InvokeAsync(StateHasChanged);
    }

    #endregion

    #region Cancellation Token

    /// <summary>
    /// Cancels the current cancellation token and disposes it.
    /// </summary>
    protected void CancelToken()
    {
        var old = Interlocked.Exchange(ref _cts, null);
        if (old is not null)
        {
            try
            {
                old.Cancel();
            }
            finally
            {
                old.Dispose();
            }
        }
    }

    /// <summary>
    /// Renews the cancellation token, disposing the previous one.
    /// </summary>
    private CancellationToken RenewCancellationToken()
    {
        var newCts = new CancellationTokenSource();
        var old = Interlocked.Exchange(ref _cts, newCts);
        if (old is not null)
        {
            try
            {
                old.Cancel();
            }
            finally
            {
                old.Dispose();
            }
        }

        return newCts.Token;
    }

    #endregion
    
    /// <summary>
    /// Sends an async request to a service, handles busy state, cancellation, and error reporting. Supports async afterSend and onFailure.
    /// </summary>
    protected async Task<TResult> SendRequestAsync<TService, TResult, TResponse>(
        Func<TService, CancellationToken, Task<TResponse>> action,
        Func<TResponse, Task<TResult>> afterSend,
        Func<Task>? onFailure = null,
        bool createScope = false,
        int debounceMs = 0)
        where TService : notnull
    {
        var token = RenewCancellationToken();

        if (debounceMs > 0)
        {
            await Task.Delay(debounceMs, token);
        }

        SetBusy();
        try
        {
            var scope = createScope ? CreateServiceScope() : CurrentScope;
            if (createScope)
                using (scope)
                {
                    var service = GetRequiredService<TService>(scope);
                    var response = await action(service, token);
                    return await afterSend(response);
                }

            {
                var service = GetRequiredService<TService>(scope);
                var response = await action(service, token);
                return await afterSend(response);
            }
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            if (onFailure is not null) await onFailure();
            HandleRequestException(ex);
            return default!;
        }
        finally
        {
            SetIdeal();
        }
    }
    
    /// <summary>
    /// Sends an async request to a service, handles busy state, cancellation, and error reporting. Supports sync afterSend and onFailure.
    /// </summary>
    protected async Task<TResult> SendRequestAsync<TService, TResult, TResponse>(
        Func<TService, CancellationToken, Task<TResponse>> action,
        Func<TResponse, TResult> afterSend,
        Action? onFailure = null,
        bool createScope = false,
        int debounceMs = 0)
        where TService : notnull
    {
        var token = RenewCancellationToken();

        if (debounceMs > 0)
        {
            await Task.Delay(debounceMs, token);
        }

        SetBusy();
        try
        {
            var scope = createScope ? CreateServiceScope() : CurrentScope;
            if (createScope)
                using (scope)
                {
                    var service = GetRequiredService<TService>(scope);
                    var response = await action(service, token);
                    return afterSend(response);
                }

            {
                var service = GetRequiredService<TService>(scope);
                var response = await action(service, token);
                return afterSend(response);
            }
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            onFailure?.Invoke();
            HandleRequestException(ex);
            return default!;
        }
        finally
        {
            SetIdeal();
        }
    }
    
    /// <summary>
    /// Sends an async request to a service, handles busy state, cancellation, and error reporting. Supports async afterSend and onFailure, no result.
    /// </summary>
    protected async Task SendRequestAsync<TService, TResponse>(
        Func<TService, CancellationToken, Task<TResponse>> action,
        Func<TResponse, Task> afterSend,
        Func<Task>? onFailure = null,
        bool createScope = false,
        int debounceMs = 0)
        where TService : notnull
    {
        var token = RenewCancellationToken();

        if (debounceMs > 0)
        {
            await Task.Delay(debounceMs, token);
        }

        SetBusy();
        try
        {
            var scope = createScope ? CreateServiceScope() : CurrentScope;
            if (createScope)
                using (scope)
                {
                    var service = GetRequiredService<TService>(scope);
                    var response = await action(service, token);
                    await afterSend(response);
                    return;
                }

            {
                var service = GetRequiredService<TService>(scope);
                var response = await action(service, token);
                await afterSend(response);
            }
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            if (onFailure is not null) await onFailure();
            HandleRequestException(ex);
        }
        finally
        {
            SetIdeal();
        }
    }
    
    /// <summary>
    /// Sends an async request to a service, handles busy state, cancellation, and error reporting. Supports sync afterSend and onFailure, no result.
    /// </summary>
    protected async Task SendRequestAsync<TService, TResponse>(
        Func<TService, CancellationToken, Task<TResponse>> action,
        Action<TResponse> afterSend,
        Action? onFailure = null,
        bool createScope = false,
        int debounceMs = 0)
        where TService : notnull
    {
        var token = RenewCancellationToken();

        if (debounceMs > 0)
        {
            await Task.Delay(debounceMs, token);
        }

        SetBusy();
        try
        {
            var scope = createScope ? CreateServiceScope() : CurrentScope;
            if (createScope)
                using (scope)
                {
                    var service = GetRequiredService<TService>(scope);
                    var response = await action(service, token);
                    afterSend(response);
                    return;
                }

            {
                var service = GetRequiredService<TService>(scope);
                var response = await action(service, token);
                afterSend(response);
            }
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            onFailure?.Invoke();
            HandleRequestException(ex);
        }
        finally
        {
            SetIdeal();
        }
    }
    
    /// <summary>
    /// Sends an async request to a service, handles busy state, cancellation, and error reporting. Returns result only.
    /// </summary>
    protected async Task<TResult?> SendRequestAsync<TService, TResult>(
        Func<TService, CancellationToken, Task<TResult>> action,
        bool createScope = false,
        int debounceMs = 0)
        where TService : notnull
    {
        var token = RenewCancellationToken();

        if (debounceMs > 0)
        {
            await Task.Delay(debounceMs, token);
        }

        SetBusy();
        try
        {
            if (createScope)
            {
                using var scope = CreateServiceScope();
                var service = GetRequiredService<TService>(scope);
                return await action(service, token);
            }
            else
            {
                var service = GetRequiredService<TService>(CurrentScope);
                return await action(service, token);
            }
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            HandleRequestException(ex);
            return default;
        }
        finally
        {
            SetIdeal();
        }
    }
    
    /// <summary>
    /// Sends an async request to a service, handles busy state, cancellation, and error reporting. No result.
    /// </summary>
    protected async Task SendRequestAsync<TService>(
        Func<TService, CancellationToken, Task> action,
        Func<Task>? afterSend = null,
        Func<Task>? onFailure = null,
        bool createScope = false,
        int debounceMs = 0)
        where TService : notnull
    {
        var token = RenewCancellationToken();

        if (debounceMs > 0)
        {
            await Task.Delay(debounceMs, token);
        }

        SetBusy();
        try
        {
            var scope = createScope ? CreateServiceScope() : CurrentScope;
            if (createScope)
                using (scope)
                {
                    var service = GetRequiredService<TService>(scope);
                    await action(service, token);
                    if (afterSend is not null) await afterSend();
                    return;
                }

            {
                var service = GetRequiredService<TService>(scope);
                await action(service, token);
                if (afterSend is not null) await afterSend();
            }
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            if (onFailure is not null) await onFailure();
            HandleRequestException(ex);
        }
        finally
        {
            SetIdeal();
        }
    }

    /// <summary>
    /// Handles exceptions from requests. Logs error and rethrows in DEBUG mode.
    /// </summary>
    /// <param name="ex">Exception to handle.</param>
    protected virtual void HandleRequestException(Exception ex)
    {
        Logger.LogError(ex, ex.Message);

#if DEBUG
        // Preserve original stack trace
        ExceptionDispatchInfo.Capture(ex).Throw();
#endif
    }
    /// <summary>
    /// Disposes the component, cancels tokens and disposes scope.
    /// </summary>
    public virtual void Dispose()
    {
        CancelToken();
        if (_currentScope is not null)
        {
            _currentScope.Dispose();
            _currentScope = null;
        }
    }
}