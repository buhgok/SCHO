// src/screenshot.js

// Debug: Confirm the script is loaded
console.log("screenshot.js loaded");

// Function to capture a screenshot of the game window
async function captureScreenshot() {
    console.log("Attempting to capture screenshot...");
    try {
        // Prompt user to select the game window
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        console.log("Stream captured successfully");
        const video = document.createElement('video');
        video.srcObject = stream;
        
        // Wait for video metadata to load
        await new Promise(resolve => video.onloadedmetadata = resolve);
        video.play();
        
        // Draw the current frame to a canvas
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to an image URL
        const imageUrl = canvas.toDataURL('image/png');
        
        // Debug: Save the screenshot as a downloadable file
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'screenshot.png';
        link.click();
        console.log("Screenshot saved as screenshot.png");

        // Stop the stream
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
    // Crop the image by drawing only the ROI portion
    context.drawImage(img, roi.x, roi.y, roi.width, roi.height, 0, 0, roi.width, roi.height);

    // Debug: Save the cropped image as a downloadable file
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

            // Convert to grayscale
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b; // Standard grayscale formula
                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;
            }

            // Increase contrast (simple threshold)
            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i];
                const value = gray > 100 ? 255 : 0; // Lower threshold to capture more text detail
                data[i] = data[i + 1] = data[i + 2] = invert ? (255 - value) : value; // Invert if specified
            }

            context.putImageData(imageData, 0, 0);
            const preprocessedUrl = canvas.toDataURL('image/png');

            // Debug: Save the preprocessed image
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
        // Preprocess the image before OCR (invert colors for light text on dark background)
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

// Function to parse extracted text into structured data
function parseContractData(extractedData) {
    console.log("Parsing extracted data:", extractedData);
    const contractData = {};

    // Parse contract name (assumes it's a single line)
    contractData.contractName = extractedData.contractName.trim();
    console.log("Parsed contractName:", contractData.contractName);

    // Parse reward (extracts the number)
    const rewardMatch = extractedData.reward.match(/([\d,]+)/);
    contractData.reward = rewardMatch ? parseInt(rewardMatch[1].replace(/,/g, ''), 10) : null;
    console.log("Parsed reward:", contractData.reward);

    // Parse max container size from details (e.g., "At most the containers will be 4 SCU in size")
    let detailsText = extractedData.details;
    console.log("Raw details text:", detailsText);
    detailsText = detailsText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    console.log("Normalized details text:", detailsText);
    const maxContainerMatch = detailsText.match(/At m[ao]st the containers will be (\d+) SCU in size/i);
    if (!maxContainerMatch) {
        console.warn("Max container regex did not match. Text:", detailsText);
    }
    contractData.maxContainer = maxContainerMatch ? parseInt(maxContainerMatch[1], 10) : 1; // Default to 1 if not found
    console.log("Parsed maxContainer:", contractData.maxContainer);

    // Extract the expected delivery location from details (e.g., "microTech Logistics Depot S4LD13")
    const deliveryMatch = detailsText.match(/freight elevator at (microTech Logistics Depot S4LD13)/i);
    const expectedDelivery = deliveryMatch ? deliveryMatch[1] : null;
    console.log("Expected delivery location from details:", expectedDelivery);

    // Parse cargo items
    let cargoText = extractedData.cargoItems;
    console.log("Raw cargo text:", cargoText);

    // Preprocess the cargo text to normalize the format
    // 1. Replace newlines with spaces
    cargoText = cargoText.replace(/\n/g, ' ');
    console.log("After replacing newlines:", cargoText);

    // 2. Remove stray symbols (keep only alphanumeric, spaces, colons, hyphens, and slashes)
    cargoText = cargoText.replace(/[^a-zA-Z0-9\s:\/-]/g, '');
    console.log("After removing symbols:", cargoText);

    // 3. Remove "PRIMARY OBJECTIVES" header
    cargoText = cargoText.replace(/PRIMARY OBJECTIVES/, '');
    console.log("After removing PRIMARY OBJECTIVES:", cargoText);

    // 4. Clean up extra spaces
    cargoText = cargoText.replace(/\s+/g, ' ').trim();
    console.log("Preprocessed cargo text:", cargoText);

    // 5. Parse cargo items by splitting into segments
    contractData.cargoItems = [];
    // Split the text into segments starting with "Collect"
    const segments = cargoText.split(/(?=Collect)/);
    console.log("Text segments:", segments);

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i].trim();
        if (!segment.startsWith("Collect")) continue;

        // Extract the "Collect" part
        const collectMatch = segment.match(/Collect (\w+) from ([\w\s:-]+?)(?=Deliver|$)/);
        if (!collectMatch) {
            console.warn("Collect match failed for segment:", segment);
            continue;
        }

        const material = collectMatch[1];
        const pickup = collectMatch[2].trim();

        // Extract the "Deliver" part from the same segment or the next one
        let deliverText = segment;
        if (!deliverText.includes("Deliver")) {
            // If "Deliver" is not in this segment, look in the next segment
            if (i + 1 < segments.length) {
                deliverText = segments[i + 1];
                i++; // Skip the next segment since we consumed it
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

        // Normalize the delivery location using the expected delivery from details
        if (expectedDelivery && delivery !== expectedDelivery) {
            console.log(`Normalizing delivery location: ${delivery} -> ${expectedDelivery}`);
            delivery = expectedDelivery;
        }

        const cargoItem = {
            material: material,
            pickup: pickup,
            scu: scu,
            delivery: delivery
        };
        contractData.cargoItems.push(cargoItem);
        console.log("Parsed cargo item:", cargoItem);
    }

    // Debug: Log if no cargo items were parsed
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

        // Step 3: Define ROIs based on the screenshot layout (updated with precise coordinates for 3440x1440)
        const ROIs = [
            // Contract Name (top center)
            { name: 'contractName', x: 1317, y: 272, width: 795, height: 139 },
            // Reward (top right)
            { name: 'reward', x: 2173, y: 294, width: 590, height: 37 },
            // Details (center, for max container size)
            { name: 'details', x: 1336, y: 439, width: 676, height: 685 },
            // Cargo Items (right side, under "PRIMARY OBJECTIVES")
            { name: 'cargoItems', x: 2064, y: 439, width: 685, height: 439 }
        ];

        // Step 4: Crop each ROI and perform OCR
        const extractedData = {};
        for (const roi of ROIs) {
            const croppedUrl = cropImage(img, roi);
            const text = await performOCR(croppedUrl);
            extractedData[roi.name] = text;
        }

        // Step 5: Parse the extracted text into structured data
        const contractData = parseContractData(extractedData);

        // Populate the form with extracted data
        console.log("Populating form with extracted data");
        document.getElementById("name").value = contractData.contractName;
        document.getElementById("reward").value = contractData.reward;

        // Clear existing cargo items
        const cargoItemsDiv = document.getElementById("cargo-items");
        if (!cargoItemsDiv) {
            console.error("Cargo items div not found in the DOM. Check the element ID.");
            return;
        }
        cargoItemsDiv.innerHTML = "";
        console.log("Cleared existing cargo items");

        // Add extracted cargo items with maxContainer value
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
                    // Set the material dropdown value
                    const materialSelect = newItem.querySelector('select.material');
                    if (materialSelect) {
                        materialSelect.value = item.material;
                        console.log(`Set material dropdown to: ${item.material}`);
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