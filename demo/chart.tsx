import * as React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = () => {
    const chartData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Sample Data',
                data: [65, 59, 80, 81, 56, 55, 40],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Bar Chart Example',
            },
        },
    };

    const chartRef = React.useRef<any>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);

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
    }, []);

    return (
        <div ref={containerRef} style={{ height: "100%", overflow: "hidden" }}>
            <Bar ref={chartRef} data={chartData} options={options} />
        </div>
    )
};

export default BarChart;
