import { selectedStates, selectedCities, } from "./filters.js";
export function updateSelectedStatesDisplay() {
    const statesList = document.getElementById("states-list");
    const selectedStatesDiv = document.getElementById("selected-states");
    if (selectedStates.size > 0) {
        statesList.innerHTML = "";
        selectedStates.forEach((stateCode) => {
            const stateOption = document.querySelector(`#state option[value="${stateCode}"]`);
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
    }
    else {
        selectedStatesDiv.style.display = "none";
    }
}
export function updateSelectedCitiesDisplay() {
    const citiesList = document.getElementById("cities-list");
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
