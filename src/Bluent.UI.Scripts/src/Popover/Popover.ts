import { flip, shift, offset, arrow, Placement, OffsetOptions, ReferenceElement, computePosition } from '@floating-ui/dom';
import { PopoverSettings } from './PopoverSettings';
export class Popover {
    private _dotNetRef: any;

    constructor(dotNetRef: any) {
        this._dotNetRef = dotNetRef;
    }
    setPopover(settings: PopoverSettings) {
        settings = Object.assign({
            placement: <Placement>'top',
            offsetOptions: <OffsetOptions>6,
            triggerEvents: ['click']
        }, settings);

        const trigger = this.getTrigger(settings);
        if (trigger) {
            settings.triggerEvents.forEach((triggerEvent) => {
                trigger.addEventListener(triggerEvent, (args) => {
                    this.renderSurface(settings);
                });
            });

        }
    }

    public showSurface(settings: PopoverSettings) {
        const surface = <HTMLElement>this.getSurface(settings);
        const trigger = this.getTrigger(settings);
        const arrowElement = this.getArrow(settings);
        surface.style.display = 'block';
        document.addEventListener('click', this.onDocumentClicked.bind(this, settings), { once: true });

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
        });
    }

    private renderSurface(settings: PopoverSettings) {
        this._dotNetRef.invokeMethodAsync('RenderSurface', settings);
    }

    private onDocumentClicked(settings: PopoverSettings, args: PointerEvent) {
        var trigger = this.getTrigger(settings);
        var surface = this.getSurface(settings);

        if (trigger.contains(<Node>args.target) || surface.contains(<Node>args.target)) {
            document.addEventListener('click', this.onDocumentClicked.bind(this, settings), { once: true });
        }
        else {
            this._dotNetRef.invokeMethodAsync('DestroySurface', settings);
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

