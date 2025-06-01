import { Chart } from "chart.js/auto";

export class ChartJs {
    //private _dotNetRef: any;
    private _id: string;

    constructor(dotNetRef: any, id: string) {
        //this._dotNetRef = dotNetRef;
        this._id = id;

        this.init();

    }

    private init() {
        var ctx = <HTMLCanvasElement>document.getElementById(this._id);
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],

                    borderColor: '#36A2EB',
                    backgroundColor: '#36A2EB80',
                    borderWidth: 2,
                    borderRadius: Number.MAX_VALUE,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Chart.js Bar Chart'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    public static create(dotNetRef: any, id: string): ChartJs {
        return new ChartJs(dotNetRef, id);
    }
}