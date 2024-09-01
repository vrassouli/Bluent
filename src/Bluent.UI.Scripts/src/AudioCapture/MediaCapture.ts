export class MediaCapture {
    private _mediaRecorder: MediaRecorder;
    private _stream: MediaStream;
    private _chunks: Blob[] = [];
    private _state: RecordingState = "inactive";
    private _format: string;

    constructor(format: string) {
        this._format = format;
    }

    public get state(): RecordingState {
        return this._state;
    }

    public get data(): Blob {
        return new Blob(this._chunks, { type: this._format });
    }

    public isSupported(): boolean {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
            return true;

        return false;
    }

    public async start(): Promise<boolean> {
        try {
            this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this._mediaRecorder = new MediaRecorder(this._stream);

            this._mediaRecorder.ondataavailable = this.onDataAvailable.bind(this);
            this._mediaRecorder.onstart = this.onStart.bind(this);
            this._mediaRecorder.onstop = this.onStop.bind(this);

            this._mediaRecorder.start();
            return true;
        }
        catch {
            return false;
        }
    }

    public stop() {
        this._mediaRecorder.stop();
        this._stream.getTracks().forEach(pTrack => pTrack.stop());
    }

    public onStopped?: (data: Blob) => void

    private onStart() {
        this._chunks = [];
        this._state = this._mediaRecorder.state;
    }

    private onStop() {
        this._state = this._mediaRecorder.state;

        this.onStopped(this.data);
    }

    private onDataAvailable(e: BlobEvent) {
        this._chunks.push(e.data);
    }

}