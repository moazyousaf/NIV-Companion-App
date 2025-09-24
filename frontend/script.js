// Tab switching functionality
function switchTab(tabName) {
  // Hide all tab contents
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach((content) => content.classList.remove('active'));

  // Remove active class from all buttons
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach((button) => button.classList.remove('active'));

  // Show selected tab and mark button as active
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');

  // Initialize chart if trends tab is selected
  if (tabName === 'trends' && currentPatientId && currentPatientId !== 'demo') {
    load7DayTrends(currentPatientId);
  }
}

// Demo data and functionality
const demoData = {
  usage_hours: 7.2,
  oxygen_avg: 94,
  mask_leak: 17.5,
  resp_rate: 16,
  tidal_volume: 480,
  minute_ventilation: 7.68,
  insp_pressure: 16,
  exp_pressure: 4,
  therapy_score: 85,
};

// Update dashboard with demo data
function updateDashboard() {
  document.getElementById('therapyScore').textContent =
    computeIntelligentScore(demoData);
  document.getElementById('usageHours').textContent = demoData.usage_hours;
  document.getElementById('oxygenLevel').textContent =
    demoData.oxygen_avg + '%';
  document.getElementById('maskLeak').textContent = demoData.mask_leak
    ? 'Leak Detected'
    : 'Good';
  document.getElementById('respRate').textContent = demoData.resp_rate;
  document.getElementById('tidalVolume').textContent = demoData.tidal_volume;
}

// Compute intelligent therapy score (matching your algorithm)
function computeIntelligentScore(data) {
  const usageWeight = 0.25;
  const oxygenWeight = 0.25;
  const leakWeight = 0.15;
  const respWeight = 0.15;
  const pressureWeight = 0.2; // new weight for pressures

  const usageScore = Math.min(data.usage_hours / 8, 1);
  const oxygenScore = Math.min((data.oxygen_avg - 88) / 12, 1);
  const leakScore = data.mask_leak ? 0.5 : 1;
  const respScore = data.resp_rate >= 12 && data.resp_rate <= 20 ? 1 : 0.5;

  // Example scoring for pressures (adjust ranges as needed)
  const idealIPAP = 15; // example ideal
  const idealEPAP = 5;
  const ipapScore =
    1 - Math.min(Math.abs(data.insp_pressure - idealIPAP) / 10, 1);
  const epapScore =
    1 - Math.min(Math.abs(data.exp_pressure - idealEPAP) / 5, 1);
  const pressureScore = (ipapScore + epapScore) / 2;

  return Math.round(
    100 *
      (usageScore * usageWeight +
        oxygenScore * oxygenWeight +
        leakScore * leakWeight +
        respScore * respWeight +
        pressureScore * pressureWeight)
  );
}

// Trends chart
let trendsChart = null;

function initTrendsChart(
  labels = [],
  usageData = [],
  oxygenData = [],
  scoreData = []
) {
  if (trendsChart) {
    trendsChart.destroy();
  }

  const ctx = document.getElementById('trendsChart').getContext('2d');

  trendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Usage Hours',
          data: usageData,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          yAxisID: 'y',
        },
        {
          label: 'Oxygen Level (%)',
          data: oxygenData,
          borderColor: '#2ecc71',
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          yAxisID: 'y1',
        },
        {
          label: 'Therapy Score',
          data: scoreData,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          yAxisID: 'y2',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Usage Hours' },
        },
        y1: {
          type: 'linear',
          display: false,
          position: 'right',
        },
        y2: {
          type: 'linear',
          display: false,
          position: 'right',
        },
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Your 7-Day Therapy Trends',
        },
      },
    },
  });
}
