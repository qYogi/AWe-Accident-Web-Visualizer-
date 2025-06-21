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

export async function exportChartToWebP(
  chartId: string,
  filename = "chart.webp"
) {
  try {
    const chart = Chart.getChart(chartId);
    if (!chart) {
      alert("No chart found to export.");
      return;
    }

    const canvas = chart.canvas;
    const dataURL = canvas.toDataURL('image/webp', 0.9);
    
    const response = await fetch(dataURL);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting WebP:", error);
    alert("Failed to export WebP chart. Please try again.");
  }
}

export async function exportChartToSVG(
  chartId: string,
  filename = "chart.svg"
) {
  try {
    const chart = Chart.getChart(chartId);
    if (!chart) {
      alert("No chart found to export.");
      return;
    }


    const svgString = chart.toBase64Image('image/svg+xml');
    
    const byteCharacters = atob(svgString.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/svg+xml' });
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting SVG:", error);
    alert("Failed to export SVG chart. Please try again.");
  }
}

export function setExportButtonLoading(buttonId: string, isLoading: boolean) {
  const button = document.getElementById(buttonId) as HTMLButtonElement;
  if (!button) return;

  if (isLoading) {
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span>Exporting...';
  } else {
    button.disabled = false;
    button.innerHTML = button.getAttribute('data-original-text') || 'Export';
  }
}

export function initializeExportButtons() {
  const buttons = ['export-csv-button', 'export-webp-button', 'export-svg-button'];
  
  buttons.forEach(buttonId => {
    const button = document.getElementById(buttonId) as HTMLButtonElement;
    if (button) {
      button.setAttribute('data-original-text', button.textContent || 'Export');
    }
  });
}
