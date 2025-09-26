// content.js
// ------------------------------------------
// This is the entry point for the content script
// It coordinates the scraping (scraper.js) and
// displaying results (ui.js).
// ------------------------------------------

(function () {
    console.log("Carbon Checker content script loaded!");
    

    // Helper: check if current page is a cart page
    function isCartPage() {
        const url = window.location.href;
        if (url.includes("amazon.") && url.includes("/cart")) return true;
        if (url.includes("flipkart.") && url.includes("/viewcart")) return true;
        if (url.includes("myntra.") && url.includes("/cart")) return true;
        return false;
    }

    function run(withProgress, retryCount = 0) {
        if (!isCartPage()) {
            console.log("Not a cart page, skipping Carbon Checker.");
            return;
        }

        if (withProgress && typeof showCarbonLoading === 'function') 
            showCarbonLoading(20, "Scanning cart...");
        if (withProgress) 
            chrome.runtime.sendMessage({ type: "SCRAPE_PROGRESS", percent: 30, label: "Detecting items..." });

        const items = detectAndScrape();

        // If cart items not ready yet → retry up to 5 times
        if ((!items || items.length === 0) && retryCount < 5) {
            console.log("Cart empty, retrying...", retryCount);
            setTimeout(() => run(withProgress, retryCount + 1), 1000);
            return;
        }

        // If user closed manually, skip re-showing
        if (window.carbonWidgetClosed) {
            console.log("Widget was manually closed, skipping re-display");
            return;
        }

        if (withProgress && typeof showCarbonLoading === 'function') 
            showCarbonLoading(50, "Estimating emissions...");
        if (withProgress) 
            chrome.runtime.sendMessage({ type: "SCRAPE_PROGRESS", percent: 60, label: "Estimating emissions..." });

        const withEmissions = window.addEmissions ? window.addEmissions(items) : { items, totalGrams: 0 };

        if (items && items.length > 0) {
            // Remove loading if any and show widget
            const loading = document.getElementById('carbon-loading');
            if (loading) loading.remove();
            showCarbonWidget(withEmissions);
            if (withProgress) 
                chrome.runtime.sendMessage({ type: "SCRAPE_DONE", ok: true });
        } else {
            if (typeof showCarbonError === 'function') 
                showCarbonError("Unable to find carbon emission of the cart.");
            if (withProgress) 
                chrome.runtime.sendMessage({ type: "SCRAPE_DONE", ok: false, error: "Unable to find carbon emission of the cart" });
        }
    }

    // Initial run after load
    window.addEventListener("load", () => {
        if (isCartPage()) run(false);
    });

    // Optional: re-run when DOM changes (basic debounce)
    let lastRun = 0;
    const observer = new MutationObserver(() => {
        if (!isCartPage()) return;
        if (window.carbonWidgetClosed) return; // don’t regenerate after close
        const now = Date.now();
        if (now - lastRun > 1500) {
            lastRun = now;
            run();
        }
    });
    observer.observe(document.documentElement, { subtree: true, childList: true });

    // Listen to popup trigger
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (!msg || msg.type !== "START_SCRAPE") return;
        if (!isCartPage()) {
            chrome.runtime.sendMessage({ 
                type: "SCRAPE_DONE", 
                ok: false, 
                error: "Not a cart page" 
            });
            return;
        }
        chrome.runtime.sendMessage({ type: "SCRAPE_PROGRESS", percent: 10, label: "Starting..." });
        try {
            window.carbonWidgetClosed = false;  // reset flag when user explicitly reopens
            run(true);
        } catch (e) {
            chrome.runtime.sendMessage({ type: "SCRAPE_DONE", ok: false, error: "Unable to analyze this page" });
        }
    });
})();

