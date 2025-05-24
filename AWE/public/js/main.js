document.getElementById('date-form').addEventListener('submit', async (e) => {
    e.preventDefault();
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
    }
});

function displayAccidents(accidents) {
    const tableBody = document.querySelector('#accidents-table tbody');
    tableBody.innerHTML = '';
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
        `;
        tableBody.appendChild(row);
    });
} 