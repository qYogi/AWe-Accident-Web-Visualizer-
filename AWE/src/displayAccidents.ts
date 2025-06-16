import type { Accident } from "./types/types.js";
import { extractActiveFlags } from "./utils/flags.js";
import { setAccidents } from "./map.js";

export function displayAccidents(accidents: Accident[]) {
  if (!accidents || accidents.length === 0) return;

  const tableHead = document.querySelector("#accidents-table-head");
  const tableBody = document.querySelector("#accidents-table tbody");
  if (!tableHead || !tableBody) return;

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
      let value = accident[column as keyof Accident] || "";
      if (column.includes("time") && value) {
        value = new Date(value as string).toLocaleString();
      }
      td.textContent = value as string;
      td.setAttribute("title", value as string);
      row.appendChild(td);
    });
    tableBody.appendChild(row);
  });

  setAccidents(accidents);
}
