import { chartData } from './charts.js';
export function exportAccidentsToCSV(accidents, filename = "accidents.csv") {
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
export function exportChartDataToCSV(chartId) {
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
export function exportChartToWebP(chartId, filename) {
    const chart = window.Chart.getChart(chartId);
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
export function exportChartToSVG(chartId, filename) {
    // Verifică biblioteca
    if (typeof window.C2S === 'undefined') {
        alert('Biblioteca SVG nu este încărcată. Verifică conexiunea la internet sau includerea scriptului.');
        return;
    }
    // Obține graficul original
    const originalChart = window.Chart.getChart(chartId);
    if (!originalChart) {
        alert('Graficul nu a fost găsit. Verifică ID-ul transmis.');
        return;
    }
    const { width, height } = originalChart.canvas;
    const svgContext = new window.C2S(width, height);
    try {
        // Creează graficul temporar
        const tempChart = new window.Chart(svgContext, {
            ...originalChart.config,
            options: {
                ...originalChart.config.options,
                animation: false,
                devicePixelRatio: 1,
            }
        });
        // Așteaptă un moment pentru randare
        setTimeout(() => {
            const svg = svgContext.getSerializedSvg();
            console.log('Conținut SVG:', svg); // Verifică ce s-a generat
            tempChart.destroy();
            // Verifică dacă SVG-ul conține ceva util
            if (svg && svg.includes('<g')) {
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
            else {
                alert('Exportul SVG a eșuat. Graficul nu s-a randat corect.');
            }
        }, 100); // Ajustează delay-ul dacă e necesar
    }
    catch (error) {
        console.error('Eroare la export SVG:', error);
        alert('A apărut o eroare la exportul graficului în SVG.');
    }
}
