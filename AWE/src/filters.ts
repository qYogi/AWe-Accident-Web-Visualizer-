export const selectedStates = new Set<string>();
export const selectedCities = new Set<string>();

export function addCity(
  cityName: string,
  updateSelectedCitiesDisplay: () => void
) {
  if (cityName.trim() && !selectedCities.has(cityName.trim())) {
    selectedCities.add(cityName.trim());
    updateSelectedCitiesDisplay();
  }
}

export function removeCity(
  cityName: string,
  updateSelectedCitiesDisplay: () => void
) {
  selectedCities.delete(cityName);
  updateSelectedCitiesDisplay();
}

export function handleStateChange(
  updateSelectedStatesDisplay: () => void,
  _updateSelectedCitiesDisplay: () => void
) {
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

export function removeState(
  stateCode: string,
  updateSelectedStatesDisplay: () => void,
  updateSelectedCitiesDisplay: () => void
) {
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
