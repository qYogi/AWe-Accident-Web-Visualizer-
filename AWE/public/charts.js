let severityChart, trendChart, hourChart;

export function updateCharts(accidents) {
  const severityCounts = [0, 0, 0, 0];
  accidents.forEach(a => {
    const sev = parseInt(a.severity);
    if (sev >= 1 && sev <= 4) severityCounts[sev - 1]++;
  });
  if (!severityChart) {
    severityChart = new Chart(document.getElementById('severityChart'), {
      type: 'bar',
      data: {
        labels: ['1', '2', '3', '4'],
        datasets: [{
          label: 'Number of Accidents',
          data: severityCounts,
          backgroundColor: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2']
        }]
      },
      options: {responsive: true, plugins: {legend: {display: false}}}
    });
  } else {
    severityChart.data.datasets[0].data = severityCounts;
    severityChart.update();
  }

  const dateMap = {};
  accidents.forEach(a => {
    const d = new Date(a.start_time).toLocaleDateString();
    dateMap[d] = (dateMap[d] || 0) + 1;
  });
  const trendLabels = Object.keys(dateMap).sort();
  const trendData = trendLabels.map(l => dateMap[l]);
  if (!trendChart) {
    trendChart = new Chart(document.getElementById('trendChart'), {
      type: 'line',
      data: {
        labels: trendLabels,
        datasets: [{
          label: 'Accidents',
          data: trendData,
          borderColor: '#4e79a7',
          backgroundColor: 'rgba(78,121,167,0.1)',
          tension: 0.2
        }]
      },
      options: {responsive: true, plugins: {legend: {display: false}}}
    });
  } else {
    trendChart.data.labels = trendLabels;
    trendChart.data.datasets[0].data = trendData;
    trendChart.update();
  }

  const hourCounts = Array(24).fill(0);
  accidents.forEach(a => {
    const hour = new Date(a.start_time).getHours();
    hourCounts[hour]++;
  });
  if (!hourChart) {
    hourChart = new Chart(document.getElementById('hourChart'), {
      type: 'bar',
      data: {
        labels: Array.from({length: 24}, (_, i) => i + ':00'),
        datasets: [{
          label: 'Accidents',
          data: hourCounts,
          backgroundColor: '#4e79a7'
        }]
      },
      options: {responsive: true, plugins: {legend: {display: false}}}
    });
  } else {
    hourChart.data.datasets[0].data = hourCounts;
    hourChart.update();
  }
} 