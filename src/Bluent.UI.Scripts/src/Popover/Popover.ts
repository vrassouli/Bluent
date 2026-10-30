import { flip, shift, offset, arrow, computePosition, autoUpdate } from '@floating-ui/dom';
import { PopoverSettings } from './PopoverSettings';
export class Popover {
    private _dotNetRef: any;
    private _scrollEventHandler: any;
    private _triggerResizeObserver: ResizeObserver;
    private _surfaceResizeObserver: ResizeObserver;
    private _cleanupAutoUpdate: (() => void) | null;
    private _activePopovers = new Map<string, PopoverSettings>();
    private _documentClickHandlers = new Map<string, (event: MouseEvent) => void>();
    private _documentKeyDownHandler: (event: KeyboardEvent) => void;
    private _triggerHandlers = new Map<string, { settings: PopoverSettings; trigger: Element; handlers: Array<{ eventName: string; handler: EventListener }>; keydown: (event: KeyboardEvent) => void }>();
    private _triggerObserver: MutationObserver | null = null;
    private _menuTypeahead = new Map<HTMLElement, { value: string; timer: number }>();

    constructor(dotNetRef: any) {
        this._dotNetRef = dotNetRef;
        this._documentKeyDownHandler = this.onDocumentKeyDown.bind(this);
    }

    setPopover(settings: PopoverSettings) {
        const trigger = this.getTrigger(settings) as HTMLElement | null;
        if (!trigger)
            return;

        // Only the explicit v3 opt-in owns its disclosure relationship.
        // Legacy Popovers retain their existing caller-authored ARIA attributes.
        if (settings.accessibleTriggerState) {
            const surface = this.getSurface(settings) as HTMLElement | null;
            trigger.setAttribute('aria-controls', settings.triggerId + '_surface');
            const expanded = !!surface &&
                surface.classList.contains('show') &&
                !surface.classList.contains('hidden');
            trigger.setAttribute('aria-expanded', String(expanded));
        }

        this.cleanupTriggerHandlers(settings.triggerId);
        const handlers: Array<{ eventName: string; handler: EventListener }> = [];

        if (settings.triggerEvents) {
            settings.triggerEvents.forEach((triggerEvent) => {
                const handler: EventListener = (event: Event) => {
                    // Button-managed menu clicks are opened by the Blazor Button/MenuItem callback.
                    // Handling the same click here races the component callback and can reopen a menu
                    // after its command has closed it.
                    if (trigger.getAttribute('aria-haspopup') === 'menu' && event.type === 'click')
                        return;

                    const surface = this.getSurface(settings) as HTMLElement | null;
                    if (surface)
                        void this.showSurface(settings);
                    else
                        void this.renderSurface(settings);
                };
                trigger.addEventListener(triggerEvent, handler);
                handlers.push({ eventName: triggerEvent, handler });
            });
        }

        if (settings.hideEvents) {
            settings.hideEvents.forEach((hideEvent) => {
                const handler: EventListener = () => this.hideSurface(settings);
                trigger.addEventListener(hideEvent, handler);
                handlers.push({ eventName: hideEvent, handler });
            });
        }

        const keydown = (event: KeyboardEvent) => this.onTriggerKeyDown(settings, event);
        trigger.addEventListener('keydown', keydown);
        this._triggerHandlers.set(settings.triggerId, { settings, trigger, handlers, keydown });
        this.ensureTriggerObserver();
    }

    public async showSurface(settings: PopoverSettings) {
        let surface = <HTMLElement>this.getSurface(settings);

        if (!surface) {
            await this.renderSurface(settings);
            surface = <HTMLElement>this.getSurface(settings);
        }

        if (settings.sameWidth) {
            const trigger = this.getTrigger(settings);

            if (!this._triggerResizeObserver) {
                this._triggerResizeObserver = new ResizeObserver(() => {
                    this.setSurfaceWidth(trigger, surface);
                });

                this._triggerResizeObserver.observe(trigger);
            }
            this.setSurfaceWidth(trigger, surface);
        }
        surface.classList.remove('hidden');

        this.updatePosition(settings);

        if (!surface.classList.contains('show'))
            surface.classList.add('show');
        this.setTriggerExpanded(settings, true);
        this._activePopovers.set(settings.triggerId, settings);
        document.addEventListener('keydown', this._documentKeyDownHandler);
        this.registerDocumentClickHandler(settings);

        // Register automatic updates on scroll/resize/mutations for correct positioning
        const trigger = this.getTrigger(settings) as HTMLElement;
        if (trigger && surface) {
            // Ensure previous auto-update (if any) is cleared before adding a new one
            if (this._cleanupAutoUpdate) {
                this._cleanupAutoUpdate();
            }
            this._cleanupAutoUpdate = autoUpdate(trigger, surface, () => this.updatePosition(settings));
            // Opening a Button-managed menu by pointer keeps focus on its trigger until this
            // frame, then places focus on the first enabled command.
            if (trigger.getAttribute('aria-haspopup') === 'menu' && document.activeElement === trigger) {
                window.requestAnimationFrame(() => {
                    const currentSurface = this.getSurface(settings) as HTMLElement | null;
                    const menu = currentSurface?.querySelector('[role="menu"]') as HTMLElement | null;
                    if (menu)
                        this.focusMenuItem(menu, false);
                });
            }
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
            this._surfaceResizeObserver = new ResizeObserver(() => { this.updatePosition(settings); });
            this._surfaceResizeObserver.observe(surface);

            new MutationObserver((mutationList, observer) => {
                mutationList.forEach(item => {
                    item.removedNodes.forEach(removedNode => {
                        if (removedNode == surface) {
                            this.deactivatePopover(settings.triggerId);
                            // window.removeEventListener('scroll', this._scrollEventHandler);

                            this._surfaceResizeObserver.disconnect();
                            observer.disconnect();
                        }
                    });
                });
            }).observe(surface.parentElement, { childList: true });
        }
    }

    private onDocumentClicked(settings: PopoverSettings, args: MouseEvent) {
        const trigger = <HTMLElement>this.getTrigger(settings);
        const surface = <HTMLElement>this.getSurface(settings);

        if (!trigger || !surface || !surface.classList.contains('show')) {
            this.deactivatePopover(settings.triggerId);
            return;
        }

        if (trigger.contains(<Node>args.target) || surface.contains(<Node>args.target) || args.defaultPrevented)
            this.registerDocumentClickHandler(settings);
        else
            this.hideSurface(settings);
    }

    // private onDocumentScroll(settings: PopoverSettings) {
    //     this.updatePosition(settings);
    // }

    public hideSurface(settings: PopoverSettings, restoreFocus = false) {
        const surface = <HTMLElement>this.getSurface(settings);
        // A close must synchronize the trigger even if this instance did not observe the open.
        this.setTriggerExpanded(settings, false);
        this.deactivatePopover(settings.triggerId);

        if (restoreFocus)
            this.restoreFocus(settings);

        if (surface) {
            if (!surface.classList.contains('show')) {
                this.doHideSurface(settings, surface);
                return;
            }

            let finished = false;
            let fallbackTimer: number | undefined;
            let transitionHandler = (_event: TransitionEvent) => { };
            const finish = (event?: TransitionEvent) => {
                if (event && event.target !== surface)
                    return;
                if (finished)
                    return;
                finished = true;
                surface.removeEventListener('transitionend', transitionHandler);
                if (fallbackTimer !== undefined)
                    window.clearTimeout(fallbackTimer);

                if (!surface.classList.contains('show'))
                    this.doHideSurface(settings, surface);
            };
            transitionHandler = (event: TransitionEvent) => finish(event);
            surface.addEventListener('transitionend', transitionHandler);
            surface.classList.remove('show');

            const duration = this.getTransitionDurationMs(surface);
            if (duration <= 0)
                finish();
            else
                fallbackTimer = window.setTimeout(() => finish(), duration + 50);
        } else {
            this.doHideSurface(settings, surface);
        }
    }

    private doHideSurface(settings: PopoverSettings, surface: HTMLElement) {
        surface?.classList.add('hidden');
        this._dotNetRef.invokeMethodAsync('HideSurface', settings);

        if (this._triggerResizeObserver) {
            this._triggerResizeObserver.disconnect();
            this._triggerResizeObserver = null;
        }

        // De-register auto update/scroll listeners when surface is hidden
        if (this._cleanupAutoUpdate) {
            this._cleanupAutoUpdate();
            this._cleanupAutoUpdate = null;
        }
    }

    private onDocumentKeyDown(args: KeyboardEvent) {
        const activeElement = document.activeElement as HTMLElement | null;
        if (activeElement) {
            const menuSettings = Array.from(this._activePopovers.values()).reverse().find(settings => {
                const surface = this.getSurface(settings) as HTMLElement | null;
                const menu = surface?.querySelector('[role="menu"]');
                const trigger = this.getTrigger(settings) as HTMLElement | null;
                return !!menu && (menu.contains(activeElement) || (!!trigger && (trigger === activeElement || trigger.contains(activeElement))));
            });

            if (menuSettings) {
                const surface = this.getSurface(menuSettings) as HTMLElement | null;
                const menu = surface?.querySelector('[role="menu"]') as HTMLElement | null;
                const trigger = this.getTrigger(menuSettings) as HTMLElement | null;
                const activeItem = activeElement.closest('[role="menuitem"]') as HTMLElement | null;

                if (args.key === 'Tab') {
                    this.hideSurface(menuSettings, false);
                    return;
                }

                if (trigger?.getAttribute('role') === 'menuitem' && menu) {
                    const isRtl = window.getComputedStyle(trigger).direction === 'rtl';
                    const closeKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
                    if (args.key === closeKey) {
                        args.preventDefault();
                        this.hideSurface(menuSettings, true);
                        return;
                    }
                }

                if (menu && activeItem && menu.contains(activeItem)) {
                    const items = this.getEnabledMenuItems(menu);
                    const index = items.indexOf(activeItem);

                    if (args.key === 'ArrowDown' || args.key === 'ArrowUp' || args.key === 'Home' || args.key === 'End') {
                        if (items.length === 0)
                            return;

                        args.preventDefault();
                        let next = index;
                        if (args.key === 'Home')
                            next = 0;
                        else if (args.key === 'End')
                            next = items.length - 1;
                        else if (args.key === 'ArrowDown')
                            next = index < 0 ? 0 : (index + 1) % items.length;
                        else
                            next = index < 0 ? items.length - 1 : (index - 1 + items.length) % items.length;

                        items[next].focus({ preventScroll: true });
                        return;
                    }

                    if (args.key === 'Enter' || args.key === ' ') {
                        args.preventDefault();

                        // Submenu items open their nested Popover in the component callback.
                        // Leaf items share the click path; dismiss here too because the async
                        // consumer callback can race popup closure in InteractiveWebAssembly.
                        if (activeItem.getAttribute('aria-haspopup') === 'menu')
                            return;

                        if (activeItem.getAttribute('aria-disabled') === 'true')
                            return;

                        activeItem.click();
                        this.hideSurface(menuSettings, true);
                        return;
                    }

                    if (args.key.length === 1 && !args.altKey && !args.ctrlKey && !args.metaKey) {
                        const character = args.key.toLocaleLowerCase();
                        const isWordCharacter = /^[a-z0-9]$/i.test(character) ||
                            (character.length === 1 && character.charCodeAt(0) > 127 && !/\s/.test(character));
                        if (isWordCharacter) {
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
                                args.preventDefault();
                                match.focus({ preventScroll: true });
                                return;
                            }
                        }
                    }
                }
            }
        }

        if (args.key !== 'Escape')
            return;

        const candidates = Array.from(this._activePopovers.values()).reverse();
        let target: PopoverSettings | null = null;

        for (const settings of candidates) {
            const surface = this.getSurface(settings) as HTMLElement | null;
            if (!surface || !surface.classList.contains('show')) {
                this.deactivatePopover(settings.triggerId);
                continue;
            }

            const trigger = this.getTrigger(settings) as HTMLElement | null;
            if (activeElement && ((trigger && (trigger === activeElement || trigger.contains(activeElement))) || surface.contains(activeElement))) {
                target = settings;
                break;
            }
        }

        if (!target) {
            target = Array.from(this._activePopovers.values()).reverse().find(settings => {
                const surface = this.getSurface(settings) as HTMLElement | null;
                return !!surface && surface.classList.contains('show');
            }) ?? null;
        }

        if (!target)
            return;

        args.preventDefault();
        args.stopPropagation();
        this.hideSurface(target, true);
    }

    private onTriggerKeyDown(settings: PopoverSettings, event: KeyboardEvent) {
        const trigger = this.getTrigger(settings) as HTMLElement | null;
        if (!trigger || trigger.getAttribute('aria-haspopup') !== 'menu')
            return;

        const isSubmenu = trigger.getAttribute('role') === 'menuitem';
        if (isSubmenu) {
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

    private async openMenu(settings: PopoverSettings, last: boolean) {
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
            !item.hidden &&
            window.getComputedStyle(item).display !== 'none');
    }

    private focusMenuItem(menu: HTMLElement, last: boolean) {
        const items = this.getEnabledMenuItems(menu);
        const item = last ? items[items.length - 1] : items[0];
        item?.focus({ preventScroll: true });
    }

    private ensureTriggerObserver() {
        if (this._triggerObserver || !document.body)
            return;

        this._triggerObserver = new MutationObserver(() => {
            Array.from(this._triggerHandlers.entries()).forEach(([triggerId, registration]) => {
                const currentTrigger = this.getTrigger(registration.settings) as HTMLElement | null;
                if (!currentTrigger) {
                    this.cleanupTriggerHandlers(triggerId);
                    return;
                }

                if (currentTrigger !== registration.trigger) {
                    const settings = registration.settings;
                    this.cleanupTriggerHandlers(triggerId);
                    this.setPopover(settings);
                }
            });
        });
        this._triggerObserver.observe(document.body, { childList: true, subtree: true });
    }

    private cleanupTriggerHandlers(triggerId: string) {
        const registration = this._triggerHandlers.get(triggerId);
        if (!registration)
            return;

        registration.handlers.forEach(item => registration.trigger.removeEventListener(item.eventName, item.handler));
        registration.trigger.removeEventListener('keydown', registration.keydown);
        this._triggerHandlers.delete(triggerId);

        if (this._triggerHandlers.size === 0 && this._triggerObserver) {
            this._triggerObserver.disconnect();
            this._triggerObserver = null;
        }
    }
    private registerDocumentClickHandler(settings: PopoverSettings) {
        this.removeDocumentClickHandler(settings.triggerId);
        const handler = (event: MouseEvent) => this.onDocumentClicked(settings, event);
        this._documentClickHandlers.set(settings.triggerId, handler);
        document.addEventListener('click', handler, { once: true });
    }

    private removeDocumentClickHandler(triggerId: string) {
        const handler = this._documentClickHandlers.get(triggerId);
        if (handler)
            document.removeEventListener('click', handler);
        this._documentClickHandlers.delete(triggerId);
    }

    private deactivatePopover(triggerId: string) {
        const settings = this._activePopovers.get(triggerId);
        if (settings)
            this.setTriggerExpanded(settings, false);
        this._activePopovers.delete(triggerId);
        this.removeDocumentClickHandler(triggerId);
        if (this._activePopovers.size === 0)
            document.removeEventListener('keydown', this._documentKeyDownHandler);
    }

    // Blazor owner teardown calls this for the opt-in disclosure contract.
    // The shared stack owns one document keydown handler for all active surfaces;
    // deactivating this trigger releases it when the last surface is removed.
    public unregisterOptInEscapeByTriggerId(triggerId: string) {
        this.deactivatePopover(triggerId);
    }

    private setTriggerExpanded(settings: PopoverSettings, expanded: boolean) {
        const trigger = <HTMLElement>this.getTrigger(settings);
        if (trigger?.hasAttribute('aria-expanded'))
            trigger.setAttribute('aria-expanded', String(expanded));
    }

    private restoreFocus(settings: PopoverSettings) {
        const trigger = <HTMLElement>this.getTrigger(settings);
        if (!trigger || !trigger.isConnected || (trigger as HTMLButtonElement).disabled === true)
            return;

        trigger.focus({ preventScroll: true });
    }

    private getTransitionDurationMs(element: HTMLElement): number {
        const style = window.getComputedStyle(element);
        const toMilliseconds = (value: string) => value.split(',').map(part => {
            const trimmed = part.trim();
            const parsed = Number.parseFloat(trimmed);
            if (!Number.isFinite(parsed))
                return 0;
            return trimmed.endsWith('ms') ? parsed : parsed * 1000;
        });

        const durations = toMilliseconds(style.transitionDuration);
        const delays = toMilliseconds(style.transitionDelay);
        return Math.max(0, ...durations.map((duration, index) => duration + (delays[index % delays.length] ?? 0)));
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
