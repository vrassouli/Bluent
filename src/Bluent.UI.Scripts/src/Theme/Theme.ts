export class Theme {
    public static setThemeMode(mode: string) {
        document.documentElement.setAttribute('data-bui-theme', mode);
    }

    public static getThemeMode(): string {
        var mode = document.documentElement.getAttribute('data-bui-theme');

        return mode ?? 'light';
    }

    public static setDir(dir: string) {
        document.documentElement.setAttribute('dir', dir);
    }

    public static getDir(): string {
        var dir = document.documentElement.getAttribute('dir');

        return dir ?? 'ltr';
    }

    public static setTheme(theme: string) {
        var link = <HTMLLinkElement>document.head.querySelector('link[href*="bluent.ui.theme"]');
        var href = link?.href;

        if (href && href.includes('bluent.ui.theme')) {
            var splits = href.split('/');
            var fileName = splits[splits.length - 1];
            href = href.replace(fileName, `bluent.ui.theme.${theme}.css`);
        }

        link.href = href;

    }
}