// emissions.js
// ------------------------------------------
// Simple heuristic-based emissions estimation.
// Maps keywords to per-item CO2e factors (in grams) and
// estimates emissions based on the product name and quantity.
// Exposes a single function: addEmissions(items)
// ------------------------------------------

(function () {
    const DEFAULT_EMISSION_G = 500; // fallback per item when unknown

    // Very rough per-item factors (grams CO2e) for demonstration.
    // In reality you would use product weight, material, lifecycle data, etc.
    const KEYWORD_FACTORS_G = [
        { keywords: ["phone", "iphone", "smartphone"], grams: 55000 },
        { keywords: ["laptop", "macbook", "notebook"], grams: 200000 },
        { keywords: ["tv", "television"], grams: 300000 },
        { keywords: ["headphone", "earbud", "earphone"], grams: 10000 },
        { keywords: ["watch", "smartwatch"], grams: 15000 },
        { keywords: ["book", "novel", "paperback", "hardcover"], grams: 1000 },
        { keywords: ["shirt", "t-shirt", "tshirt", "clothes", "apparel"], grams: 3500 },
        { keywords: ["shoe", "sneaker", "footwear"], grams: 9000 },
        { keywords: ["toy", "lego", "doll"], grams: 4000 },
        { keywords: ["bottle", "plastic", "container"], grams: 1500 }
    ];

    function getPerItemEmissionGrams(productName) {
        if (!productName) return DEFAULT_EMISSION_G;
        const name = String(productName).toLowerCase();
        for (const entry of KEYWORD_FACTORS_G) {
            for (const kw of entry.keywords) {
                if (name.includes(kw)) return entry.grams;
            }
        }
        return DEFAULT_EMISSION_G;
    }

    // items: [{ site, name, qty }]
    // returns: { items: [{ ...item, emissionGramsPerUnit, emissionGramsTotal }], totalGrams }
    function addEmissions(items) {
        const enriched = [];
        let total = 0;
        (items || []).forEach(item => {
            const perUnit = getPerItemEmissionGrams(item.name);
            const quantity = Number(item.qty) || 1;
            const itemTotal = perUnit * quantity;
            total += itemTotal;
            enriched.push({
                ...item,
                emissionGramsPerUnit: perUnit,
                emissionGramsTotal: itemTotal
            });
        });
        return { items: enriched, totalGrams: Math.round(total) };
    }

    // Expose globally for other content scripts
    window.addEmissions = addEmissions;
})();


