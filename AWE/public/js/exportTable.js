import { columns } from "./types/columns";
import Papa from "papaparse";
export function exportAccidentsToCSV(accidents) {
    if (!accidents || accidents.length === 0) {
        alert("No data to export.");
        return;
    }
    // Only export the columns defined in columns.ts
    const data = accidents.map((row) => {
        const obj = {};
        columns.forEach((col) => {
            obj[col] = row[col] !== undefined ? row[col] : "";
        });
        return obj;
    });
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "accidents.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
