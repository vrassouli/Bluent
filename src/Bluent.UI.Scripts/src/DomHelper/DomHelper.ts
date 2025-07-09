declare global {
    interface Navigator {
        standalone?: boolean;
    }
}

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export class DomHelper {
    private deferredPrompt: BeforeInstallPromptEvent | null = null;

    constructor() {
        window.addEventListener('beforeinstallprompt', (e: Event) => {
            // Prevent automatic prompt
            e.preventDefault();
            this.deferredPrompt = e as BeforeInstallPromptEvent;
        });
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

    public async requestFullscreen(selector: string) {
        var el = document.querySelector(selector);
        await el.requestFullscreen();
    }

    public exitFullscreen() {
        document.exitFullscreen();
    }

    public eval(script: string): any {
        return eval(script);
    }

    public matchMedia(query: string): boolean {
        return window.matchMedia(query).matches;
    }

    public isPwaInstalled(): boolean {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    }

    public async installPwa(): Promise<boolean> {
        if (!this.deferredPrompt) {
            //console.warn('Install prompt not available yet');
            return false;
        }

        this.deferredPrompt.prompt();

        const result = await this.deferredPrompt.userChoice;
        //console.log(`User response: ${result.outcome}`);

        this.deferredPrompt = null; // Only usable once
        return result.outcome === 'accepted';
    }

    public static create(): DomHelper {
        return new DomHelper();
    }
}
