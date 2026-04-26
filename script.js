let map;
let directionsService;
let directionsRenderer;

// Setup Modal bindings
document.addEventListener('DOMContentLoaded', () => {
    const riskModal = document.getElementById('risk-modal');
    if (riskModal) {
        document.querySelector('.close-btn').addEventListener('click', () => riskModal.classList.add('hidden'));
        document.getElementById('cancel-btn').addEventListener('click', () => {
            riskModal.classList.add('hidden');
            console.log("Shipment cancelled due to risk.");
        });
        document.getElementById('override-btn').addEventListener('click', () => {
            riskModal.classList.add('hidden');
            console.log("⚠️ User overrode risk warning. Proceeding with route.");
        });
    }
});

// Initialize Google Map (called by the API script callback)
function initMap() {
    console.log("Initializing Google Maps...");
    
    // Default center (e.g., center of US)
    const defaultCenter = { lat: 39.8283, lng: -98.5795 };
    
    // Clear the placeholder text
    document.getElementById("map").innerHTML = "";

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: defaultCenter,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        // Optional dark mode styling for the map to match our UI
        styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
            },
            {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
            },
            {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
            },
            {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }],
            },
            {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }],
            },
        ],
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Setup Place Autocomplete for inputs
    const sourceInput = document.getElementById("source");
    const destInput = document.getElementById("destination");
    new google.maps.places.Autocomplete(sourceInput);
    new google.maps.places.Autocomplete(destInput);

    // Bind calculate button
    document.getElementById("calculate-btn").addEventListener("click", calculateRoute);
}

function calculateRoute() {
    const source = document.getElementById("source").value;
    const destination = document.getElementById("destination").value;
    const alertsContainer = document.getElementById('alerts-container');
    const alertList = document.getElementById('alert-list');
    const riskModal = document.getElementById('risk-modal');

    if (!source || !destination) {
        alert("Please enter both source and destination.");
        return;
    }

    console.log(`Calculating route from ${source} to ${destination}...`);

    // Reset UI for new calculation
    alertsContainer.classList.add('hidden');
    alertList.innerHTML = '';

    const priority = document.querySelector('input[name="priority"]:checked').value;

    const request = {
        origin: source,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true // Request multiple routes so we can choose
    };

    directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            let selectedRouteIndex = 0;

            if (priority === 'emergency') {
                // Emergency: Pick the fastest route (default first route)
                console.log("🚨 EMERGENCY MODE: Selecting fastest route regardless of risk.");
                selectedRouteIndex = 0;
            } else {
                // Normal: Simulate risk analysis and pick the "safest" route
                console.log("🛡️ NORMAL MODE: Analyzing alternate routes for lowest risk...");
                
                let lowestRiskScore = Infinity;
                
                result.routes.forEach((route, index) => {
                    // MOCK RISK SCORE: In reality, we'd send the route path to Vertex AI.
                    // Here, we assign a random risk score between 0 and 100 to each route.
                    const simulatedRiskScore = Math.floor(Math.random() * 100);
                    console.log(`- Route ${index + 1}: Simulated Risk Score = ${simulatedRiskScore}`);

                    if (simulatedRiskScore < lowestRiskScore) {
                        lowestRiskScore = simulatedRiskScore;
                        selectedRouteIndex = index;
                    }
                });

                console.log(`✅ Selected Route ${selectedRouteIndex + 1} as the SAFEST route.`);
                
                // --- PHASE 4: Early Warning System ---
                // If even the safest route has a high risk score (> 65), trigger warnings.
                if (lowestRiskScore > 65) {
                    console.warn(`CRITICAL: Safest route still has high risk (${lowestRiskScore})`);
                    
                    alertsContainer.classList.remove('hidden');
                    
                    if (lowestRiskScore > 85) {
                        alertList.innerHTML += `<div class="alert-item">🌊 Severe Flood Risk Detected on Route</div>`;
                    }
                    if (lowestRiskScore > 65) {
                        alertList.innerHTML += `<div class="alert-item">🚗 Major Traffic Disruption Ahead</div>`;
                    }

                    riskModal.classList.remove('hidden');
                } else {
                    console.log("Route is safe. No warnings triggered.");
                }
            }

            directionsRenderer.setRouteIndex(selectedRouteIndex);
            directionsRenderer.setDirections(result);

            // --- PHASE 5: Update Metrics Dashboard ---
            const leg = result.routes[selectedRouteIndex].legs[0];
            document.getElementById('metric-time').innerText = leg.duration.text;
            document.getElementById('metric-distance').innerText = leg.distance.text;
            
            const riskEl = document.getElementById('metric-risk');
            if (priority === 'emergency') {
                riskEl.innerText = "N/A";
                riskEl.className = "";
            } else {
                riskEl.innerText = lowestRiskScore > 65 ? "HIGH" : (lowestRiskScore > 35 ? "MED" : "LOW");
                riskEl.className = lowestRiskScore > 65 ? "risk-high" : (lowestRiskScore > 35 ? "risk-warn" : "risk-safe");
            }
            
        } else {
            alert("Could not calculate route: " + status);
        }
    });
}
