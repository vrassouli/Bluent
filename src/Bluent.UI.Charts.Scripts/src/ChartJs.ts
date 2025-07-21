import { Chart, ChartConfiguration } from "chart.js/auto";

export class ChartJs {
    //private _dotNetRef: any;
    private _id: string;
    private _chart?: Chart;

    constructor(dotNetRef: any, id: string) {
        //this._dotNetRef = dotNetRef;
        this._id = id;
    }

    public init(config: ChartConfiguration) {
        //ChartJs.log('creating chart:', config);

        var ctx = <HTMLCanvasElement>document.getElementById(this._id);
        this._chart = new Chart(ctx, config);
    }

    public update(config: ChartConfiguration) {
        if (this._chart) {
            this._chart.data.datasets.forEach((dataset, index) => {
                if (config.data.datasets.length > index) {
                    dataset.data = config.data.datasets[index].data;
                }
            });
            this._chart.update();
        }
    }

    public destroy() {
        this._chart?.destroy();
    }

    // private static log(message: string, obj?: any) {
    //     console.log(message);
    //     if (obj)
    //         console.log(obj);
    // }

    public static create(dotNetRef: any, id: string): ChartJs {
        return new ChartJs(dotNetRef, id);
    }
}