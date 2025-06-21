let severityChart;
let trendChart;
let hourChart;
function updateCharts(accidents) {
    const severityCounts = [0, 0, 0, 0];
    accidents.forEach((a) => {
        const sev = parseInt(a.severity);
        if (sev >= 1 && sev <= 4)
            severityCounts[sev - 1]++;
    });
    if (!severityChart) {
        const severityCanvas = document.getElementById("severityChart");
        if (severityCanvas) {
            severityCanvas.id = "severityChart";
            severityChart = new window.Chart(severityCanvas, {
                type: "bar",
                data: {
                    labels: ["1", "2", "3", "4"],
                    datasets: [
                        {
                            label: "Number of Accidents",
                            data: severityCounts,
                            backgroundColor: ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2"],
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'Accident Severity Distribution'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Accidents'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Severity Level'
                            }
                        }
                    }
                },
            });
        }
    }
    else {
        severityChart.data.datasets[0].data = severityCounts;
        severityChart.update();
    }
    const dateMap = {};
    accidents.forEach((a) => {
        const d = new Date(a.start_time).toLocaleDateString();
        dateMap[d] = (dateMap[d] || 0) + 1;
    });
    const trendLabels = Object.keys(dateMap).sort();
    const trendData = trendLabels.map((l) => dateMap[l]);
    if (!trendChart) {
        const trendCanvas = document.getElementById("trendChart");
        if (trendCanvas) {
            trendCanvas.id = "trendChart";
            trendChart = new window.Chart(trendCanvas, {
                type: "line",
                data: {
                    labels: trendLabels,
                    datasets: [
                        {
                            label: "Accidents",
                            data: trendData,
                            borderColor: "#4e79a7",
                            backgroundColor: "rgba(78,121,167,0.1)",
                            tension: 0.2,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'Accident Trends Over Time'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Accidents'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        }
                    }
                },
            });
        }
    }
    else {
        trendChart.data.labels = trendLabels;
        trendChart.data.datasets[0].data = trendData;
        trendChart.update();
    }
    const hourCounts = Array(24).fill(0);
    accidents.forEach((a) => {
        const hour = new Date(a.start_time).getHours();
        hourCounts[hour]++;
    });
    if (!hourChart) {
        const hourCanvas = document.getElementById("hourChart");
        if (hourCanvas) {
            hourCanvas.id = "hourChart";
            hourChart = new window.Chart(hourCanvas, {
                type: "bar",
                data: {
                    labels: Array.from({ length: 24 }, (_, i) => i + ":00"),
                    datasets: [
                        {
                            label: "Accidents",
                            data: hourCounts,
                            backgroundColor: "#4e79a7",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'Accidents by Hour of Day'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Accidents'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Hour of Day'
                            }
                        }
                    }
                },
            });
        }
    }
    else {
        hourChart.data.datasets[0].data = hourCounts;
        hourChart.update();
    }
}
export default updateCharts;
