# SCHOT Development Notes

## Overview
The Star Citizen Hauling Optimization Tool (SCHOT) is a vanilla HTML/CSS/JS app designed to help haulers manage contracts and plan routes. This document tracks technical details and key implementation notes.

## Version
Alpha 0.2.0 (March 21, 2025)

## File Structure
- `index.html`: Main app interface, loads all JS modules and CSS.
- `css/styles.css`: Styling for dark/light themes, tab layout, and forms.
- `src/`:
  - `app.js`: Initializes the app, sets up event listeners, and handles theme toggling.
  - `data.js`: Stores static data (ships, distances, materials) and manages localStorage.
  - `ui.js`: Updates DOM elements (tables, dropdowns, datalists) and creates reusable UI components.
  - `contracts.js`: Handles contract CRUD (create, read, update, delete) and status logic.
  - `locations.js`: Manages location list, validation, and CRUD operations.
  - `routing.js`: Calculates and displays routes based on active contracts.

## Key Implementation Details
- **Modular Refactor (Alpha 0.2.0)**:
  - Split original `script.js` into six modules under `src/` for better maintainability.
  - Moved `index.html` from `html/` to root for simpler paths (e.g., `src/data.js` instead of `../src/script.js`).
  - Global `window` objects (e.g., `window.data`, `window.ui`) expose module functions.

- **Data Management**:
  - `data.js` holds `ships` (e.g., "Hull A": { totalSCU: 64, fuel: 600 }), `distances` (placeholder pairs), and `STATIC_MATERIALS` (33 commodities).
  - State (contracts, locations, materials, session) persists via `localStorage` with `saveState()`.

- **Contract Logic**:
  - `contracts.js` validates cargo against ship SCU (e.g., Taurus at 174 SCU) and tracks status changes (Pending → Completed).
  - Session earnings/count update in `updateStatus()`.

- **Route Calculation**:
  - `routing.js` builds routes by iterating active contracts, using a greedy nearest-neighbor approach.
  - Placeholder distances (e.g., 100000 km) used until real data is added.

- **UI Updates**:
  - `ui.js` dynamically populates dropdowns (ships, materials) and datalists (locations) from `data.state`.
  - Tab switching moved from inline HTML to event listeners in `index.html` script block.

## Key Functions
- `contracts.addContract()`: Adds a contract, validates SCU limits, and saves to state.
- `routing.updateRoute()`: Calculates route legs, displays in a table with distance/fuel estimates.
- `ui.updateContractTable()`: Refreshes the Contracts tab table with current contract data.
- `data.saveState()`: Persists state to localStorage.

## Development Process
- Work in feature branches (e.g., `feat/fuel-costs`) off `main`.
- Test manually by opening `index.html` in a browser (e.g., via VS Code Live Server).
- Merge to `main` after testing, update version in `README.md`, and tag (e.g., `git tag v0.2.0`).

## Known Limitations
- Distances are placeholders—real in-game data needed.
- Fuel estimates are basic (distance / 1000)—no ship-specific QT rates yet.
- Single-ship focus—no multi-ship optimization.