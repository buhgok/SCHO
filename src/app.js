// App module: Initializes the application and sets up event listeners
document.addEventListener("DOMContentLoaded", () => {
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

        // Populate initial UI
        Object.keys(data.ships).forEach(ship => shipSelect.appendChild(ui.createOption(ship)));
        ui.updateDatalists();
        ui.updateMaterialDropdown();
        ui.updateContractTable();
        ui.updateSession();
        ui.updateLocationTable();

        // Event listeners
        contractForm.addEventListener("submit", (event) => {
            event.preventDefault();
            contracts.addContract();
        });

        locationForm.addEventListener("submit", (event) => {
            event.preventDefault();
            locations.addLocation(document.getElementById("new-location").value);
            document.getElementById("location-form").reset();
        });

        themeToggle.addEventListener("click", () => {
            document.body.className = document.body.className === "dark" ? "light" : "dark";
            themeToggle.textContent = document.body.className === "dark" ? "Light Mode" : "Dark Mode";
            localStorage.setItem("theme", document.body.className);
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
            }
        });

        addCargoButton.addEventListener("click", () => {
            const cargoItems = document.getElementById("cargo-items");
            const newItem = ui.createCargoItem();
            cargoItems.appendChild(newItem);
        });

        calculateRouteButton.addEventListener("click", () => {
            routing.updateRoute();
        });

        refreshMaterialsButton.addEventListener("click", () => {
            data.state.materials = [...data.STATIC_MATERIALS];
            data.saveState();
            ui.updateMaterialDropdown();
        });

        // Initial cargo item remove button
        document.querySelectorAll(".remove-cargo").forEach(btn => {
            btn.addEventListener("click", () => {
                if (document.querySelectorAll(".cargo-item").length > 1) btn.closest(".cargo-item").remove();
            });
        });

    } catch (error) {
        console.error("Error in DOMContentLoaded:", error);
        alert("Script error - check console (F12) for details.");
    }
});