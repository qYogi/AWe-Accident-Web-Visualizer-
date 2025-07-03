import type { DurationFilter, DistanceFilter, WeatherFilter, TimeOfDayFilter, DayOfWeekFilter, FilterState } from "./types/types.js";

export const selectedStates = new Set<string>();
export const selectedCities = new Set<string>();

export const filterState: FilterState = {
  duration: "all",
  distance: "all",
  weather: "all",
  timeOfDay: "all",
  dayOfWeek: "all"
};

export function setDurationFilter(duration: DurationFilter) {
  filterState.duration = duration;
}

export function getDurationFilter(): DurationFilter {
  return filterState.duration;
}

export function setDistanceFilter(distance: DistanceFilter) {
  filterState.distance = distance;
}

export function getDistanceFilter(): DistanceFilter {
  return filterState.distance;
}

export function setWeatherFilter(weather: WeatherFilter) {
  filterState.weather = weather;
}

export function getWeatherFilter(): WeatherFilter {
  return filterState.weather;
}

export function setTimeOfDayFilter(timeOfDay: TimeOfDayFilter) {
  filterState.timeOfDay = timeOfDay;
}

export function getTimeOfDayFilter(): TimeOfDayFilter {
  return filterState.timeOfDay;
}

export function setDayOfWeekFilter(dayOfWeek: DayOfWeekFilter) {
  filterState.dayOfWeek = dayOfWeek;
}

export function getDayOfWeekFilter(): DayOfWeekFilter {
  return filterState.dayOfWeek;
}

export function getAllFilters() {
  return {
    states: Array.from(selectedStates),
    cities: Array.from(selectedCities),
    duration: filterState.duration,
    distance: filterState.distance,
    weather: filterState.weather,
    timeOfDay: filterState.timeOfDay,
    dayOfWeek: filterState.dayOfWeek
  };
}

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
