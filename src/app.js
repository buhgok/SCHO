// src/app.js

console.log("app.js loaded");

// App module: Initializes the application and sets up event listeners
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded in app.js");
    try {
        const shipSelect = document.getElementById("ship");
        const contractForm = document.getElementById("contract-form");
        const locationForm = document.getElementById("location-form");
        const themeToggle = document.getElementById("theme-toggle");
        const resetButton = document.getElementById("reset-all");
        const addCargoButton = document.getElementById("add-cargo");
        const calculateRouteButton = document.getElementById("calculate-route");
        const refreshMaterialsButton = document.getElementById("refresh-materials");

        // Theme setup
        const savedTheme = localStorage.getItem("theme") || "dark";
        document.body.className = savedTheme;
        themeToggle.textContent = savedTheme === "dark" ? "Light Mode" : "Dark Mode";
        console.log("Theme set to:", savedTheme);

        // Populate initial UI
        Object.keys(data.ships).forEach(ship => shipSelect.appendChild(ui.createOption(ship)));
        ui.updateDatalists();
        ui.updateMaterialDropdown();
        ui.updateContractTable();
        ui.updateSession();
        ui.updateLocationTable();
        console.log("Initial UI populated");

        // Event listeners for tabs
        document.getElementById("contracts-tab").addEventListener("click", () => openTab("contracts"));
        document.getElementById("route-tab").addEventListener("click", () => openTab("route"));
        document.getElementById("locations-tab").addEventListener("click", () => openTab("locations"));
        document.getElementById("session-tab").addEventListener("click", () => openTab("session"));
        console.log("Tab event listeners attached");

        function openTab(tabId) {
            document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
            document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
            document.getElementById(tabId).classList.add("active");
            document.getElementById(`${tabId}-tab`).classList.add("active");
            console.log(`Switched to tab: ${tabId}`);
        }

        // Event listeners for other buttons
        contractForm.addEventListener("submit", (event) => {
            event.preventDefault();
            contracts.addContract();
            console.log("Contract form submitted");
        });

        locationForm.addEventListener("submit", (event) => {
            event.preventDefault();
            locations.addLocation(document.getElementById("new-location").value);
            document.getElementById("location-form").reset();
            console.log("Location form submitted");
        });

        themeToggle.addEventListener("click", () => {
            document.body.className = document.body.className === "dark" ? "light" : "dark";
            themeToggle.textContent = document.body.className === "dark" ? "Light Mode" : "Dark Mode";
            localStorage.setItem("theme", document.body.className);
            console.log("Theme toggled to:", document.body.className);
        });

        resetButton.addEventListener("click", () => {
            if (confirm("Reset all data? This will clear contracts, locations, and session summary.")) {
                data.state.contracts = [];
                data.state.sessionCompleted = { count: 0, earnings: 0 };
                data.state.materials = [...data.STATIC_MATERIALS];
                data.saveState();
                ui.updateContractTable();
                routing.updateRoute();
                ui.updateSession();
                ui.updateLocationTable();
                ui.updateDatalists();
                ui.updateMaterialDropdown();
                console.log("All data reset");
            }
        });

        addCargoButton.addEventListener("click", () => {
            const cargoItems = document.getElementById("cargo-items");
            const newItem = ui.createCargoItem();
            cargoItems.appendChild(newItem);
            console.log("Added new cargo item");
        });

        calculateRouteButton.addEventListener("click", () => {
            routing.updateRoute();
            console.log("Route calculated");
        });

        refreshMaterialsButton.addEventListener("click", () => {
            data.state.materials = [...data.STATIC_MATERIALS];
            data.saveState();
            ui.updateMaterialDropdown();
            console.log("Materials refreshed");
        });

        // Initial cargo item remove button
        document.querySelectorAll(".remove-cargo").forEach(btn => {
            btn.addEventListener("click", () => {
                if (document.querySelectorAll(".cargo-item").length > 1) btn.closest(".cargo-item").remove();
                console.log("Cargo item removed");
            });
        });

    } catch (error) {
        console.error("Error in DOMContentLoaded:", error);
        alert("Script error - check console (F12) for details.");
    }
});