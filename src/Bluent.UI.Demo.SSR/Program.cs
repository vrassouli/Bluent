using Blazored.LocalStorage;
using Bluent.UI.Demo;
using Bluent.UI.Demo.Interactive.Client.Pages;
using Bluent.UI.Extensions;
using Bluent.UI.Demo.SSR.Components;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents();
builder.Services.AddBlazoredLocalStorage()
    .AddBluentUI();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseWebAssemblyDebugging();
}
else
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();


app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(typeof(InteractiveServerProbe).Assembly)
    .AddAdditionalAssemblies(typeof(Bluent.UI.Demo.Pages._Imports).Assembly);

app.Run();
