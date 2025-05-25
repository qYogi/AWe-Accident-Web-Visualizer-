import { initMap, setAccidents } from "./map.js";

//variabila pentru numarul de randuri
let rowCount = 0;

const searchButton = document.querySelector('#date-form button');
const originalButtonHTML = searchButton.innerHTML;

function showLoading() {
    searchButton.disabled = true;
    searchButton.innerHTML = '<span class="loader"></span>';
}

function hideLoading() {
    searchButton.disabled = false;
    searchButton.innerHTML = originalButtonHTML;
}

document.addEventListener("DOMContentLoaded", () => {
    initMap("map");
    document.getElementById('date-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        const startDate = document.getElementById('start_date').value;
        const endDate = document.getElementById('end_date').value;
        try {
            const response = await fetch(`/api/accidents?start_date=${startDate}&end_date=${endDate}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const accidents = await response.json();
            displayAccidents(accidents);
        } catch (error) {
            console.error('Error:', error);
            alert('Error fetching accident data');
        } finally {
            hideLoading();
        }
    });

    document.getElementById('start_date').addEventListener('change', function() {
        const startDate = this.value;
        const endDateInput = document.getElementById('end_date');
        endDateInput.min = startDate;
        if (endDateInput.value < startDate) {
            endDateInput.value = startDate;
        }
        endDateInput.focus();
    });
});

function displayAccidents(accidents) {
    const tableBody = document.querySelector('#accidents-table tbody');
    tableBody.innerHTML = '';
    rowCount = accidents.length >>> 0; 
    accidents.forEach(accident => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${accident.id || ''}</td>
            <td>${accident.source || ''}</td>
            <td>${accident.severity || ''}</td>
            <td>${accident.start_time ? new Date(accident.start_time).toLocaleString() : ''}</td>
            <td>${accident.end_time ? new Date(accident.end_time).toLocaleString() : ''}</td>
            <td>${accident.start_lat || ''}</td>
            <td>${accident.start_lng || ''}</td>
            <td>${accident.end_lat || ''}</td>
            <td>${accident.end_lng || ''}</td>
            <td>${accident.distance_mi || ''}</td>
            <td>${accident.description || ''}</td>
            <td>${accident.street || ''}</td>
            <td>${accident.city || ''}</td>
            <td>${accident.county || ''}</td>
            <td>${accident.state || ''}</td>
            <td>${accident.zipcode || ''}</td>
            <td>${accident.country || ''}</td>
            <td>${accident.timezone || ''}</td>
            <td>${accident.airport_code || ''}</td>
            <td>${accident.weather_timestamp ? new Date(accident.weather_timestamp).toLocaleString() : ''}</td>
            <td>${accident.temperature_f || ''}</td>
            <td>${accident.wind_chill_f || ''}</td>
            <td>${accident.humidity_percent || ''}</td>
            <td>${accident.pressure_in || ''}</td>
            <td>${accident.visibility_mi || ''}</td>
            <td>${accident.wind_direction || ''}</td>
            <td>${accident.wind_speed_mph || ''}</td>
            <td>${accident.precipitation_in || ''}</td>
            <td>${accident.weather_condition || ''}</td>
            <td>${accident.amenity ? 'Yes' : 'No'}</td>
            <td>${accident.bump ? 'Yes' : 'No'}</td>
            <td>${accident.crossing ? 'Yes' : 'No'}</td>
            <td>${accident.give_way ? 'Yes' : 'No'}</td>
            <td>${accident.junction ? 'Yes' : 'No'}</td>
            <td>${accident.no_exit ? 'Yes' : 'No'}</td>
            <td>${accident.railway ? 'Yes' : 'No'}</td>
            <td>${accident.roundabout ? 'Yes' : 'No'}</td>
            <td>${accident.station ? 'Yes' : 'No'}</td>
            <td>${accident.stop ? 'Yes' : 'No'}</td>
            <td>${accident.traffic_calming ? 'Yes' : 'No'}</td>
            <td>${accident.traffic_signal ? 'Yes' : 'No'}</td>
            <td>${accident.turning_loop ? 'Yes' : 'No'}</td>
            <td>${accident.sunrise_sunset || ''}</td>
            <td>${accident.civil_twilight || ''}</td>
            <td>${accident.nautical_twilight || ''}</td>
            <td>${accident.astronomical_twilight || ''}</td>
        `;
        tableBody.appendChild(row);
    });
    setAccidents(accidents);
}
