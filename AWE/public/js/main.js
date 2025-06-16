import { initMap } from "./map.js";
import { displayAccidents } from "./displayAccidents.js";
import { updateCharts } from "../charts.js";

document.addEventListener("DOMContentLoaded", () => {
    initMap("map");
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
        const startDate = document.getElementById("start_date")?.value;
        const endDate = document.getElementById("end_date")
            ?.value;
        const state = document.getElementById("state")
            ?.value;
        const severity = document.getElementById("severity")?.value;
        try {
            const queryParams = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
            });
            if (state && state !== "Choose a state")
                queryParams.append("state", state);
            if (severity !== "0")
                queryParams.append("severity", severity);
            const response = await fetch(`/api/accidents?${queryParams.toString()}`);
            if (!response.ok)
                throw new Error("Network response was not ok");
            const accidents = await response.json();
            displayAccidents(accidents);
            updateCharts(accidents);
        }
        catch (error) {
            console.error("Error:", error);
            alert("Error fetching accident data");
        }
    });
});
