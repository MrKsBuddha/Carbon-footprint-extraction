# GreenLedger: Carbon-footprint-extraction
A lightweight Chrome extension that estimates the carbon footprint of items on Amazon and Flipkart. It scrapes product/cart data, applies simple emission factors, and shows a floating widget with per-item and total CO₂e. Runs locally in the browser with no backend, for demo and educational use.

## Carbon Footprint Checker (Chrome Extension)

A lightweight Chrome extension that estimates the carbon footprint of items on supported e‑commerce pages. It scrapes product/cart information on Amazon and Flipkart, computes a rough CO2e estimate, and shows a small floating widget with per-item and total emissions.

<p align="center">
  <img src="https://github.com/user-attachments/assets/177668a5-db47-450f-a0eb-3910468651fe" alt="Architecture Diagram" width="400">
</p>

### Features
- **On‑page widget**: Floating panel with per‑item and total CO2e.
- **Progress UI**: Loading bar while scanning pages.
- **Domain‑scoped**: Runs only on Amazon (`.com`, `.in`) and Flipkart (`.com`).
- **Zero backend**: All calculations run locally in the browser.

### How it works
1. Content scripts run on supported domains and scrape visible product/cart data.
2. `emissions.js` applies basic factors to estimate grams CO2e per item and totals.
3. `ui.js` renders a floating widget showing results; it can be dismissed.

### Supported sites
- `amazon.com`, `amazon.in`
- `flipkart.com`

The extension does not activate on other websites.

### Installation (Load Unpacked)
1. Build/clone this repository locally.
2. Open Chrome: `chrome://extensions`.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the `carbon-extension_ksh/carbon-extension` folder.
5. Visit an Amazon/Flipkart page and open a product or cart page.

### Usage
- Navigate to a supported site/product/cart.
- The extension scans the page and shows the widget in the bottom‑right.
- Close the widget with the button.

### Project structure
```text
carbon-extension_ksh/
└─ carbon-extension/
   ├─ manifest.json        # MV3 config (matches restricted to Amazon/Flipkart)
   ├─ content.js           # Entry glue for page integration
   ├─ scraper.js           # Extracts items (name, qty, etc.) from the page
   ├─ emissions.js         # Converts items into grams CO2e (heuristics)
   ├─ ui.js                # Renders floating widget + loading/error panels
   ├─ popup.html           # Browser action popup UI
   ├─ popup.js             # Popup logic
   └─ icon.png             # Extension icon
```

### Key configuration
`manifest.json` limits activation to Amazon and Flipkart:
```json
{
  "content_scripts": [
    {
      "matches": [
        "*://*.amazon.com/*",
        "*://*.amazon.in/*",
        "*://*.flipkart.com/*"
      ],
      "js": ["scraper.js", "emissions.js", "ui.js", "content.js"]
    }
  ]
}
```

### Development
- Make edits in the `carbon-extension` folder.
- After changes, go to `chrome://extensions` and click "Reload" on the extension.
- Use DevTools on supported pages to debug content scripts (`Sources` → Page).

### Permissions
- `activeTab`, `scripting`, `tabs` are used to inject and run content scripts on supported domains only.

### Privacy
- No personal information is collected or sent to external servers. Estimates are computed locally.

### Limitations / Notes
- Emission factors are simplified approximations for demo/educational purposes.
- Site markup can change; if scraping breaks, update `scraper.js` selectors.




