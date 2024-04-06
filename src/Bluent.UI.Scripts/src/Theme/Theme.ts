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
}