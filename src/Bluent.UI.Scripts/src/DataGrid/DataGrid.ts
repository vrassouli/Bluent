import { ScrollSync } from "../ScrollSync/ScrollSync";

export class DataGrid {
    private _dotNetRef: any;
    private _id: string;

    constructor(dotNetRef: any, id: string) {
        this._dotNetRef = dotNetRef;
        this._id = id;

        this.init();
    }

    private init() {
        var headerRowGroups = <HTMLElement>document.querySelector(`#${this._id}>.header>.rowgroups`);
        var headerMainRowGroup = document.querySelector(`#${this._id}>.header>.rowgroups>.rowgroup.main`);
        var contentFreezedRowGroup = <HTMLElement>document.querySelector(`#${this._id}>.content>.rowgroups>.rowgroup.freezed`);
        var contentMainRowGroup = document.querySelector(`#${this._id}>.content>.rowgroups>.rowgroup.main`);

        headerRowGroups.style.marginInlineEnd = `${this.getScrollbarWidth()}px`;
        if (contentFreezedRowGroup)
            contentFreezedRowGroup.style.paddingBottom = `${this.getScrollbarWidth()}px`;

        new ScrollSync(contentMainRowGroup, [contentFreezedRowGroup], { syncHorizontal: false, syncVertical: true });
        new ScrollSync(contentMainRowGroup, [headerMainRowGroup], { syncHorizontal: true, syncVertical: false });
    }

    private getScrollbarWidth(): number {
        // Create the measurement node
        var scrollDiv = document.createElement("div");
        scrollDiv.style.width = '100px';
        scrollDiv.style.height = '100px';
        scrollDiv.style.overflow = 'scroll';
        scrollDiv.style.position = 'absolute';
        scrollDiv.style.top = '-9999px';
        document.body.appendChild(scrollDiv);

        // Get the scrollbar width
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

        // Delete the DIV 
        document.body.removeChild(scrollDiv);

        return scrollbarWidth;
    }

    static create(dotNetRef: any, id: string): DataGrid {
        return new DataGrid(dotNetRef, id);
    }
}