document.addEventListener('DOMContentLoaded', () => {
  let playHours = 0;

  // Default values for settings
  let pricePerKm = 0.38;
  let payTravelHour = 10;
  let payWorkHour = 100;
  let numMusicians = 8;
  let avoidTolls = false;
  let avoidHighways = false;

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
  const avoidTollsCheckbox = document.getElementById('avoid-tolls');
  const avoidHighwaysCheckbox = document.getElementById('avoid-highways');

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
    const origin = startInput.value.trim();
    const destination = endInput.value.trim();

    if (origin && destination) {
      try {
        // Fetch data from Google Maps API
        const distanceData = await fetchDistance(origin, destination, avoidTolls, avoidHighways);
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
        console.error('API Error:', error);  // Log full error for debugging
        alert('Error fetching distance: ' + error.message); // Show detailed error
      }
    } else {
      alert('Please enter both start and end locations.');
    }
  });

  // Fetch distance and time from Google Maps API
  async function fetchDistance(origin, destination, avoidTolls, avoidHighways) {
    const apiKey = 'AIzaSyAf2vMpz8WqBZVrmu4Gx3kArpnQvtlo7bo';
    let avoid = [];
    if (avoidTolls) avoid.push('tolls');
    if (avoidHighways) avoid.push('highways');

    const avoidString = avoid.length ? `&avoid=${avoid.join(',')}` : '';
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=driving${avoidString}&key=${apiKey}`;

    console.log('API Request URL:', url); // Log the full request URL for debugging

    const response = await fetch(url);
    const data = await response.json();
    
    // Log the full API response for debugging
    console.log('Full API Response:', data);

    if (data.status !== 'OK') {
      throw new Error(`API returned status: ${data.status}. ${data.error_message || ''}`);
    }

    const result = data.rows[0].elements[0];
    if (result.status !== 'OK') {
      throw new Error(`Route error: ${result.status}`);
    }

    return {
      distance: result.distance.value,
      duration: result.duration.value
    };
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

    // Update checkbox values
    avoidTolls = avoidTollsCheckbox.checked;
    avoidHighways = avoidHighwaysCheckbox.checked;

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
