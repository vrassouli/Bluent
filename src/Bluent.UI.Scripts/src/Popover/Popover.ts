import { flip, shift, offset, arrow, computePosition, autoUpdate } from '@floating-ui/dom';
import { PopoverSettings } from './PopoverSettings';
export class Popover {
    private _dotNetRef: any;
    // Geometry resources belong to each surface, never to the singleton
    // Popover JS object hosting potentially many independent overlays.
    private readonly _triggerResizeObservers = new Map<string, ResizeObserver>();
    private readonly _surfaceResizeObservers = new Map<string, ResizeObserver>();
    private readonly _surfaceMutationObservers = new Map<string, MutationObserver>();
    private readonly _autoUpdates = new Map<string, () => void>();
    // Non-modal popovers use Escape to dismiss only the most recently opened
    // surface. Only Escape returns focus to its trigger; an outside click does not.
    private readonly _openSurfaces: PopoverSettings[] = [];
    private readonly _triggerHandlers = new Map<string, Array<{ target: Element; event: string; listener: EventListener }>>();
    private readonly _documentClickHandlers = new Map<string, EventListener>();
    private _disposed = false;
    private readonly _onDocumentKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== 'Escape' || event.defaultPrevented)
            return;

        const current = this._openSurfaces[this._openSurfaces.length - 1];
        if (!current)
            return;

        const surface = this.getSurface(current);
        if (!surface?.classList.contains('show'))
            return;

        event.preventDefault();
        event.stopPropagation();
        this.hideSurface(current);
        (this.getTrigger(current) as HTMLElement | null)?.focus();
    };

    constructor(dotNetRef: any) {
        this._dotNetRef = dotNetRef;
    }

    setPopover(settings: PopoverSettings) {
        if (this._disposed)
            return;
        // Rebinding must not accumulate handlers on the same trigger across
        // Blazor redraws or reuse of an existing ID.
        this.unbindTrigger(settings.triggerId);
        const trigger = this.getTrigger(settings);
        const handlers: Array<{ target: Element; event: string; listener: EventListener }> = [];
        if (trigger) {
            if (settings.triggerEvents) {
                settings.triggerEvents.forEach((triggerEvent) => {
                    const listener: EventListener = () => {
                        const surface = <HTMLElement>this.getSurface(settings);
                        if (surface) {
                            void this.showSurface(settings);
                        }
                        else {
                            void this.renderSurface(settings);
                        }
                    };
                    trigger.addEventListener(triggerEvent, listener);
                    handlers.push({ target: trigger, event: triggerEvent, listener });
                });
            }

            if (settings.hideEvents) {
                settings.hideEvents.forEach((hideEvent) => {
                    const listener: EventListener = () => this.hideSurface(settings);
                    trigger.addEventListener(hideEvent, listener);
                    handlers.push({ target: trigger, event: hideEvent, listener });
                });
            }
        }
        this._triggerHandlers.set(settings.triggerId, handlers);
    }

    private unbindTrigger(triggerId: string): void {
        const handlers = this._triggerHandlers.get(triggerId) || [];
        for (const { target, event, listener } of handlers)
            target.removeEventListener(event, listener);
        this._triggerHandlers.delete(triggerId);
    }

    private installOutsideClick(settings: PopoverSettings): void {
        this.unbindOutsideClick(settings.triggerId);
        const listener: EventListener = (event: Event) =>
            this.onDocumentClicked(settings, event as PointerEvent);
        this._documentClickHandlers.set(settings.triggerId, listener);
        document.addEventListener('click', listener, { once: true });
    }

    private unbindOutsideClick(triggerId: string): void {
        const listener = this._documentClickHandlers.get(triggerId);
        if (listener)
            document.removeEventListener('click', listener);
        this._documentClickHandlers.delete(triggerId);
    }

    public dispose(): void {
        if (this._disposed)
            return;
        this._disposed = true;
        for (const id of Array.from(this._triggerHandlers.keys()))
            this.unbindTrigger(id);
        for (const id of Array.from(this._documentClickHandlers.keys()))
            this.unbindOutsideClick(id);
        document.removeEventListener('keydown', this._onDocumentKeyDown);
        this._openSurfaces.length = 0;
        // The library intentionally compiles TypeScript to ES5, so avoid
        // spreading Map iterators (which requires downlevelIteration).
        const geometryIds = new Set<string>();
        this._triggerResizeObservers.forEach((_value, id) => geometryIds.add(id));
        this._surfaceResizeObservers.forEach((_value, id) => geometryIds.add(id));
        this._surfaceMutationObservers.forEach((_value, id) => geometryIds.add(id));
        this._autoUpdates.forEach((_value, id) => geometryIds.add(id));
        geometryIds.forEach(id => this.cleanupGeometry(id, true));
    }

    public async showSurface(settings: PopoverSettings) {
        if (this._disposed)
            return;
        let surface = <HTMLElement>this.getSurface(settings);

        if (!surface) {
            await this.renderSurface(settings);
            surface = <HTMLElement>this.getSurface(settings);
        }

        if (settings.sameWidth) {
            const trigger = this.getTrigger(settings);

            if (trigger && !this._triggerResizeObservers.has(settings.triggerId)) {
                const observer = new ResizeObserver(() => this.setSurfaceWidth(trigger, surface));
                observer.observe(trigger);
                this._triggerResizeObservers.set(settings.triggerId, observer);
            }
            this.setSurfaceWidth(trigger, surface);
        }
        surface.classList.remove('hidden');

        this.updatePosition(settings);

        if (!surface.classList.contains('show'))
            surface.classList.add('show');
        this.installOutsideClick(settings);

        const alreadyOpen = this._openSurfaces.findIndex(x => x.triggerId === settings.triggerId);
        if (alreadyOpen >= 0)
            this._openSurfaces.splice(alreadyOpen, 1);
        if (this._openSurfaces.length === 0)
            document.addEventListener('keydown', this._onDocumentKeyDown);
        this._openSurfaces.push(settings);

        // Reopening replaces ONLY this trigger's updater, never the updater
        // for another concurrently visible Popover.
        const trigger = this.getTrigger(settings) as HTMLElement;
        if (trigger && surface) {
            this._autoUpdates.get(settings.triggerId)?.();
            this._autoUpdates.set(settings.triggerId,
                autoUpdate(trigger, surface, () => this.updatePosition(settings)));
        }
    }

    private updatePosition(settings: PopoverSettings) {
        const surface = <HTMLElement>this.getSurface(settings);
        const trigger = this.getTrigger(settings);
        const arrowElement = this.getArrow(settings);

        if (!surface || !trigger)
            return;

        computePosition(trigger, surface, {
            placement: settings.placement,
            middleware: [
                flip(),
                shift({ padding: settings.padding }),
                offset(settings.offset),
                arrow({ element: arrowElement }),],
        }).then(({ x, y, placement, middlewareData }) => {
            Object.assign(surface.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
            // Accessing the data
            const { x: arrowX, y: arrowY } = middlewareData.arrow;
            const staticSide = {
                top: 'bottom',
                right: 'left',
                bottom: 'top',
                left: 'right',
            }[placement.split('-')[0]];

            if (arrowElement) {
                Object.assign((<HTMLElement>arrowElement).style, {
                    left: arrowX != null ? `${arrowX}px` : '',
                    top: arrowY != null ? `${arrowY}px` : '',
                    right: '',
                    bottom: '',
                    [staticSide]: '-4px',
                });
            }
        });
    }

    private async renderSurface(settings: PopoverSettings) {
        await this._dotNetRef.invokeMethodAsync('RenderSurface', settings);

        const surface = <HTMLElement>this.getSurface(settings);
        if (surface) {
            // Dynamic Blazor Surface removal must only clean its own tracked
            // ResizeObservers/MutationObservers, not sibling Popovers.
            this.cleanupSurfaceObservers(settings.triggerId);
            const resize = new ResizeObserver(() => this.updatePosition(settings));
            resize.observe(surface);
            this._surfaceResizeObservers.set(settings.triggerId, resize);

            if (surface.parentElement) {
                const mutation = new MutationObserver(mutations => {
                    if (mutations.some(entry =>
                        Array.from(entry.removedNodes).includes(surface)))
                        this.cleanupGeometry(settings.triggerId, true);
                });
                mutation.observe(surface.parentElement, { childList: true });
                this._surfaceMutationObservers.set(settings.triggerId, mutation);
            }
        }
    }

    private onDocumentClicked(settings: PopoverSettings, args: PointerEvent) {
        this._documentClickHandlers.delete(settings.triggerId);
        if (this._disposed)
            return;
        var trigger = this.getTrigger(settings);
        var surface = this.getSurface(settings);

        if (trigger && surface) {
            if (trigger.contains(<Node>args.target) || surface.contains(<Node>args.target) || args.defaultPrevented) {
                this.installOutsideClick(settings);
            }
            else {
                this.hideSurface(settings);
            }
        }
    }

    // private onDocumentScroll(settings: PopoverSettings) {
    //     this.updatePosition(settings);
    // }

    private hideSurface(settings: PopoverSettings) {
        const index = this._openSurfaces.findIndex(x => x.triggerId === settings.triggerId);
        if (index >= 0)
            this._openSurfaces.splice(index, 1);
        if (this._openSurfaces.length === 0)
            document.removeEventListener('keydown', this._onDocumentKeyDown);
        this.unbindOutsideClick(settings.triggerId);

        const surface = <HTMLElement>this.getSurface(settings);
        if (surface) {
            surface.addEventListener("transitionend", (event) => {
                this.doHideSurface(settings, surface);
            }, { once: true });

            if (surface.classList.contains('show'))
                surface.classList.remove('show');
            else
                this.doHideSurface(settings, surface);
        }
        else {
            this.doHideSurface(settings, surface);
        }
    }

    private doHideSurface(settings: PopoverSettings, surface: HTMLElement) {
        surface?.classList.add('hidden');
        this._dotNetRef.invokeMethodAsync('HideSurface', settings);

        // Leave surface observation until removal: hidden KeepSurface
        // instances retain their DOM, and unrelated surfaces stay active.
        this.cleanupGeometry(settings.triggerId, false);
    }

    private cleanupSurfaceObservers(triggerId: string): void {
        this._surfaceResizeObservers.get(triggerId)?.disconnect();
        this._surfaceMutationObservers.get(triggerId)?.disconnect();
        this._surfaceResizeObservers.delete(triggerId);
        this._surfaceMutationObservers.delete(triggerId);
    }

    private cleanupGeometry(triggerId: string, removeSurfaceObservers: boolean): void {
        this._triggerResizeObservers.get(triggerId)?.disconnect();
        this._triggerResizeObservers.delete(triggerId);
        this._autoUpdates.get(triggerId)?.();
        this._autoUpdates.delete(triggerId);
        if (removeSurfaceObservers)
            this.cleanupSurfaceObservers(triggerId);
    }

    private getTrigger(settings: PopoverSettings) {
        return document.querySelector(`#${settings.triggerId}`);
    }

    private getSurface(settings: PopoverSettings) {
        return document.querySelector(this.getSurafeSelector(settings));
    }

    private getArrow(settings: PopoverSettings) {
        return document.querySelector(`${this.getSurafeSelector(settings)}>.arrow`);
    }

    private getSurafeSelector(settings: PopoverSettings): string {
        return `#${settings.triggerId}_surface`;
    }

    private setSurfaceWidth(trigger: Element, surface: HTMLElement) {
        if (trigger && surface) {
            surface.style.width = `${trigger.getBoundingClientRect().width}px`;
        }
    }

    static create(dotNetRef: any): Popover {
        return new Popover(dotNetRef);
    }
}
