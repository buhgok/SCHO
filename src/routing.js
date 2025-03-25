// Routing module: Calculates and displays routes
function updateRoute() {
    const routeOutput = document.getElementById("route-output");
    let startLocation = document.getElementById("start-location").value.trim();
    const routeShip = document.getElementById("route-ship").value;
    const activeContracts = data.state.contracts.filter(c => c.status === "Pending" || c.status === "Enroute");

    // Validation
    if (!startLocation) {
        routeOutput.innerHTML = "Please set a starting location.";
        return;
    }
    if (!routeShip) {
        routeOutput.innerHTML = "Please select a ship for the route.";
        return;
    }
    if (activeContracts.length === 0) {
        routeOutput.innerHTML = "No active contracts.";
        return;
    }

    // Normalize starting location
    const fullStartLocation = data.state.locations.find(loc => loc.includes(startLocation)) || startLocation;
    const shipCapacity = data.ships[routeShip].totalSCU;
    let currentLocation = fullStartLocation;
    let cargoOnBoard = [];
    let visitedPickups = new Set();
    let route = [];

    function allTasksCompleted() {
        return activeContracts.every(contract =>
            contract.cargoItems.every(item =>
                visitedPickups.has(`${contract.name}-${item.pickup}-${item.material}`) &&
                !cargoOnBoard.some(c => c.item === item)
            )
        );
    }

    while (!allTasksCompleted()) {
        let startActions = [];
        let endActions = [];
        let currentSCU = cargoOnBoard.reduce((sum, c) => sum + c.scu, 0);
        let startContracts = new Set();
        let endContracts = new Set();

        // Pick up at current location (start)
        const pickupsHere = activeContracts.flatMap(contract =>
            contract.cargoItems
                .filter(item => item.pickup === currentLocation && !visitedPickups.has(`${contract.name}-${item.pickup}-${item.material}`))
                .map(item => ({ contract, item }))
        );
        for (const { contract, item } of pickupsHere) {
            if (currentSCU + item.cargo <= shipCapacity) {
                startActions.push(`Pick up ${item.material} (${item.cargo} SCU)`);
                cargoOnBoard.push({ contract, item, scu: item.cargo });
                visitedPickups.add(`${contract.name}-${item.pickup}-${item.material}`);
                startContracts.add(contract.name);
                currentSCU += item.cargo;
            }
        }

        // Choose next location
        const deliveryLocations = [...new Set(cargoOnBoard.map(c => c.item.delivery))];
        const pickupLocations = [...new Set(activeContracts.flatMap(contract =>
            contract.cargoItems.filter(item => !visitedPickups.has(`${contract.name}-${item.pickup}-${item.material}`)).map(item => item.pickup)
        ))].filter(loc => {
            const availablePickups = activeContracts.flatMap(c => c.cargoItems.filter(i => i.pickup === loc && !visitedPickups.has(`${c.name}-${i.pickup}-${i.material}`)));
            return availablePickups.some(item => currentSCU + item.cargo <= shipCapacity);
        });

        const allPossibleLocations = [...deliveryLocations, ...pickupLocations];
        if (allPossibleLocations.length === 0) break;

        // Calculate scores
        let scores = allPossibleLocations.map(loc => {
            if (deliveryLocations.includes(loc)) {
                const deliveries = cargoOnBoard.filter(c => c.item.delivery === loc).length;
                return { loc, score: deliveries, type: 'delivery' };
            } else {
                const availablePickups = activeContracts.flatMap(c => c.cargoItems.filter(i => i.pickup === loc && !visitedPickups.has(`${c.name}-${i.pickup}-${i.material}`)));
                let score = 0;
                for (const item of availablePickups) {
                    if (currentSCU + item.cargo <= shipCapacity) {
                        const bonus = cargoOnBoard.filter(c => c.item.delivery === item.delivery).length;
                        // Boost pickup score when cargo is onboard to encourage holding
                        score += (cargoOnBoard.length > 0 ? 2 : 1) + bonus;
                    }
                }
                return { loc, score, type: 'pickup' };
            }
        });

        // Force pickup when empty and pickups are available
        if (cargoOnBoard.length === 0 && pickupLocations.length > 0) {
            scores = scores.filter(s => s.type === 'pickup');
        }

        scores.sort((a, b) => b.score - a.score || (a.type === 'delivery' ? -1 : 1));
        const nextLocation = scores[0].loc;

        // Deliver at next location (end)
        const deliveriesThere = cargoOnBoard.filter(c => c.item.delivery === nextLocation);
        if (deliveriesThere.length > 0) {
            deliveriesThere.forEach(d => {
                endActions.push(`Deliver ${d.item.material} (${d.scu} SCU)`);
                endContracts.add(d.contract.name);
                cargoOnBoard = cargoOnBoard.filter(c => c !== d);
            });
            currentSCU = cargoOnBoard.reduce((sum, c) => sum + c.scu, 0);
        }

        // Record the leg with only deliveries at end
        route.push({
            start: currentLocation,
            startAction: startActions.length > 0 ? startActions.join(", ") : "Depart",
            end: nextLocation,
            endAction: endActions.length > 0 ? endActions.join(", ") : "Arrive",
            contract: (startActions.length > 0 || endActions.length > 0)
                ? [...startContracts, ...endContracts].join(", ")
                : "-"
        });

        currentLocation = nextLocation;
    }

    // Generate route table
    let tableHTML = `
        <table id="route-table">
            <thead>
                <tr>
                    <th>Leg #</th>
                    <th>Start</th>
                    <th>Action at Start</th>
                    <th>End</th>
                    <th>Action at End</th>
                    <th>Contract</th>
                </tr>
            </thead>
            <tbody>
    `;
    route.forEach((leg, index) => {
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${leg.start}</td>
                <td>${leg.startAction}</td>
                <td>${leg.end}</td>
                <td>${leg.endAction}</td>
                <td>${leg.contract}</td>
            </tr>
        `;
    });
    tableHTML += `</tbody></table>`;
    routeOutput.innerHTML = tableHTML;
}

window.routing = {
    updateRoute
};