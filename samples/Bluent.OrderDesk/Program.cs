using Bluent.OrderDesk;
using Bluent.OrderDesk.Data;
using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddBluentUI();
builder.Services.AddSingleton<OrderDeskRepository>();

await builder.Build().RunAsync();
