console.log("data.js loaded");
// Data module: Manages static data and localStorage
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

const STATIC_MATERIALS = [
    "Agricium", "Aluminum", "Astatine", "Bexalite", "Copper", "Corundum", "Diamond", "Gold", "Iron", "Quantanium", "Titanium", "Tungsten",
    "Chlorine", "Fluorine", "Helium", "Hydrogen", "Iodine", "Nitrogen",
    "Waste", "Scrap", "Recycled Material Composite",
    "Agricultural Supplies", "Distilled Spirits", "Fresh Food", "Processed Food",
    "Medical Supplies", "Stims", "SLAM", "WiDoW",
    "Construction Materials", "Souvenirs", "Steel"
];

const state = {
    contracts: JSON.parse(localStorage.getItem("contracts")) || [],
    sessionCompleted: JSON.parse(localStorage.getItem("sessionCompleted")) || { count: 0, earnings: 0 },
    locations: JSON.parse(localStorage.getItem("locations")) || [
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
    ],
    materials: JSON.parse(localStorage.getItem("materials")) || [...STATIC_MATERIALS]
};

function saveState() {
    localStorage.setItem("contracts", JSON.stringify(state.contracts));
    localStorage.setItem("sessionCompleted", JSON.stringify(state.sessionCompleted));
    localStorage.setItem("locations", JSON.stringify(state.locations));
    localStorage.setItem("materials", JSON.stringify(state.materials));
}

window.data = {
    ships,
    distances,
    STATIC_MATERIALS,
    state,
    saveState
};