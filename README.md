# Star Citizen Hauling Optimization Tool (SCHOT)

A web-based tool to optimize cargo routes for Star Citizen haulers, built with HTML, CSS, and JavaScript.

## Overview
This app helps players plan efficient trade routes by calculating legs, distances, and fuel needs based on contracts. It supports multiple cargo items, ship capacities, and a dynamic location list.

## Features
- **Contract Management**: Add and manage contracts with multiple cargo items, including name, ship, reward (aUEC), and cargo details.
- **Material Dropdown**: Select cargo materials from a static list of 33 Alpha 4.0.2 commodities (e.g., Agricium, Waste, Steel). Includes a "Refresh Materials" button to reset to the default list.
- **Calculate Optimized Routes**: Generate step-by-step routes with start/end actions for active contracts (Pending/Enroute).
- **Track Completed Contracts**: Monitor completed contracts and earnings in the Session tab.
- **Dark/Light Theme Toggle**: Switch between dark (default) and light modes for better readability.
- **Persistent Data**: Save contracts, locations, materials, and session data via localStorage.

## Installation
1. Clone the repo: `git clone https://github.com/buhgok/SCHOT.git`
2. Open `index.html` in a browser—no server needed!

## Usage
1. **Add a Contract**:
   - Go to the "Contracts" tab.
   - Enter a name, ship, reward, and cargo details (material, pickup, delivery, SCU).
   - Click "Add Contract".
2. **Calculate a Route**:
   - Set a starting location (e.g., "Stanton: Port Tressler") in the "Route" tab.
   - Click "Calculate Route" to see legs with actions at start/end.
3. **Manage Data**:
   - Edit/delete contracts or locations in their respective tabs.
   - Reset all data with the "Reset All" button.

## Example Route
Leg # | Start | Action at Start | End | Action at End | Contract | Distance (km) | Fuel Needed
------|-------|-----------------|-----|---------------|----------|---------------|-------------
1     | Stanton: Port Tressler | Pick up Agricium (8 SCU) | Stanton: Everus Harbor | Deliver Agricium (8 SCU), Pick up Waste (12 SCU) | Haul-01 | 100000 | 100
2     | Stanton: Everus Harbor | Depart | Stanton: Greycat Stanton IV Production Complex-A | Deliver Waste (12 SCU), Pick up Steel (15 SCU) | Haul-01 | 100000 | 100
3     | Stanton: Greycat Stanton IV Production Complex-A | Depart | Stanton: Port Tressler | Deliver Steel (15 SCU) | Haul-01 | 100000 | 100

## Development
### File Structure
- `index.html`: Main app interface (moved from `html/` to root).
- `css/styles.css`: Styling (dark/light themes).
- `src/`:
  - `app.js`: Initializes the app and sets up event listeners.
  - `data.js`: Manages static data and localStorage.
  - `ui.js`: Handles DOM updates and UI logic.
  - `contracts.js`: Manages contract CRUD operations.
  - `locations.js`: Manages location CRUD and validation.
  - `routing.js`: Calculates and displays routes.

### Key Functions
- `contracts.addContract()`: Adds a new contract to the list.
- `routing.updateRoute()`: Calculates and displays the optimized route.
- `ui.updateContractTable()`: Refreshes the contract list UI.

### Adding Features
1. Fork the repo and create a branch: `git checkout -b feature-name`.
2. Edit files in `src/` or add new ones as needed.
3. Test locally, commit, and push: `git push origin feature-name`.
4. Submit a pull request.

## Current Status
- **Version**: Alpha 0.2.0 (March 21, 2025)
- Stable with modular structure and 5-leg route optimization.
- Todo: Add real distances, multi-ship support.

## Contributing
- Report bugs or suggest features via [Issues](https://github.com/buhgok/SCHOT/issues).
- Pull requests welcome—keep it simple and test before submitting.