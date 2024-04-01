import { computePosition } from '@floating-ui/dom';
export class Tooltip {
    setTooltip(elementSelector: string, tooltipSelector) {
        const button = document.querySelector(elementSelector);
        const tooltip = document.querySelector(tooltipSelector);

        computePosition(button, tooltip).then(({ x, y }) => {
            Object.assign(tooltip.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
        });    }

    static create(): Tooltip {
        return new Tooltip();
    }
}
//window["Tooltip"] = Tooltip;
