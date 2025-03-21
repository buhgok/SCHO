# SCHOT User Guide

## Welcome to SCHOT
The Star Citizen Hauling Optimization Tool (SCHOT) helps you plan hauling contracts and routes in Star Citizen. This guide walks you through its features as of Alpha 0.2.0.

## Getting Started
1. Clone or download from [GitHub](https://github.com/buhgok/SCHOT).
2. Open `index.html` in your browser—no server needed.

## Interface Overview
- **Tabs**: Contracts, Route, Locations, Session.
- **Header**: SCHOT title, Theme Toggle (Light/Dark), Reset All button.

## Adding a Contract
1. Go to the "Contracts" tab.
2. Fill in:
   - **Name**: Your contract name (e.g., "Ore Run 1").
   - **Ship**: Select from dropdown (e.g., "Constellation Taurus").
   - **Reward (aUEC)**: Enter payment (e.g., 5000).
   - **Cargo Items**:
     - **Material**: Choose from 33 options (e.g., "Agricium").
     - **Pickup/Delivery**: Type or select locations (e.g., "Stanton: Port Tressler").
     - **Cargo Size (SCU)**: Enter amount (e.g., 8).
     - **Max Container (SCU)**: Select container size (e.g., 8).
   - Add more cargo with "Add Cargo" button if needed.
3. Click "Add Contract".
   - Note: SCHOT checks if total SCU fits your ship (e.g., 174 SCU for Taurus).

## Managing Contracts
- **Edit**: Click "Edit" to modify a contract—it loads into the form; re-save when done.
- **Delete**: Click "Delete" to remove a contract.
- **Status**: Change via dropdown (Pending, Enroute, Completed, Abandoned).
  - "Completed" updates the Session tab’s earnings/count.
- **Refresh Materials**: In the "Route" tab, click "Refresh Materials" to reset the material dropdown list to its default 33 commodities (e.g., if you’ve added custom ones and want to start fresh).

## Calculating a Route
1. Go to the "Route" tab.
2. Enter a **Starting Location** (e.g., "Stanton: Port Tressler")—use the autocomplete list.
3. Click "Calculate Route".
4. View the table:
   - **Leg #**: Route steps.
   - **Start/End**: Locations.
   - **Action at Start/End**: Pickup or deliver cargo (e.g., "Pick up Agricium (8 SCU)").
   - **Distance/Fuel**: Estimates (placeholders for now).

## Managing Locations
1. Go to the "Locations" tab.
2. **Add**: Enter a new location (e.g., "Pyro: Ruin Station") and click "Add Location".
   - Must start with "Stanton: " or "Pyro: ".
3. **Edit/Delete**: Click buttons next to a location to modify or remove it.
   - Updates autocomplete lists in Contracts/Route tabs.

## Tracking Earnings
1. Go to the "Session" tab.
2. See:
   - **Completed**: Number of contracts marked "Completed".
   - **Earnings**: Total aUEC from completed contracts.

## Customizing the Look
- Click "Light Mode" or "Dark Mode" in the header to switch themes.

## Resetting Data
- Click "Reset All" in the header to clear all contracts, locations, and session data.
  - Confirms with a prompt to avoid accidents.

## Tips
- Use "Refresh Materials" in the Route tab to reset the material list to defaults.
- Save often—data persists in your browser’s localStorage.

## Current Limitations
- Distances and fuel are rough estimates—real values coming soon.
- Only supports one ship per contract.