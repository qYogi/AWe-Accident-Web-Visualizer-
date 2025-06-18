import { setAccidents } from "./map.js";
import updateCharts from "./charts.js";
export function displayAccidents(accidents) {
    if (typeof accidents === 'object' && 'error' in accidents) {
        const tableHead = document.querySelector("#accidents-table-head");
        const tableBody = document.querySelector("#accidents-table tbody");
        if (!tableHead || !tableBody)
            return;
        tableHead.innerHTML = "";
        tableBody.innerHTML = "";
        const errorRow = document.createElement("tr");
        const errorCell = document.createElement("td");
        errorCell.colSpan = 10;
        errorCell.style.cssText = "text-align: center; color: #e15759; font-weight: bold; padding: 2rem;";
        errorCell.textContent = accidents.error;
        errorRow.appendChild(errorCell);
        tableBody.appendChild(errorRow);
        setAccidents([]);
        updateCharts([]);
        return;
    }
    if (!accidents || accidents.length === 0)
        return;
    const tableHead = document.querySelector("#accidents-table-head");
    const tableBody = document.querySelector("#accidents-table tbody");
    if (!tableHead || !tableBody)
        return;
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";
    const columns = [
        "id",
        "severity",
        "start_time",
        "end_time",
        "description",
        "street",
        "city",
        "county",
        "state",
        "country",
    ];
    const headerRow = document.createElement("tr");
    columns.forEach((column) => {
        const th = document.createElement("th");
        th.textContent = column
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
        th.setAttribute("title", th.textContent);
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);
    accidents.forEach((accident) => {
        const row = document.createElement("tr");
        columns.forEach((column) => {
            const td = document.createElement("td");
            let value = accident[column] || "";
            if (column.includes("time") && value) {
                value = new Date(value).toLocaleString();
            }
            td.textContent = value;
            td.setAttribute("title", value);
            row.appendChild(td);
        });
        tableBody.appendChild(row);
    });
    setAccidents(accidents);
    updateCharts(accidents);
}
