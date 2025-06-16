import { setAccidents } from "./map.js";
export function displayAccidents(accidents) {
    if (!accidents || accidents.length === 0)
        return;
    const tableHead = document.querySelector("#accidents-table-head");
    const tableBody = document.querySelector("#accidents-table tbody");
    if (!tableHead || !tableBody)
        return;
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";
    let message = document.getElementById("accidents-table-message");
    if (!message) {
        message = document.createElement("div");
        message.id = "accidents-table-message";
        tableHead.parentElement?.insertBefore(message, tableHead);
    }
    message.textContent = "For the full table, please download it.";
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
}
