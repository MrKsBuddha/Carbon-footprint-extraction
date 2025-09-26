// popup.js
// ------------------------------------------
// Popup to trigger scraping and show progress state
// ------------------------------------------

//v1
/*const scanBtn = document.getElementById("scan");
const statusEl = document.getElementById("status");
const bar = document.getElementById("bar");

function setProgress(pct, text) {
    bar.style.width = Math.max(0, Math.min(100, pct)) + "%";
    if (text) statusEl.textContent = text;
}

function setBusy(busy) {
    scanBtn.disabled = !!busy;
}

scanBtn.addEventListener("click", async () => {
    setBusy(true);
    setProgress(5, "Starting scrape...");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
        setBusy(false);
        setProgress(0, "No active tab");
        return;
    }

    try {
        // Tell content script to start scraping
        await chrome.tabs.sendMessage(tab.id, { type: "START_SCRAPE" });
        setProgress(20, "Scanning page...");
    } catch (e) {
        // If content script not yet injected (MV3), try to register by pinging
        setBusy(false);
        setProgress(0, "Unable to reach page");
    }
});

// Listen for progress events from content
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || !msg.type) return;
    if (msg.type === "SCRAPE_PROGRESS") {
        setProgress(msg.percent || 0, msg.label || "Working...");
    }
    if (msg.type === "SCRAPE_DONE") {
        setProgress(100, msg.ok ? "Done" : (msg.error || "No items found"));
        setBusy(false);
    }
});
*/


//v2
/*
// popup.js
// ------------------------------------------
// Popup lets user manually activate the floating widget
// even if it was closed.
// ------------------------------------------

const scanBtn = document.getElementById("scan");
const statusEl = document.getElementById("status");
const bar = document.getElementById("bar");

function setProgress(pct, text) {
    bar.style.width = Math.max(0, Math.min(100, pct)) + "%";
    if (text) statusEl.textContent = text;
}

function setBusy(busy) {
    scanBtn.disabled = !!busy;
}

scanBtn.addEventListener("click", async () => {
    setBusy(true);
    setProgress(5, "Starting scrape...");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
        setBusy(false);
        setProgress(0, "No active tab");
        return;
    }

    try {
        // Tell content script to re-run scraping + widget display
        await chrome.tabs.sendMessage(tab.id, { type: "START_SCRAPE" });
        setProgress(20, "Scanning page...");
    } catch (e) {
        setBusy(false);
        setProgress(0, "Unable to reach page");
    }
});

// Listen for progress events from content.js
chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || !msg.type) return;
    if (msg.type === "SCRAPE_PROGRESS") {
        setProgress(msg.percent || 0, msg.label || "Working...");
    }
    if (msg.type === "SCRAPE_DONE") {
        setProgress(100, msg.ok ? "Done" : (msg.error || "No items found"));
        setBusy(false);
    }
});

*/


//v3
// popup.js
// ------------------------------------------
// Popup lets user manually activate the floating widget
// ------------------------------------------

const scanBtn = document.getElementById("scan");

// Old progress/status logic — keep commented for later reuse
/*
const statusEl = document.getElementById("status");
const bar = document.getElementById("bar");

function setProgress(pct, text) {
    bar.style.width = Math.max(0, Math.min(100, pct)) + "%";
    if (text) statusEl.textContent = text;
}

function setBusy(busy) {
    scanBtn.disabled = !!busy;
}
*/

scanBtn.addEventListener("click", async () => {
    // For now: just send message, no status/progress shown
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;

    try {
        await chrome.tabs.sendMessage(tab.id, { type: "START_SCRAPE" });
    } catch (e) {
        console.warn("Unable to reach content script", e);
    }
});

// Old listener for progress messages — commented out
/*
chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || !msg.type) return;
    if (msg.type === "SCRAPE_PROGRESS") {
        setProgress(msg.percent || 0, msg.label || "Working...");
    }
    if (msg.type === "SCRAPE_DONE") {
        setProgress(100, msg.ok ? "Done" : (msg.error || "No items found"));
        setBusy(false);
    }
});
*/

