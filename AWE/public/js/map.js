// @ts-ignore
import * as L from "https://esm.sh/leaflet@1.9.4";
let map = null;
let markers = [];
export function initMap(mapId, options) {
    if (map)
        return;
    map = L.map(mapId, options);
    map.setView([39.82, -98.58], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
}
export function setAccidents(accidents) {
    if (!map)
        return;
    markers.forEach((marker) => marker.remove());
    markers = [];
    accidents.forEach((accident) => {
        if (accident.start_lat && accident.start_lng) {
            const marker = L.marker([
                Number(accident.start_lat),
                Number(accident.start_lng),
            ]);
            marker.addTo(map);
            markers.push(marker);
        }
    });
}
