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

  // Calculate button event listener
  calculateBtn.addEventListener('click', async () => {
    const start = startInput.value.trim();
    const end = endInput.value.trim();
    avoidTolls = avoidTollsCheckbox.checked;
    avoidHighways = avoidHighwaysCheckbox.checked;

    if (start && end) {
      try {
        console.log('Calling fetchDistance with:', start, end, avoidTolls, avoidHighways);
        const distanceData = await fetchDistance(start, end, avoidTolls, avoidHighways);
        if (distanceData) {
          const totalPrice = (distanceData.distance / 1000 * pricePerKm) + (playHours * payWorkHour);
          totalPriceElement.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
          resultsSection.style.display = 'block';
        }
      } catch (error) {
        console.error('Error calculating distance:', error);
        alert('Error calculating distance: ' + error.message);
      }
    } else {
      alert('Please enter both start and end locations.');
    }
  });

  async function fetchDistance(origin, destination, avoidTolls, avoidHighways) {
    const apiKey = 'YOUR_API_KEY_HERE';
    let avoid = [];
    if (avoidTolls) avoid.push('tolls');
    if (avoidHighways) avoid.push('highways');
  
    const avoidString = avoid.length ? `&avoid=${avoid.join(',')}` : '';
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=driving${avoidString}&key=${apiKey}`;
    
    // Use a CORS proxy
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const fullUrl = proxyUrl + url;
  
    console.log('API Request URL:', fullUrl); // Log the full request URL for debugging
  
    try {
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
    } catch (error) {
      console.error('Error fetching distance:', error);
      throw error;
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

    // Update checkbox values
    avoidTolls = avoidTollsCheckbox.checked;
    avoidHighways = avoidHighwaysCheckbox.checked;

    // Close the modal
    settingsModal.classList.add('hidden');
  });
});