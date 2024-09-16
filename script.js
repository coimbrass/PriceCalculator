document.addEventListener('DOMContentLoaded', () => {
  let playHours = 0;
  const pricePerKm = 0.38;
  const payTravelHour = 10;
  const payWorkHour = 100;
  const numMusicians = 8;

  const startInput = document.getElementById('start-input');
  const endInput = document.getElementById('end-input');
  const hoursDisplay = document.getElementById('hours-display');
  const increaseHoursBtn = document.getElementById('increase-hours');
  const decreaseHoursBtn = document.getElementById('decrease-hours');
  const calculateBtn = document.getElementById('calculate-btn');
  const totalPriceElement = document.getElementById('total-price');
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

        // Calculate costs
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
});
