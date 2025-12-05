import { BubbleDataPoint, Chart, ChartConfiguration, ChartDataset, ChartTypeRegistry, Point } from "chart.js/auto";

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
            this.syncDatasets(this._chart, config.data.datasets);

            // replace plugin options (built-in plugin options like title/subtitle)
            if (config.options?.plugins) {
                // replace only plugin-related options
                this._chart.options.plugins = config.options.plugins as any;
            }

            // replace per-chart plugins array (if provided)
            if (config.plugins) {
                this._chart.config.plugins = config.plugins as any;
            }

            this._chart.update();
        }
    }

    private syncDatasets(chart: Chart<keyof ChartTypeRegistry, (number | [number, number] | Point | BubbleDataPoint | null)[], unknown>,
        newDatasets: ChartDataset<keyof ChartTypeRegistry, (number | [number, number] | Point | BubbleDataPoint | null)[]>[]) {
        const existing = chart.data.datasets;
        const newLen = newDatasets.length;
        const existLen = existing.length;
        const minLen = Math.min(existLen, newLen);

        // 1) Update the datasets that already exist
        for (let i = 0; i < minLen; i++) {
            // Replace dataset.data (usual) and copy other provided props.
            // We use shallow copy so you keep any Chart-managed fields intact.
            existing[i].data = newDatasets[i].data;

            // Copy other properties from new dataset (label, backgroundColor, etc.)
            // but avoid overwriting internal Chart.js-only fields if you care.
            for (const key of Object.keys(newDatasets[i])) {
                if (key === 'data') continue;
                // @ts-ignore -- dynamic assignment
                existing[i][key] = (newDatasets[i] as any)[key];
            }
        }

        // 2) Append any additional new datasets
        if (newLen > existLen) {
            for (let i = minLen; i < newLen; i++) {
                // push a shallow clone of the incoming dataset
                existing.push({ ...(newDatasets[i] as any) } as ChartDataset);
            }
        }

        // 3) Remove any extra old datasets
        if (existLen > newLen) {
            existing.splice(newLen, existLen - newLen);
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