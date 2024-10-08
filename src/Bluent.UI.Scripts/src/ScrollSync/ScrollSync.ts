export class ScrollSync {
    constructor(source: Element, targets: Element[], options: SyncOptions) {
        source.addEventListener('scroll', this.onScroll.bind(this, source, targets, options));
    }

    private onScroll(source: Element, targets: Element[], options: SyncOptions) {
        targets.forEach(target => {
            if (options.syncHorizontal)
                target.scrollLeft = source.scrollLeft;
            if (options.syncVertical)
                target.scrollTop = source.scrollTop;
        });
    }
}

interface SyncOptions {
    syncHorizontal: boolean,
    syncVertical: boolean
}