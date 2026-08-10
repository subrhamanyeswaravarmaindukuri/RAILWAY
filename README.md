# RAILRAKE — Forecasting & Scheduling of Railway Rakes
### Smart India Hackathon Prototype (SIH1319) — Ministry of Coal

**RAILRAKE** is a high-fidelity, interactive operational dashboard designed to optimize coal movements from production mines to power plants. It forecasts coal inventory depletion rates and schedules rail rakes to mitigate demurrage risks.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React, TypeScript, Tailwind CSS v4, Lucide Icons, Vite
- **Data & State**: Dynamic simulated state with live database mutations (allocations, reports, notifications)
- **Backend Algorithms (SIH Engine)**: 
  - **MySQL Database**: Relational schema in `backend-engine/mysql/schema.sql`
  - **C Forecasting**: Double Exponential Smoothing in `backend-engine/c/forecasting.c`
  - **C++ Optimization**: Multi-criteria heuristic siding evaluation in `backend-engine/cpp/optimizer.cpp`
  - **Java Spring REST Endpoints**: API controller mapping in `backend-engine/java/RakeController.java`

*Note: The frontend prototype simulates the output of these backend algorithms dynamically, letting you demo the entire workflow with zero-configuration.*

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Launch
1. Install project dependencies:
   ```bash
   npm install
   ```
2. Start the Vite local development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the printed local port (usually `http://localhost:5173`).

---

## 📱 DUAL LAYOUT MODES (Presentation-Ready)
To facilitate smooth SIH demonstrations on standard desktop monitors and projectors, the application features an interactive **Presentation Preview Panel** at the top of the screen:
1. **Auto-Responsive Mode**: Natively adjusts styles using Tailwind CSS media queries.
2. **Desktop Dashboard View**: Locks the resolution to standard 1440×900 desktop specifications with sidebar navigation, analytics panels, and spreadsheets.
3. **Mobile Bezel Mockup**: Wraps the prototype inside an iPhone frame (390×844px) complete with a notch and bottom navigation, permitting judges to inspect mobile layouts directly on a desktop screen.

---

## 🖥️ Screen List & Interactions
- **Login**: Click LOGIN with any non-empty credentials (e.g. `admin` / `pass123`) to unlock the dashboard.
- **Dashboard**: Six status cards, overview card, and quick action panels.
- **Rake Tracking**: Interactive railway path timeline showing Rake positions between station nodes.
- **Demand Forecast**: Custom SVG depletion curve tracking stock decay days.
- **Scheduling**: Structured scheduling log tables (Desktop) and lists (Mobile).
- **Rake Allocation**: Optimizer recommendations. Clicking `Allocate Siding` shifts the rake to transit, adjusts siding stocks, registers alerts, and outputs a green success toast.
- **Siding Details**: Unloading statistics, average turnaround durations, and collapsible historical entries.
- **Alert Center**: Warning flags indicating demurrage risks and delays.
- **Analytics**: Graphic bar charts representing monthly rakings.
- **Reports**: simulated download logs.
- **Code Viewer**: Integrates a mock developer IDE displaying the database scripts and C/C++/Java algorithms.
