let contracts = JSON.parse(localStorage.getItem("contracts")) || [];
let sessionCompleted = JSON.parse(localStorage.getItem("sessionCompleted")) || { count: 0, earnings: 0 };
let locations = JSON.parse(localStorage.getItem("locations")) || [
    "Stanton: ARC-L1 Wide Forest Station", "Stanton: ARC-L2 Lively Pathway Station", "Stanton: ARC-L5 Yellow Core Station",
    "Stanton: Baijini Point", "Stanton: Covalex Distribution Center (S4DC05)", "Stanton: CRU-L1 Ambitious Dream Station",
    "Stanton: CRU-L4 Shallow Fields Station", "Stanton: Devlin Scrap & Salvage", "Stanton: Everus Harbor",
    "Stanton: Greycat Stanton IV Production Complex-A", "Stanton: HUR-L2 Faithful Dream Station",
    "Stanton: MIC-L1 Shallow Frontier Station", "Stanton: MIC-L2 Long Forest Station", "Stanton: MIC-L4 Red Crossroads Station",
    "Stanton: microTech Logistics Depot (S4LD13)", "Stanton: NB Int. Spaceport", "Stanton: Port Tressler",
    "Stanton: Pyro Gateway", "Stanton: Rayari Anvik Research Outpost", "Stanton: Rayari Cantwell Research Outpost",
    "Stanton: Rayari Deltana Research Outpost", "Stanton: Rayari Kaltag Research Outpost", "Stanton: Rayari McGrath Research Outpost",
    "Stanton: Sakura Sun Goldenrod Workcenter", "Stanton: Seraphim Station", "Stanton: Shubin Mining Facility (SMCa-6)",
    "Stanton: Shubin Mining Facility (SMCa-8)", "Stanton: Terra Gateway", "Stanton: MIC-L3 Endless Odyssey Station",
    "Pyro: Ruin Station", "Pyro: Stanton Gateway", "Pyro: Pyro I Outpost", "Pyro: Pyro II Mining Site",
    "Pyro: Pyro III Refinery", "Pyro: Pyro V Fuel Depot", "Pyro: Klescher Rehabilitation Facility (Pyro)"
];

const ships = {
    "Hull A": { totalSCU: 64, fuel: 600 },
    "Constellation Taurus": { totalSCU: 174, mainGrid: 168, rearGrid: 6, fuel: 1200 },
    "Freelancer MAX": { totalSCU: 120, fuel: 1000 },
    "Hull B": { totalSCU: 384, fuel: 1500 },
    "Mercury Star Runner": { totalSCU: 96, fuel: 1100 },
    "Caterpillar": { totalSCU: 576, fuel: 2000 },
    "Hull C": { totalSCU: 4608, fuel: 5000 },
    "C2 Hercules": { totalSCU: 696, fuel: 2500 },
    "M2 Hercules": { totalSCU: 522, fuel: 2300 }
};

const distances = {
    "Stanton: Port Tressler-Stanton: NB Int. Spaceport": 50000,
    "Stanton: ARC-L1 Wide Forest Station-Stanton: Everus Harbor": 800000,
    "Pyro: Ruin Station-Pyro: Pyro Gateway": 200000,
    "Pyro: Pyro I Outpost-Pyro: Pyro V Fuel Depot": 300000
};

function updateDatalist(datalist) {
    datalist.innerHTML = "";
    locations.forEach(loc => datalist.appendChild(createOption(loc)));
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded fired - script.js is running!");
    try {
        const pickupList = document.getElementById("pickup-list");
        const deliveryList = document.getElementById("delivery-list");
        const shipSelect = document.getElementById("ship");
        const contractForm = document.getElementById("contract-form");
        const locationForm = document.getElementById("location-form");
        const themeToggle = document.getElementById("theme-toggle");
        const resetButton = document.getElementById("reset-all");
        const addCargoButton = document.getElementById("add-cargo");
        const calculateRouteButton = document.getElementById("calculate-route");

        const savedTheme = localStorage.getItem("theme") || "dark";
        document.body.className = savedTheme;
        themeToggle.textContent = savedTheme === "dark" ? "Light Mode" : "Dark Mode";

        console.log("Populating ships dropdown...");
        Object.keys(ships).forEach(ship => shipSelect.appendChild(createOption(ship)));
        console.log("Populating datalists...");
        updateDatalist(pickupList);
        updateDatalist(deliveryList);
        updateTable();
        updateSession();
        updateLocationTable();

        contractForm.addEventListener("submit", (event) => {
            event.preventDefault();
            addContract();
        });

        locationForm.addEventListener("submit", (event) => {
            event.preventDefault();
            addLocation();
        });

        themeToggle.addEventListener("click", () => {
            document.body.className = document.body.className === "dark" ? "light" : "dark";
            themeToggle.textContent = document.body.className === "dark" ? "Light Mode" : "Dark Mode";
            localStorage.setItem("theme", document.body.className);
        });

        resetButton.addEventListener("click", () => {
            if (confirm("Reset all data? This will clear contracts, locations, and session summary.")) {
                contracts = [];
                sessionCompleted = { count: 0, earnings: 0 };
                locations = [...locations];
                localStorage.setItem("contracts", JSON.stringify(contracts));
                localStorage.setItem("sessionCompleted", JSON.stringify(sessionCompleted));
                localStorage.setItem("locations", JSON.stringify(locations));
                updateTable();
                updateRoute();
                updateSession();
                updateLocationTable();
                updateDatalist(pickupList);
                updateDatalist(deliveryList);
            }
        });

        addCargoButton.addEventListener("click", () => {
            const cargoItems = document.getElementById("cargo-items");
            const newItem = cargoItems.children[0].cloneNode(true);
            newItem.querySelectorAll("input, select").forEach(el => el.value = "");
            newItem.querySelector(".remove-cargo").addEventListener("click", () => newItem.remove());
            cargoItems.appendChild(newItem);
        });

        document.querySelectorAll(".remove-cargo").forEach(btn => {
            btn.addEventListener("click", () => {
                if (document.querySelectorAll(".cargo-item").length > 1) btn.closest(".cargo-item").remove();
            });
        });

        calculateRouteButton.addEventListener("click", () => {
            console.log("Calculate Route button clicked!");
            updateRoute();
        });

        console.log("Initialization complete!");
    } catch (error) {
        console.error("Error in DOMContentLoaded:", error);
        alert("Script error - check console (F12) for details.");
    }
});

function createOption(value) {
    const option = document.createElement("option");
    option.value = value;
    option.text = value;
    return option;
}

function validateLocation(loc) {
    const validSystems = ["stanton", "pyro"];
    const [system] = loc.split(":");
    if (!system || !validSystems.includes(system.toLowerCase())) {
        alert("Invalid system. Use 'Stanton: ' or 'Pyro: ' followed by the location name.");
        return false;
    }
    return true;
}

function addContract() {
    const name = document.getElementById("name").value;
    const ship = document.getElementById("ship").value;
    const reward = parseInt(document.getElementById("reward").value);
    const cargoItems = Array.from(document.querySelectorAll(".cargo-item")).map(item => ({
        material: item.querySelector(".material").value,
        pickup: item.querySelector(".pickup").value.trim(),
        delivery: item.querySelector(".delivery").value.trim(),
        cargo: parseInt(item.querySelector(".cargo").value),
        maxContainer: parseInt(item.querySelector(".max-container").value)
    }));

    cargoItems.forEach(item => {
        if (!locations.includes(item.pickup)) {
            if (!validateLocation(item.pickup)) return;
            locations.push(item.pickup);
        }
        if (!locations.includes(item.delivery)) {
            if (!validateLocation(item.delivery)) return;
            locations.push(item.delivery);
        }
    });
    locations.sort();
    localStorage.setItem("locations", JSON.stringify(locations));
    updateDatalist(document.getElementById("pickup-list"));
    updateDatalist(document.getElementById("delivery-list"));

    const shipData = ships[ship];
    const totalSCU = cargoItems.reduce((sum, item) => sum + item.cargo, 0);
    if (totalSCU > shipData.totalSCU) {
        alert(`Total cargo (${totalSCU} SCU) exceeds ${ship} capacity (${shipData.totalSCU} SCU).`);
        return;
    }
    cargoItems.forEach(item => {
        if (item.maxContainer > shipData.totalSCU || (ship === "Constellation Taurus" && item.maxContainer > shipData.mainGrid)) {
            alert(`Max Container (${item.maxContainer} SCU) for ${item.material} exceeds ${ship === "Constellation Taurus" ? "main grid (168 SCU)" : "ship capacity"}.`);
        }
    });

    const contract = { name, ship, reward, cargoItems, status: "Pending", completedOnce: false };
    contracts.push(contract);
    localStorage.setItem("contracts", JSON.stringify(contracts));

    document.getElementById("contract-form").reset();
    document.getElementById("cargo-items").innerHTML = document.getElementById("cargo-items").children[0].outerHTML;
    updateTable();
}

function updateTable() {
    const tbody = document.getElementById("contract-list");
    tbody.innerHTML = "";

    contracts.forEach((contract, index) => {
        const cargoDetails = contract.cargoItems.map(item =>
            `${item.material}: ${item.cargo} SCU (${item.pickup} → ${item.delivery})`
        ).join("<br>");
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${contract.name}</td>
            <td>${cargoDetails}</td>
            <td>${contract.reward}</td>
            <td>
                <select onchange="updateStatus(${index}, this.value)">
                    <option value="Pending" ${contract.status === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="Enroute" ${contract.status === "Enroute" ? "selected" : ""}>Enroute</option>
                    <option value="Completed" ${contract.status === "Completed" ? "selected" : ""}>Completed</option>
                    <option value="Abandoned" ${contract.status === "Abandoned" ? "selected" : ""}>Abandoned</option>
                </select>
            </td>
            <td>${contract.ship}</td>
            <td>
                <button class="edit" onclick="editContract(${index})">Edit</button>
                <button class="delete" onclick="deleteContract(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editContract(index) {
    const contract = contracts[index];
    document.getElementById("name").value = contract.name;
    document.getElementById("ship").value = contract.ship;
    document.getElementById("reward").value = contract.reward;

    const cargoItemsDiv = document.getElementById("cargo-items");
    cargoItemsDiv.innerHTML = "";
    contract.cargoItems.forEach(item => {
        const newItem = cargoItemsDiv.children[0] ? cargoItemsDiv.children[0].cloneNode(true) : document.createElement("div");
        newItem.className = "cargo-item";
        newItem.innerHTML = `
            <label>Material: <input type="text" class="material" value="${item.material}" required></label>
            <label>Pickup: <input type="text" class="pickup" list="pickup-list" value="${item.pickup}" required></label>
            <label>Delivery: <input type="text" class="delivery" list="delivery-list" value="${item.delivery}" required></label>
            <label>Cargo Size (SCU): <input type="number" class="cargo" value="${item.cargo}" min="1" required></label>
            <label>Max Container (SCU): 
                <select class="max-container" required>
                    <option value="1" ${item.maxContainer === 1 ? "selected" : ""}>1</option>
                    <option value="2" ${item.maxContainer === 2 ? "selected" : ""}>2</option>
                    <option value="4" ${item.maxContainer === 4 ? "selected" : ""}>4</option>
                    <option value="8" ${item.maxContainer === 8 ? "selected" : ""}>8</option>
                    <option value="16" ${item.maxContainer === 16 ? "selected" : ""}>16</option>
                    <option value="32" ${item.maxContainer === 32 ? "selected" : ""}>32</option>
                    <option value="64" ${item.maxContainer === 64 ? "selected" : ""}>64</option>
                </select>
            </label>
            <button type="button" class="remove-cargo">Remove</button>
        `;
        newItem.querySelector(".remove-cargo").addEventListener("click", () => newItem.remove());
        cargoItemsDiv.appendChild(newItem);
    });

    contracts.splice(index, 1);
    localStorage.setItem("contracts", JSON.stringify(contracts));
    updateTable();
}

function deleteContract(index) {
    const contract = contracts[index];
    if (contract.status === "Completed" && contract.completedOnce) {
        sessionCompleted.count--;
        sessionCompleted.earnings -= contract.reward;
        localStorage.setItem("sessionCompleted", JSON.stringify(sessionCompleted));
        updateSession();
    }
    contracts.splice(index, 1);
    localStorage.setItem("contracts", JSON.stringify(contracts));
    updateTable();
}

function updateStatus(index, newStatus) {
    const contract = contracts[index];
    const oldStatus = contract.status;
    contract.status = newStatus;

    if (newStatus === "Completed" && !contract.completedOnce) {
        sessionCompleted.count++;
        sessionCompleted.earnings += contract.reward;
        contract.completedOnce = true;
        localStorage.setItem("sessionCompleted", JSON.stringify(sessionCompleted));
        updateSession();
    } else if (oldStatus === "Completed" && newStatus !== "Completed" && contract.completedOnce) {
        sessionCompleted.count--;
        sessionCompleted.earnings -= contract.reward;
        contract.completedOnce = false;
        localStorage.setItem("sessionCompleted", JSON.stringify(sessionCompleted));
        updateSession();
    }

    localStorage.setItem("contracts", JSON.stringify(contracts));
    updateTable();
}

function updateRoute() {
    const routeOutput = document.getElementById("route-output");
    const startLocation = document.getElementById("start-location").value.trim();
    const activeContracts = contracts.filter(c => c.status === "Pending" || c.status === "Enroute");

    console.log("updateRoute started", { startLocation, activeContractsLength: activeContracts.length });

    if (!startLocation) {
        routeOutput.innerHTML = "Please set a starting location.";
        console.log("No start location set");
        return;
    }
    if (activeContracts.length === 0) {
        routeOutput.innerHTML = "No active contracts.";
        console.log("No active contracts");
        return;
    }

    // Gather all cargo tasks
    let cargoTasks = [];
    activeContracts.forEach(contract => {
        contract.cargoItems.forEach(item => {
            cargoTasks.push({
                pickup: item.pickup,
                delivery: item.delivery,
                material: item.material,
                scu: item.cargo,
                contract: contract
            });
        });
    });
    console.log("Cargo tasks gathered", cargoTasks);

    let route = [];
    let currentLocation = startLocation;
    let cargoOnBoard = [];
    let visitedPickups = new Set();
    let totalDistance = 0;
    let totalFuel = 0;
    const shipCapacity = ships["Constellation Taurus"].totalSCU; // 174 SCU

    // Helper to get distance between two points
    function getDistance(from, to) {
        const key1 = `${from}-${to}`;
        const key2 = `${to}-${from}`;
        return distances[key1] || distances[key2] || 100000; // Default 100,000 km if unknown
    }

    while (visitedPickups.size < cargoTasks.length || cargoOnBoard.length > 0) {
        console.log("Loop iteration", { currentLocation, visitedPickups: visitedPickups.size, cargoOnBoard: cargoOnBoard.length });
        let actions = [];
        let currentSCU = cargoOnBoard.reduce((sum, t) => sum + t.scu, 0);

        // Deliver anything we can at current location
        const deliveriesHere = cargoOnBoard.filter(t => t.delivery === currentLocation);
        if (deliveriesHere.length > 0) {
            actions.push(...deliveriesHere.map(t => `Deliver ${t.material} (${t.scu} SCU)`));
            cargoOnBoard = cargoOnBoard.filter(t => t.delivery !== currentLocation);
            currentSCU = cargoOnBoard.reduce((sum, t) => sum + t.scu, 0);
        }

        // Pick up anything available here if capacity allows
        const pickupsHere = cargoTasks.filter(t => t.pickup === currentLocation && !visitedPickups.has(t));
        for (const task of pickupsHere) {
            if (currentSCU + task.scu <= shipCapacity) {
                actions.push(`Pick up ${task.material} (${task.scu} SCU)`);
                cargoOnBoard.push(task);
                visitedPickups.add(task);
                currentSCU += task.scu;
            }
        }
        console.log("Actions at current location", { actions, currentSCU });

        // Decide next stop
        const unvisitedPickups = cargoTasks.filter(t => !visitedPickups.has(t)).map(t => t.pickup);
        const pendingDeliveries = cargoOnBoard.map(t => t.delivery);
        const nextCandidates = [...new Set([...unvisitedPickups, ...pendingDeliveries])];
        console.log("Next candidates", nextCandidates);

        let nextLocation = currentLocation;
        if (nextCandidates.length > 0) {
            nextLocation = nextCandidates.reduce((closest, loc) => {
                const dist = getDistance(currentLocation, loc);
                return dist < getDistance(currentLocation, closest) ? loc : closest;
            }, nextCandidates[0]);
        } else if (actions.length === 0) {
            console.log("No more tasks, breaking loop");
            break;
        }

        // Add leg only if there's a change or action
        const dist = currentLocation === nextLocation ? 0 : getDistance(currentLocation, nextLocation);
        if (actions.length > 0 || dist > 0) {
            route.push({
                start: currentLocation,
                end: nextLocation,
                action: actions.length > 0 ? actions.join(", ") : "Travel",
                contract: (deliveriesHere[0] || pickupsHere[0])?.contract?.name || "-",
                distance: dist,
                fuel: dist / 1000
            });
            totalDistance += dist;
            totalFuel += dist / 1000;
            console.log("Leg added", route[route.length - 1]);
        }

        currentLocation = nextLocation;
    }

    // Generate table
    let tableHTML = `
        <table id="route-table">
            <thead>
                <tr>
                    <th>Leg #</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Action at End</th>
                    <th>Contract</th>
                    <th>Distance (km)</th>
                    <th>Fuel Needed</th>
                </tr>
            </thead>
            <tbody>
    `;

    route.forEach((leg, index) => {
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${leg.start}</td>
                <td>${leg.end}</td>
                <td>${leg.action}</td>
                <td>${leg.contract}</td>
                <td>${leg.distance}</td>
                <td>${leg.fuel}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
        <p>Total Distance: ${totalDistance} km | Total Fuel: ${totalFuel}</p>
    `;
    routeOutput.innerHTML = tableHTML;
    console.log("Route output updated", { totalDistance, totalFuel });
}

function updateSession() {
    const sessionOutput = document.getElementById("session-output");
    sessionOutput.innerHTML = `Completed: ${sessionCompleted.count} contracts | Earnings: ${sessionCompleted.earnings} aUEC`;
}

function addLocation() {
    const newLocation = document.getElementById("new-location").value.trim();
    if (validateLocation(newLocation) && !locations.includes(newLocation)) {
        locations.push(newLocation);
        locations.sort();
        localStorage.setItem("locations", JSON.stringify(locations));
        updateLocationTable();
        updateDatalist(document.getElementById("pickup-list"));
        updateDatalist(document.getElementById("delivery-list"));
    }
    document.getElementById("location-form").reset();
}

function updateLocationTable() {
    const tbody = document.getElementById("location-list");
    tbody.innerHTML = "";

    locations.forEach((loc, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${loc}</td>
            <td>
                <button class="edit" onclick="editLocation(${index})">Edit</button>
                <button class="delete" onclick="deleteLocation(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editLocation(index) {
    const newValue = prompt("Edit location:", locations[index]);
    if (newValue && validateLocation(newValue) && !locations.includes(newValue.trim())) {
        locations[index] = newValue.trim();
        locations.sort();
        localStorage.setItem("locations", JSON.stringify(locations));
        updateLocationTable();
        updateDatalist(document.getElementById("pickup-list"));
        updateDatalist(document.getElementById("delivery-list"));
    }
}

function deleteLocation(index) {
    if (confirm(`Delete "${locations[index]}"?`)) {
        locations.splice(index, 1);
        localStorage.setItem("locations", JSON.stringify(locations));
        updateLocationTable();
        updateDatalist(document.getElementById("pickup-list"));
        updateDatalist(document.getElementById("delivery-list"));
    }
}

function openTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    document.querySelector(`button[onclick="openTab('${tabId}')"]`).classList.add("active");
}