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

//Load patients list in the dropdown(for the doctors)
async function loadPatients() {
  try {
    console.log('Loading patients from API...');

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const id = localStorage.getItem('id');

    const select = document.getElementById('patientSelect');
    select.innerHTML = ''; // clear

    if (!token) throw new Error('No token found, please login again');

    if (role === 'patient') {
      // ✅ PATIENT: show only their own name
      const option = document.createElement('option');
      option.value = id;
      option.textContent = name;
      select.appendChild(option);

      updateApiStatus('✅ Logged in as patient', 'success');
      return; // stop here
    }

    // ✅ DOCTOR: fetch full list
    const response = await fetch('http://localhost:5000/api/patient/list', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const patients = await response.json();
    console.log('API Response:', patients);

    select.innerHTML =
      '<option value="demo">Demo Patient (Sample Data)</option>';

    if (patients && Array.isArray(patients) && patients.length > 0) {
      patients.forEach((p) => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.name}${p.email ? ' (' + p.email + ')' : ''}`;
        select.appendChild(option);
      });

      console.log(`Successfully loaded ${patients.length} patients`);

      // Update status message
      updateApiStatus(
        `✅ Connected - Found ${patients.length} patients`,
        'success'
      );
    } else {
      console.log('No patients found in database');
      updateApiStatus(
        '⚠️ Connected but no patients found in database',
        'warning'
      );
    }

    select.addEventListener('change', (e) => {
      const selectedValue = e.target.value;
      currentPatientId = selectedValue === 'demo' ? 'demo' : selectedValue;
      if (selectedValue === 'demo') updateDashboard();
      else {
        loadPatientDays(selectedValue);
        load7DayTrends(selectedValue);
      }
    });

    // Auto-load first real patient if available
    if (patients && patients.length > 0) {
      console.log('Auto-loading first patient:', patients[0].name);
      select.value = patients[0].id;
      currentPatientId = patients[0].id;
      loadPatientData(patients[0].id);
      loadPatientDays(patients[0].id);
      load7DayTrends(patients[0].id);
    } else {
      // No patients, stay in demo mode
      currentPatientId = 'demo';
      updateDashboard();
    }
  } catch (error) {
    console.error('API Error:', error);
    updateApiStatus(`❌ API Error: ${error.message}`, 'error');

    // Fall back to demo mode
    currentPatientId = 'demo';
    updateDashboard();
  }
}

//load patient data
async function loadPatientData(id) {
  try {
    console.log(`Loading data for patient ID: ${id}`);
    // Fallback: try full profile endpoint
    console.log('Summary not available, trying profile endpoint...');
    const response = await fetch(`http://localhost:5000/api/patient/${id}`, {
      headers: {
        'Authorization': 'Bearer ' + token,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const profileData = await response.json();
    patientData = profileData.latest_data;
    console.log('Profile data loaded:', profileData);

    if (!patientData) {
      console.log('No data available for this patient');
      displayNoDataMessage();
      return;
    }

    // Update dashboard with patient data
    document.getElementById('therapyScore').textContent =
      patientData.intelligent_score || computeIntelligentScore(patientData);
    document.getElementById('usageHours').textContent =
      patientData.usage_hours || 'N/A';
    document.getElementById('oxygenLevel').textContent = patientData.oxygen_avg
      ? patientData.oxygen_avg + '%'
      : 'N/A';
    document.getElementById('maskLeak').textContent = patientData.mask_leak
      ? 'Leak Detected'
      : 'Good';
    document.getElementById('respRate').textContent =
      patientData.resp_rate || 'N/A';
    document.getElementById('tidalVolume').textContent =
      patientData.tidal_volume || 'N/A';
    document.getElementById('minuteVentilation').textContent =
      patientData.minute_ventilation || 'N/A';

    updateRangeIndicators();
    console.log('Dashboard updated with patient data');
  } catch (error) {
    console.error('Error loading patient data:', error);
    displayNoDataMessage();
  }
}

function updateApiStatus(message, type) {
  const statusElement =
    document.querySelector('.demo-mode') || createStatusElement();
  statusElement.innerHTML = message;

  // Update styling based on type
  statusElement.className = 'demo-mode';
  if (type === 'success') {
    statusElement.style.background = '#d4edda';
    statusElement.style.color = '#155724';
  } else if (type === 'warning') {
    statusElement.style.background = '#fff3cd';
    statusElement.style.color = '#856404';
  } else if (type === 'error') {
    statusElement.style.background = '#f8d7da';
    statusElement.style.color = '#721c24';
  }
}

function createStatusElement() {
  const statusElement = document.createElement('div');
  statusElement.className = 'demo-mode';
  document
    .querySelector('.container')
    .insertBefore(statusElement, document.querySelector('nav'));
  return statusElement;
}

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
  console.log('=== NIV Companion App Starting ===');
  loadPatients();

  // Only show demo dashboard if we haven't loaded real patients
  setTimeout(() => {
    if (currentPatientId === 'demo') {
      updateDashboard();
    }
  }, 1000);
});
