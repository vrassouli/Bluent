import { MediaCapture } from "./MediaCapture";

export class AudioCapture {
    private _dotNetRef: any;
    private _recorder: MediaCapture;
    private _id: string;
    private _format: string;

    constructor(dotNetRef: any, id: string, format: string) {
        this._dotNetRef = dotNetRef;
        this._id = id;
        this._format = format;

        this._recorder = new MediaCapture(format);
        this._recorder.onStopped = this.onStopped.bind(this);
    }

    public isSupported(): boolean {
        return this._recorder.isSupported();
    }

    public async record(): Promise<boolean> {
        this.emptyPlayList();
        return (await this._recorder.start());
    }

    public stop() {
        if (this._recorder.state == "recording") {
            this._recorder.stop();
        }
    }

    private async onStopped(data: Blob) {
        const buffer = new Uint8Array(await data.arrayBuffer());
        await this._dotNetRef.invokeMethodAsync('OnAudioCaptured', buffer);

        this.generateAudioElement(buffer);
    }

    private generateAudioElement(buffer: Uint8Array) {
        let playList = this.getPlayList();

        if (playList) {
            this.emptyPlayList();

            const audio = document.createElement("audio");
            audio.setAttribute("controls", "");
            playList.appendChild(audio);

            let data = new Blob([buffer.buffer], { type: this._format })
            const audioURL = window.URL.createObjectURL(data);
            audio.src = audioURL;
        }
    }

    private emptyPlayList() {
        let playList = this.getPlayList();
        if (playList)
            playList.replaceChildren();
    }

    private getPlayList() {
        let playList = document.querySelector(`#${this._id}>.play-list`);

        return playList;
    }

    static create(dotNetRef: any, id: string, format: string): AudioCapture {
        return new AudioCapture(dotNetRef, id, format);
    }
}

