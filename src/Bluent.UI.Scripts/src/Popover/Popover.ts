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

    constructor(dotNetRef: any) {
        this._dotNetRef = dotNetRef;
        this._documentKeyDownHandler = this.onDocumentKeyDown.bind(this);
    }

    setPopover(settings: PopoverSettings) {
        const trigger = this.getTrigger(settings);
        if (trigger) {
            if (settings.triggerEvents) {
                settings.triggerEvents.forEach((triggerEvent) => {
                    trigger.addEventListener(triggerEvent, () => {
                        const surface = <HTMLElement>this.getSurface(settings);
                        if (surface) {
                            this.showSurface(settings);
                        }
                        else {
                            this.renderSurface(settings);
                        }
                    });
                });
            }

            if (settings.hideEvents) {
                settings.hideEvents.forEach((hideEvent) => {
                    trigger.addEventListener(hideEvent, () => {
                        this.hideSurface(settings);
                    });
                });
            }
        }
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
        if (args.key !== 'Escape')
            return;

        const activeElement = document.activeElement;
        const candidates = Array.from(this._activePopovers.values()).reverse();
        let target: PopoverSettings | null = null;

        for (const settings of candidates) {
            const surface = <HTMLElement>this.getSurface(settings);
            if (!surface || !surface.classList.contains('show')) {
                this.deactivatePopover(settings.triggerId);
                continue;
            }

            const trigger = <HTMLElement>this.getTrigger(settings);
            if (activeElement && ((trigger && (trigger === activeElement || trigger.contains(activeElement))) || surface.contains(activeElement))) {
                target = settings;
                break;
            }
        }

        if (!target) {
            target = Array.from(this._activePopovers.values()).reverse().find(settings => {
                const surface = <HTMLElement>this.getSurface(settings);
                return !!surface && surface.classList.contains('show');
            }) ?? null;
        }

        if (!target)
            return;

        args.preventDefault();
        args.stopPropagation();
        this.hideSurface(target, true);
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

