import type { Accident } from "./types/types.js";

declare global {
  interface Window {
    Chart: any;
    Papa: any;
  }
}

const charts = new Map<string, any>();
let exportButtonsInitialized = false;

function createOrUpdateChart(
  chartId: string,
  chartType: any,
  data: any,
  options: any
) {
  let chart = charts.get(chartId);
  if (chart) {
    chart.data = data;
    chart.update();
  } else {
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    if (canvas) {
      chart = new (window as any).Chart(canvas, {
        type: chartType,
        data,
        options,
      });
      charts.set(chartId, chart);
    }
  }
}

function getChartInstance(chartId: string): any | undefined {
  return charts.get(chartId);
}

function exportChartToCSV(chart: any, chartId: string) {
  const data = chart.data.datasets[0].data;
  const labels = chart.data.labels;
  const rows = labels.map((label: string, i: number) => ({
    Label: label,
    Value: data[i],
  }));

  const csv = window.Papa.unparse(rows);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${chartId}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function exportChartAsImage(
  chart: any,
  chartId: string,
  format: "webp" | "svg"
) {
  const chartConfig = {
    type: chart.config.type,
    data: chart.data,
    options: chart.options,
  };

  const width = 500;
  const height = 300;

  const url = `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify(chartConfig)
  )}&width=${width}&height=${height}&format=${format}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`QuickChart.io request failed: ${response.statusText}`);
    }
    const blob = await response.blob();
    const link = document.createElement("a");
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = `${chartId}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("Failed to download chart image.", error);
  }
}

function initializeChartExport() {
  document.querySelectorAll(".chart-export-btn").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const target = event.currentTarget as HTMLElement;
      const chartId = target.dataset.chart;
      const format = target.dataset.format;

      if (!chartId || !format) {
        console.error("Error on chartId or format.");
        return;
      }

      const chart = getChartInstance(chartId);
      if (!chart) {
        console.error(`Chart instance with id ${chartId} not found.`);
        return;
      }

      if (format === "csv") {
        exportChartToCSV(chart, chartId);
      } else if (format === "webp" || format === "svg") {
        await exportChartAsImage(chart, chartId, format as "webp" | "svg");
      }
    });
  });
  exportButtonsInitialized = true;
}

function updateCharts(accidents: Accident[]) {
  // Severity Chart
  const severityCounts = [0, 0, 0, 0];
  accidents.forEach((a) => {
    const sev = parseInt(a.severity as string);
    if (sev >= 1 && sev <= 4) severityCounts[sev - 1]++;
  });

  createOrUpdateChart(
    "severityChart",
    "bar",
    {
      labels: ["1", "2", "3", "4"],
      datasets: [
        {
          label: "Number of Accidents",
          data: severityCounts,
          backgroundColor: ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2"],
        },
      ],
    },
    {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Accident Severity Distribution",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Accidents",
          },
        },
        x: {
          title: {
            display: true,
            text: "Severity Level",
          },
        },
      },
    }
  );
  const dateMap: { [key: string]: number } = {};
  accidents.forEach((a) => {
    const d = new Date(a.start_time).toLocaleDateString();
    dateMap[d] = (dateMap[d] || 0) + 1;
  });
  const trendLabels = Object.keys(dateMap).sort();
  const trendData = trendLabels.map((l) => dateMap[l]);
  createOrUpdateChart(
    "trendChart",
    "line",
    {
      labels: trendLabels,
      datasets: [
        {
          label: "Accidents",
          data: trendData,
          borderColor: "#4e79a7",
          backgroundColor: "rgba(78,121,167,0.1)",
          tension: 0.2,
        },
      ],
    },
    {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Accident Trends Over Time",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Accidents",
          },
        },
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
      },
    }
  );

  // Hour Chart
  const hourCounts = Array(24).fill(0);
  accidents.forEach((a) => {
    const hour = new Date(a.start_time).getHours();
    hourCounts[hour]++;
  });
  createOrUpdateChart(
    "hourChart",
    "bar",
    {
      labels: Array.from({ length: 24 }, (_, i) => i + ":00"),
      datasets: [
        {
          label: "Accidents",
          data: hourCounts,
          backgroundColor: "#4e79a7",
        },
      ],
    },
    {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Accidents by Hour of Day",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Accidents",
          },
        },
        x: {
          title: {
            display: true,
            text: "Hour of Day",
          },
        },
      },
    }
  );

  if (!exportButtonsInitialized) {
    initializeChartExport();
  }
}

export default updateCharts;
