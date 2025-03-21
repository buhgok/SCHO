// Locations module: Manages location CRUD and validation
function validateLocation(loc) {
    const validSystems = ["stanton", "pyro"];
    const [system] = loc.split(":");
    if (!system || !validSystems.includes(system.toLowerCase())) {
        alert("Invalid system. Use 'Stanton: ' or 'Pyro: ' followed by the location name.");
        return false;
    }
    return true;
}

function addLocation(newLocation) {
    newLocation = newLocation.trim();
    if (validateLocation(newLocation) && !data.state.locations.includes(newLocation)) {
        data.state.locations.push(newLocation);
        data.state.locations.sort();
        data.saveState();
        ui.updateLocationTable();
        ui.updateDatalists();
    }
}

function editLocation(index) {
    const newValue = prompt("Edit location:", data.state.locations[index]);
    if (newValue && validateLocation(newValue) && !data.state.locations.includes(newValue.trim())) {
        data.state.locations[index] = newValue.trim();
        data.state.locations.sort();
        data.saveState();
        ui.updateLocationTable();
        ui.updateDatalists();
    }
}

function deleteLocation(index) {
    if (confirm(`Delete "${data.state.locations[index]}"?`)) {
        data.state.locations.splice(index, 1);
        data.saveState();
        ui.updateLocationTable();
        ui.updateDatalists();
    }
}

window.locations = {
    validateLocation,
    addLocation,
    editLocation,
    deleteLocation
};