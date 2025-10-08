export class OtpField {
    private host: HTMLElement | null = null;
    private hiddenInput: HTMLInputElement | null = null;
    private cells: HTMLInputElement[] = [];
    private length: number = 4;
    private initialized = false;

    /** Keep bound handlers so we could support a future dispose() */
    private onInputHandler = (e: Event) => this.onInput(e);
    private onKeyDownHandler = (e: KeyboardEvent) => this.onKeyDown(e);
    private onPasteHandler = (e: ClipboardEvent) => this.onPaste(e);
    private onFocusHandler = (e: FocusEvent) => this.onFocus(e);

    constructor() { }

    /**
     * Initialize OTP field behavior on the element with the given id or the element itself.
     * Subsequent calls are ignored (idempotent) unless forceReinit = true.
     */
    public init(idOrElement: string | HTMLElement, forceReinit = false): void {
        const host = typeof idOrElement === 'string' ? document.getElementById(idOrElement) : idOrElement;
        if (!host) return;

        // Prevent double init (mirrors __otpInited flag logic from inline script)
        if ((host as any).__otpInited && !forceReinit) return;
        (host as any).__otpInited = true;

        this.host = host;
        this.length = Math.max(1, parseInt(host.getAttribute('data-otp-length') || '4', 10));

        const hiddenId = host.getAttribute('data-otp-hidden');
        this.hiddenInput = hiddenId ? document.getElementById(hiddenId) as HTMLInputElement | null : null;

        this.cells = Array.from(host.querySelectorAll<HTMLInputElement>('.otp-cell-input'));
        this.cells.forEach((inp, idx) => inp.setAttribute('data-idx', String(idx)));

        // Attach listeners
        this.cells.forEach(inp => {
            inp.addEventListener('input', this.onInputHandler);
            inp.addEventListener('keydown', this.onKeyDownHandler);
            inp.addEventListener('paste', this.onPasteHandler);
            inp.addEventListener('focus', this.onFocusHandler);
        });

        this.setHidden();
        this.initialized = true;
    }

    /** Optional teardown if needed externally */
    public dispose(): void {
        if (!this.host || !this.initialized) return;
        this.cells.forEach(inp => {
            inp.removeEventListener('input', this.onInputHandler);
            inp.removeEventListener('keydown', this.onKeyDownHandler);
            inp.removeEventListener('paste', this.onPasteHandler);
            inp.removeEventListener('focus', this.onFocusHandler);
        });
        this.initialized = false;
    }

    private onlyDigits(s: string): string { return (s || '').replace(/\D+/g, ''); }

    private focusIdx(i: number): void { if (i >= 0 && i < this.cells.length) this.cells[i].focus(); }

    private joinValue(): string { return this.cells.map(i => i.value).join(''); }

    private setHidden(): void {
        if (!this.hiddenInput) return;
        this.hiddenInput.value = this.joinValue();
        const host = this.host;
        if (!host) return;
        const raw = host.getAttribute('data-otp-blazor-event') || 'onchange';
        const evtName = raw.startsWith('on') ? raw.slice(2) : raw; // oninput -> input
        this.hiddenInput.dispatchEvent(new Event(evtName, { bubbles: true }));
    }

    /** Replicates distributeFrom logic from script */
    private distributeFrom(startIdx: number, s: string): void {
        let p = 0;
        for (let i = startIdx; i < this.cells.length && p < s.length; i++, p++) this.cells[i].value = s[p];
        for (let i = 0; i < startIdx && p < s.length; i++, p++) this.cells[i].value = s[p];
        const firstEmpty = this.cells.findIndex(inp => inp.value === '');
        this.focusIdx(firstEmpty === -1 ? this.cells.length - 1 : firstEmpty);
        this.setHidden();
    }

    private onInput(e: Event): void {
        const t = e.target;
        if (!(t instanceof HTMLInputElement)) return;
        const idx = parseInt(t.getAttribute('data-idx') || '0', 10);
        let v = this.onlyDigits(t.value);
        if (v.length === 0) {
            t.value = '';
            this.setHidden();
            return;
        }
        if (v.length > 1) {
            this.distributeFrom(idx, v.slice(0, this.length));
        } else {
            t.value = v;
            if (v && idx < this.cells.length - 1) this.focusIdx(idx + 1);
            this.setHidden();
        }
    }

    private onKeyDown(e: KeyboardEvent): void {
        const t = e.target;
        if (!(t instanceof HTMLInputElement)) return;
        const idx = parseInt(t.getAttribute('data-idx') || '0', 10);

        if ((e.metaKey || e.ctrlKey) && ['v', 'V', 'a', 'c', 'x'].includes(e.key)) return;

        switch (e.key) {
            case 'Backspace':
                if (t.value === '') {
                    if (idx > 0) {
                        const prev = this.cells[idx - 1];
                        prev.value = '';
                        prev.focus();
                        e.preventDefault();
                    }
                } else {
                    t.value = '';
                }
                this.setHidden();
                break;
            case 'Delete':
                t.value = '';
                this.setHidden();
                break;
            case 'ArrowLeft':
                if (idx > 0) { this.focusIdx(idx - 1); e.preventDefault(); }
                break;
            case 'ArrowRight':
                if (idx < this.cells.length - 1) { this.focusIdx(idx + 1); e.preventDefault(); }
                break;
            default:
                if (e.key.length === 1 && !/\d/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
                    e.preventDefault();
                }
                break;
        }
    }

    private onPaste(e: ClipboardEvent): void {
        const t = e.target;
        if (!(t instanceof HTMLInputElement)) return;
        const idx = parseInt(t.getAttribute('data-idx') || '0', 10);
        const cd = e.clipboardData || (window as any).clipboardData;
        const text = cd ? cd.getData('text') : '';
        const digits = this.onlyDigits(text);
        if (!digits) return;
        e.preventDefault();
        this.distributeFrom(idx, digits.slice(0, this.length));
        this.setHidden();
    }

    private onFocus(e: FocusEvent): void {
        const t = e.target;
        if (t instanceof HTMLInputElement) t.select();
    }

    public static create(): OtpField { return new OtpField(); }
}