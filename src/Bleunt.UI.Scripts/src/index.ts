import { flip, shift, offset, arrow, Placement, OffsetOptions, ReferenceElement, computePosition } from '@floating-ui/dom';
export class Tooltip {
    setTooltip(elementSelector: string, tooltipSelector: string, placement = <Placement>'top', offsetOptions = <OffsetOptions>6) {
        const reference = document.querySelector(elementSelector);
        const floating = document.querySelector(tooltipSelector);
        const arrowElement = document.querySelector(`${tooltipSelector}>.arrow`);

        this.updateTooltip(<ReferenceElement>reference, <HTMLElement>floating, arrowElement, placement, offsetOptions);

        reference.addEventListener('mouseenter', () => {
            this.showTooltip(<ReferenceElement>reference, <HTMLElement>floating, arrowElement, placement, offsetOptions);
        });
        reference.addEventListener('focus', () => {
            this.showTooltip(<ReferenceElement>reference, <HTMLElement>floating, arrowElement, placement, offsetOptions);
        });

        reference.addEventListener('mouseleave', () => {
            this.hideTooltip(<HTMLElement>floating);
        });
        reference.addEventListener('blur', () => {
            this.hideTooltip(<HTMLElement>floating);
        });
    }

    private updateTooltip(reference: ReferenceElement, floating: HTMLElement, arrowElement: Element, placement: Placement, offsetOptions: OffsetOptions) {
        computePosition(reference, floating, {
            placement: placement,
            middleware: [
                flip(),
                shift({ padding: 5 }),
                offset(offsetOptions),
                arrow({ element: arrowElement }),],
        }).then(({ x, y, placement, middlewareData }) => {
            Object.assign(floating.style, {
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

            Object.assign((<HTMLElement>arrowElement).style, {
                left: arrowX != null ? `${arrowX}px` : '',
                top: arrowY != null ? `${arrowY}px` : '',
                right: '',
                bottom: '',
                [staticSide]: '-4px',
            });
        });
    }

    private showTooltip(reference: ReferenceElement, floating: HTMLElement, arrowElement: Element, placement: Placement, offsetOptions: OffsetOptions) {
        floating.style.display = 'block';
        this.updateTooltip(reference, floating, arrowElement, placement, offsetOptions);
    }

    private hideTooltip(floating: HTMLElement) {
        floating.style.display = '';
    }

    static create(): Tooltip {
        return new Tooltip();
    }
}
