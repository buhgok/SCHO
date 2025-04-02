console.log("screenshot.js loaded");

// Reference resolution for which the ROIs were defined
const REFERENCE_WIDTH = 3440;
const REFERENCE_HEIGHT = 1440;

// Define ROIs as proportions of the reference resolution
const ROI_PROPORTIONS = [
    // Contract Name (top center)
    {
        name: 'contractName',
        x: 1317 / REFERENCE_WIDTH,  // 0.383
        y: 272 / REFERENCE_HEIGHT,  // 0.189
        width: 795 / REFERENCE_WIDTH,  // 0.231
        height: 139 / REFERENCE_HEIGHT  // 0.097
    },
    // Reward (top right)
    {
        name: 'reward',
        x: 2173 / REFERENCE_WIDTH,  // 0.632
        y: 294 / REFERENCE_HEIGHT,  // 0.204
        width: 590 / REFERENCE_WIDTH,  // 0.172
        height: 37 / REFERENCE_HEIGHT  // 0.026
    },
    // Details (center, for max container size)
    {
        name: 'details',
        x: 1336 / REFERENCE_WIDTH,  // 0.388
        y: 439 / REFERENCE_HEIGHT,  // 0.305
        width: 676 / REFERENCE_WIDTH,  // 0.197
        height: 685 / REFERENCE_HEIGHT  // 0.476
    },
    // Cargo Items (right side, under "PRIMARY OBJECTIVES")
    {
        name: 'cargoItems',
        x: 2064 / REFERENCE_WIDTH,  // 0.600
        y: 439 / REFERENCE_HEIGHT,  // 0.305
        width: 685 / REFERENCE_WIDTH,  // 0.199
        height: 439 / REFERENCE_HEIGHT  // 0.305
    }
];

// Function to scale ROIs based on the user's resolution
function scaleROIs(screenshotWidth, screenshotHeight) {
    return ROI_PROPORTIONS.map(roi => ({
        name: roi.name,
        x: Math.round(roi.x * screenshotWidth),
        y: Math.round(roi.y * screenshotHeight),
        width: Math.round(roi.width * screenshotWidth),
        height: Math.round(roi.height * screenshotHeight)
    }));
}

// Function to capture a screenshot of the game window
async function captureScreenshot() {
    console.log("Attempting to capture screenshot...");
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        console.log("Stream captured successfully");
        const video = document.createElement('video');
        video.srcObject = stream;

        await new Promise(resolve => video.onloadedmetadata = resolve);
        video.play();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageUrl = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'screenshot.png';
        link.click();
        console.log("Screenshot saved as screenshot.png");

        stream.getTracks().forEach(track => track.stop());
        console.log("Screenshot captured successfully");
        return imageUrl;
    } catch (error) {
        console.error('Error capturing screenshot:', error);
        throw error;
    }
}

// Function to crop an image based on an ROI
function cropImage(img, roi) {
    console.log(`Cropping image for ROI: ${roi.name}`);
    const canvas = document.createElement('canvas');
    canvas.width = roi.width;
    canvas.height = roi.height;
    const context = canvas.getContext('2d');
    context.drawImage(img, roi.x, roi.y, roi.width, roi.height, 0, 0, roi.width, roi.height);

    const croppedUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = croppedUrl;
    link.download = `cropped_${roi.name}.png`;
    link.click();
    console.log(`Cropped image saved as cropped_${roi.name}.png`);

    return croppedUrl;
}

// Function to preprocess the image (convert to grayscale, increase contrast, optionally invert)
function preprocessImage(imageUrl, invert = true) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const context = canvas.getContext('2d');
            context.drawImage(img, 0, 0);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;
            }

            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i];
                const value = gray > 100 ? 255 : 0;
                data[i] = data[i + 1] = data[i + 2] = invert ? (255 - value) : value;
            }

            context.putImageData(imageData, 0, 0);
            const preprocessedUrl = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = preprocessedUrl;
            link.download = 'preprocessed.png';
            link.click();
            console.log("Preprocessed image saved as preprocessed.png");

            resolve(preprocessedUrl);
        };
    });
}

// Function to perform OCR on an image using Tesseract
async function performOCR(imageUrl) {
    console.log("Performing OCR...");
    try {
        const preprocessedUrl = await preprocessImage(imageUrl, true);
        const { data: { text } } = await Tesseract.recognize(preprocessedUrl, 'eng', {
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:,. -/'
        });
        console.log("OCR completed:", text);
        return text;
    } catch (error) {
        console.error('Error performing OCR:', error);
        throw error;
    }
}

// Function to normalize material names to match dropdown options
function normalizeMaterialName(material) {
    // Remove "Raw" suffix and trim
    let normalized = material.replace(/\s*Raw/i, '').trim();
    // Capitalize first letter of each word to match dropdown format (e.g., "Quartz", "Corundum")
    normalized = normalized
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    return normalized;
}

// Function to parse extracted text into structured data
function parseContractData(extractedData) {
    console.log("Parsing extracted data:", extractedData);
    const contractData = {};

    contractData.contractName = extractedData.contractName.trim();
    console.log("Parsed contractName:", contractData.contractName);

    const rewardMatch = extractedData.reward.match(/([\d,]+)/);
    contractData.reward = rewardMatch ? parseInt(rewardMatch[1].replace(/,/g, ''), 10) : null;
    console.log("Parsed reward:", contractData.reward);

    let detailsText = extractedData.details;
    console.log("Raw details text:", detailsText);
    detailsText = detailsText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    console.log("Normalized details text:", detailsText);
    const maxContainerMatch = detailsText.match(/(\d+)\s*SCU\s*(?:or\s*smaller|in\s*size)/i);
    if (!maxContainerMatch) {
        console.warn("Max container regex did not match. Text:", detailsText);
    }
    contractData.maxContainer = maxContainerMatch ? parseInt(maxContainerMatch[1], 10) : 1;
    console.log("Parsed maxContainer:", contractData.maxContainer);

    const deliveryMatch = detailsText.match(/freight elevator at ([\w\s-]+)(?: above microTech)?/i);
    let expectedDelivery = deliveryMatch ? deliveryMatch[1].trim() : null;
    console.log("Expected delivery location from details:", expectedDelivery);

    let cargoText = extractedData.cargoItems;
    console.log("Raw cargo text:", cargoText);

    cargoText = cargoText.replace(/\n/g, ' ');
    console.log("After replacing newlines:", cargoText);

    cargoText = cargoText.replace(/[^a-zA-Z0-9\s:\/-]/g, '');
    console.log("After removing symbols:", cargoText);

    cargoText = cargoText.replace(/PRIMARY OBJECTIVES/, '');
    console.log("After removing PRIMARY OBJECTIVES:", cargoText);

    cargoText = cargoText.replace(/\s+/g, ' ').trim();
    console.log("Preprocessed cargo text:", cargoText);

    contractData.cargoItems = [];
    const segments = cargoText.split(/(?=Collect)/);
    console.log("Text segments:", segments);

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i].trim();
        if (!segment.startsWith("Collect")) continue;

        const collectMatch = segment.match(/Collect ([\w\s()]+) from ([\w\s:-]+?)(?=\s*Deliver|$)/);
        if (!collectMatch) {
            console.warn("Collect match failed for segment:", segment);
            continue;
        }

        const rawMaterial = collectMatch[1].trim();
        const material = normalizeMaterialName(rawMaterial); // Normalize the material name
        const pickup = collectMatch[2].trim();

        let deliverText = segment;
        if (!deliverText.includes("Deliver")) {
            if (i + 1 < segments.length) {
                deliverText = segments[i + 1];
                i++;
            } else {
                console.warn("No Deliver statement found for segment:", segment);
                continue;
            }
        }

        const deliverMatch = deliverText.match(/Deliver \d+\/(\d+) SCU to ([\w\s:-]+)/);
        console.log("Deliver match for segment:", deliverText, "Result:", deliverMatch);
        if (!deliverMatch) {
            console.warn("Deliver match failed for segment:", deliverText);
            continue;
        }

        const scu = parseInt(deliverMatch[1], 10);
        let delivery = deliverMatch[2].trim();

        // Normalize delivery location by comparing the base name
        if (expectedDelivery && delivery !== expectedDelivery) {
            const normalizedExpected = expectedDelivery.toLowerCase().replace(/\s+/g, '');
            const normalizedDelivery = delivery.toLowerCase().replace(/\s+/g, '');
            if (normalizedDelivery.includes(normalizedExpected)) {
                console.log(`Normalizing delivery location: ${delivery} -> ${expectedDelivery}`);
                delivery = expectedDelivery;
            }
        }

        const cargoItem = {
            material: material, // Use normalized material name
            rawMaterial: rawMaterial, // Keep the raw material name for logging
            pickup: pickup,
            scu: scu,
            delivery: delivery
        };
        contractData.cargoItems.push(cargoItem);
        console.log("Parsed cargo item:", cargoItem);
    }

    if (contractData.cargoItems.length === 0) {
        console.warn("No cargo items were parsed from the cargo text. Check OCR output and parsing logic.");
    }

    console.log("Parsed contract data:", contractData);
    return contractData;
}

// Main function to orchestrate the entire process
async function captureAndExtract() {
    console.log("captureAndExtract function called");
    try {
        // Step 1: Capture the screenshot
        const imageUrl = await captureScreenshot();

        // Step 2: Load the screenshot into an image object
        const img = new Image();
        img.src = imageUrl;
        await new Promise(resolve => img.onload = resolve);

        // Step 3: Get the screenshot dimensions
        const screenshotWidth = img.width;
        const screenshotHeight = img.height;
        console.log(`Screenshot dimensions: ${screenshotWidth}x${screenshotHeight}`);

        // Step 4: Scale the ROIs based on the screenshot dimensions
        const ROIs = scaleROIs(screenshotWidth, screenshotHeight);
        console.log("Scaled ROIs:", ROIs);

        // Step 5: Crop each ROI and perform OCR
        const extractedData = {};
        for (const roi of ROIs) {
            const croppedUrl = cropImage(img, roi);
            const text = await performOCR(croppedUrl);
            extractedData[roi.name] = text;
        }

        // Step 6: Parse the extracted text into structured data
        const contractData = parseContractData(extractedData);

        // Populate the form with extracted data
        console.log("Populating form with extracted data");
        document.getElementById("name").value = contractData.contractName;
        document.getElementById("reward").value = contractData.reward;

        const cargoItemsDiv = document.getElementById("cargo-items");
        if (!cargoItemsDiv) {
            console.error("Cargo items div not found in the DOM. Check the element ID.");
            return;
        }
        cargoItemsDiv.innerHTML = "";
        console.log("Cleared existing cargo items");

        if (contractData.cargoItems.length === 0) {
            console.warn("No cargo items to add to the form.");
        } else {
            contractData.cargoItems.forEach((item, index) => {
                console.log(`Adding cargo item ${index + 1}:`, item);
                const cargoItem = {
                    name: item.material,
                    item: item.material,
                    cargoMaterial: item.material,
                    pickup: item.pickup,
                    delivery: item.delivery,
                    cargo: item.scu,
                    maxContainer: contractData.maxContainer
                };
                try {
                    const newItem = ui.createCargoItem(cargoItem);
                    const materialSelect = newItem.querySelector('select.material');
                    if (materialSelect) {
                        // Log the available options in the dropdown
                        const availableOptions = Array.from(materialSelect.options).map(opt => opt.value);
                        console.log(`Available material options for cargo item ${index + 1}:`, availableOptions);

                        // Check if the material exists in the dropdown
                        if (availableOptions.includes(item.material)) {
                            materialSelect.value = item.material; // Use normalized material name
                            console.log(`Set material dropdown to: ${item.material}`);
                        } else {
                            console.warn(`Material "${item.material}" not found in dropdown options for cargo item ${index + 1}. Leaving unselected.`);
                        }

                        // Verify the value after setting
                        console.log(`Dropdown value after setting: ${materialSelect.value}`);
                        console.log(`Selected index: ${materialSelect.selectedIndex}`);

                        // Dispatch a change event to trigger any listeners
                        const changeEvent = new Event('change', { bubbles: true });
                        materialSelect.dispatchEvent(changeEvent);
                        console.log("Dispatched change event on material dropdown");
                    } else {
                        console.warn(`Material dropdown not found in cargo item ${index + 1}`);
                    }
                    console.log(`HTML structure of cargo item ${index + 1}:`, newItem.outerHTML);
                    cargoItemsDiv.appendChild(newItem);
                    console.log(`Successfully added cargo item ${index + 1} to the form`);
                } catch (error) {
                    console.error(`Error adding cargo item ${index + 1}:`, error);
                }
            });
        }

    } catch (error) {
        console.error('Error in captureAndExtract:', error);
    }
}

// Attach event listener to the button with error handling
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded, attaching event listener to capture-screenshot button");
    const captureButton = document.getElementById('capture-screenshot');
    if (captureButton) {
        console.log("Capture button found, attaching listener");
        captureButton.addEventListener('click', () => {
            console.log("Capture from Screenshot button clicked");
            captureAndExtract();
        });
    } else {
        console.error("Capture button not found in the DOM");
    }
});