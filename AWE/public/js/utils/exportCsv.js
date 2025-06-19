import Papa from "papaparse";
import { columns } from "../types/columns.js";
export function exportAccidentsToCsv(accidents, filename = "accidents.csv") {
    // Ensure all columns are present in each row
    const data = accidents.map((accident) => {
        const row = {};
        columns.forEach((col) => {
            row[col] = accident[col] !== undefined ? accident[col] : "";
        });
        return row;
    });
    const csv = Papa.unparse(data, { columns });
    // Create a blob and trigger download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
