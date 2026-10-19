import { flip, shift, offset, arrow, computePosition, autoUpdate } from '@floating-ui/dom';
import { PopoverSettings } from './PopoverSettings';
export class Popover {
    private _dotNetRef: any;
    private _scrollEventHandler: any;
    private _triggerResizeObserver: ResizeObserver;
    private _surfaceResizeObserver: ResizeObserver;
    private _cleanupAutoUpdate: (() => void) | null;
    private _optInEscapeHandlers = new Map<string, (event: KeyboardEvent) => void>();

    constructor(dotNetRef: any) {
        this._dotNetRef = dotNetRef;
    }

    setPopover(settings: PopoverSettings) {
        const trigger = this.getTrigger(settings);
        if (trigger) {
            if (settings.accessibleTriggerState) {
                trigger.setAttribute("aria-controls", settings.triggerId + "_surface");
                trigger.setAttribute("aria-expanded", "false");
            }
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
        // Keep the .NET Button's aria-expanded state in sync with the JS-owned
        // visibility for explicitly opted-in v3 button-triggered Popovers.
        // Existing non-opted-in controls retain their previous lifecycle.
        surface.classList.remove('hidden');
        if (settings.accessibleTriggerState) {
            this.getTrigger(settings)?.setAttribute("aria-expanded", "true");
            this.registerOptInEscape(settings);
        }

        this.updatePosition(settings);

        if (!surface.classList.contains('show'))
            surface.classList.add('show');
        document.addEventListener('click', this.onDocumentClicked.bind(this, settings), { once: true });

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
                            // window.removeEventListener('scroll', this._scrollEventHandler);

                            this._surfaceResizeObserver.disconnect();
                            observer.disconnect();
                        }
                    });
                });
            }).observe(surface.parentElement, { childList: true });
        }
    }

    private onDocumentClicked(settings: PopoverSettings, args: PointerEvent) {
        var trigger = this.getTrigger(settings);
        var surface = this.getSurface(settings);

        if (trigger && surface) {
            if (trigger.contains(<Node>args.target) || surface.contains(<Node>args.target) || args.defaultPrevented) {
                document.addEventListener('click', this.onDocumentClicked.bind(this, settings), { once: true });
            }
            else {
                this.hideSurface(settings);
            }
        }
    }

    // private onDocumentScroll(settings: PopoverSettings) {
    //     this.updatePosition(settings);
    // }

    // Registered only for a currently visible, opted-in button Popover.
    // The document bubble handler runs before the Modal's window bubble
    // handler, allowing the nearest open child to consume Escape first.
    private registerOptInEscape(settings: PopoverSettings) {
        this.unregisterOptInEscape(settings);
        const listener = (event: KeyboardEvent) => {
            if (event.key !== "Escape" || event.defaultPrevented || event.isComposing || event.repeat) return;
            const trigger = this.getTrigger(settings);
            const surface = this.getSurface(settings);
            if (!trigger || !surface || surface.classList.contains("hidden") || !surface.classList.contains("show")) return;
            const target = event.target as Node;
            if (!trigger.contains(target) && !surface.contains(target)) return;
            event.preventDefault();
            event.stopPropagation();
            this.hideSurface(settings);
            if (trigger instanceof HTMLElement && trigger.isConnected)
                trigger.focus({ preventScroll: true });
        };
        document.addEventListener("keydown", listener);
        this._optInEscapeHandlers.set(settings.triggerId, listener);
    }

    // An opted-in owner can be removed from the Blazor render tree while
    // its surface is open. Explicitly release its document Escape handler.
    public unregisterOptInEscapeByTriggerId(triggerId: string) {
        const listener = this._optInEscapeHandlers.get(triggerId);
        if (!listener) return;
        document.removeEventListener("keydown", listener);
        this._optInEscapeHandlers.delete(triggerId);
    }
    private unregisterOptInEscape(settings: PopoverSettings) {
        this.unregisterOptInEscapeByTriggerId(settings.triggerId);
    }
    private hideSurface(settings: PopoverSettings) {
        const surface = <HTMLElement>this.getSurface(settings);
        if (surface) {
            // #418 opted-in: finish dismissal even if transitionend is skipped.
            if (settings.accessibleTriggerState) {
                let finished = false;
                const complete = () => {
                    if (finished) return;
                    finished = true;
                    surface.removeEventListener("transitionend", onEnd);
                    // A new show request supersedes an earlier close timer.
                    if (surface.classList.contains("show")) return;
                    this.doHideSurface(settings, surface);
                };
                const onEnd = (event: TransitionEvent) => {
                    if (event.target === surface) complete();
                };
                const duration = getComputedStyle(surface).transitionDuration
                    .split(',').map(x => x.trim()).map(x =>
                        x.endsWith('ms') ? parseFloat(x) : parseFloat(x) * 1000);
                const maxMs = Math.max(0, ...duration.filter(Number.isFinite));
                surface.addEventListener("transitionend", onEnd);
                surface.classList.remove('show');
                if (maxMs === 0) complete();
                else window.setTimeout(complete, maxMs + 90);
                return;
            }
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
        if (settings.accessibleTriggerState) this.unregisterOptInEscape(settings);
        surface?.classList.add('hidden');
        if (settings.accessibleTriggerState)
            this.getTrigger(settings)?.setAttribute("aria-expanded", "false");
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

