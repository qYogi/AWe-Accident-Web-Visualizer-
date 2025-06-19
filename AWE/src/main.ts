import { initMap } from "./map.js";
import { displayAccidents } from "./displayAccidents.js";

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

const selectedStates = new Set<string>();
const selectedCities = new Set<string>();

function updateSelectedStatesDisplay() {
  const statesList = document.getElementById("states-list") as HTMLDivElement;
  const selectedStatesDiv = document.getElementById(
    "selected-states"
  ) as HTMLDivElement;

  if (selectedStates.size > 0) {
    statesList.innerHTML = "";
    selectedStates.forEach((stateCode) => {
      const stateOption = document.querySelector(
        `#state option[value="${stateCode}"]`
      ) as HTMLOptionElement;
      const stateName = stateOption ? stateOption.textContent : stateCode;

      const stateTag = document.createElement("div");
      stateTag.style.cssText =
        "background: #4e79a7; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; display: flex; align-items: center; gap: 0.5rem;";
      stateTag.innerHTML = `
        <span>✓ ${stateName}</span>
        <button type="button" onclick="removeState('${stateCode}')" style="background: none; border: none; color: white; cursor: pointer; font-weight: bold;">×</button>
      `;
      statesList.appendChild(stateTag);
    });
    selectedStatesDiv.style.display = "block";
  } else {
    selectedStatesDiv.style.display = "none";
  }
}

function updateSelectedCitiesDisplay() {
  const citiesList = document.getElementById("cities-list") as HTMLDivElement;

  citiesList.innerHTML = "";
  selectedCities.forEach((city) => {
    const cityTag = document.createElement("div");
    cityTag.style.cssText =
      "background: #f28e2b; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; display: flex; align-items: center; gap: 0.5rem;";
    cityTag.innerHTML = `
      <span>${city}</span>
      <button type="button" onclick="removeCity('${city}')" style="background: none; border: none; color: white; cursor: pointer; font-weight: bold;">×</button>
    `;
    citiesList.appendChild(cityTag);
  });
}

function handleStateChange() {
  const stateSelect = document.getElementById("state") as HTMLSelectElement;
  const cityInputSection = document.getElementById(
    "city-input-section"
  ) as HTMLDivElement;

  if (stateSelect.value && !selectedStates.has(stateSelect.value)) {
    selectedStates.add(stateSelect.value);
    updateSelectedStatesDisplay();
    cityInputSection.style.display = "block";
  }

  stateSelect.value = "";
}

function addCity(cityName: string) {
  if (cityName.trim() && !selectedCities.has(cityName.trim())) {
    selectedCities.add(cityName.trim());
    updateSelectedCitiesDisplay();
  }
}

function removeState(stateCode: string) {
  selectedStates.delete(stateCode);
  updateSelectedStatesDisplay();

  if (selectedStates.size === 0) {
    const cityInputSection = document.getElementById(
      "city-input-section"
    ) as HTMLDivElement;
    cityInputSection.style.display = "none";
    selectedCities.clear();
    updateSelectedCitiesDisplay();
  }
}

function removeCity(cityName: string) {
  selectedCities.delete(cityName);
  updateSelectedCitiesDisplay();
}

document.addEventListener("DOMContentLoaded", () => {
  initMap("map");
  populateDateTimeDropdowns();

  const stateSelect = document.getElementById("state") as HTMLSelectElement;
  stateSelect.addEventListener("change", handleStateChange);

  const cityInput = document.getElementById("city-input") as HTMLInputElement;
  cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const cityName = cityInput.value.trim();
      if (cityName) {
        addCity(cityName);
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

      const sd = `${
        (document.getElementById("start_year") as HTMLSelectElement).value
      }-${
        (document.getElementById("start_month") as HTMLSelectElement).value
      }-${(document.getElementById("start_day") as HTMLSelectElement).value} ${
        (document.getElementById("start_hour") as HTMLSelectElement).value
      }:${
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
        });

        if (selectedStates.size > 0) {
          selectedStates.forEach((state) => queryParams.append("state", state));
        }

        if (selectedCities.size > 0) {
          selectedCities.forEach((city) => queryParams.append("city", city));
        }

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

(window as any).removeState = removeState;
(window as any).removeCity = removeCity;
