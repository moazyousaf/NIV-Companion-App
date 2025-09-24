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
