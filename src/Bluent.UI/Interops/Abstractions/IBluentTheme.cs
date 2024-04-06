using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bluent.UI.Interops.Abstractions;

public interface IBluentTheme
{
    Task<string> GetThemeModeAsync();
    void SetThemeMode(string mode);
    void SetLightThemeMode();
    void SetDarkThemeMode();
    Task<string> GetDirectionAsync();
    void SetDirection(string dir);
    void SetLtrDirection();
    void SetRtlDirection();
    void SetTheme(string theme);
}
