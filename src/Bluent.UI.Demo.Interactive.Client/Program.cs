using Bluent.UI.Extensions;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.Services.AddBluentUI();

await builder.Build().RunAsync();
