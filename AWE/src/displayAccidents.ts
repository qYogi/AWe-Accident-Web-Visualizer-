import type { Accident } from "./types/types.js";
import { setAccidents } from "./map.js";
import updateCharts from "./charts.js";
import { tableSorter } from "./tableSorting.js";

export interface AccidentsResponse {
  accidents: Accident[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  error: string;
  missingCities?: string[];
}

export function displayAccidents(response: AccidentsResponse | ErrorResponse) {
  if ("error" in response) {
    const tableHead = document.querySelector("#accidents-table-head");
    const tableBody = document.querySelector("#accidents-table tbody");
    if (!tableHead || !tableBody) return;

    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    const errorRow = document.createElement("tr");
    const errorCell = document.createElement("td");
    errorCell.colSpan = 10;
    errorCell.style.cssText =
      "text-align: center; color: #e15759; font-weight: bold; padding: 2rem;";
    errorCell.textContent = response.error;
    errorRow.appendChild(errorCell);
    tableBody.appendChild(errorRow);

    const paginationContainer = document.getElementById("pagination-controls");
    if (paginationContainer) paginationContainer.innerHTML = "";

    setAccidents([]);
    updateCharts([]);
    return;
  }

  const { accidents } = response;

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

  tableSorter.setData(accidents);
  tableSorter.createSortableHeaders();

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
  updateCharts(accidents);
}

export function createPagination(
  paginationContainer: HTMLElement,
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
) {
  paginationContainer.innerHTML = "";
  if (totalPages <= 1) return;

  const select = document.createElement("select");
  select.className = "pagination-select";
  for (let i = 1; i <= totalPages; i++) {
    const option = document.createElement("option");
    option.value = i.toString();
    option.textContent = `Page ${i} of ${totalPages}`;
    if (i === currentPage) {
      option.selected = true;
    }
    select.appendChild(option);
  }

  select.addEventListener("change", (e) => {
    const newPage = parseInt((e.target as HTMLSelectElement).value, 10);
    onPageChange(newPage);
  });

  const label = document.createElement("label");
  label.textContent = "Go to page: ";
  label.appendChild(select);

  paginationContainer.appendChild(label);
}
