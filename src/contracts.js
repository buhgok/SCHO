console.log("contracts.js loaded");
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

async function captureScreenshot() {
    console.log("Starting captureScreenshot function");
    try {
        // Check if getDisplayMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            throw new Error("getDisplayMedia is not supported in this browser");
        }

        console.log("Requesting screen share");
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        console.log("Screen share stream obtained");
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        console.log("Video stream playing");

        // Capture the full screenshot
        const imageData = await new Promise((resolve) => {
            setTimeout(() => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                stream.getTracks().forEach(track => track.stop()); // Stop sharing
                console.log("Full screenshot captured");
                resolve(dataUrl);
            }, 1000); // Delay to ensure game content is visible
        });

        // Perform OCR on the full screenshot
        console.log("Starting OCR on full screenshot");
        const { data: { text } } = await Tesseract.recognize(imageData, 'eng');
        console.log('Extracted text:', text);

        // Parse the text
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        const contractData = {
            name: '',
            ship: '',
            reward: 0,
            cargoItems: []
        };

        let material = '';
        let pickup = '';
        let maxContainer = 1; // Default

        lines.forEach(line => {
            console.log('Processing line:', line); // Debug each line

            // Extract contract name (e.g., "Junior Rank - Solar Small Cargo Haul")
            if (!contractData.name && (line.includes('Junior Rank') || line.includes('Rookie Rank') || line.includes('Senior Rank'))) {
                const nameMatch = line.match(/(Junior|Senior|Rookie)\s*Rank\s*-\s*([^\n]+)/i);
                if (nameMatch) {
                    contractData.name = nameMatch[0].trim();
                    console.log('Parsed name:', contractData.name);
                }
            }

            // Extract material and pickup (e.g., "Collect Corundum from MIC-L2 Long Forest Station")
            if (line.includes('Collect')) {
                const collectMatch = line.match(/Collect\s*([A-Za-z-]+)\s*from\s*([^\.]+)/i);
                if (collectMatch) {
                    material = collectMatch[1].trim(); // e.g., "Corundum"
                    pickup = collectMatch[2].trim(); // e.g., "MIC-L2 Long Forest Station"
                    console.log('Parsed material:', material, 'Pickup:', pickup);
                } else {
                    console.log('Collect line found but regex did not match:', line);
                }
            }

            // Fallback for material if not found in "Collect"
            if (!material && line.includes('processed a bunch of')) {
                const materialMatch = line.match(/processed a bunch of\s*([A-Za-z-]+)/i);
                if (materialMatch) {
                    material = materialMatch[1].trim();
                    console.log('Fallback material:', material);
                } else {
                    console.log('Processed line found but regex did not match:', line);
                }
            }

            // Extract delivery locations and SCU (e.g., "Deliver 0/5 SCU to Seraphim Station")
            if (line.includes('Deliver') && line.includes('SCU')) {
                const deliverMatch = line.match(/Deliver\s*(\d+\/\d+|\d+)\s*SCU\s*to\s*([^\.]+)/i);
                if (deliverMatch) {
                    const scuText = deliverMatch[1];
                    const scu = scuText.includes('/') ? parseInt(scuText.split('/')[1]) : parseInt(scuText);
                    const delivery = deliverMatch[2].trim();
                    if (material && pickup) {
                        contractData.cargoItems.push({
                            material,
                            cargo: scu,
                            pickup,
                            delivery,
                            maxContainer
                        });
                        console.log('Added cargo item:', { material, cargo: scu, pickup, delivery, maxContainer });
                    } else {
                        console.log('Skipped cargo item - missing material or pickup:', line);
                    }
                }
            }

            // Extract max container size (e.g., "containers 4 SCU or smaller")
            if (line.includes('containers') && line.includes('SCU')) {
                const containerMatch = line.match(/containers\s*(\d+)\s*SCU/i);
                if (containerMatch) {
                    maxContainer = parseInt(containerMatch[1]);
                    contractData.cargoItems.forEach(item => {
                        item.maxContainer = maxContainer;
                    });
                    console.log('Parsed max container:', maxContainer);
                }
            }

            // Extract reward (e.g., "Reward © 52,500")
            if (line.includes('Reward')) {
                // More flexible regex to handle OCR variations
                const rewardMatch = line.match(/Reward[^\d]*(\d+[,\d]*)/i);
                if (rewardMatch) {
                    contractData.reward = parseInt(rewardMatch[1].replace(/,/g, ''));
                    console.log('Parsed reward:', contractData.reward);
                } else {
                    console.log('Reward line found but regex did not match:', line);
                }
            }

            // Extract ship (if specified)
            if (line.includes('Ship')) {
                const shipMatch = line.match(/Ship:\s*([^\s]+)/i);
                if (shipMatch) {
                    contractData.ship = shipMatch[1];
                    console.log('Parsed ship:', contractData.ship);
                }
            }
        });

        // Fallback for name if not found
        if (!contractData.name) {
            contractData.name = 'New Contract';
            console.log('Fallback name:', contractData.name);
        }

        // Fallback for material if not found
        if (!material) {
            material = 'Unknown Material';
            console.log('Material not found, using fallback:', material);
            // Add cargo items that were skipped due to missing material
            contractData.cargoItems = contractData.cargoItems.length > 0 ? contractData.cargoItems : [];
            lines.forEach(line => {
                if (line.includes('Deliver') && line.includes('SCU')) {
                    const deliverMatch = line.match(/Deliver\s*(\d+\/\d+|\d+)\s*SCU\s*to\s*([^\.]+)/i);
                    if (deliverMatch && pickup) {
                        const scuText = deliverMatch[1];
                        const scu = scuText.includes('/') ? parseInt(scuText.split('/')[1]) : parseInt(scuText);
                        const delivery = deliverMatch[2].trim();
                        contractData.cargoItems.push({
                            material,
                            cargo: scu,
                            pickup,
                            delivery,
                            maxContainer
                        });
                        console.log('Added cargo item with fallback material:', { material, cargo: scu, pickup, delivery, maxContainer });
                    }
                }
            });
        }

        // Fallback for reward if not found
        if (!contractData.reward) {
            contractData.reward = 0;
            console.log('Reward not found, using fallback:', contractData.reward);
        }

        // Populate the form with parsed data
        document.getElementById("name").value = contractData.name;
        document.getElementById("ship").value = contractData.ship || Object.keys(data.ships)[0];
        document.getElementById("reward").value = contractData.reward;

        const cargoItemsDiv = document.getElementById("cargo-items");
        if (contractData.cargoItems.length > 0) {
            cargoItemsDiv.innerHTML = "";
            contractData.cargoItems.forEach(item => {
                const newItem = ui.createCargoItem(item);
                const materialSelect = newItem.querySelector('.material');
                // Ensure the material dropdown is set
                if (materialSelect) {
                    const optionExists = Array.from(materialSelect.options).some(option => option.value.toLowerCase() === item.material.toLowerCase());
                    if (optionExists) {
                        materialSelect.value = item.material;
                        console.log('Set material dropdown to:', item.material);
                    } else {
                        console.log('Material not in dropdown, adding:', item.material);
                        const newOption = document.createElement('option');
                        newOption.value = item.material;
                        newOption.textContent = item.material;
                        materialSelect.appendChild(newOption);
                        materialSelect.value = item.material;
                    }
                } else {
                    console.error('Material dropdown not found in cargo item');
                }
                cargoItemsDiv.appendChild(newItem);
            });
        } else {
            console.log('No cargo items detected - preserving default cargo item');
        }

        ui.updateContractTable();
    } catch (error) {
        console.error('Screenshot capture or parsing failed:', error);
        alert('Failed to capture or parse screenshot. Check console for details.');
    }
}

window.contracts = {
    addContract,
    editContract,
    deleteContract,
    updateStatus,
    captureScreenshot
};