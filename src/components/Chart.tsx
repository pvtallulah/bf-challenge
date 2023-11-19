import React, { useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useAppSelector } from "../redux/hooks";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  indexAxis: "y" as const,
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
  plugins: {
    legend: {
      position: "right" as const,
    },
    title: {
      display: true,
      text: "Chart.js Horizontal Bar Chart",
    },
  },
};

type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    tension: number;
  }[];
};

const Chart = () => {
  const [chartData, setChartData] = React.useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "My First Dataset",
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  });
  const book = useAppSelector((state) => state.bookReducer);
  let data = {
    labels: ["1", "2", 3],
    datasets: [
      {
        label: "My First Dataset",
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };
  useEffect(() => {
    if (Object.keys(book.bids).length) return;
    setChartData((prev: any) => {
      const prevData = { ...prev };
      return {
        ...prevData,
        labels: Object.keys(book.bids),
        datasets: [
          {
            label: "My First Dataset",
            data: Object.values(book.bids),
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      };
    });
  }, [book]);
  return (
    <div>
      {chartData.labels.length ? (
        <table>
          <thead>
            <tr>
              <th>Price</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            {chartData.labels.map((label, index) => (
              <tr key={index}>
                <td>{label}</td>
                <td>{chartData.datasets[0].data[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>loading...</div>
      )}
    </div>
  );
};

export default Chart;
