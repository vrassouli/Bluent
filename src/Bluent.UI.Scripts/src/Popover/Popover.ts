import { flip, shift, offset, arrow, computePosition } from '@floating-ui/dom';
import { PopoverSettings } from './PopoverSettings';
export class Popover {
    private _dotNetRef: any;

    constructor(dotNetRef: any) {
        this._dotNetRef = dotNetRef;
    }
    setPopover(settings: PopoverSettings) {
        const trigger = this.getTrigger(settings);
        if (trigger) {
            if (settings.triggerEvents) {
                settings.triggerEvents.forEach((triggerEvent) => {
                    trigger.addEventListener(triggerEvent, () => {
                        this.renderSurface(settings);
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

    public showSurface(settings: PopoverSettings) {
        const surface = <HTMLElement>this.getSurface(settings);
        const trigger = this.getTrigger(settings);
        const arrowElement = this.getArrow(settings);

        computePosition(trigger, surface, {
            placement: settings.placement,
            middleware: [
                flip(),
                shift({ padding: 5 }),
                offset(settings.offsetOptions),
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
            //surface.classList.add(staticSide)
            if (!surface.classList.contains('show'))
                surface.classList.add('show');
            document.addEventListener('click', this.onDocumentClicked.bind(this, settings), { once: true });
        });
    }

    private renderSurface(settings: PopoverSettings) {
        this._dotNetRef.invokeMethodAsync('RenderSurface', settings);
    }

    private onDocumentClicked(settings: PopoverSettings, args: PointerEvent) {
        var trigger = this.getTrigger(settings);
        var surface = this.getSurface(settings);

        if (trigger && surface) {
            if (trigger.contains(<Node>args.target) || surface.contains(<Node>args.target)) {
                document.addEventListener('click', this.onDocumentClicked.bind(this, settings), { once: true });
            }
            else {
                this.hideSurface(settings);
            }
        }
    }

    private hideSurface(settings: PopoverSettings) {
        const surface = <HTMLElement>this.getSurface(settings);
        if (surface) {
            surface.addEventListener("transitionend", (event) => {
                this._dotNetRef.invokeMethodAsync('HideSurface', settings);
            }, { once: true });

            if (surface.classList.contains('show'))
                surface.classList.remove('show');
            else
                this._dotNetRef.invokeMethodAsync('HideSurface', settings);
        }
        else {
            this._dotNetRef.invokeMethodAsync('HideSurface', settings);
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

    static create(dotNetRef: any): Popover {
        return new Popover(dotNetRef);
    }
}

