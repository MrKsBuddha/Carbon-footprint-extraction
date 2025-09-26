// popup.js
// ------------------------------------------
// Popup to trigger scraping and show progress state
// ------------------------------------------

const scanBtn = document.getElementById("scan");

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




