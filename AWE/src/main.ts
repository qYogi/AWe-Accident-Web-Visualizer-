import { initMap } from "./map.js";
import { displayAccidents, createPagination } from "./displayAccidents.js";
import type { AccidentsResponse, ErrorResponse } from "./displayAccidents.js";
import {
  selectedStates,
  selectedCities,
  addCity,
  removeCity,
  handleStateChange,
  removeState,
} from "./filters.js";
import {
  updateSelectedStatesDisplay,
  updateSelectedCitiesDisplay,
} from "./uiHelpers.js";
import { exportAccidentsToCSV } from "./exportTable.js";
import updateCharts from "./charts.js";
import type { Accident } from "./types/types.js";

let lastFullAccidents: any[] = [];
let currentPage = 1;

function pad(n: number): string {
  return n < 10 ? "0" + n : n.toString();
}

function populateDateTimeDropdowns() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const years: number[] = [];
  for (let y = 2000; y <= currentYear; y++) years.push(y);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => pad(i));
  const minutes = Array.from({ length: 60 }, (_, i) => pad(i));

  function fill(sel: HTMLSelectElement, arr: (number | string)[]) {
    sel.innerHTML = arr
      .map(
        (v) => `<option value="${pad(Number(v))}">${pad(Number(v))}</option>`
      )
      .join("");
  }
  fill(document.getElementById("start_day") as HTMLSelectElement, days);
  fill(document.getElementById("end_day") as HTMLSelectElement, days);
  fill(document.getElementById("start_month") as HTMLSelectElement, months);
  fill(document.getElementById("end_month") as HTMLSelectElement, months);
  fill(document.getElementById("start_year") as HTMLSelectElement, years);
  fill(document.getElementById("end_year") as HTMLSelectElement, years);
  fill(document.getElementById("start_hour") as HTMLSelectElement, hours);
  fill(document.getElementById("end_hour") as HTMLSelectElement, hours);
  fill(document.getElementById("start_minute") as HTMLSelectElement, minutes);
  fill(document.getElementById("end_minute") as HTMLSelectElement, minutes);

  (document.getElementById("start_day") as HTMLSelectElement).value = pad(
    now.getDate()
  );
  (document.getElementById("start_month") as HTMLSelectElement).value = pad(
    now.getMonth() + 1
  );
  (document.getElementById("start_year") as HTMLSelectElement).value = now
    .getFullYear()
    .toString();
  (document.getElementById("end_day") as HTMLSelectElement).value = pad(
    now.getDate()
  );
  (document.getElementById("end_month") as HTMLSelectElement).value = pad(
    now.getMonth() + 1
  );
  (document.getElementById("end_year") as HTMLSelectElement).value = now
    .getFullYear()
    .toString();
  (document.getElementById("start_hour") as HTMLSelectElement).value = pad(0);
  (document.getElementById("start_minute") as HTMLSelectElement).value = pad(0);
  (document.getElementById("end_hour") as HTMLSelectElement).value = pad(23);
  (document.getElementById("end_minute") as HTMLSelectElement).value = pad(59);
}

async function fetchAndDisplayAccidents(page: number) {
  currentPage = page;

  const sd = `${
    (document.getElementById("start_year") as HTMLSelectElement).value
  }-${(document.getElementById("start_month") as HTMLSelectElement).value}-${
    (document.getElementById("start_day") as HTMLSelectElement).value
  } ${(document.getElementById("start_hour") as HTMLSelectElement).value}:${
    (document.getElementById("start_minute") as HTMLSelectElement).value
  }:00`;
  const ed = `${
    (document.getElementById("end_year") as HTMLSelectElement).value
  }-${(document.getElementById("end_month") as HTMLSelectElement).value}-${
    (document.getElementById("end_day") as HTMLSelectElement).value
  } ${(document.getElementById("end_hour") as HTMLSelectElement).value}:${
    (document.getElementById("end_minute") as HTMLSelectElement).value
  }:59`;
  (document.getElementById("start_date") as HTMLInputElement).value = sd;
  (document.getElementById("end_date") as HTMLInputElement).value = ed;

  const startDate = sd;
  const endDate = ed;
  const severity = (document.getElementById("severity") as HTMLInputElement)
    ?.value;

  try {
    const queryParams = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      page: currentPage.toString(),
    });

    if (selectedStates.size > 0) {
      selectedStates.forEach((state) => queryParams.append("state", state));
    }

    if (selectedCities.size > 0) {
      selectedCities.forEach((city) => queryParams.append("city", city));
    }

    if (severity !== "0") queryParams.append("severity", severity);

    const accidentsPromise = fetch(
      `/api/accidents?${queryParams.toString()}`
    ).then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    });

    const chartsPromise = fetch(
      `/api/accidents/for-charts?${queryParams.toString()}`
    ).then((res) => {
      if (!res.ok) throw new Error("Chart data fetch failed");
      return res.json();
    });

    const [accidentsData, chartsData] = await Promise.all([
      accidentsPromise,
      chartsPromise,
    ]);

    const data: AccidentsResponse | ErrorResponse = accidentsData;
    const fullAccidentsForCharts: Accident[] = chartsData;

    const resultsSection = document.getElementById("results");
    const chartsSection = document.getElementById("charts");
    const noResultsMessage = document.getElementById("no-results-message");

    if ("error" in data) {
      displayAccidents(data);
      if (resultsSection) resultsSection.classList.remove("hidden");
      if (noResultsMessage) noResultsMessage.classList.add("hidden");
      if (chartsSection) chartsSection.classList.add("hidden");
      updateCharts([]);
      return;
    }

    lastFullAccidents = data.accidents;

    if (data.total === 0) {
      if (resultsSection) resultsSection.classList.add("hidden");
      if (noResultsMessage) noResultsMessage.classList.remove("hidden");
      if (chartsSection) chartsSection.classList.add("hidden");
      displayAccidents({ accidents: [], total: 0, page: 1, limit: 10 });
      updateCharts([]);
    } else {
      displayAccidents(data);
      updateCharts(fullAccidentsForCharts);
      if (resultsSection) resultsSection.classList.remove("hidden");
      if (chartsSection) chartsSection.classList.remove("hidden");
      if (noResultsMessage) noResultsMessage.classList.add("hidden");

      const paginationContainer = document.getElementById(
        "pagination-controls"
      );
      if (paginationContainer) {
        const totalPages = Math.ceil(data.total / data.limit);
        createPagination(
          paginationContainer,
          currentPage,
          totalPages,
          (newPage) => {
            fetchAndDisplayAccidents(newPage);
          }
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error fetching accident data");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    initMap("map");
  }, 50);
  populateDateTimeDropdowns();

  const stateSelect = document.getElementById("state") as HTMLSelectElement;
  stateSelect.addEventListener("change", () =>
    handleStateChange(updateSelectedStatesDisplay, updateSelectedCitiesDisplay)
  );

  const cityInput = document.getElementById("city-input") as HTMLInputElement;
  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const cityName = cityInput.value.trim();
      if (cityName) {
        addCity(cityName, updateSelectedCitiesDisplay);
        cityInput.value = "";
      }
    }
  });

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

      const searchButton = document.getElementById(
        "search-button"
      ) as HTMLButtonElement;
      const headerContent = document.getElementById("header-content");
      const loadingAnimation = document.getElementById("loading-animation");

      if (searchButton.disabled) {
        return;
      }

      searchButton.disabled = true;
      headerContent?.classList.add("hidden");
      loadingAnimation?.classList.remove("hidden");

      try {
        await fetchAndDisplayAccidents(1);
      } catch (error) {
        console.error("Failed to fetch or display accidents", error);
        alert("An error occurred. Please try again.");
      } finally {
        searchButton.disabled = false;
        headerContent?.classList.remove("hidden");
        loadingAnimation?.classList.add("hidden");
      }
    });

  const exportBtn = document.getElementById("export-button");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      exportAccidentsToCSV(lastFullAccidents);
    });
  }

  (window as any).removeState = (stateCode: string) =>
    removeState(
      stateCode,
      updateSelectedStatesDisplay,
      updateSelectedCitiesDisplay
    );
  (window as any).removeCity = (cityName: string) =>
    removeCity(cityName, updateSelectedCitiesDisplay);
});
