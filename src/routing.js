// Routing module: Calculates and displays routes
function updateRoute() {
    const routeOutput = document.getElementById("route-output");
    const startLocation = document.getElementById("start-location").value.trim();
    const activeContracts = data.state.contracts.filter(c => c.status === "Pending" || c.status === "Enroute");

    if (!startLocation) {
        routeOutput.innerHTML = "Please set a starting location.";
        return;
    }
    if (activeContracts.length === 0) {
        routeOutput.innerHTML = "No active contracts.";
        return;
    }

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

    let route = [];
    let currentLocation = startLocation;
    let cargoOnBoard = [];
    let visitedPickups = new Set();
    let totalDistance = 0;
    let totalFuel = 0;
    const shipCapacity = data.ships["Constellation Taurus"].totalSCU; // Default ship for now

    function getDistance(from, to) {
        const key1 = `${from}-${to}`;
        const key2 = `${to}-${from}`;
        return data.distances[key1] || data.distances[key2] || 100000;
    }

    while (visitedPickups.size < cargoTasks.length || cargoOnBoard.length > 0) {
        let startActions = [];
        let endActions = [];
        let currentSCU = cargoOnBoard.reduce((sum, t) => sum + t.scu, 0);

        const deliveriesHere = cargoOnBoard.filter(t => t.delivery === currentLocation);
        if (deliveriesHere.length > 0) {
            startActions.push(...deliveriesHere.map(t => `Deliver ${t.material} (${t.scu} SCU)`));
            cargoOnBoard = cargoOnBoard.filter(t => t.delivery !== currentLocation);
            currentSCU = cargoOnBoard.reduce((sum, t) => sum + t.scu, 0);
        }

        const pickupsHere = cargoTasks.filter(t => t.pickup === currentLocation && !visitedPickups.has(t));
        for (const task of pickupsHere) {
            if (currentSCU + task.scu <= shipCapacity) {
                startActions.push(`Pick up ${task.material} (${task.scu} SCU)`);
                cargoOnBoard.push(task);
                visitedPickups.add(task);
                currentSCU += task.scu;
            }
        }

        const unvisitedPickups = cargoTasks.filter(t => !visitedPickups.has(t)).map(t => t.pickup);
        const pendingDeliveries = cargoOnBoard.map(t => t.delivery);
        const nextCandidates = [...new Set([...unvisitedPickups, ...pendingDeliveries])];

        let nextLocation = currentLocation;
        if (nextCandidates.length > 0) {
            nextLocation = nextCandidates.reduce((closest, loc) => {
                const dist = getDistance(currentLocation, loc);
                return dist < getDistance(currentLocation, closest) ? loc : closest;
            }, nextCandidates[0]);
        } else if (startActions.length === 0) {
            break;
        }

        const deliveriesNext = cargoOnBoard.filter(t => t.delivery === nextLocation);
        if (deliveriesNext.length > 0) {
            endActions.push(...deliveriesNext.map(t => `Deliver ${t.material} (${t.scu} SCU)`));
            cargoOnBoard = cargoOnBoard.filter(t => t.delivery !== nextLocation);
            currentSCU = cargoOnBoard.reduce((sum, t) => sum + t.scu, 0);
        }

        const pickupsNext = cargoTasks.filter(t => t.pickup === nextLocation && !visitedPickups.has(t));
        for (const task of pickupsNext) {
            if (currentSCU + task.scu <= shipCapacity) {
                endActions.push(`Pick up ${task.material} (${task.scu} SCU)`);
                cargoOnBoard.push(task);
                visitedPickups.add(task);
                currentSCU += task.scu;
            }
        }

        const dist = currentLocation === nextLocation ? 0 : getDistance(currentLocation, nextLocation);
        if (startActions.length > 0 || endActions.length > 0 || dist > 0) {
            route.push({
                start: currentLocation,
                startAction: startActions.length > 0 ? startActions.join(", ") : "Depart",
                end: nextLocation,
                endAction: endActions.length > 0 ? endActions.join(", ") : "Arrive",
                contract: (deliveriesHere[0] || pickupsHere[0] || deliveriesNext[0] || pickupsNext[0])?.contract?.name || "-",
                distance: dist,
                fuel: dist / 1000
            });
            totalDistance += dist;
            totalFuel += dist / 1000;
        }

        currentLocation = nextLocation;
    }

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
                <td>${leg.startAction}</td>
                <td>${leg.end}</td>
                <td>${leg.endAction}</td>
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
}

window.routing = {
    updateRoute
};