param([ValidateSet("get","set")][string]$Action = "get", [uint32]$Flags = 0, [string]$Scheme = "")
$ErrorActionPreference = "Stop"
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class BluentHighContrastNative {
  [StructLayout(LayoutKind.Sequential)]
  public struct HighContrastData { public UInt32 cbSize; public UInt32 dwFlags; public IntPtr lpszDefaultScheme; }
  [DllImport("user32.dll", EntryPoint="SystemParametersInfoW", SetLastError=true)]
  [return: MarshalAs(UnmanagedType.Bool)]
  private static extern bool SystemParametersInfo(UInt32 action, UInt32 param, ref HighContrastData data, UInt32 flags);
  public static object Read() {
    var data = new HighContrastData(); data.cbSize = (UInt32)Marshal.SizeOf(typeof(HighContrastData));
    if (!SystemParametersInfo(0x0042, data.cbSize, ref data, 0)) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
    return new { success = true, flags = data.dwFlags, enabled = (data.dwFlags & 1) == 1,
      scheme = data.lpszDefaultScheme == IntPtr.Zero ? null : Marshal.PtrToStringUni(data.lpszDefaultScheme) };
  }
  public static object Set(UInt32 flags, string scheme) {
    IntPtr pointer = String.IsNullOrEmpty(scheme) ? IntPtr.Zero : Marshal.StringToHGlobalUni(scheme);
    try {
      var data = new HighContrastData { cbSize = (UInt32)Marshal.SizeOf(typeof(HighContrastData)), dwFlags = flags, lpszDefaultScheme = pointer };
      if (!SystemParametersInfo(0x0043, data.cbSize, ref data, 0x0003)) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
    } finally { if (pointer != IntPtr.Zero) Marshal.FreeHGlobal(pointer); }
    return Read();
  }
}
"@
if ($Action -eq "set") { [BluentHighContrastNative]::Set($Flags, $Scheme) | ConvertTo-Json -Compress }
else { [BluentHighContrastNative]::Read() | ConvertTo-Json -Compress }
