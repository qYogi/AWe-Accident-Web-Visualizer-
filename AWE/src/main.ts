import { initMap } from "./map.js";
import { displayAccidents } from "./displayAccidents.js";

document.addEventListener("DOMContentLoaded", () => {
  initMap("map");
  const severitySlider = document.getElementById(
    "severity"
  ) as HTMLInputElement;
  const severityDisplay = document.getElementById("severity-value");

  if (severitySlider && severityDisplay) {
    severityDisplay.textContent =
      severitySlider.value === "0" ? "All" : severitySlider.value;
    severitySlider.addEventListener("input", () => {
      severityDisplay.textContent =
        severitySlider.value === "0" ? "All" : severitySlider.value;
    });
  }

  document
    .getElementById("date-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const startDate = (
        document.getElementById("start_date") as HTMLInputElement
      )?.value;
      const endDate = (document.getElementById("end_date") as HTMLInputElement)
        ?.value;

      const state = (document.getElementById("state") as HTMLSelectElement)
        ?.value;
      const severity = (
        document.getElementById("severity") as HTMLSelectElement
      )?.value;

      try {
        const queryParams = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
        });

        if (state && state !== "Choose a state")
          queryParams.append("state", state);
        if (severity !== "0") queryParams.append("severity", severity);

        const response = await fetch(
          `/api/accidents?${queryParams.toString()}`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const accidents = await response.json();

        const resultsSection = document.getElementById("results");
        const chartsSection = document.getElementById("charts");
        const noResultsMessage = document.getElementById("no-results-message");

        if (accidents.length === 0) {
          if (resultsSection) resultsSection.classList.add("hidden");
          if (noResultsMessage) noResultsMessage.classList.remove("hidden");
          if (chartsSection) chartsSection.classList.add("hidden");
          displayAccidents([]);
        } else {
          displayAccidents(accidents);
          if (resultsSection) resultsSection.classList.remove("hidden");
          if (chartsSection) chartsSection.classList.remove("hidden");
          if (noResultsMessage) noResultsMessage.classList.add("hidden");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error fetching accident data");
      }
    });
});
