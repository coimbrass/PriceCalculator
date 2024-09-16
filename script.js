document.addEventListener('DOMContentLoaded', () => {
  let playHours = 0;

  // Default values for settings
  let pricePerKm = 0.38;
  let payTravelHour = 10;
  let payWorkHour = 100;
  let numMusicians = 8;

  const startInput = document.getElementById('start-input');
  const endInput = document.getElementById('end-input');
  const hoursDisplay = document.getElementById('hours-display');
  const increaseHoursBtn = document.getElementById('increase-hours');
  const decreaseHoursBtn = document.getElementById('decrease-hours');
  const calculateBtn = document.getElementById('calculate-btn');
  const totalPriceElement = document.getElementById('total-price');
  const resultsSection = document.getElementById('results-section');
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const settingsForm = document.getElementById('settings-form');

  // Increase or decrease hours of playing
  increaseHoursBtn.addEventListener('click', () => {
    playHours += 0.5;
    hoursDisplay.textContent = playHours;
  });

  decreaseHoursBtn.addEventListener('click', () => {
    if (playHours > 0) {
      playHours -= 0.5;
    }
    hoursDisplay.textContent = playHours;
  });

  // Calculate button
  calculateBtn.addEventListener('click', async () => {
    const origin = startInput.value;
    const destination = endInput.value;

    if (origin && destination) {
      try {
        // Fetch data from Google Maps API
        const distanceData = await fetchDistance(origin, destination);
        const distanceKm = distanceData.distance / 1000; // Convert to km
        const travelTime = distanceData.duration / 3600; // Convert to hours

        // Calculate costs using updated settings
        const costDistance = distanceKm * pricePerKm * 2 * 2;
        const costTravel = travelTime * payTravelHour * numMusicians * 2;
        const costWork = playHours * payWorkHour * numMusicians;

        const totalCost = costDistance + costTravel + costWork;
        totalPriceElement.textContent = totalCost.toFixed(2);

        // Show results section
        resultsSection.classList.remove('hidden');
      } catch (error) {
        alert('Error fetching distance. Please check your input.');
      }
    } else {
      alert('Please enter both start and end locations.');
    }
  });

  // Fetch distance and time from Google Maps API
  async function fetchDistance(origin, destination) {
    const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
    const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apiKey}`);
    const data = await response.json();
    if (data.rows[0].elements[0].status === 'OK') {
      const distance = data.rows[0].elements[0].distance.value;
      const duration = data.rows[0].elements[0].duration.value;
      return { distance, duration };
    } else {
      throw new Error('Invalid locations');
    }
  }

  // Open settings modal
  openSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
  });

  // Save settings and close modal
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Update values from the form
    pricePerKm = parseFloat(document.getElementById('price-per-km').value);
    payTravelHour = parseFloat(document.getElementById('pay-travel-hour').value);
    payWorkHour = parseFloat(document.getElementById('pay-work-hour').value);
    numMusicians = parseInt(document.getElementById('num-musicians').value);

    // Close modal
    settingsModal.classList.add('hidden');
  });

  // Close the modal when clicking outside of the form
  window.addEventListener('click', function(event) {
    if (event.target == settingsModal) {
      settingsModal.classList.add('hidden');
    }
  });
});
