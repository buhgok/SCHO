// Contracts module: Manages contract CRUD and logic
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
        if (!data.state.locations.includes(item.pickup)) {
            if (!locations.validateLocation(item.pickup)) return;
            locations.addLocation(item.pickup);
        }
        if (!data.state.locations.includes(item.delivery)) {
            if (!locations.validateLocation(item.delivery)) return;
            locations.addLocation(item.delivery);
        }
    });

    const shipData = data.ships[ship];
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
    data.state.contracts.push(contract);
    data.saveState();

    document.getElementById("contract-form").reset();
    document.getElementById("cargo-items").innerHTML = document.getElementById("cargo-items").children[0].outerHTML;
    ui.updateContractTable();
}

function editContract(index) {
    const contract = data.state.contracts[index];
    document.getElementById("name").value = contract.name;
    document.getElementById("ship").value = contract.ship;
    document.getElementById("reward").value = contract.reward;

    const cargoItemsDiv = document.getElementById("cargo-items");
    cargoItemsDiv.innerHTML = "";
    contract.cargoItems.forEach(item => {
        const newItem = ui.createCargoItem(item);
        cargoItemsDiv.appendChild(newItem);
    });

    data.state.contracts.splice(index, 1);
    data.saveState();
    ui.updateContractTable();
}

function deleteContract(index) {
    const contract = data.state.contracts[index];
    if (contract.status === "Completed" && contract.completedOnce) {
        data.state.sessionCompleted.count--;
        data.state.sessionCompleted.earnings -= contract.reward;
        ui.updateSession();
    }
    data.state.contracts.splice(index, 1);
    data.saveState();
    ui.updateContractTable();
}

function updateStatus(index, newStatus) {
    const contract = data.state.contracts[index];
    const oldStatus = contract.status;
    contract.status = newStatus;

    if (newStatus === "Completed" && !contract.completedOnce) {
        data.state.sessionCompleted.count++;
        data.state.sessionCompleted.earnings += contract.reward;
        contract.completedOnce = true;
        ui.updateSession();
    } else if (oldStatus === "Completed" && newStatus !== "Completed" && contract.completedOnce) {
        data.state.sessionCompleted.count--;
        data.state.sessionCompleted.earnings -= contract.reward;
        contract.completedOnce = false;
        ui.updateSession();
    }

    data.saveState();
    ui.updateContractTable();
}

window.contracts = {
    addContract,
    editContract,
    deleteContract,
    updateStatus
};