import { flip, shift, offset, arrow, computePosition } from '@floating-ui/dom';
import { PopoverSettings } from './PopoverSettings';
export class Popover {
    private _dotNetRef: any;
    private _scrollEventHandler: any;
    private _resizeObserver: ResizeObserver;

    constructor(dotNetRef: any) {
        this._dotNetRef = dotNetRef;
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
        const surface = <HTMLElement>this.getSurface(settings);
        if (!surface)
            await this.renderSurface(settings);

        surface.classList.remove('hidden');

        this.updatePosition(settings);

        if (!surface.classList.contains('show'))
            surface.classList.add('show');
        document.addEventListener('click', this.onDocumentClicked.bind(this, settings), { once: true });
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
            // this._scrollEventHandler = this.onDocumentScroll.bind(this, settings);
            // window.addEventListener('scroll', this.onDocumentScroll.bind(this, settings));

            this._resizeObserver = new ResizeObserver(() => { this.updatePosition(settings); });
            this._resizeObserver.observe(surface);

            new MutationObserver((mutationList, observer) => {
                mutationList.forEach(item => {
                    item.removedNodes.forEach(removedNode => {
                        if (removedNode == surface) {
                            // window.removeEventListener('scroll', this._scrollEventHandler);

                            this._resizeObserver.disconnect();
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

    private hideSurface(settings: PopoverSettings) {
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

        //document.removeEventListener('scroll', this._scrollEventHandler);
    }

    private doHideSurface(settings: PopoverSettings, surface: HTMLElement) {
        surface?.classList.add('hidden');
        this._dotNetRef.invokeMethodAsync('HideSurface', settings);
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

    static create(dotNetRef: any): Popover {
        return new Popover(dotNetRef);
    }
}

