namespace Bluent.UI.Interops.Abstractions;

public interface IBluentTheme
{
    Task<string> GetThemeModeAsync();
    Task SetThemeModeAsync(string mode);
    Task SetLightThemeModeAsync();
    Task SetDarkThemeModeAsync();
    Task<string> GetDirectionAsync();
    Task SetDirectionAsync(string dir);
    Task SetLtrDirectionAsync();
    Task SetRtlDirectionAsync();
    Task SetThemeAsync(string theme);
}
