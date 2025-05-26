import { initMap } from "./map.js";
import { displayAccidents } from "./displayAccidents.js";
document.addEventListener("DOMContentLoaded", () => {
    initMap("map");
    document
        .getElementById("date-form")
        ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const startDate = document.getElementById("start_date")?.value;
        const endDate = document.getElementById("end_date")
            ?.value;
        try {
<<<<<<< Updated upstream
            const response = await fetch(`/api/accidents?start_date=${startDate}&end_date=${endDate}`);
=======
            const queryParams = new URLSearchParams({
                start_date: startDate,
                end_date: endDate,
            });
            if (state && state !== "Choose a state")
                queryParams.append("state", state);
            if (severity !== "0")
                queryParams.append("severity", severity);
            const response = await fetch(`/api/accidents?${queryParams.toString()}`);
>>>>>>> Stashed changes
            if (!response.ok)
                throw new Error("Network response was not ok");
            const accidents = await response.json();
            displayAccidents(accidents);
        }
        catch (error) {
            console.error("Error:", error);
            alert("Error fetching accident data");
        }
    });
});
