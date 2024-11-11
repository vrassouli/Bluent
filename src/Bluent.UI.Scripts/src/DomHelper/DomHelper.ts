export class DomHelper {
    constructor() {
    }

    public invokeClickEvent(sourceSelector: string) {
        var source = <HTMLElement>document.querySelector(sourceSelector);

        if (source) {
            source.click();
        }
    }

    public async downloadFileFromStream(fileName: string, contentStreamReference: any) {
        const arrayBuffer = await contentStreamReference.arrayBuffer();
        const blob = new Blob([arrayBuffer]);
        const url = URL.createObjectURL(blob);
        const anchorElement = document.createElement('a');

        anchorElement.href = url;
        anchorElement.download = fileName ?? '';
        anchorElement.click();
        anchorElement.remove();

        URL.revokeObjectURL(url);
    }

    public requestFullscreen(selector: string) {
        var el = document.querySelector(selector);
        if (el)
            el.requestFullscreen();
    }

    public exitFullscreen() {
        document.exitFullscreen();
    }

    public eval(script: string) {
        eval(script);
    }

    public static create(): DomHelper {
        return new DomHelper();
    }
}
