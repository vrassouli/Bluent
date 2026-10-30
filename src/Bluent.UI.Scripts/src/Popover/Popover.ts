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
        trigger: Element; expanded: boolean; controls: boolean; persistentControls: boolean;
    }>();

    // #418's opt-in flag is not yet declared in the #420 branch's public
    // PopoverSettings type. This private, read-only compatibility guard
    // preserves the current #420 contract until the foundation lands.
    private isOptInDisclosure(settings: PopoverSettings): boolean {
        return (settings as PopoverSettings & { accessibleTriggerState?: boolean }).accessibleTriggerState === true;
    }
    private bindDisclosure(settings: PopoverSettings, trigger: Element): void {
        // Bluent Button and nested MenuItem triggers own their generated menu ARIA,
        // including keyboard-opened submenus whose pointer trigger is hover-only.
        const componentOwnsDisclosureState = trigger.getAttribute('data-bui-managed-menu-trigger') === 'true';
        if (!this.isOptInDisclosure(settings) && !settings.triggerEvents?.includes('click') && !componentOwnsDisclosureState)
            return;
        const expanded = componentOwnsDisclosureState || !trigger.hasAttribute('aria-expanded');
        const controls = componentOwnsDisclosureState || !trigger.hasAttribute('aria-controls');
        if (expanded)
            trigger.setAttribute('aria-expanded', 'false');
        // Explicit #418 opt-in with mounted KeepSurface retains its IDREF
        // when collapsed. Ordinary #420 click disclosures expose controls
        // only while open, so no stale reference is left in the DOM.
        const persistentControls = this.isOptInDisclosure(settings) || componentOwnsDisclosureState;
        if (controls && persistentControls)
            trigger.setAttribute('aria-controls', settings.triggerId + '_surface');
        this._managedTriggerAria.set(settings.triggerId, { trigger, expanded, controls, persistentControls });
    }
    private setDisclosureExpanded(settings: PopoverSettings, visible: boolean): void {
        const entry = this._managedTriggerAria.get(settings.triggerId);
        if (!entry || this.getTrigger(settings) !== entry.trigger)
            return;
        if (entry.expanded)
            entry.trigger.setAttribute('aria-expanded', visible ? 'true' : 'false');
        if (entry.controls) {
            if (visible || entry.persistentControls)
                entry.trigger.setAttribute('aria-controls', settings.triggerId + '_surface');
            else if (entry.trigger.getAttribute('aria-controls') === settings.triggerId + '_surface')
                entry.trigger.removeAttribute('aria-controls');
        }
    }

    private readonly _menuTypeahead = new Map<HTMLElement, { value: string; timer: number }>();
    private readonly _documentClickHandlers = new Map<string, EventListener>();
    // CSS transitionend can be absent (0-duration/reduced motion) or arrive
    // after a new Show. Hide completions are owned/cancellable per surface.
    private readonly _pendingHides = new Map<string, {
        surface: HTMLElement; listener: EventListener; timer: number;
    }>();
    private _disposed = false;
    private readonly _onDocumentKeyDown = (event: KeyboardEvent): void => {
        if (event.defaultPrevented || event.isComposing || event.repeat)
            return;
        if (this.handleMenuKeyDown(event))
            return;
        if (event.key !== 'Escape')
            return;

        const current = this._openSurfaces[this._openSurfaces.length - 1];
        if (!current)
            return;

        const surface = this.getSurface(current);
        if (!surface?.classList.contains('show'))
            return;

        // When an opt-in Popover is hosted inside an owning Modal,
        // unrelated Escape events must reach that Modal. A focused
        // child trigger or its active surface still dismisses first.
        if (this.isOptInDisclosure(current)) {
            const trigger = this.getTrigger(current);
            const target = event.target as Node | null;
            if (!target || !(trigger?.contains(target) || surface.contains(target)))
                return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.hideSurface(current, true);
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
                    const listener: EventListener = (event: Event) => {
                        // Button-managed menus are opened by the awaited Blazor callback.
                        // Handling the same click here would race that callback and reopen
                        // a menu after its command has already closed it.
                        if (trigger.getAttribute('aria-haspopup') === 'menu' && event.type === 'click')
                            return;
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

            const keydown: EventListener = event => this.onTriggerKeyDown(settings, event as KeyboardEvent);
            trigger.addEventListener('keydown', keydown);
            handlers.push({ target: trigger, event: 'keydown', listener: keydown });

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
        this._menuTypeahead.forEach(entry => window.clearTimeout(entry.timer));
        this._menuTypeahead.clear();
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

        // Pointer-opened Button menus move focus to their first enabled item
        // after the surface is visible; keyboard-opened menus choose first/last
        // explicitly in openMenu().
        const menuTrigger = this.getTrigger(settings) as HTMLElement | null;
        if (menuTrigger?.getAttribute('aria-haspopup') === 'menu' && document.activeElement === menuTrigger) {
            window.requestAnimationFrame(() => {
                const currentSurface = this.getSurface(settings) as HTMLElement | null;
                const menu = currentSurface?.querySelector('[role="menu"]') as HTMLElement | null;
                if (menu)
                    this.focusMenuItem(menu, false);
            });
        }

        // Reopening replaces ONLY this trigger's updater, never the updater
        // for another concurrently visible Popover.
        const trigger = this.getTrigger(settings) as HTMLElement;
        if (trigger && surface) {
            this._autoUpdates.get(settings.triggerId)?.();
            this._autoUpdates.set(settings.triggerId,
                autoUpdate(trigger, surface, () => this.updatePosition(settings)));
        }
    }

    private handleMenuKeyDown(event: KeyboardEvent): boolean {
        const activeElement = document.activeElement as HTMLElement | null;
        if (!activeElement)
            return false;

        const menuSettings = this._openSurfaces.slice().reverse().find(settings => {
            const surface = this.getSurface(settings) as HTMLElement | null;
            const menu = surface?.querySelector('[role="menu"]');
            const trigger = this.getTrigger(settings) as HTMLElement | null;
            return !!menu && (menu.contains(activeElement) || (!!trigger &&
                (trigger === activeElement || trigger.contains(activeElement))));
        });
        if (!menuSettings)
            return false;

        const surface = this.getSurface(menuSettings) as HTMLElement | null;
        const menu = surface?.querySelector('[role="menu"]') as HTMLElement | null;
        const trigger = this.getTrigger(menuSettings) as HTMLElement | null;
        const activeItem = activeElement.closest('[role="menuitem"]') as HTMLElement | null;

        if (event.key === 'Tab') {
            this.hideSurface(menuSettings, false);
            return true;
        }

        if (trigger?.getAttribute('role') === 'menuitem' && menu) {
            const rtl = window.getComputedStyle(trigger).direction === 'rtl';
            const closeKey = rtl ? 'ArrowRight' : 'ArrowLeft';
            if (event.key === closeKey) {
                event.preventDefault();
                this.hideSurface(menuSettings, true);
                return true;
            }
        }

        if (menu && activeItem && menu.contains(activeItem)) {
            const items = this.getEnabledMenuItems(menu);
            const index = items.indexOf(activeItem);

            if (event.key === 'ArrowDown' || event.key === 'ArrowUp' ||
                event.key === 'Home' || event.key === 'End') {
                if (items.length === 0)
                    return true;
                event.preventDefault();
                let next = index;
                if (event.key === 'Home')
                    next = 0;
                else if (event.key === 'End')
                    next = items.length - 1;
                else if (event.key === 'ArrowDown')
                    next = index < 0 ? 0 : (index + 1) % items.length;
                else
                    next = index < 0 ? items.length - 1 : (index - 1 + items.length) % items.length;
                items[next].focus({ preventScroll: true });
                return true;
            }

            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                // A submenu's own Blazor callback opens its nested Popover.
                if (activeItem.getAttribute('aria-haspopup') === 'menu' ||
                    activeItem.getAttribute('aria-disabled') === 'true')
                    return true;
                activeItem.click();
                this.hideSurface(menuSettings, true);
                return true;
            }

            if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
                const character = event.key.toLocaleLowerCase();
                const wordCharacter = /^[a-z0-9]$/i.test(character) ||
                    (character.length === 1 && character.charCodeAt(0) > 127 && !/\s/.test(character));
                if (wordCharacter) {
                    const previous = this._menuTypeahead.get(menu);
                    let value = (previous?.value ?? '') + character;
                    if (value.length > 1 && Array.from(value).every(ch => ch === value[0]))
                        value = character;
                    if (previous)
                        window.clearTimeout(previous.timer);
                    const timer = window.setTimeout(() => this._menuTypeahead.delete(menu), 700);
                    this._menuTypeahead.set(menu, { value, timer });
                    const rotated = items.slice(Math.max(0, index) + 1).concat(items.slice(0, Math.max(0, index) + 1));
                    const match = rotated.find(item => (item.textContent ?? '').trim().toLocaleLowerCase().startsWith(value));
                    if (match) {
                        event.preventDefault();
                        match.focus({ preventScroll: true });
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private onTriggerKeyDown(settings: PopoverSettings, event: KeyboardEvent): void {
        const trigger = this.getTrigger(settings) as HTMLElement | null;
        if (!trigger || trigger.getAttribute('aria-haspopup') !== 'menu')
            return;
        const submenu = trigger.getAttribute('role') === 'menuitem';
        if (submenu) {
            const rtl = window.getComputedStyle(trigger).direction === 'rtl';
            const openKey = rtl ? 'ArrowLeft' : 'ArrowRight';
            if (event.key === openKey) {
                event.preventDefault();
                void this.openMenu(settings, false);
            }
            return;
        }
        const surface = this.getSurface(settings) as HTMLElement | null;
        if (!surface?.querySelector('[role="menu"]'))
            return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            void this.openMenu(settings, event.key === 'ArrowUp');
        }
    }

    private async openMenu(settings: PopoverSettings, last: boolean): Promise<void> {
        let surface = this.getSurface(settings) as HTMLElement | null;
        if (!surface) {
            await this.renderSurface(settings);
            surface = await this.waitForSurface(settings);
        }
        if (!surface)
            return;
        if (!surface.classList.contains('show'))
            await this.showSurface(settings);
        await new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()));
        surface = this.getSurface(settings) as HTMLElement | null;
        const menu = surface?.querySelector('[role="menu"]') as HTMLElement | null;
        if (menu)
            this.focusMenuItem(menu, last);
    }

    private async waitForSurface(settings: PopoverSettings): Promise<HTMLElement | null> {
        for (let attempt = 0; attempt < 12; attempt++) {
            const surface = this.getSurface(settings) as HTMLElement | null;
            if (surface)
                return surface;
            await new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()));
        }
        return this.getSurface(settings) as HTMLElement | null;
    }

    private getEnabledMenuItems(menu: HTMLElement): HTMLElement[] {
        return Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(item =>
            item.closest('[role="menu"]') === menu &&
            item.getAttribute('aria-disabled') !== 'true' &&
            !item.hidden && window.getComputedStyle(item).display !== 'none');
    }

    private focusMenuItem(menu: HTMLElement, last: boolean): void {
        const items = this.getEnabledMenuItems(menu);
        (last ? items[items.length - 1] : items[0])?.focus({ preventScroll: true });
    }

    private restoreFocus(settings: PopoverSettings): void {
        const trigger = this.getTrigger(settings) as HTMLElement | null;
        if (!trigger || !trigger.isConnected || (trigger as HTMLButtonElement).disabled === true)
            return;
        trigger.focus({ preventScroll: true });
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

    public hideSurface(settings: PopoverSettings, restoreFocus = false) {
        const index = this._openSurfaces.findIndex(x => x.triggerId === settings.triggerId);
        if (index >= 0)
            this._openSurfaces.splice(index, 1);
        if (this._openSurfaces.length === 0)
            document.removeEventListener('keydown', this._onDocumentKeyDown);
        this.unbindOutsideClick(settings.triggerId);
        this.setDisclosureExpanded(settings, false);
        if (restoreFocus)
            this.restoreFocus(settings);

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
