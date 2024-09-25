document.addEventListener('DOMContentLoaded', () => {
  let playHours = 0;

  // Default values for settings
  let pricePerKm = 0.25;
  let payTravelHour = 2.5;
  let payWork = 0; //change save as well
  let numMusicians = 8;
  let avoidTolls = false;
  let avoidHighways = false;

  const startInputCar1 = document.getElementById('start-input-car1');
  const startInputCar2 = document.getElementById('start-input-car2');
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

    const startCar1 = startInputCar1.value.trim();
    const startCar2 = startInputCar2.value.trim();
    const end = endInput.value.trim();
    avoidTolls = avoidTollsCheckbox.checked;
    avoidHighways = avoidHighwaysCheckbox.checked;

    if (document.getElementById('breackdown-section')) {
      document.getElementById('breackdown-section').remove();
    }

    if (startCar1 && startCar2 && end) {
      try {
        console.log('Calling fetchDistance with:', startCar1, end, avoidTolls, avoidHighways);

        // Call the API and fetch distance data
        const distanceData1 = await fetchDistance(startCar1, end, avoidTolls, avoidHighways);
        const distanceData2 = await fetchDistance(startCar2, end, avoidTolls, avoidHighways);

        if (distanceData1 && distanceData2) {
          // Parse distance and time values

          if (playHours == 0.5) payWork = 50;
          else if (playHours == 1) payWork = 70;
          else if (playHours == 1.5) payWork = 90;
          else if (playHours == 2) payWork = 100;
          else if (playHours > 2) payWork = 100 + (playHours - 2) * 20;


          const distanceKm1 = distanceData1.distance / 1000;
          const travelTimeHours1 = distanceData1.duration / 3600;

          const distanceKm2 = distanceData2.distance / 1000;
          const travelTimeHours2 = distanceData2.duration / 3600;

          let biggerTravelTime = travelTimeHours1 > travelTimeHours2 ? travelTimeHours1 : travelTimeHours2;

          const travelTimeHours_hours1 = Math.floor(travelTimeHours1);
          const travelTimeHours_minutes1 = (travelTimeHours1 - travelTimeHours_hours1) * 60;
          const travelTimeHours_hours2 = Math.floor(travelTimeHours2);
          const travelTimeHours_minutes2 = (travelTimeHours2 - travelTimeHours_hours2) * 60;

          // Calculate the various costs
          const costPerTravelTime = biggerTravelTime * payTravelHour * numMusicians * 2; // Round trip
          
          const costPerWork = payWork * numMusicians;

          // Price calculations
          const carPayment1 = distanceKm1 * pricePerKm * 2; // Round trip
          const carPayment2 = distanceKm2 * pricePerKm * 2; // Round trip
          const costPerKm = 2 * pricePerKm * (distanceKm1 + distanceKm2); // Round trip, 2 vehicles

          const musicianPayment = (costPerWork + costPerTravelTime) / numMusicians;
          const totalPrice = costPerKm + costPerTravelTime + costPerWork;

          // Update total price in UI
          totalPriceElement.textContent = `${totalPrice.toFixed(2)}`;

          // After calculation is done, show the results
          resultsSection.classList.remove('hidden');
          

          // Store details for the breakdown
          detailsBtn.breakdownDetails = {
            distanceKm1, //info
            distanceKm2, //info
            travelTimeHours1, //info
            travelTimeHours2, //info
            travelTimeHours_hours1, //info
            travelTimeHours_minutes1, //info
            travelTimeHours_hours2, //info
            travelTimeHours_minutes2, //info
            costPerKm, //info
            costPerTravelTime, //musician
            costPerWork, //musician
            carPayment1, //car payment
            carPayment2, //car payment
            musicianPayment, //musician payment
            totalPrice //band payment
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
        <p><strong>Carro 1:</strong></p>
        <p style="white-space: pre;">  Distancia (ida): ${details.distanceKm1.toFixed(2)}km</p>
        <p style="white-space: pre;">  Tempo de Viajem (ida): ${details.travelTimeHours_hours1.toFixed(0)} hours ${details.travelTimeHours_minutes1.toFixed(0)} minutes</p>
        <p style="white-space: pre;">  Pagamento do Carro 1: €${details.carPayment1.toFixed(2)}</p>
        <p><strong>Carro 2:</strong></p>
        <p style="white-space: pre;">  Distancia (ida): ${details.distanceKm2.toFixed(2)}km</p>
        <p style="white-space: pre;">  Tempo de Viajem (ida): ${details.travelTimeHours_hours2.toFixed(0)} hours ${details.travelTimeHours_minutes2.toFixed(0)} minutes</p>
        <p style="white-space: pre;">  Pagamento do Carro 2: €${details.carPayment2.toFixed(2)}</p>
        <p><br /></p>
        <p>Custo Total dos Carros: €${details.costPerKm.toFixed(2)}</p>
        <p>Preço das horas em viajem: €${details.costPerTravelTime.toFixed(2)}</p>
        <p>Preço do tempo a tocar: €${details.costPerWork.toFixed(2)}</p>  
        <p><strong>Pagamento por músico: €${details.musicianPayment.toFixed(2)}</strong></p>
        <p><strong>Preço Total: €${details.totalPrice.toFixed(2)}</strong></p>
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
    //payWork = parseFloat(document.getElementById('pay-work-hour').value);
    numMusicians = parseInt(document.getElementById('num-musicians').value);

    // Update checkbox values
    avoidTolls = avoidTollsCheckbox.checked;
    avoidHighways = avoidHighwaysCheckbox.checked;

    // Close the modal
    settingsModal.classList.add('hidden');
  });


});
