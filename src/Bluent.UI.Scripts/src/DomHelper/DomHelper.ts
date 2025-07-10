declare global {
    interface Navigator {
        standalone?: boolean;
    }

    interface Window {
        deferredInstallPrompt?: BeforeInstallPromptEvent;
    }
}

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

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
        if (!window.deferredInstallPrompt) {
            //console.warn('Install prompt not available yet');
            return false;
        }

        window.deferredInstallPrompt.prompt();

        const result = await window.deferredInstallPrompt.userChoice;
        //console.log(`User response: ${result.outcome}`);

        window.deferredInstallPrompt = null; // Only usable once
        return result.outcome === 'accepted';
    }

    public canInstallPwa(): boolean {
        const ua = window.navigator.userAgent;
        const isIos = /iphone|ipad|ipod/i.test(ua);
        const isStandalone = this.isPwaInstalled();

        const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
        const isIosSafari = isIos && isSafari;

        // iOS Safari: manual install
        if (isIosSafari && !isStandalone) return true;

        // Chrome/Edge/Opera/Brave/etc. on Android/desktop: install via prompt
        const supportsBeforeInstallPrompt = 'onbeforeinstallprompt' in window;

        return supportsBeforeInstallPrompt && !isStandalone;
    }

    public getBrowserInfo(): string {
        const ua = navigator.userAgent;

        if (/CriOS/i.test(ua)) return 'Chrome iOS';
        if (/EdgiOS/i.test(ua)) return 'Edge iOS';
        if (/FxiOS/i.test(ua)) return 'Firefox iOS';
        if (/Chrome/i.test(ua)) return 'Chrome';
        if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
        if (/Firefox/i.test(ua)) return 'Firefox';
        if (/Edg/i.test(ua)) return 'Edge';
        return 'Unknown';
    }

    public isMobile(): boolean {
        return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
    }

    public getOsInfo(): string {
        const platform = navigator.platform.toLowerCase();
        const userAgent = navigator.userAgent.toLowerCase();

        if (/android/.test(userAgent)) return 'Android';
        if (/iphone|ipad|ipod/.test(userAgent)) return 'iOS';
        if (/win/.test(platform)) return 'Windows';
        if (/mac/.test(platform)) return 'macOS';
        if (/linux/.test(platform)) return 'Linux';
        if (/cros/.test(userAgent)) return 'Chrome OS';

        return 'Unknown';
    }

    public static create(): DomHelper {
        return new DomHelper();
    }
}
