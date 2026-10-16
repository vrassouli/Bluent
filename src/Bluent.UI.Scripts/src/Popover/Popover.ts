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
    // Only generic click-trigger disclosures own ARIA state. Hover/focus
    // Tooltip triggers and author-supplied ARIA attributes remain untouched.
    private readonly _managedTriggerAria = new Map<string, {
        trigger: Element; expanded: boolean; controls: boolean;
    }>();
    private bindDisclosure(settings: PopoverSettings, trigger: Element): void {
        if (!settings.triggerEvents?.includes('click'))
            return;
        const expanded = !trigger.hasAttribute('aria-expanded');
        const controls = !trigger.hasAttribute('aria-controls');
        if (expanded)
            trigger.setAttribute('aria-expanded', 'false');
        this._managedTriggerAria.set(settings.triggerId, { trigger, expanded, controls });
    }
    private setDisclosureExpanded(settings: PopoverSettings, visible: boolean): void {
        const entry = this._managedTriggerAria.get(settings.triggerId);
        if (!entry || this.getTrigger(settings) !== entry.trigger)
            return;
        if (entry.expanded)
            entry.trigger.setAttribute('aria-expanded', visible ? 'true' : 'false');
        if (entry.controls) {
            if (visible)
                entry.trigger.setAttribute('aria-controls', settings.triggerId + '_surface');
            else if (entry.trigger.getAttribute('aria-controls') === settings.triggerId + '_surface')
                entry.trigger.removeAttribute('aria-controls');
        }
    }

    private readonly _documentClickHandlers = new Map<string, EventListener>();
    // CSS transitionend can be absent (0-duration/reduced motion) or arrive
    // after a new Show. Hide completions are owned/cancellable per surface.
    private readonly _pendingHides = new Map<string, {
        surface: HTMLElement; listener: EventListener; timer: number;
    }>();
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
            this.bindDisclosure(settings, trigger);
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
        const managed = this._managedTriggerAria.get(triggerId);
        if (managed) {
            if (managed.expanded && ['true', 'false'].includes(
                managed.trigger.getAttribute('aria-expanded') || ''))
                managed.trigger.removeAttribute('aria-expanded');
            if (managed.controls &&
                managed.trigger.getAttribute('aria-controls') === triggerId + '_surface')
                managed.trigger.removeAttribute('aria-controls');
            this._managedTriggerAria.delete(triggerId);
        }
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

    // A single Blazor child Popover may be destroyed while the shared
    // container and sibling surfaces remain alive. This is NOT dispose().
    public destroyPopover(triggerId: string): void {
        if (this._disposed)
            return;
        const index = this._openSurfaces.findIndex(x => x.triggerId === triggerId);
        if (index >= 0)
            this._openSurfaces.splice(index, 1);
        if (this._openSurfaces.length === 0)
            document.removeEventListener('keydown', this._onDocumentKeyDown);
        this.cancelPendingHide(triggerId);
        this.unbindOutsideClick(triggerId);
        const surface = document.getElementById(triggerId + '_surface');
        surface?.classList.remove('show');
        surface?.classList.add('hidden');
        this.cleanupGeometry(triggerId, true);
        this.unbindTrigger(triggerId);
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
        this._pendingHides.forEach((_pending, id) => this.cancelPendingHide(id));
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
        // A previous closing animation must never hide a reopened surface.
        this.cancelPendingHide(settings.triggerId);
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
        this.setDisclosureExpanded(settings, true);

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

    private cancelPendingHide(triggerId: string): void {
        const pending = this._pendingHides.get(triggerId);
        if (!pending)
            return;
        pending.surface.removeEventListener('transitionend', pending.listener);
        window.clearTimeout(pending.timer);
        this._pendingHides.delete(triggerId);
    }

    private static transitionMilliseconds(surface: HTMLElement): number {
        // A computed CSS duration may be 0s under forced/reduced motion and
        // transitionend is not guaranteed to fire. Follow the longest track.
        const computed = window.getComputedStyle(surface);
        const times = (value: string): number[] => value.split(',').map(raw => {
            const term = raw.trim();
            const numeric = parseFloat(term) || 0;
            return term.endsWith('ms') ? numeric : numeric * 1000;
        });
        const durations = times(computed.transitionDuration);
        const delays = times(computed.transitionDelay);
        const count = Math.max(durations.length, delays.length);
        let maximum = 0;
        for (let i = 0; i < count; i++)
            maximum = Math.max(maximum,
                durations[i % durations.length] + delays[i % delays.length]);
        return maximum;
    }

    private hideSurface(settings: PopoverSettings) {
        const index = this._openSurfaces.findIndex(x => x.triggerId === settings.triggerId);
        if (index >= 0)
            this._openSurfaces.splice(index, 1);
        if (this._openSurfaces.length === 0)
            document.removeEventListener('keydown', this._onDocumentKeyDown);
        this.unbindOutsideClick(settings.triggerId);
        this.setDisclosureExpanded(settings, false);

        const surface = <HTMLElement>this.getSurface(settings);
        if (!surface) {
            this.cleanupGeometry(settings.triggerId, true);
            return;
        }
        if (!surface.classList.contains('show')) {
            if (!this._pendingHides.has(settings.triggerId))
                this.doHideSurface(settings, surface);
            return;
        }

        this.cancelPendingHide(settings.triggerId);
        const duration = Popover.transitionMilliseconds(surface);
        surface.classList.remove('show');
        if (duration <= 0) {
            this.doHideSurface(settings, surface);
            return;
        }
        const complete = () => {
            // Do not dismiss a surface which has been reopened.
            this.cancelPendingHide(settings.triggerId);
            if (!surface.classList.contains('show') && !this._disposed)
                this.doHideSurface(settings, surface);
        };
        const listener: EventListener = event => {
            if (event.target === surface &&
                (['opacity', 'transform'].includes((event as TransitionEvent).propertyName)))
                complete();
        };
        surface.addEventListener('transitionend', listener);
        // Fallback for detached DOM, interrupted transitions and browsers that
        // do not deliver transitionend. The timer is cancelled upon reopen.
        const timer = window.setTimeout(complete, Math.ceil(duration) + 80);
        this._pendingHides.set(settings.triggerId, { surface, listener, timer });
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
