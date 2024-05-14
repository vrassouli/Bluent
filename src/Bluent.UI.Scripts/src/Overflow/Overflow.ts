export class Overflow {
    private _element: HTMLElement;
    private _overflowMenu: HTMLElement;
    private _isHorizontal: boolean;
    private _overflowButtonWidth: number;
    private _overflowButtonHeight: number;
    private _mutaionObserver: MutationObserver;
    private _overflowSurface: HTMLElement;
    _checkingOverflow: any;

    constructor() {
    }

    public init(id: string) {
        this._element = document.getElementById(id);

        if (this._element) {
            let overflowButton = <HTMLElement>this._element.querySelector(':scope > .overflow-button');
            this._overflowSurface = <HTMLElement>document.querySelector(`#${overflowButton.id}_surface>.overflow-menu`);
            this._overflowMenu = document.querySelector(`#${overflowButton.id}_surface>.overflow-menu`);
            this._isHorizontal = this._element.classList.contains('horizontal');
            this.getOverflowButtonDimention(overflowButton);

            new ResizeObserver(this.onSizeChanged.bind(this))
                .observe(this._element);
            this._mutaionObserver = new MutationObserver(this.onSurfaceContentChanged.bind(this));
        }

        this.checkOverflow();
    }

    public checkOverflow() {
        try {
            this.disconnectMutionObserver();

            let children = Array.from(this._element.children)
                .filter(child => !child.classList.contains('overflow-button'));
            let overflowMenuChildren = Array.from(this._overflowMenu.children);

            this.clearOverflowingItems(children);
            this.clearOverflowingItems(overflowMenuChildren);

            let firstOverflow = this.getFirstOverflowIndex(children);

            this.setOverflowingItems(firstOverflow, children);
            this.setOverflowingItems(firstOverflow, overflowMenuChildren);
        }
        catch {

        }
        finally {
            this.connectMutationObserver();
        }
    }

    private getOverflowButtonDimention(btn: HTMLElement) {
        btn.style.display = 'inline-flex';

        this._overflowButtonWidth = btn.clientWidth;
        this._overflowButtonHeight = btn.clientHeight;

        btn.style.display = '';
    }

    private setOverflowingItems(firstOverflow: number, children: Element[]) {
        if (firstOverflow == -1)
            return;

        for (let i = firstOverflow; i < children.length; i++) {
            let child = children[i];
            child.classList.add('overflowing');
        }
    }

    private getFirstOverflowIndex(children: Array<Element>): number {
        if (this._isHorizontal) {
            let paddingStart = parseInt(window.getComputedStyle(this._element, null).getPropertyValue('padding-inline-start'));
            let paddingEnd = parseInt(window.getComputedStyle(this._element, null).getPropertyValue('padding-inline-end'));
            let width = this._element.clientWidth;
            let availableWidth = width - paddingStart - paddingEnd;

            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                let offsetEnd = this.getOffsetEnd(child) - paddingStart;

                if ((offsetEnd + this._overflowButtonWidth) > availableWidth) {
                    return i;
                }
            }
        } else {
            let paddingTop = parseInt(window.getComputedStyle(this._element, null).getPropertyValue('padding-top'));
            let paddingBottom = parseInt(window.getComputedStyle(this._element, null).getPropertyValue('padding-bottom'));
            let Height = this._element.clientHeight;
            let availableHeight = Height - paddingTop - paddingBottom;

            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                let offsetEnd = (<HTMLElement>child).offsetTop + (<HTMLElement>child).offsetHeight - paddingTop;
                if ((offsetEnd + this._overflowButtonHeight) > availableHeight) {
                    return i;
                }
            }
        }
        return -1;
    }

    private clearOverflowingItems(children: Array<Element>) {
        children.forEach(child => child.classList.remove('overflowing'));
    }

    private getOffsetEnd(child: Element): number {
        let dir = window.getComputedStyle(child.parentElement).getPropertyValue('direction');
        let parentRect = child.parentElement.getBoundingClientRect();
        let childRect = child.getBoundingClientRect();

        if (dir === 'ltr')
            return (childRect.left - parentRect.left) + childRect.width;
        else
            return (parentRect.right - childRect.right) + childRect.width;
    }

    private onSizeChanged() {
        this.checkOverflow();
    }

    private onSurfaceContentChanged() {
        //console.log('content changed.');
        this.checkOverflow();
    }

    private disconnectMutionObserver() {
        if (this._mutaionObserver) {
            this._mutaionObserver.disconnect();
        }
    }

    private connectMutationObserver() {
        this._mutaionObserver.observe(this._overflowSurface, { attributes: true, childList: true, subtree: true });
    }

    public static create(): Overflow {
        return new Overflow();
    }
}
