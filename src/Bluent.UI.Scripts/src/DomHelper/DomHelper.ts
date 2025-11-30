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
    private _pointerMoveHandlers: Map<string, any> = new Map<string, any>();
    private _pointerUpHandlers: Map<string, any> = new Map<string, any>();
    private _pointerMoveListener: any;
    private _pointerUpListener: any;

    constructor() {
    }

    public invokeClickEvent(selectorOrElement: string | HTMLElement) {
        // if `selectorOrElement` is an element, use it directly
        if (selectorOrElement instanceof HTMLElement) {
            selectorOrElement.click();
            return;
        }

        // otherwise, treat it as a selector
        var source = <HTMLElement>document.querySelector(selectorOrElement);

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
        return (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
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

        return supportsBeforeInstallPrompt && !isStandalone && window.deferredInstallPrompt != null;
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

    public getBoundingClientRect(selector: string): DOMRect | null {
        const el = document.querySelector(selector);
        if (el) {
            return el.getBoundingClientRect();
        }
        return null;
    }

    public registerPointerMoveHandler(id: string, pointerMoveHandler: any) {
        this._pointerMoveHandlers.set(id, pointerMoveHandler);

        this.ensurePointerMoveListener();
    }

    public unregisterPointerMoveHandler(id: string) {
        if (this._pointerMoveHandlers.delete(id))
            this.ensurePointerMoveListener();
    }

    private ensurePointerMoveListener() {
        if (this._pointerMoveHandlers.size > 0 && !this._pointerMoveListener) {
            this._pointerMoveListener = this.triggerPointerMoveEvent.bind(this);
            document.addEventListener('pointermove', this._pointerMoveListener);
        }
        else if (this._pointerMoveHandlers.size == 0 && this._pointerMoveListener) {
            document.removeEventListener('pointermove', this._pointerMoveListener);
            this._pointerMoveListener = null;
        }
    }

    public triggerPointerMoveEvent(event: PointerEvent) {
        this._pointerMoveHandlers.forEach(async handler => {
            await handler.invokeMethodAsync('OnPointerMove', this.mapPointerEvent(event));
        });
    }

    public registerPointerUpHandler(id: string, pointerUpHandler: any) {
        this._pointerUpHandlers.set(id, pointerUpHandler);

        this.ensurePointerUpListener();
    }

    public unregisterPointerUpHandler(id: string) {
        if (this._pointerUpHandlers.delete(id))
            this.ensurePointerUpListener();
    }


    private ensurePointerUpListener() {
        if (this._pointerUpHandlers.size > 0 && !this._pointerUpListener) {
            this._pointerUpListener = this.triggerPointerUpEvent.bind(this);
            document.addEventListener('pointerup', this._pointerUpListener);
        }
        else if (this._pointerUpHandlers.size == 0 && this._pointerUpListener) {
            document.removeEventListener('pointerup', this._pointerUpListener);
            this._pointerUpListener = null;
        }
    }

    public triggerPointerUpEvent(event: PointerEvent) {
        this._pointerUpHandlers.forEach(async handler => {
            await handler.invokeMethodAsync('OnPointerUp', this.mapPointerEvent(event));
        });
    }

    mapPointerEvent(event: PointerEvent): any {
        return {
            PointerId: event.pointerId,
            Width: event.width,
            Height: event.height,
            Pressure: event.pressure,
            TiltX: event.tiltX,
            TiltY: event.tiltY,
            PointerType: event.pointerType,
            IsPrimary: event.isPrimary,
            Detail: event.detail,
            ScreenX: event.screenX,
            ScreenY: event.screenY,
            ClientX: event.clientX,
            ClientY: event.clientY,
            OffsetX: event.offsetX,
            OffsetY: event.offsetY,
            PageX: event.pageX,
            PageY: event.pageY,
            MovementX: event.movementX,
            MovementY: event.movementY,
            Button: event.button,
            Buttons: event.buttons,
            AltKey: event.altKey,
            CtrlKey: event.ctrlKey,
            MetaKey: event.metaKey,
            ShiftKey: event.shiftKey,
            Type: event.type
        };
    }

    public static create(): DomHelper {
        return new DomHelper();
    }
}
