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

const BarChart: React.FC = () => {
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

    const selfRef = React.useRef<HTMLDivElement | null>(null);
    const [showBar, setShowBar] = React.useState<boolean>(false);

    React.useEffect(() => {
        const rect = selfRef.current!.getBoundingClientRect();
        if (!showBar && rect.width > 0 && rect.height > 0 && rect.x >=0 && rect.y>=0) {
            setShowBar(true);
        }
    });

    let bar = null;
    if (showBar) {
        bar = <Bar style={{ width: "100%", height: "100%" }} data={chartData} options={options} />;
    }

    return (
        <div ref={selfRef} style={{ width: "100%", height: "100%" }}>
            {bar}
        </div>
    )
};

export default BarChart;
