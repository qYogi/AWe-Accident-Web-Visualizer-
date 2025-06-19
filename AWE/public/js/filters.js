export const selectedStates = new Set();
export const selectedCities = new Set();
export function addCity(cityName, updateSelectedCitiesDisplay) {
    if (cityName.trim() && !selectedCities.has(cityName.trim())) {
        selectedCities.add(cityName.trim());
        updateSelectedCitiesDisplay();
    }
}
export function removeCity(cityName, updateSelectedCitiesDisplay) {
    selectedCities.delete(cityName);
    updateSelectedCitiesDisplay();
}
export function handleStateChange(updateSelectedStatesDisplay, updateSelectedCitiesDisplay) {
    const stateSelect = document.getElementById("state");
    const cityInputSection = document.getElementById("city-input-section");
    if (stateSelect.value && !selectedStates.has(stateSelect.value)) {
        selectedStates.add(stateSelect.value);
        updateSelectedStatesDisplay();
        cityInputSection.style.display = "block";
    }
    stateSelect.value = "";
}
export function removeState(stateCode, updateSelectedStatesDisplay, updateSelectedCitiesDisplay) {
    selectedStates.delete(stateCode);
    updateSelectedStatesDisplay();
    if (selectedStates.size === 0) {
        const cityInputSection = document.getElementById("city-input-section");
        cityInputSection.style.display = "none";
        selectedCities.clear();
        updateSelectedCitiesDisplay();
    }
}
