// scraper.js
// ------------------------------------------
// This file contains all scraping logic
// Responsible for extracting product names and quantities
// from cart pages of Amazon / Flipkart.
// ------------------------------------------

// Scrape Amazon cart page
function scrapeAmazonCart() {
    let items = [];
    document.querySelectorAll(".sc-list-item").forEach(el => {
        // Name candidates
        const titleEl =
            el.querySelector(".sc-product-title") ||
            el.querySelector(".sc-product-link") ||
            el.querySelector("span.a-truncate-cut") ||
            el.querySelector("a");

        let name = (titleEl?.getAttribute("title") || titleEl?.innerText || "").trim();
        if (!name && titleEl) name = titleEl.textContent?.trim() || "";
        if (!name) name = "Unknown";

        // Quantity candidates: input or select
        const qtyInput = el.querySelector(".sc-update-quantity-input");
        const qtySelect = el.querySelector("select[name='quantity']");
        let qtyRaw = 1;
        if (qtyInput && qtyInput.value) qtyRaw = qtyInput.value;
        else if (qtySelect) qtyRaw = qtySelect.value || qtySelect.selectedOptions?.[0]?.value || qtySelect.selectedOptions?.[0]?.text || 1;
        const qty = parseInt(String(qtyRaw).match(/\d+/)?.[0] || "1", 10) || 1;

        items.push({ site: "Amazon", name, qty });
    });
    return items;
}

// Scrape Flipkart cart page
function scrapeFlipkartCart() {
    let items = [];
    // Scope to main container to avoid grabbing recommendations
    const root =
        document.querySelector("#container") ||
        document.querySelector("[data-reactroot]") ||
        document.body;

    // Try multiple container patterns from different Flipkart layouts
    const containers = root.querySelectorAll(
        "div[data-id], ._2Kn22P, ._3ycxrs, .eGXlor, [class*='cartItem'], [class*='CartItem']"
    );

    if (containers.length > 0) {
        containers.forEach(el => {
            // Prefer product links with pid or /p/
            const linkEl =
                el.querySelector("a[href*='pid=']") ||
                el.querySelector("a[href*='/p/']") ||
                el.querySelector("a[title]") ||
                el.querySelector("a");

            let name = (linkEl?.getAttribute("title") || linkEl?.innerText || "").trim();
            if (!name && linkEl) name = linkEl.textContent?.trim() || "";
            if (!name) return;

            // Quantity controls vary; default to 1 if not found
            const qtyEl =
                el.querySelector("input[type='text'][value]") ||
                el.querySelector("input[type='number'][value]") ||
                el.querySelector("select") ||
                el.querySelector("._253qQJ") ||
                el.querySelector("[aria-label*='Quantity']") ||
                el.querySelector("[data-qa='quantity']");

            let qtyRaw = 1;
            if (qtyEl) qtyRaw = qtyEl.value || qtyEl.getAttribute?.("value") || qtyEl.innerText || 1;
            const qty = parseInt(String(qtyRaw).match(/\d+/)?.[0] || "1", 10) || 1;

            items.push({ site: "Flipkart", name, qty });
        });
    }

    // Fallback: product anchors in the root if we still have no items
    if (items.length === 0) {
        root.querySelectorAll("a[href*='pid='], a[href*='/p/']").forEach(linkEl => {
            const name = (linkEl.getAttribute("title") || linkEl.innerText || "").trim();
            if (!name) return;
            items.push({ site: "Flipkart", name, qty: 1 });
        });
    }

    // XPath-based fallback using action buttons' text (SAVE FOR LATER / REMOVE)
    if (items.length === 0) {
        try {
            const xpaths = [
                "//*[contains(translate(normalize-space(.), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'SAVE FOR LATER')]",
                "//*[contains(translate(normalize-space(.), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'REMOVE')]"
            ];
            const found = new Set();
            xpaths.forEach(xpath => {
                const snapshot = document.evaluate(xpath, root, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                for (let i = 0; i < snapshot.snapshotLength; i++) {
                    const btn = snapshot.snapshotItem(i);
                    const el = btn.closest("div[data-id], ._2Kn22P, ._3ycxrs, .eGXlor, [class*='cartItem'], [class*='CartItem']") || btn.parentElement;
                    if (!el) continue;
                    const linkEl =
                        el.querySelector("a[href*='pid=']") ||
                        el.querySelector("a[href*='/p/']") ||
                        el.querySelector("a[title]") ||
                        el.querySelector("a");
                    let name = (linkEl?.getAttribute("title") || linkEl?.innerText || "").trim();
                    if (!name && linkEl) name = linkEl.textContent?.trim() || "";
                    if (!name) continue;
                    const key = name.toLowerCase();
                    if (found.has(key)) continue;
                    found.add(key);
                    items.push({ site: "Flipkart", name, qty: 1 });
                }
            });
        } catch (e) {
            // ignore
        }
    }

    // De-duplicate by name to avoid sidebar duplicates
    const seen = new Set();
    items = items.filter(it => {
        const key = (it.name || "").toLowerCase();
        if (!key) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    return items;
}

// Scrape Myntra cart page
function scrapeMyntraCart() {
    let items = [];
    // Scope to cart root to avoid scraping recommendations/grid outside the cart
    const cartRoot =
        document.querySelector(".cartSection") ||
        document.querySelector("[data-qa='cart']") ||
        document.querySelector(".desktop-base-cartContainer") ||
        document.querySelector("[class*='cart']") ||
        document;

    // Support multiple known Myntra cart item containers and patterns within cart
    const containers = cartRoot.querySelectorAll(
        ".desktop-cartItem, [data-qa='bag-item-container'], [data-qa*='item'], [class*='itemContainer'], [class*='bagItem'], [class*='cartItem']"
    );

    containers.forEach(el => {
        // Try various selectors for brand and product name
        const brandEl =
            el.querySelector(".product-brand") ||
            el.querySelector(".itemContainer-base-brand") ||
            el.querySelector("[data-qa='item-brand']") ||
            el.querySelector("[class*='brand']");

        const productEl =
            el.querySelector(".product-name") ||
            el.querySelector(".product-product") ||
            el.querySelector(".itemContainer-base-itemLink") ||
            el.querySelector("[data-qa='item-name']") ||
            el.querySelector("[class*='itemName']") ||
            el.querySelector("a[href*='/buy/']") ||
            el.querySelector("a[href*='/men/'], a[href*='/women/']");

        let name = "Unknown";
        if (brandEl || productEl) {
            const brand = brandEl?.innerText?.trim() || "";
            const product = productEl?.innerText?.trim() || "";
            name = [brand, product].filter(Boolean).join(" ") || "Unknown";
        }

        // Quantity: Myntra may use select or input
        const qtyEl =
            el.querySelector("select") ||
            el.querySelector("input.qty-text") ||
            el.querySelector("input[type='number']") ||
            el.querySelector("[data-qa='quantity']");

        let qtyRaw = 1;
        if (qtyEl) {
            qtyRaw = qtyEl.value || qtyEl.getAttribute("value") || qtyEl.innerText || 1;
        }
        const qty = parseInt(String(qtyRaw).toString().match(/\d+/)?.[0] || "1", 10) || 1;

        items.push({
            site: "Myntra",
            name,
            qty
        });
    });
    // Global fallbacks if container-based scrape missed items (still scoped to cart)
    if (items.length === 0) {
        const productEls = cartRoot.querySelectorAll(".product-product, [data-qa='item-name'], [class*='itemName']");
        productEls.forEach(prod => {
            const el = prod.closest("[class*='item'], [data-qa*='item'], .desktop-cartItem") || cartRoot;
            const brand = (el.querySelector(".product-brand, [data-qa='item-brand'], [class*='brand']")?.innerText || "").trim();
            const product = (prod.innerText || prod.textContent || "").trim();
            const name = [brand, product].filter(Boolean).join(" ") || product || brand || "Unknown";

            const qtyEl = el.querySelector("select, input.qty-text, input[type='number'], [data-qa='quantity']");
            const qtyRaw = qtyEl ? (qtyEl.value || qtyEl.getAttribute("value") || qtyEl.innerText || 1) : 1;
            const qty = parseInt(String(qtyRaw).match(/\d+/)?.[0] || "1", 10) || 1;
            if (name && name !== "Unknown") items.push({ site: "Myntra", name, qty });
        });
    }

    // Filter out unknown/empty and de-duplicate by name within cart
    const seen = new Set();
    items = items.filter(it => {
        const valid = it && it.name && it.name !== "Unknown";
        if (!valid) return false;
        const key = it.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    return items;
}




// Detect which site we are on and call correct scraper
function detectAndScrape() {
    let host = window.location.hostname;
    if (host.includes("amazon")) return scrapeAmazonCart();
    if (host.includes("flipkart")) return scrapeFlipkartCart();
    if (host.includes("myntra")) return scrapeMyntraCart();
    return [];
}

