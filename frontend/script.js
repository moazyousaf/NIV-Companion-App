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
