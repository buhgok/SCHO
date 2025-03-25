// Data module: Centralized state management
const data = {
    ships: {
        "Constellation Taurus": { totalSCU: 174, mainGrid: 168 },
        "Freelancer MAX": { totalSCU: 120, mainGrid: 120 }
        // Add more ships as needed
    },
    STATIC_MATERIALS: [
        "Agricium", "Aluminum", "Astatine", "Bexalite", "Chlorine", "Corundum",
        "Fluorine", "Gold", "Hydrogen", "Iodine", "Medical Supplies", "Pressurized Ice",
        "Processed Food", "Scrap", "Steel", "Titanium", "Waste", "WiDoW"
    ],
    // New: Clean, standardized locations list
    STATIC_LOCATIONS: [
        "Stanton: Port Tressler",
        "Stanton: Everus Harbor",
        "Stanton: Baijini Point",
        "Stanton: Seraphim Station",
        "Stanton: MIC-L2 Long Forest Station",
        "Stanton: MIC-L3 Endless Odyssey Station",
        "Stanton: Rayari Anvik Research Outpost",
        "Stanton: Rayari Cantwell Research Outpost",
        "Stanton: Rayari Deltana Research Outpost",
        "Stanton: Rayari McGrath Research Outpost",
        "Stanton: Shubin Mining Facility SMCa-8",
        "Stanton: Sakura Sun Goldenrod Workcenter",
        "Stanton: CRU-L4 Shallow Fields Station",
        "Stanton: microTech Logistics Depot S4LD13",
        "Stanton: microTech Logistics Depot S4LD01",
        "Pyro: Pyro V Fuel Depot",
        "Pyro: Pyro II Mining Site",
        "Pyro: Klescher Rehabilitation Facility (Pyro)",
        "Pyro: Stanton Gateway"
    ],
    state: {
        contracts: [],
        locations: [],
        sessionCompleted: { count: 0, earnings: 0 },
        materials: []
    },
    saveState() {
        localStorage.setItem("appState", JSON.stringify(this.state));
    },
    loadState() {
        const savedState = localStorage.getItem("appState");
        if (savedState) {
            this.state = JSON.parse(savedState);
        } else {
            // Initialize with defaults if no saved state
            this.state.materials = [...this.STATIC_MATERIALS];
            this.state.locations = [...this.STATIC_LOCATIONS];
            this.saveState();
        }
    }
};

data.loadState();
window.data = data;