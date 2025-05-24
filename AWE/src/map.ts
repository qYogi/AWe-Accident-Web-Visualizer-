// @ts-ignore
import * as L from "https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js";
import { Accident } from "./types/types";

let map: L.Map | null = null;
let markers: L.Marker[] = [];

export function initMap(mapId: string, options?: L.MapOptions) {
  if (map) return;

  map = L.map(mapId, options);
  map.setView([37.7749, -122.4194], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
}

export function setAccidents(accidents: Accident[]) {
  if (!map) return;
  markers.forEach((marker) => marker.remove());
  markers = [];

  accidents.forEach((accident) => {
    if (accident.start_lat && accident.start_lng) {
      const marker = L.marker([
        Number(accident.start_lat),
        Number(accident.start_lng),
      ]);
      marker.addTo(map!);
      markers.push(marker);
    }
  });
}
