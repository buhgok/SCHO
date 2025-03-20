# Star Citizen Hauling Optimization Tool (SCHOT)

A web-based tool to optimize cargo routes for Star Citizen haulers, built with HTML, CSS, and JavaScript.

## Overview
This app helps players plan efficient trade routes by calculating legs, distances, and fuel needs based on contracts. It supports multiple cargo items, ship capacities, and a dynamic location list.

## Features
- Add and manage contracts with multiple cargo items.
- Calculate optimized routes with start/end actions.
- Track completed contracts and earnings.
- Dark/light theme toggle.
- Persistent data via localStorage.

## Installation
1. Clone the repo: `git clone https://github.com/buhgok/SCHOT.git`
2. Open `html/index.html` in a browser—no server needed!

## Usage
1. **Add a Contract**:
   - Go to the "Contracts" tab.
   - Enter a name, ship, reward, and cargo details (material, pickup, delivery, SCU).
   - Click "Add Contract".
2. **Calculate a Route**:
   - Set a starting location (e.g., "Stanton: Port Tressler").
   - Click "Calculate Route" to see legs with actions at start/end.
3. **Manage Data**:
   - Edit/delete contracts or locations in their respective tabs.
   - Reset all data with the "Reset All" button.

## Example Route
Leg # | Start | Action at Start | End | Action at End | Contract | Distance (km) | Fuel Needed
------|-------|-----------------|-----|---------------|----------|---------------|-------------
1     | Stanton: Port Tressler | Pick up Xerox (2 SCU) | Stanton: Everus Harbor | Pick up Stuff (45 SCU), Pick up Other (34 SCU) | Test | 100000 | 100
2     | Stanton: Everus Harbor | Depart | Stanton: Greycat Stanton IV Production Complex-A | Deliver Xerox (2 SCU), Deliver Stuff (45 SCU), Pick up Widget (12 SCU) | Test | 100000 | 100
[...]

## Development
### File Structure
- `html/index.html`: Main app interface.
- `src/script.js`: Core logic (contract management, route calculation).
- `css/style.css`: Styling (dark/light themes).

### Key Functions
- `addContract()`: Adds a new contract to the list.
- `updateRoute()`: Calculates and displays the optimized route.
- `updateTable()`: Refreshes the contract list UI.

### Adding Features
1. Fork the repo and create a branch: `git checkout -b feature-name`.
2. Edit `src/script.js` or add new files.
3. Test locally, commit, and push: `git push origin feature-name`.
4. Submit a pull request.

## Current Status
- Version: 1.0 (March 20, 2025)
- Stable with 5-leg route optimization.
- Todo: Add real distances, multi-ship support.

## Contributing
- Report bugs or suggest features via [Issues](https://github.com/buhgok/SCHOT/issues).
- Pull requests welcome—keep it simple and test before submitting.

