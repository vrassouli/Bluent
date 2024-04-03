import { OffsetOptions, Placement } from "@floating-ui/dom";

export type PopoverSettings = {
    triggerId: string;
    placement: Placement;
    offsetOptions: OffsetOptions;
    triggerEvents: string[];
    hideEvents: string[];
};