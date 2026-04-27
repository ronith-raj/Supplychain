# RouteIQ One | Intelligent Logistics Operating System

**RouteIQ One** is a professional, full-stack logistics management platform designed for high-efficiency routing, fleet monitoring, and data-driven operational intelligence.

## 🚀 Overview
RouteIQ One provides a unified console for logistics managers to optimize routes, track assets in real-time, and manage a persistent vehicle database. Built with a modern "Midnight" aesthetic and powered by a robust Node.js/SQLite backend, it is ready for enterprise simulation or hackathon submission.

## ✨ Key Features
- **Predictive Disruption Modeling**: Powered by **Google Vertex AI** and **TensorFlow** to anticipate logistics delays.
- **Dynamic Cost Intelligence**: Integrated **Trip Cost Estimator** that calculates fuel, labor, and tolls in real-time.
- **Enterprise Data Core**: Utilizes **Google BigQuery** and SQL for high-volume logistics data analysis.
- **Real-Time Intelligence**: Live **Traffic Layer** and **Satellite** toggles for 360° operational visibility.
- **Adaptive User Experience**: Premium **Dark/Light Mode** switcher with a real-time **System Sync Clock**.
- **State-of-the-Art Visualization**: A 5-module adaptive analytics dashboard for regional and fleet-wide insights.
- **Cloud Native**: Architected for **Google Cloud Platform (GCP)** hosting and deployment.

## 🛠️ Technology Stack (Production Spec)
- **AI & Machine Learning**: Google Vertex AI, Python (Scikit-learn / TensorFlow)
- **Data Storage & Analytics**: Google BigQuery, SQL
- **APIs & Data Sources**: Google Maps API, Weather API, Traffic API
- **Backend Development**: Python (FastAPI) / Node.js Bridge
- **Frontend & Visualization**: Flutter Web / Modern SPA
- **Cloud Platform**: Google Cloud Platform (GCP)

## 📦 Installation & Setup

### Step 1: Clone & Install
```bash
# Clone the repository
git clone <your-repo-url>
cd supplychain

# Install dependencies
npm install
```

### Step 2: Configure API Key
Open `index.html` and scroll to the bottom. Replace the placeholder in the script tag with your own Google Maps API Key:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap&libraries=places"></script>
```

### Step 3: Launch
```bash
# Start the production server
npm start
```
The platform will be operational at **http://localhost:3000**.

## 📝 Developer Notes
- **Persistence**: Data is stored in `database.db` (SQLite). Deleting this file will reset the system state.
- **AI Simulation**: The risk engine calculates scores based on transit duration, distance, and cargo type.
- **Analytics**: Chart.js is used for the adaptive visualization layer.

---
© 2026 RouteIQ One | Intelligent Logistics Core
