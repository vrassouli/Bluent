using System.Reflection;
using Bluent.UI.Components;
using Microsoft.JSInterop;

namespace V3InteropLifecycle;

internal static class Program
{
    private static int _assertions;

    public static async Task<int> Main()
    {
        try
        {
            await StopActuallyAwaitsJs();
            await StopReportsRealJsFailures();
            await DisposeHandlesDisconnectAndReleasesManagedReference();
            await DisposeStillReleasesResourcesOnUnexpectedError();
            await DisposeBeforeInitializationDoesNotImport();
            await OverflowInitActuallyAwaitsJs();
            await OverflowDisposeAfterDisconnectionAndUnexpectedError();
            Console.WriteLine($"PASS: {_assertions} executed AudioCapture/Overflow interop lifecycle assertions against compiled Bluent.UI");
            return 0;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex);
            return 1;
        }
    }

    private static object CreateInterop(FakeRuntime js)
    {
        Type type=typeof(AudioCapture).Assembly.GetType("Bluent.UI.Interops.AudioCaptureInterop",throwOnError:true)!;
        return Activator.CreateInstance(type,BindingFlags.Instance|BindingFlags.Public|BindingFlags.NonPublic,
            binder:null,args:new object?[]{new AudioCapture(),js,"audio-test","audio/ogg"},culture:null)!;
    }

    private static object CreateOverflowInterop(FakeRuntime js)
    {
        Type type=typeof(AudioCapture).Assembly.GetType("Bluent.UI.Interops.OverflowInterop",throwOnError:true)!;
        return Activator.CreateInstance(type,BindingFlags.Instance|BindingFlags.Public|BindingFlags.NonPublic,
            binder:null,args:new object?[]{js},culture:null)!;
    }

    private static Task InvokeTask(object instance,string method,params object?[] args)
    {
        return (Task)instance.GetType().GetMethod(method,BindingFlags.Public|BindingFlags.Instance)!
            .Invoke(instance,args)!;
    }

    private static async Task Dispose(object instance)
    {
        var method=instance.GetType().GetMethod("DisposeAsync",BindingFlags.Public|BindingFlags.Instance)!;
        await ((ValueTask)method.Invoke(instance,null)!).ConfigureAwait(false);
    }

    private static T? Field<T>(object instance,string name) where T:class
        => (T?)instance.GetType().GetField(name,BindingFlags.Instance|BindingFlags.NonPublic)!.GetValue(instance);

    private static void Assert(bool ok,string message)
    {
        _assertions++;
        if (!ok) throw new InvalidOperationException("ASSERTION FAILED: "+message);
    }

    private static async Task StopActuallyAwaitsJs()
    {
        var js=new FakeRuntime();
        var gate=new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        js.Handle.StopGate=gate;
        var interop=CreateInterop(js);
        Assert(js.ImportCount==0,"module remains lazy before StopAsync");
        Task operation=InvokeTask(interop,"StopAsync");
        Assert(js.ImportCount==1,"module import started");
        Assert(js.Module.CreateCount==1,"AudioCapture.create used once");
        Assert(js.Handle.StopCount==1,"stop JS call started");
        Assert(!operation.IsCompleted,"managed StopAsync must await unresolved JS");
        gate.SetResult();
        await operation;
        Assert(operation.IsCompletedSuccessfully,"managed StopAsync completes after JS");
        await Dispose(interop);
        Assert(js.Handle.DisposeCount==1&&js.Module.DisposeCount==1,"both JS handles disposed");
        Assert(Field<object>(interop,"_handlerReference") is null,"managed callback reference cleared");
        await Dispose(interop);
        Assert(js.Handle.DisposeCount==1&&js.Module.DisposeCount==1,"repeated DisposeAsync is idempotent");
    }

    private static async Task StopReportsRealJsFailures()
    {
        var js=new FakeRuntime();
        js.Handle.StopFailure=new JSException("microphone failed");
        var interop=CreateInterop(js);
        try
        {
            await InvokeTask(interop,"StopAsync");
            throw new InvalidOperationException("JSException should propagate, not be swallowed");
        }
        catch(JSException)
        {
            Assert(true,"unexpected JS failure reaches awaited caller");
        }
        finally
        {
            await Dispose(interop);
        }
    }

    private static async Task DisposeHandlesDisconnectAndReleasesManagedReference()
    {
        var js=new FakeRuntime();
        var interop=CreateInterop(js);
        await InvokeTask(interop,"StopAsync");
        js.Handle.DisposeFailure=new JSDisconnectedException("circuit disconnected");
        await Dispose(interop);
        Assert(js.Handle.DisposeCount==1,"child JS disposal attempted");
        Assert(js.Module.DisposeCount==1,"module disposal still attempted after disconnect");
        Assert(Field<object>(interop,"_handlerReference") is null,"managed callback released");
    }

    private static async Task DisposeStillReleasesResourcesOnUnexpectedError()
    {
        var js=new FakeRuntime();
        var interop=CreateInterop(js);
        await InvokeTask(interop,"StopAsync");
        js.Handle.DisposeFailure=new JSException("broken JS dispose");
        try
        {
            await Dispose(interop);
            throw new InvalidOperationException("unexpected child error must propagate");
        }
        catch(JSException)
        {
            Assert(js.Module.DisposeCount==1,"module still disposed after unexpected child error");
            Assert(Field<object>(interop,"_handlerReference") is null,"callback still released");
        }
    }

    private static async Task DisposeBeforeInitializationDoesNotImport()
    {
        var js=new FakeRuntime();
        var interop=CreateInterop(js);
        await Dispose(interop);
        Assert(js.ImportCount==0,"dispose-before-use must not import JS module");
        Assert(js.Module.DisposeCount==0&&js.Handle.DisposeCount==0,"no imaginary handles disposed");
    }
    private static async Task OverflowInitActuallyAwaitsJs()
    {
        var js=new FakeRuntime();
        var gate=new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        js.Handle.InitGate=gate;
        var interop=CreateOverflowInterop(js);
        Assert(js.ImportCount==0,"Overflow must not eagerly import JS");
        Task init=InvokeTask(interop,"InitAsync","overflow-container");
        Assert(js.ImportCount==1&&js.Module.CreateCount==1,"Overflow module created lazily");
        Assert(js.Handle.InitCount==1,"init JS call started");
        Assert(!init.IsCompleted,"Overflow.InitAsync must await pending JS");
        gate.SetResult();
        await init;
        Assert(init.IsCompletedSuccessfully,"Overflow init finishes only after JS");
        await Dispose(interop);
        Assert(js.Handle.DisposeCount==1&&js.Module.DisposeCount==1,"Overflow JS handles disposed");
        await Dispose(interop);
        Assert(js.Handle.DisposeCount==1&&js.Module.DisposeCount==1,"Overflow DisposeAsync idempotent");
    }

    private static async Task OverflowDisposeAfterDisconnectionAndUnexpectedError()
    {
        var disconnected=new FakeRuntime();
        var disconnectedInterop=CreateOverflowInterop(disconnected);
        await InvokeTask(disconnectedInterop,"InitAsync","overflow-disconnected");
        disconnected.Handle.DisposeFailure=new JSDisconnectedException("circuit closed");
        await Dispose(disconnectedInterop);
        Assert(disconnected.Module.DisposeCount==1,"Overflow module disposed despite child disconnection");

        var unexpected=new FakeRuntime();
        var unexpectedInterop=CreateOverflowInterop(unexpected);
        await InvokeTask(unexpectedInterop,"InitAsync","overflow-unexpected");
        unexpected.Handle.DisposeFailure=new JSException("unexpected JS exception");
        try
        {
            await Dispose(unexpectedInterop);
            throw new InvalidOperationException("Unexpected JS error cannot be silently swallowed");
        }
        catch(JSException)
        {
            Assert(unexpected.Module.DisposeCount==1,"Overflow module disposed after unexpected failure");
            Assert(Field<object>(unexpectedInterop,"_overflowReference") is null,"Overflow child handle cleared");
        }

        var unused=new FakeRuntime();
        await Dispose(CreateOverflowInterop(unused));
        Assert(unused.ImportCount==0,"Overflow no import during disposal before first render");
    }
}

internal sealed class FakeRuntime: IJSRuntime
{
    public FakeModule Module {get;}
    public FakeJsHandle Handle {get;}
    public int ImportCount {get;private set;}
    public FakeRuntime() { Handle=new FakeJsHandle();Module=new FakeModule(Handle); }

    public ValueTask<TValue> InvokeAsync<TValue>(string identifier,object?[]? args)
        => InvokeAsync<TValue>(identifier,CancellationToken.None,args);

    public ValueTask<TValue> InvokeAsync<TValue>(string identifier,CancellationToken cancellationToken,object?[]? args)
    {
        if(identifier!="import")throw new InvalidOperationException("Unexpected JS runtime: "+identifier);
        ImportCount++;
        return new ValueTask<TValue>((TValue)(object)Module);
    }
}

internal sealed class FakeModule(FakeJsHandle handle): IJSObjectReference
{
    public int CreateCount {get;private set;}
    public int DisposeCount {get;private set;}

    public ValueTask<TValue> InvokeAsync<TValue>(string identifier,object?[]? args)
        => InvokeAsync<TValue>(identifier,CancellationToken.None,args);
    public ValueTask<TValue> InvokeAsync<TValue>(string identifier,CancellationToken cancellationToken,object?[]? args)
    {
        if(identifier is not ("AudioCapture.create" or "Overflow.create"))
            throw new InvalidOperationException("Unexpected JS module: "+identifier);
        CreateCount++;
        return new ValueTask<TValue>((TValue)(object)handle);
    }
    public ValueTask DisposeAsync() {DisposeCount++;return ValueTask.CompletedTask;}
}

internal sealed class FakeJsHandle: IJSObjectReference
{
    public int StopCount {get;private set;}
    public int InitCount {get;private set;}
    public TaskCompletionSource? InitGate {get;set;}
    public int DisposeCount {get;private set;}
    public TaskCompletionSource? StopGate {get;set;}
    public Exception? StopFailure {get;set;}
    public Exception? DisposeFailure {get;set;}

    public ValueTask<TValue> InvokeAsync<TValue>(string identifier,object?[]? args)
        => InvokeAsync<TValue>(identifier,CancellationToken.None,args);
    public async ValueTask<TValue> InvokeAsync<TValue>(string identifier,CancellationToken cancellationToken,object?[]? args)
    {
        if(identifier=="init")
        {
            InitCount++;
            if(InitGate is not null)await InitGate.Task.WaitAsync(cancellationToken);
        }
        else if(identifier=="stop")
        {
            StopCount++;
            if(StopGate is not null)await StopGate.Task.WaitAsync(cancellationToken);
            if(StopFailure is not null)throw StopFailure;
        }
        else
        {
            throw new InvalidOperationException("Unexpected JS handle method: "+identifier);
        }
        return default!;
    }

    public ValueTask DisposeAsync()
    {
        DisposeCount++;
        if(DisposeFailure is not null)throw DisposeFailure;
        return ValueTask.CompletedTask;
    }
}
