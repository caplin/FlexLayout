import * as React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = () => {
    const chartRef = React.useRef<any>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const chartDocument = React.useRef<Document | null>(null);
    // the chart state to carry across rebuilds: dataset visibility (one entry per dataset),
    // captured when the user toggles a legend item
    const [datasetVisibility, setDatasetVisibility] = React.useState<boolean[]>([true]);
    const [chartVersion, setChartVersion] = React.useState(0);

    // stable identities: react-chartjs-2 reapplies data/options when they change, which
    // resets chart state such as the legend's dataset visibility. The visibility is baked
    // into the dataset definition so that any rebuild recreates the chart with it intact
    const chartData = React.useMemo(
        () => ({
            labels: ["January", "February", "March", "April", "May", "June", "July"],
            datasets: [
                {
                    label: "Sample Data",
                    data: [65, 59, 80, 81, 56, 55, 40],
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                    hidden: !datasetVisibility[0],
                },
            ],
        }),
        [datasetVisibility],
    );

    const options = React.useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0,
            },
            plugins: {
                legend: {
                    position: "top" as const,
                    onClick: (_e: any, legendItem: any, legend: any) => {
                        const chart = legend.chart;
                        const index = legendItem.datasetIndex;
                        chart.setDatasetVisibility(index, !chart.isDatasetVisible(index));
                        chart.update();
                        setDatasetVisibility((v) => v.map((visible, i) => (i === index ? chart.isDatasetVisible(index) : visible)));
                    },
                },
                title: {
                    display: true,
                    text: "Bar Chart Example",
                },
            },
        }),
        [],
    );

    // when the tab moves between windows (popout/popin) the chart's canvas is adopted into
    // another document, which invalidates its rendering context (draws silently no-op).
    // Re-key the <Bar> so react-chartjs-2 builds a fresh canvas and Chart instance; the
    // dataset visibility is baked into chartData so the legend state survives the move.
    // The state update is guarded by the document comparison so it cannot loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => {
        const target = containerRef.current;
        if (!target) return;
        if (chartDocument.current !== target.ownerDocument) {
            if (chartDocument.current !== null) {
                setChartVersion((v) => v + 1);
            }
            chartDocument.current = target.ownerDocument;
        }
    });

    React.useEffect(() => {
        const target = containerRef.current;
        if (!target) return;

        const win = target.ownerDocument.defaultView || window;
        const Observer = win.ResizeObserver || ResizeObserver;

        const resizeObserver = new Observer(() => {
            if (chartRef.current) {
                chartRef.current.resize();
            }
        });

        resizeObserver.observe(target);

        return () => {
            resizeObserver.disconnect();
        };
        // re-attach against the new window when the chart is rebuilt after a document move
    }, [chartVersion]);

    return (
        <div ref={containerRef} style={{ height: "100%", overflow: "hidden" }}>
            <Bar key={chartVersion} ref={chartRef} data={chartData} options={options} />
        </div>
    );
};

export default BarChart;
