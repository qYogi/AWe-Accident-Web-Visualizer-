import { chartData } from './charts.js';

declare const Papa: any;
declare const Chart: any;

export function exportAccidentsToCSV(
  accidents: any[],
  filename = "accidents.csv"
) {
  if (!accidents.length) {
    alert("No data to export. Please run a search first.");
    return;
  }
  const csv = Papa.unparse(accidents);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportChartDataToCSV(chartId: string) {
  const data = chartData[chartId];
  if (!data || data.length === 0) {
    alert('No data to export for this chart.');
    return;
  }

  const filename = `${chartId}.csv`;
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportChartToWebP(chartId: string, filename: string) {
  const chart = (window as any).Chart.getChart(chartId);
  if (!chart) {
    alert("Chart not found");
    return;
  }
  const dataURL = chart.canvas.toDataURL("image/webp");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportChartToSVG(chartId: string, filename: string) {
    if (typeof (window as any).C2S === 'undefined') {
        alert('SVG export library is not loaded. Please check your internet connection and try again.');
        return;
    }

    const originalChart = (window as any).Chart.getChart(chartId);
    if (!originalChart) {
      alert("Chart not found");
      return;
    }

    const { width, height } = originalChart.canvas;
    const svgContext = new (window as any).C2S(width, height);

    const tempChart = new (window as any).Chart(svgContext, {
        ...originalChart.config,
        options: {
            ...originalChart.config.options,
            animation: false,
            devicePixelRatio: 1,
        }
    });

    const svg = svgContext.getSerializedSvg();

    tempChart.destroy();

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}