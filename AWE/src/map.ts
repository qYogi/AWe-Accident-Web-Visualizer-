// @ts-ignore
import * as L from "https://esm.sh/leaflet@1.9.4";
import { Accident } from "./types/types";

let map: L.Map | null = null;
let markers: L.Marker[] = [];

export function initMap(mapId: string, options?: L.MapOptions) {
  if (map) return;

  map = L.map(mapId, options);
  map.setView([39.82, -98.58], 5);

  L.tileLayer("https://.tile.openstreetmap.org/{z}/{x}/{y}.png", {
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
