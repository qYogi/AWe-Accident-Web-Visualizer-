// @ts-ignore
// import * as L from "https://esm.sh/leaflet@1.9.4";
import { Accident } from "./types/types";

let map: any = null;
let markers: any[] = [];

async function loadLeaflet() {
  if (!window.L) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Leaflet.js"));
      document.head.appendChild(script);
    });
  }
}

export async function initMap(mapId: string, options?: any) {
  await loadLeaflet();
  if (map) return;

  map = window.L.map(mapId, options);
  map.setView([39.82, -98.58], 5);

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
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
      const marker = window.L.marker([
        Number(accident.start_lat),
        Number(accident.start_lng),
      ]);
      marker.addTo(map!);
      markers.push(marker);
    }
  });
}
