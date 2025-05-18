import { Table } from "./Table";

export function Results(): HTMLElement {
  const results = document.createElement("div");
  results.id = "results";

  const resultsHeader = document.createElement("h2");
  resultsHeader.textContent = "Rezultate";
  results.appendChild(resultsHeader);

  results.appendChild(Table());

  return results;
}
