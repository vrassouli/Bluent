import { OffsetOptions, Padding, Placement } from "@floating-ui/dom";

export type PopoverSettings = {
    triggerId: string;
    placement: Placement;
    offset: OffsetOptions;
    padding: Padding;
    triggerEvents: string[];
    hideEvents: string[];
    sameWidth: boolean;
};