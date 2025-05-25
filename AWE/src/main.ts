import { initMap } from "./map.js";
import { displayAccidents } from "./displayAccidents.js";

document.addEventListener("DOMContentLoaded", () => {
  initMap("map");

  document
    .getElementById("date-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const startDate = (
        document.getElementById("start_date") as HTMLInputElement
      )?.value;
      const endDate = (document.getElementById("end_date") as HTMLInputElement)
        ?.value;

      try {
        const response = await fetch(
          `/api/accidents?start_date=${startDate}&end_date=${endDate}`,
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const accidents = await response.json();
        displayAccidents(accidents);
      } catch (error) {
        console.error("Error:", error);
        alert("Error fetching accident data");
      }
    });
});
