/**
 * RouteGuard AI | Intelligent Logistics Core
 * ----------------------------------------
 */

let map;
let trafficLayer;
let directionsService;
let directionsRenderer;
let charts = {};

const API_BASE = ''; 

// --- CORE INITIALIZATION ---

async function initMap() {
    if (typeof google === 'undefined' || !google.maps) {
        console.warn("SYSTEM: Maps API Connectivity Lost.");
        return;
    }

    const mapStyle = [
        { elementType: "geometry", stylers: [{ color: "#080b12" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#131926" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0f1d" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] }
    ];

    try {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 40.7128, lng: -74.0060 },
            zoom: 12,
            styles: mapStyle,
            disableDefaultUI: true
        });

        trafficLayer = new google.maps.TrafficLayer();
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            polylineOptions: { strokeColor: '#00d2ff', strokeWeight: 5, strokeOpacity: 0.8 }
        });

    } catch (e) { console.error("Map Core Failure:", e); }
}

// --- DATA & STATE MANAGEMENT ---

async function loadProfile() {
    try {
        const res = await fetch(`${API_BASE}/api/profile`);
        const profile = await res.json();
        
        document.getElementById('display-name').innerText = profile.name;
        document.getElementById('display-role').innerText = profile.role;
        document.getElementById('profile-avatar').src = profile.avatar;
        
        // Initials avatar
        const initials = profile.name.split(' ').map(n => n[0]).join('');
        document.getElementById('user-initials').innerText = initials;

        // Populate Form
        document.getElementById('edit-name').value = profile.name;
        document.getElementById('edit-role').value = profile.role;
        document.getElementById('edit-email').value = profile.email;
    } catch (e) { console.error("Profile Sync Error:", e); }
}

async function loadFleet() {
    const response = await fetch(`${API_BASE}/api/fleet`);
    const fleet = await response.json();
    
    document.getElementById('fleet-table-body').innerHTML = fleet.map(v => {
        const fuelVal = parseInt(v.fuel) || 0;
        const statusClass = v.status.toLowerCase().includes('time') ? 'on-time' : 'delayed';
        
        return `
        <tr>
            <td><strong>${v.id}</strong></td>
            <td>${v.type}</td>
            <td><span class="status-badge ${statusClass}">${v.status}</span></td>
            <td>
                <div class="fuel-container">
                    <span style="font-size: 0.75rem; margin-bottom: 4px; display: block;">${v.fuel}</span>
                    <div class="fuel-bar"><div class="fuel-fill" style="width: ${v.fuel};"></div></div>
                </div>
            </td>
            <td>${v.driver}</td>
            <td><button class="action-btn">View Telemetry</button></td>
        </tr>
    `}).join('');
}

function switchView(viewName) {
    // Update Side Nav
    document.querySelectorAll('.side-item, .main-nav a').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-view') === viewName) item.classList.add('active');
    });

    // Toggle Visibility
    document.querySelectorAll('.app-view').forEach(view => view.classList.add('hidden'));
    const activeView = document.getElementById(`view-${viewName}`);
    if (activeView) activeView.classList.remove('hidden');

    // Load Module Data
    if (viewName === 'analytics') loadAnalytics();
    if (viewName === 'fleet') loadFleet();
    if (viewName === 'climate') loadClimate();
}

// --- CLIMATE LOGIC ---

function loadClimate() {
    if (charts.carbon) charts.carbon.destroy();
    
    const ctx = document.getElementById('carbonChart').getContext('2d');
    charts.carbon = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
            datasets: [{
                data: [150, 142, 138, 124, 130, 115, 110],
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { 
                y: { display: false },
                x: { display: false }
            }
        }
    });
}

// --- DATA VISUALIZATION ---

async function loadAnalytics() {
    const response = await fetch(`${API_BASE}/api/analytics`);
    const data = await response.json();
    renderCharts(data);
}

function renderCharts(data) {
    Object.values(charts).forEach(c => c && c.destroy());

    const chartConfig = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8e9aaf' } },
            x: { grid: { display: false }, ticks: { color: '#8e9aaf' } }
        }
    };

    charts.eff = new Chart(document.getElementById('efficiencyChart'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{ data: data.efficiency, borderColor: '#00d2ff', tension: 0.4, fill: true, backgroundColor: 'rgba(0, 210, 255, 0.05)' }]
        },
        options: chartConfig
    });

    charts.risk = new Chart(document.getElementById('riskChart'), {
        type: 'doughnut',
        data: {
            labels: ['Cleared', 'Caution', 'High Risk'],
            datasets: [{ data: data.riskDistribution, backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c'], borderWidth: 0 }]
        },
        options: { ...chartConfig, cutout: '80%' }
    });

    charts.fuel = new Chart(document.getElementById('fuelChart'), {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{ data: data.fuelConsumption, backgroundColor: '#3498db', borderRadius: 4 }]
        },
        options: chartConfig
    });

    charts.region = new Chart(document.getElementById('regionChart'), {
        type: 'radar',
        data: {
            labels: ['North', 'South', 'East', 'West', 'Central'],
            datasets: [{ data: data.regionalEfficiency, borderColor: '#00d2ff', backgroundColor: 'rgba(0, 210, 255, 0.1)' }]
        },
        options: { ...chartConfig, scales: { r: { grid: { color: 'rgba(255,255,255,0.05)' }, angleLines: { color: 'rgba(255,255,255,0.05)' }, ticks: { display: false } } } }
    });
}

// --- INTELLIGENCE ---

async function calculateRoute() {
    const source = document.getElementById("source").value;
    const destination = document.getElementById("destination").value;
    
    if (!source || !destination) return alert("System: Mission parameters incomplete.");

    const btn = document.getElementById('calculate-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

    directionsService.route({
        origin: source,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
    }, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
        } else {
            alert("Routing Error: " + status);
        }
        btn.disabled = false;
        btn.innerText = 'Optimize Route';
    });
}

function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('live-clock').innerText = now.toLocaleTimeString();
    }, 1000);
}

// --- BOOTSTRAP ---

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadFleet();
    startClock();
    
    // Navigation
    document.querySelectorAll('.side-item, .main-nav a').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const view = el.getAttribute('data-view');
            if (view) switchView(view);
        });
    });

    document.getElementById('calculate-btn').addEventListener('click', calculateRoute);
});

window.initMap = initMap;
