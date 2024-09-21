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
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const settingsForm = document.getElementById('settings-form');
  const avoidTollsCheckbox = document.getElementById('avoid-tolls');
  const avoidHighwaysCheckbox = document.getElementById('avoid-highways');
  const resultsSection = document.getElementById('results-section');
  const detailsBtn = document.getElementById('details-btn');

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

    if (document.getElementById('breackdown-section')) {
      document.getElementById('breackdown-section').remove();
    }

    if (start && end) {
      try {
        console.log('Calling fetchDistance with:', start, end, avoidTolls, avoidHighways);

        // Call the API and fetch distance data
        const distanceData = await fetchDistance(start, end, avoidTolls, avoidHighways);

        if (distanceData) {
          // Parse distance and time values
          const distanceKm = distanceData.distance / 1000;
          const travelTimeHours = distanceData.duration / 3600;

          // Calculate the various costs
          const costPerKm = distanceKm * pricePerKm * 2 * 2; // Round trip, 2 vehicles
          const costPerTravelTime = travelTimeHours * payTravelHour * numMusicians * 2; // Round trip
          const costPerWork = playHours * payWorkHour * numMusicians;

          // Total price calculation
          const totalPrice = costPerKm + costPerTravelTime + costPerWork;

          // Log values for debugging
          console.log('Distance (km):', distanceKm);
          console.log('Travel Time (hours):', travelTimeHours);
          console.log('Cost per Km:', costPerKm);
          console.log('Cost per Travel Time:', costPerTravelTime);
          console.log('Cost per Work:', costPerWork);
          console.log('Total Price:', totalPrice);

          // Update total price in UI
          totalPriceElement.textContent = `${totalPrice.toFixed(2)}`;

          // After calculation is done, show the results
          resultsSection.classList.remove('hidden');
          console.log('Results section removed hidden class');
          

          // Store details for the breakdown
          detailsBtn.breakdownDetails = {
            distanceKm,
            travelTimeHours,
            costPerKm,
            costPerTravelTime,
            costPerWork,
            totalPrice
          };

        }

      } catch (error) {
        console.error('Error calculating distance:', error);
      }
    } else {
      alert("Please provide both start and end locations.");
    
  }
  });

  // Event listener for the "See breakdown" button
  detailsBtn.addEventListener('click', () => {

    // Toggle visibility of the results section
    const details = detailsBtn.breakdownDetails;
    resultsSection.classList.add('hidden');
    if (details) {
      document.getElementById('breackdown').innerHTML = `
        <div id="breackdown-section">
        <p id="text-distance">Distance (km): ${details.distanceKm.toFixed(2)}</p>
        <p>Travel Time (hours): ${details.travelTimeHours.toFixed(2)}</p>
        <p>Cost per Km: €${details.costPerKm.toFixed(2)}</p>
        <p>Cost per Travel Time: €${details.costPerTravelTime.toFixed(2)}</p>
        <p>Cost per Work: €${details.costPerWork.toFixed(2)}</p>
        <p>Total Price: €${details.totalPrice.toFixed(2)}</p>
        </div>
      `;
    }
  });


  async function fetchDistance(origin, destination, avoidTolls, avoidHighways) {
    const apiKey = 'AIzaSyAf2vMpz8WqBZVrmu4Gx3kArpnQvtlo7bo'; // Replace with your actual API key
    let avoid = [];
    if (avoidTolls) avoid.push('tolls');
    if (avoidHighways) avoid.push('highways');

    const avoidString = avoid.length ? `&avoid=${avoid.join(',')}` : '';
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=driving${avoidString}&key=${apiKey}`;

    // Use a different CORS proxy
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const fullUrl = proxyUrl + encodeURIComponent(url);

    console.log('API Request URL:', fullUrl); // Log the full request URL for debugging

    try {
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Parse the JSON response from the proxy
      const apiData = JSON.parse(data.contents);

      // Log the full API response for debugging
      console.log('Full API Response:', apiData);

      if (apiData.status !== 'OK') {
        throw new Error(`API returned status: ${apiData.status}. ${apiData.error_message || ''}`);
      }

      const result = apiData.rows[0].elements[0];
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
