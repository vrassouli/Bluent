param([ValidateSet("snapshot","key")][string]$Action, [string]$Profile, [string]$Key = "")
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class BluentNativeInput {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint flags, UIntPtr extra);
  public static void Tap(byte vk) { keybd_event(vk, 0, 0, UIntPtr.Zero); keybd_event(vk, 0, 2, UIntPtr.Zero); }
  public static void ShiftTab() {
    keybd_event(0x10, 0, 0, UIntPtr.Zero); keybd_event(0x09, 0, 0, UIntPtr.Zero);
    keybd_event(0x09, 0, 2, UIntPtr.Zero); keybd_event(0x10, 0, 2, UIntPtr.Zero);
  }
}
"@
$owned = @(Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "msedge.exe" -and $_.CommandLine -and $_.CommandLine.IndexOf($Profile, [StringComparison]::OrdinalIgnoreCase) -ge 0
})
$browser = $null
foreach ($item in $owned) {
  $process = Get-Process -Id $item.ProcessId -ErrorAction SilentlyContinue
  if ($process -and $process.MainWindowHandle -ne 0) { $browser = $process; break }
}
if (-not $browser) { throw "No Edge top-level window found for the isolated profile." }
$hwnd = $browser.MainWindowHandle
if ($Action -eq "key") {
  [void][BluentNativeInput]::ShowWindow($hwnd, 9)
  [void][BluentNativeInput]::SetForegroundWindow($hwnd)
  Start-Sleep -Milliseconds 180
  switch ($Key) {
    "Tab" { [BluentNativeInput]::Tap(0x09) }
    "ShiftTab" { [BluentNativeInput]::ShiftTab() }
    "Escape" { [BluentNativeInput]::Tap(0x1B) }
    default { throw "Unsupported key request: $Key" }
  }
  Start-Sleep -Milliseconds 180
}
$root = [System.Windows.Automation.AutomationElement]::RootElement
$condition = New-Object System.Windows.Automation.PropertyCondition(
  [System.Windows.Automation.AutomationElement]::ProcessIdProperty, [int]$browser.Id)
$window = $root.FindFirst([System.Windows.Automation.TreeScope]::Children, $condition)
if (-not $window) { throw "UI Automation could not find Edge's top-level window." }
function Describe-Element($element, [int]$depth) {
  $c = $element.Current
  $patterns = @()
  foreach ($pair in @(
    @("Invoke",[System.Windows.Automation.InvokePattern]::Pattern),
    @("Window",[System.Windows.Automation.WindowPattern]::Pattern),
    @("Value",[System.Windows.Automation.ValuePattern]::Pattern),
    @("SelectionItem",[System.Windows.Automation.SelectionItemPattern]::Pattern),
    @("Text",[System.Windows.Automation.TextPattern]::Pattern)
  )) {
    try { if ($element.GetCurrentPattern($pair[1])) { $patterns += $pair[0] } } catch {}
  }
  [pscustomobject]@{
    depth=$depth; name=$c.Name; controlType=$c.ControlType.ProgrammaticName
    automationId=$c.AutomationId; className=$c.ClassName; frameworkId=$c.FrameworkId
    enabled=$c.IsEnabled; offscreen=$c.IsOffscreen; keyboardFocusable=$c.IsKeyboardFocusable
    hasKeyboardFocus=$c.HasKeyboardFocus; nativeWindowHandle=$c.NativeWindowHandle
    rect=$null
    patterns=$patterns
  }
}
$queue = New-Object System.Collections.Queue
$queue.Enqueue(@($window, 0))
$nodes = New-Object System.Collections.Generic.List[object]
$relevantNodes = New-Object System.Collections.Generic.List[object]
$walker = [System.Windows.Automation.TreeWalker]::ControlViewWalker
while ($queue.Count -gt 0 -and $nodes.Count -lt 1400) {
  $entry = $queue.Dequeue(); $element = $entry[0]; $depth = [int]$entry[1]
  try {
    $description = Describe-Element $element $depth
    $nodes.Add($description)
    if ($description.name -match "(?i)v3 keyboard modal|close modal|detached theme ownership|global Popover ownership|service-hosted popover|keyboard modal|close Dialog" -or
        $description.hasKeyboardFocus -or $description.controlType -match "Dialog|Window") { $relevantNodes.Add($description) }
    if ($depth -lt 22) {
      $child = $walker.GetFirstChild($element)
      while ($child) { $queue.Enqueue(@($child, $depth + 1)); $child = $walker.GetNextSibling($child) }
    }
  } catch {}
}
[pscustomobject]@{
  processId=$browser.Id; windowTitle=$browser.MainWindowTitle; nativeWindowHandle=$hwnd
  controlViewElementCount=$nodes.Count; truncated=($queue.Count -gt 0)
  elements=$nodes.ToArray(); relevant=$relevantNodes.ToArray()
} | ConvertTo-Json -Depth 12 -Compress
