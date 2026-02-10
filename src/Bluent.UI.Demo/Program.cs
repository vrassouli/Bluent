using Blazored.LocalStorage;
using Bluent.UI.Demo;
using Bluent.UI.Extensions;
using Bluent.UI.Utilities.Extensions;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) })
    .AddBlazoredLocalStorage()
    .AddBluentUI()
    .AddBluentUtilities();

await builder.Build().RunAsync();
