using System.Reflection;
using Bluent.UI.Components;
using Bluent.Core;
using Bluent.UI.Interops.Abstractions;
using Microsoft.AspNetCore.Components.Web;
using System.Collections;
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
            await OtpDisposeIndependentResources();
            await PopoverDisposalAndContainerUnsubscription();
            await DataGridJsAndComponentCleanup();
            await DomHelperPointerLifetimeChecks();
            await ThemeModuleLifetimeChecks();
            Console.WriteLine($"PASS: {_assertions} executed AudioCapture/Overflow/OtpField/Popover/DataGrid/DomHelper/BluentTheme interop lifecycle assertions against compiled Bluent.UI");
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

    private static object CreateOtpInterop(FakeRuntime js)
    {
        Type type=typeof(AudioCapture).Assembly.GetType("Bluent.UI.Interops.OptFieldInterop",throwOnError:true)!;
        return Activator.CreateInstance(type,BindingFlags.Instance|BindingFlags.Public|BindingFlags.NonPublic,
            binder:null,args:new object?[]{js},culture:null)!;
    }

    private static (object Interop,object Container,object Service) CreatePopover(FakeRuntime js)
    {
        Assembly assembly=typeof(AudioCapture).Assembly;
        Type serviceType=assembly.GetType("Bluent.UI.Services.PopoverService",throwOnError:true)!;
        Type containerType=assembly.GetType("Bluent.UI.Components.PopoverComponent.PopoverContainerBase\u00601",throwOnError:true)!
            .MakeGenericType(serviceType);
        object service=Activator.CreateInstance(serviceType,nonPublic:true)!;
        object container=Activator.CreateInstance(containerType)!;
        containerType.GetProperty("Service",BindingFlags.Instance|BindingFlags.NonPublic)!
            .SetValue(container,service);
        containerType.GetProperty("JsRuntime",BindingFlags.Instance|BindingFlags.NonPublic)!
            .SetValue(container,js);
        containerType.GetMethod("OnInitialized",BindingFlags.Instance|BindingFlags.NonPublic)!
            .Invoke(container,null);
        object interop=Field<object>(container,"_interop")!;
        return (interop,container,service);
    }

    private static async Task InitializePopoverInterop(object interop)
    {
        var method=interop.GetType().GetMethod("GetModuleAsync",BindingFlags.Instance|BindingFlags.NonPublic)!;
        await (Task)method.Invoke(interop,null)!;
    }

    private static (object Interop,DataGrid<string> Component) CreateDataGrid(FakeRuntime js)
    {
        var component=new DataGrid<string>();
        Type type=component.GetType();
        type.GetProperty("JsRuntime",BindingFlags.Instance|BindingFlags.NonPublic)!
            .SetValue(component,js);
        type.GetMethod("OnInitialized",BindingFlags.Instance|BindingFlags.NonPublic)!
            .Invoke(component,null);
        return (Field<object>(component,"_interop")!,component);
    }

    private static object CreateTheme(FakeRuntime js)
    {
        Type type=typeof(AudioCapture).Assembly.GetType("Bluent.UI.Interops.BluentTheme",throwOnError:true)!;
        return Activator.CreateInstance(type,BindingFlags.Instance|BindingFlags.Public|BindingFlags.NonPublic,
            binder:null,args:new object?[]{js},culture:null)!;
    }

    private static object CreateDomHelper(FakeRuntime js)
    {
        Type type=typeof(AudioCapture).Assembly.GetType("Bluent.UI.Services.DomHelper",throwOnError:true)!;
        return Activator.CreateInstance(type,BindingFlags.Instance|BindingFlags.Public|BindingFlags.NonPublic,
            binder:null,args:new object?[]{js},culture:null)!;
    }

    private static Task CallPointer(object service,string method,FakePointerHandler handler)
    {
        var target=service.GetType().GetMethod(method,BindingFlags.Public|BindingFlags.Instance)!;
        return (Task)target.MakeGenericMethod(typeof(FakePointerHandler)).Invoke(service,[handler])!;
    }

    private static int PointerReferences(object instance,string name)
    {
        return ((ICollection)Field<object>(instance,name)!).Count;
    }

    private static void AssertDisposedReference(object? reference,string context)
    {
        Assert(reference is not null,context+" callback reference exists");
        var value=reference!.GetType().GetProperty("Value")!;
        try
        {
            _=value.GetValue(reference);
            throw new InvalidOperationException(context+" callback reference remained live after cleanup");
        }
        catch(TargetInvocationException ex) when(ex.InnerException is ObjectDisposedException)
        {
            Assert(true,context+" released actual DotNetObjectReference");
        }
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
    private static async Task OtpDisposeIndependentResources()
    {
        var js=new FakeRuntime();
        var interop=CreateOtpInterop(js);
        await InvokeTask(interop,"InitializeAsync","otp-test");
        Assert(js.Handle.InitCount==1&&js.Module.CreateCount==1,"OTP JS initialized once");
        js.Handle.DisposeFailure=new JSDisconnectedException("OTP circuit closed");
        await Dispose(interop);
        Assert(js.Handle.DisposeCount==1&&js.Module.DisposeCount==1,
            "OTP module disposed despite child JS disconnect");
        Assert(Field<object>(interop,"_reference") is null,"OTP child handle reset");
        await Dispose(interop);
        Assert(js.Handle.DisposeCount==1&&js.Module.DisposeCount==1,
            "OTP DisposeAsync idempotent");

        var unexpected=new FakeRuntime();
        var other=CreateOtpInterop(unexpected);
        await InvokeTask(other,"InitializeAsync","otp-unexpected");
        unexpected.Handle.DisposeFailure=new JSException("OTP child disposal failure");
        try
        {
            await Dispose(other);
            throw new InvalidOperationException("Unexpected OTP JS error was hidden");
        }
        catch(JSException)
        {
            Assert(unexpected.Module.DisposeCount==1,
                "OTP module still disposed after unexpected child failure");
            Assert(Field<object>(other,"_module") is null,
                "OTP module handle reset after unexpected child failure");
        }

        var moduleFail=new FakeRuntime();
        var affected=CreateOtpInterop(moduleFail);
        await InvokeTask(affected,"InitializeAsync","otp-module-fail");
        moduleFail.Module.DisposeFailure=new JSException("module disposal failed");
        try
        {
            await Dispose(affected);
            throw new InvalidOperationException("Unexpected module error was hidden");
        }
        catch(JSException)
        {
            Assert(moduleFail.Handle.DisposeCount==1,
                "OTP child disposed before module failure");
            Assert(Field<object>(affected,"_reference") is null,
                "OTP child handle cleared despite module exception");
        }

        var lazy=new FakeRuntime();
        await Dispose(CreateOtpInterop(lazy));
        Assert(lazy.ImportCount==0,"OTP dispose-before-use does not import JS");
    }

    private static async Task PopoverDisposalAndContainerUnsubscription()
    {
        var normal=new FakeRuntime();
        var (interop,container,service)=CreatePopover(normal);
        Assert(EventSubscriptions(service)==5,"all five Popover service events are subscribed");
        await InitializePopoverInterop(interop);
        Assert(normal.Module.CreateCount==1,"Popover JS proxy created lazily");
        normal.Handle.DisposeFailure=new JSDisconnectedException("Popover browser disconnected");
        await Dispose(container);
        Assert(normal.Handle.DisposeCount==1&&normal.Module.DisposeCount==1,
            "Popover module disposed despite child JS disconnection");
        Assert(Field<object>(interop,"_handlerReference") is null,
            "Popover managed callback disposed");
        Assert(EventSubscriptions(service)==0,
            "All service events unsubscribed after JS disconnect");

        var unexpected=new FakeRuntime();
        var (failedInterop,failedContainer,failedService)=CreatePopover(unexpected);
        await InitializePopoverInterop(failedInterop);
        unexpected.Handle.DisposeFailure=new JSException("Popover child JS exception");
        try
        {
            await Dispose(failedContainer);
            throw new InvalidOperationException("Expected JS disposal error was hidden");
        }
        catch(JSException)
        {
            Assert(unexpected.Module.DisposeCount==1,"Popover module cleanup attempted after unexpected child exception");
            Assert(Field<object>(failedInterop,"_handlerReference") is null,
                "Popover managed callback released after unexpected JS failure");
            Assert(EventSubscriptions(failedService)==0,
                "All five Popover service handlers unsubscribed even when DisposeAsync fails");
        }
        var unused=new FakeRuntime();
        var (_,noUseContainer,noUseService)=CreatePopover(unused);
        await Dispose(noUseContainer);
        Assert(unused.ImportCount==0,"Popover unused Dispose does not import module");
        Assert(EventSubscriptions(noUseService)==0,
            "Unused Popover still unsubscribes service handlers");
    }

    private static int EventSubscriptions(object service)
    {
        int count=0;
        foreach(string name in new[]{"OnSetTrigger","OnShowSurface","OnHideSurface","OnDestroy","OnRefreshSurface"})
        {
            if(service.GetType().GetField(name,BindingFlags.NonPublic|BindingFlags.Instance)!
                .GetValue(service) is MulticastDelegate d)
                count+=d.GetInvocationList().Length;
        }
        return count;
    }

    private static async Task DataGridJsAndComponentCleanup()
    {
        var normal=new FakeRuntime();
        var (interop,component)=CreateDataGrid(normal);
        Assert(normal.ImportCount==0,"DataGrid module lazily loaded");
        await InvokeTask(interop,"Initialize");
        Assert(normal.ImportCount==1&&normal.Module.CreateCount==1,
            "Real DataGrid component initializes interop lazily");
        normal.Handle.DisposeFailure=new JSDisconnectedException("DataGrid disconnected");
        await Dispose(component);
        Assert(normal.Handle.DisposeCount==1&&normal.Module.DisposeCount==1,
            "DataGrid module cleanup reached after child disconnect");
        Assert(Field<object>(interop,"_handlerReference") is null,
            "DataGrid callback reference released");
        await Dispose(component);
        Assert(normal.Handle.DisposeCount==1&&normal.Module.DisposeCount==1,
            "DataGrid repeated component disposal does not touch JS again");

        var failed=new FakeRuntime();
        var (failedInterop,failedComponent)=CreateDataGrid(failed);
        await InvokeTask(failedInterop,"Initialize");
        failed.Handle.DisposeFailure=new JSException("DataGrid disposal unexpected");
        try
        {
            await Dispose(failedComponent);
            throw new InvalidOperationException("DataGrid unexpected disposal error was hidden");
        }
        catch(JSException)
        {
            Assert(failed.Module.DisposeCount==1,
                "DataGrid module disposed after child JS exception");
            Assert(Field<object>(failedInterop,"_handlerReference") is null,
                "DataGrid callback released after JS exception");
        }

        var lazy=new FakeRuntime();
        var (_,neverRendered)=CreateDataGrid(lazy);
        await Dispose(neverRendered);
        Assert(lazy.ImportCount==0,"DataGrid pre-render dispose must not import JS");
    }

    private static async Task DomHelperPointerLifetimeChecks()
    {
        var js=new FakeRuntime();
        var dom=CreateDomHelper(js);
        var handler=new FakePointerHandler("pointer-one");
        Assert(js.ImportCount==0,"DomHelper JS import lazy");
        await CallPointer(dom,"RegisterPointerMoveHandler",handler);
        var first=js.Handle.LastRegisterReference;
        Assert(PointerReferences(dom,"_pointerMoveReferences")==1,
            "pointer move registration tracked exactly once by handler ID");
        Assert(js.ImportCount==1&&js.Module.CreateCount==1,
            "first DomHelper handler register creates one JS proxy");
        await CallPointer(dom,"RegisterPointerMoveHandler",handler);
        var second=js.Handle.LastRegisterReference;
        Assert(!ReferenceEquals(first,second),"duplicate registration owns replacement reference");
        AssertDisposedReference(first,"previous same-ID registration");
        Assert(PointerReferences(dom,"_pointerMoveReferences")==1,
            "repeat same-ID registration does not leak tracked handles");
        await CallPointer(dom,"UnregisterPointerMoveHandler",handler);
        Assert(PointerReferences(dom,"_pointerMoveReferences")==0,
            "unregister removes managed pointer reference immediately");
        AssertDisposedReference(second,"normal pointer unregister");

        await CallPointer(dom,"RegisterPointerUpHandler",handler);
        var up=js.Handle.LastRegisterReference;
        Assert(PointerReferences(dom,"_pointerUpReferences")==1,
            "pointer up registered independently");
        js.Handle.FailureOn="unregisterPointerUpHandler";
        try
        {
            await CallPointer(dom,"UnregisterPointerUpHandler",handler);
            throw new InvalidOperationException("unexpected pointer unregister error suppressed");
        }
        catch(JSException)
        {
            Assert(PointerReferences(dom,"_pointerUpReferences")==0,
                "pointer up reference removed despite unexpected JS failure");
            AssertDisposedReference(up,"unregister failing JS cleanup");
        }
        js.Handle.FailureOn=null;

        // The JS call can fail before ownership is transferred. That freshly
        // created DotNetObjectReference must still be disposed.
        js.Handle.FailureOn="registerPointerMoveHandler";
        try
        {
            await CallPointer(dom,"RegisterPointerMoveHandler",handler);
            throw new InvalidOperationException("expected JS register failure");
        }
        catch(JSException)
        {
            Assert(PointerReferences(dom,"_pointerMoveReferences")==0,
                "failed registration did not retain a callback");
            AssertDisposedReference(js.Handle.LastRegisterReference,"register JS failure");
        }
        js.Handle.FailureOn=null;

        await CallPointer(dom,"RegisterPointerMoveHandler",handler);
        var remaining=js.Handle.LastRegisterReference;
        js.Handle.DisposeFailure=new JSDisconnectedException("disposed during Blazor circuit shutdown");
        await Dispose(dom);
        AssertDisposedReference(remaining,"DomHelper dispose during circuit loss");
        Assert(PointerReferences(dom,"_pointerMoveReferences")==0,
            "DomHelper remaining pointer move refs cleared on disconnect");
        Assert(js.Handle.DisposeCount==1&&js.Module.DisposeCount==1,
            "DomHelper child and module both attempted on disconnect");
        await Dispose(dom);
        Assert(js.Handle.DisposeCount==1&&js.Module.DisposeCount==1,
            "DomHelper Dispose is idempotent");

        var unexpected=new FakeRuntime();
        var failedDom=CreateDomHelper(unexpected);
        await CallPointer(failedDom,"RegisterPointerUpHandler",handler);
        var live=unexpected.Handle.LastRegisterReference;
        unexpected.Handle.DisposeFailure=new JSException("unrecoverable JS disposal");
        try
        {
            await Dispose(failedDom);
            throw new InvalidOperationException("unexpected DomHelper cleanup exception suppressed");
        }
        catch(JSException)
        {
            Assert(unexpected.Module.DisposeCount==1,
                "DomHelper imports module independently disposed on unexpected JS error");
            AssertDisposedReference(live,"DomHelper finally cleanup after JSException");
            Assert(PointerReferences(failedDom,"_pointerUpReferences")==0,
                "DomHelper managed ref dictionary cleared despite JSException");
        }

        var unused=new FakeRuntime();
        await Dispose(CreateDomHelper(unused));
        Assert(unused.ImportCount==0,"DomHelper dispose-before-register does not import JS");
    }

    private static async Task ThemeModuleLifetimeChecks()
    {
        var neverUsed=new FakeRuntime();
        await Dispose(CreateTheme(neverUsed));
        Assert(neverUsed.ImportCount==0,
            "BluentTheme dispose-before-use does not import module");

        var disconnected=new FakeRuntime();
        var theme=CreateTheme(disconnected);
        await InitializePopoverInterop(theme);
        Assert(disconnected.ImportCount==1,
            "BluentTheme imports only when first requested");
        disconnected.Module.DisposeFailure=new JSDisconnectedException("theme circuit closed");
        await Dispose(theme);
        Assert(disconnected.Module.DisposeCount==1,
            "BluentTheme attempts disposal even if circuit closed");
        Assert(Field<object>(theme,"_module") is null,
            "BluentTheme module released after expected disconnection");
        await Dispose(theme);
        Assert(disconnected.Module.DisposeCount==1,
            "BluentTheme double DisposeAsync idempotent");

        var failed=new FakeRuntime();
        var failingTheme=CreateTheme(failed);
        await InitializePopoverInterop(failingTheme);
        failed.Module.DisposeFailure=new JSException("unexpected theme JS failure");
        try
        {
            await Dispose(failingTheme);
            throw new InvalidOperationException("BluentTheme unexpected JS error silently hidden");
        }
        catch(JSException)
        {
            Assert(failed.Module.DisposeCount==1,
                "BluentTheme unexpected module error propagated");
            Assert(Field<object>(failingTheme,"_module") is null,
                "BluentTheme still clears failed module reference");
        }
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
    public Exception? DisposeFailure {get;set;}
    public string? FailureOn {get;set;}
    public object? LastRegisterReference {get;private set;}
    public int PointerCalls {get;private set;}

    public ValueTask<TValue> InvokeAsync<TValue>(string identifier,object?[]? args)
        => InvokeAsync<TValue>(identifier,CancellationToken.None,args);
    public ValueTask<TValue> InvokeAsync<TValue>(string identifier,CancellationToken cancellationToken,object?[]? args)
    {
        if(identifier is not ("AudioCapture.create" or "Overflow.create" or "OtpField.create" or "Popover.create" or "DataGrid.create" or "DomHelper.create"))
            throw new InvalidOperationException("Unexpected JS module: "+identifier);
        CreateCount++;
        return new ValueTask<TValue>((TValue)(object)handle);
    }
    public ValueTask DisposeAsync() {DisposeCount++;if(DisposeFailure is not null)throw DisposeFailure;return ValueTask.CompletedTask;}
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
    public string? FailureOn {get;set;}
    public object? LastRegisterReference {get;private set;}
    public int PointerCalls {get;private set;}

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
        else if(identifier is "registerPointerMoveHandler" or "unregisterPointerMoveHandler"
             or "registerPointerUpHandler" or "unregisterPointerUpHandler")
        {
            PointerCalls++;
            if(identifier.StartsWith("registerPointer",StringComparison.Ordinal))
                LastRegisterReference=args?.LastOrDefault();
            if(identifier==FailureOn)throw new JSException("simulated "+identifier+" failure");
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


internal sealed class FakePointerHandler(string id):
    IBluentComponent, IPointerMoveEventHandler, IPointerUpEventHandler
{
    public string Id { get; } = id;
    public Task OnPointerMove(PointerEventArgs args) => Task.CompletedTask;
    public Task OnPointerUp(PointerEventArgs args) => Task.CompletedTask;
}
