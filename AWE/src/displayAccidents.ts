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

  // Set a max width for the table to prevent expanding too wide
  const table = document.getElementById("accidents-table");
  if (table) {
    table.style.width = "100%";
  }

  const flagColumns = [
    "amenity",
    "bump",
    "crossing",
    "give_way",
    "junction",
    "no_exit",
    "railway",
    "roundabout",
    "station",
    "stop",
    "traffic_calming",
    "traffic_signal",
    "turning_loop",
  ];

  const firstAccident = accidents[0];
  let columns = Object.keys(firstAccident).filter(
    (col) => !flagColumns.includes(col.toLowerCase()),
  );

  const hasFlags = flagColumns.some((flag) =>
    Object.keys(firstAccident).some((col) => col.toLowerCase() === flag),
  );

  if (hasFlags) columns.push("flags");

  const headerRow = document.createElement("tr");
  columns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent =
      column === "flags"
        ? "Flags"
        : column
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    
    // Add title attribute for tooltip on hover
    th.setAttribute("title", th.textContent);
    headerRow.appendChild(th);
  });
  tableHead.appendChild(headerRow);

  accidents.forEach((accident) => {
    const row = document.createElement("tr");

    columns.forEach((column) => {
      const td = document.createElement("td");

      if (column === "flags") {
        const flagsText = extractActiveFlags(accident, flagColumns).join(", ");
        td.textContent = flagsText;
        td.setAttribute("title", flagsText);
      } else {
        let value = accident[column as keyof Accident] || "";
        if (column.includes("time") && value) {
          value = new Date(value as string).toLocaleString();
        }
        
        // Add title attribute for full text on hover
        td.textContent = value as string;
        td.setAttribute("title", value as string);
      }

      row.appendChild(td);
    });

    tableBody.appendChild(row);
  });

  setAccidents(accidents);
}
