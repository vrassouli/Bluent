using Bluent.FocusLifecycleLab.Components;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorComponents().AddInteractiveServerComponents();
var app = builder.Build();
app.UseStaticFiles();

// This isolated lab uses the .NET SDK's local static Blazor runtime files.
// Runtime JS is served explicitly, without modifying Bluent or requiring a CDN.
// MapStaticAssets was unsuitable in this minimal no-template fixture on Dev01.
var nuget = Path.Combine(
    Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
    ".nuget", "packages", "microsoft.aspnetcore.app.internal.assets");
if (!Directory.Exists(nuget))
    throw new InvalidOperationException("Local .NET internal ASP.NET Core static assets missing");
var framework = Directory.EnumerateDirectories(nuget)
    .OrderByDescending(path => Version.TryParse(Path.GetFileName(path), out var version)
        ? version : new Version(0, 0))
    .Select(path => Path.Combine(path, "_framework"))
    .FirstOrDefault(Directory.Exists)
    ?? throw new InvalidOperationException("No local _framework asset directory");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(framework),
    RequestPath = "/_framework"
});
app.UseAntiforgery();
app.MapRazorComponents<App>().AddInteractiveServerRenderMode();
app.Run();
