// UI module: Handles DOM updates and events
function createOption(value) {
    const option = document.createElement("option");
    option.value = value;
    option.text = value;
    return option;
}

function updateDatalists() {
    const pickupList = document.getElementById("pickup-list");
    const deliveryList = document.getElementById("delivery-list");
    pickupList.innerHTML = "";
    deliveryList.innerHTML = "";
    data.state.locations.forEach(loc => {
        pickupList.appendChild(createOption(loc));
        deliveryList.appendChild(createOption(loc));
    });
}

function updateMaterialDropdown(dropdown = null) {
    const targets = dropdown ? [dropdown] : document.querySelectorAll(".material");
    targets.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select Material</option>';
        data.state.materials.forEach(mat => {
            const option = createOption(mat);
            if (mat === currentValue) option.selected = true;
            select.appendChild(option);
        });
    });
}

function createCargoItem(item = {}) {
    const newItem = document.createElement("div");
    newItem.className = "cargo-item";
    newItem.innerHTML = `
        <label>Material: 
            <select class="material" required>
                <option value="">Select Material</option>
            </select>
        </label>
        <label>Pickup: <input type="text" class="pickup" list="pickup-list" value="${item.pickup || ''}" required></label>
        <label>Delivery: <input type="text" class="delivery" list="delivery-list" value="${item.delivery || ''}" required></label>
        <label>Cargo Size (SCU): <input type="number" class="cargo" value="${item.cargo || ''}" min="1" required></label>
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
    newItem.querySelector(".material").value = item.material || "";
    newItem.querySelector(".remove-cargo").addEventListener("click", () => {
        if (document.querySelectorAll(".cargo-item").length > 1) newItem.remove();
    });
    updateMaterialDropdown(newItem.querySelector(".material"));
    return newItem;
}

function updateContractTable() {
    const tbody = document.getElementById("contract-list");
    tbody.innerHTML = "";
    data.state.contracts.forEach((contract, index) => {
        const cargoDetails = contract.cargoItems.map(item =>
            `${item.material}: ${item.cargo} SCU (${item.pickup} → ${item.delivery})`
        ).join("<br>");
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${contract.name}</td>
            <td>${cargoDetails}</td>
            <td>${contract.reward}</td>
            <td>
                <select onchange="contracts.updateStatus(${index}, this.value)">
                    <option value="Pending" ${contract.status === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="Enroute" ${contract.status === "Enroute" ? "selected" : ""}>Enroute</option>
                    <option value="Completed" ${contract.status === "Completed" ? "selected" : ""}>Completed</option>
                    <option value="Abandoned" ${contract.status === "Abandoned" ? "selected" : ""}>Abandoned</option>
                </select>
            </td>
            <td>${contract.ship}</td>
            <td>
                <button class="edit" onclick="contracts.editContract(${index})">Edit</button>
                <button class="delete" onclick="contracts.deleteContract(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateLocationTable() {
    const tbody = document.getElementById("location-list");
    tbody.innerHTML = "";
    data.state.locations.forEach((loc, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${loc}</td>
            <td>
                <button class="edit" onclick="locations.editLocation(${index})">Edit</button>
                <button class="delete" onclick="locations.deleteLocation(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateSession() {
    const sessionOutput = document.getElementById("session-output");
    sessionOutput.innerHTML = `Completed: ${data.state.sessionCompleted.count} contracts | Earnings: ${data.state.sessionCompleted.earnings} aUEC`;
}

window.ui = {
    createOption,
    updateDatalists,
    updateMaterialDropdown,
    createCargoItem,
    updateContractTable,
    updateLocationTable,
    updateSession
};