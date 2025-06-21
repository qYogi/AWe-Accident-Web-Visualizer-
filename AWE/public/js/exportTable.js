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
