import { initMap } from "./map.js";
import { displayAccidents } from "./displayAccidents.js";
import { selectedStates, selectedCities, addCity, removeCity, handleStateChange, removeState, } from "./filters.js";
import { updateSelectedStatesDisplay, updateSelectedCitiesDisplay, } from "./uiHelpers.js";
import { exportAccidentsToCSV } from "./exportTable.js";
let lastFullAccidents = [];
function pad(n) {
    return n < 10 ? "0" + n : n.toString();
}
function populateDateTimeDropdowns() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const years = [];
    for (let y = 2000; y <= currentYear; y++)
        years.push(y);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const hours = Array.from({ length: 24 }, (_, i) => pad(i));
    const minutes = Array.from({ length: 60 }, (_, i) => pad(i));
    function fill(sel, arr) {
        sel.innerHTML = arr
            .map((v) => `<option value="${pad(Number(v))}">${pad(Number(v))}</option>`)
            .join("");
    }
    fill(document.getElementById("start_day"), days);
    fill(document.getElementById("end_day"), days);
    fill(document.getElementById("start_month"), months);
    fill(document.getElementById("end_month"), months);
    fill(document.getElementById("start_year"), years);
    fill(document.getElementById("end_year"), years);
    fill(document.getElementById("start_hour"), hours);
    fill(document.getElementById("end_hour"), hours);
    fill(document.getElementById("start_minute"), minutes);
    fill(document.getElementById("end_minute"), minutes);
    document.getElementById("start_day").value = pad(now.getDate());
    document.getElementById("start_month").value = pad(now.getMonth() + 1);
    document.getElementById("start_year").value = now
        .getFullYear()
        .toString();
    document.getElementById("end_day").value = pad(now.getDate());
    document.getElementById("end_month").value = pad(now.getMonth() + 1);
    document.getElementById("end_year").value = now
        .getFullYear()
        .toString();
    document.getElementById("start_hour").value = pad(0);
    document.getElementById("start_minute").value = pad(0);
    document.getElementById("end_hour").value = pad(23);
    document.getElementById("end_minute").value = pad(59);
}
document.addEventListener("DOMContentLoaded", () => {
    initMap("map");
    populateDateTimeDropdowns();
    const stateSelect = document.getElementById("state");
    stateSelect.addEventListener("change", () => handleStateChange(updateSelectedStatesDisplay, updateSelectedCitiesDisplay));
    const cityInput = document.getElementById("city-input");
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
    const severitySlider = document.getElementById("severity");
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
        const sd = `${document.getElementById("start_year").value}-${document.getElementById("start_month").value}-${document.getElementById("start_day").value} ${document.getElementById("start_hour").value}:${document.getElementById("start_minute").value}:00`;
        const ed = `${document.getElementById("end_year").value}-${document.getElementById("end_month").value}-${document.getElementById("end_day").value} ${document.getElementById("end_hour").value}:${document.getElementById("end_minute").value}:59`;
        document.getElementById("start_date").value = sd;
        document.getElementById("end_date").value = ed;
        const startDate = sd;
        const endDate = ed;
        const severity = document.getElementById("severity")
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
            if (severity !== "0")
                queryParams.append("severity", severity);
            const response = await fetch(`/api/accidents?${queryParams.toString()}`);
            if (!response.ok)
                throw new Error("Network response was not ok");
            const accidents = await response.json();
            lastFullAccidents = Array.isArray(accidents) ? accidents : [];
            const resultsSection = document.getElementById("results");
            const chartsSection = document.getElementById("charts");
            const noResultsMessage = document.getElementById("no-results-message");
            if (accidents.length === 0) {
                if (resultsSection)
                    resultsSection.classList.add("hidden");
                if (noResultsMessage)
                    noResultsMessage.classList.remove("hidden");
                if (chartsSection)
                    chartsSection.classList.add("hidden");
                displayAccidents([]);
            }
            else {
                displayAccidents(accidents);
                if (resultsSection)
                    resultsSection.classList.remove("hidden");
                if (chartsSection)
                    chartsSection.classList.remove("hidden");
                if (noResultsMessage)
                    noResultsMessage.classList.add("hidden");
            }
        }
        catch (error) {
            console.error("Error:", error);
            alert("Error fetching accident data");
        }
    });
    const exportBtn = document.getElementById("export-button");
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            exportAccidentsToCSV(lastFullAccidents);
        });
    }
    window.removeState = (stateCode) => removeState(stateCode, updateSelectedStatesDisplay, updateSelectedCitiesDisplay);
    window.removeCity = (cityName) => removeCity(cityName, updateSelectedCitiesDisplay);
});
