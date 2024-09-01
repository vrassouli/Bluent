namespace Bluent.UI.Interops.Abstractions;

internal interface IAudioCaptureEventHandler
{
    void OnAudioCaptured(byte[] buffer);
}
