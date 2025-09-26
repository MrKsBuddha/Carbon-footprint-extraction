// ui.js
// ------------------------------------------
// This file handles the user interface widget
// It shows scraped items in a floating box
// with a close button.
// ------------------------------------------

function showCarbonWidget(data) {
    // Remove old widget if it exists
    let oldDiv = document.getElementById("carbon-widget");
    if (oldDiv) oldDiv.remove();

    const items = (data && data.items) ? data.items : (Array.isArray(data) ? data : []);
    if (items.length === 0) return;

    let div = document.createElement("div");
    div.id = "carbon-widget";
    div.style.position = "fixed";
    div.style.bottom = "20px";
    div.style.right = "20px";
    div.style.width = "300px";
    div.style.height = "200px";
    div.style.overflowY = "auto";
    div.style.background = "white";
    div.style.border = "2px solid #333";
    div.style.borderRadius = "8px";
    div.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    div.style.padding = "10px";
    div.style.fontSize = "12px";
    div.style.fontFamily = "Arial, sans-serif";
    div.style.zIndex = "9999";

    // Resizing from edges
    div.style.resize = "both";
    div.style.overflow = "auto";

    makeDraggable(div);


    // Close button
    let closeBtn = document.createElement("button");
    closeBtn.innerText = "✖";
    closeBtn.style.float = "right";
    closeBtn.style.border = "none";
    closeBtn.style.background = "transparent";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = () => div.remove();
    div.appendChild(closeBtn);

    // Title
    let title = document.createElement("h4");
    title.innerText = "Carbon Estimate";
    title.style.margin = "0 0 10px 0";
    div.appendChild(title);

    // Items list
    /*
    let list = document.createElement("ul");
    items.forEach(item => {
        let li = document.createElement("li");
        const per = item.emissionGramsPerUnit != null ? `${Math.round(item.emissionGramsPerUnit/1000)} kg CO2e/unit` : "";
        const tot = item.emissionGramsTotal != null ? `${(item.emissionGramsTotal/1000).toFixed(1)} kg CO2e` : "";
        li.innerText = `${item.name} (Qty: ${item.qty}) ${tot ? '— ' + tot : ''}`;
        li.style.wordWrap = "break-word"; // prevent text cut-off
        li.title = item.name;             // tooltip shows full name
        list.appendChild(li);
    });
    div.appendChild(list);
    */
    // Items table
    let table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontSize = "12px";

    // Header row
    let thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th style="text-align:left; border-bottom:1px solid #ccc; padding:4px;">Item</th>
            <th style="text-align:center; border-bottom:1px solid #ccc; padding:4px;">Qty</th>
            <th style="text-align:right; border-bottom:1px solid #ccc; padding:4px;">CO₂e</th>
        </tr>`;
    table.appendChild(thead);

    // Body rows
    let tbody = document.createElement("tbody");
    items.forEach(item => {
        const tot = item.emissionGramsTotal != null 
            ? `${(item.emissionGramsTotal/1000).toFixed(1)} kg` 
            : "";

        let row = document.createElement("tr");
        row.innerHTML = `
            <td style="padding:4px; border-bottom:1px solid #eee; word-wrap:break-word;" title="${item.name}">
                ${item.name}
            </td>
            <td style="padding:4px; border-bottom:1px solid #eee; text-align:center;">
                ${item.qty}
            </td>
            <td style="padding:4px; border-bottom:1px solid #eee; text-align:right;">
                ${tot}
            </td>`;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    div.appendChild(table);



    // Total footer
    if (data && typeof data.totalGrams === "number") {
        let hr = document.createElement("hr");
        div.appendChild(hr);

        let total = document.createElement("div");
        total.style.fontWeight = "bold";
        const kg = (data.totalGrams / 1000).toFixed(1);
        total.innerText = `Total: ${kg} kg CO2e`;
        div.appendChild(total);
    }

    document.body.appendChild(div);
}

// Show a small loading panel with progress
function showCarbonLoading(percent, label) {
    let div = document.getElementById("carbon-loading");
    if (!div) {
        div = document.createElement("div");
        div.id = "carbon-loading";
        div.style.position = "fixed";
        div.style.bottom = "20px";
        div.style.right = "20px";
        div.style.width = "260px";
        div.style.background = "white";
        div.style.border = "2px solid #333";
        div.style.borderRadius = "8px";
        div.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
        div.style.padding = "10px";
        div.style.fontSize = "12px";
        div.style.fontFamily = "Arial, sans-serif";
        div.style.zIndex = "9999";

        const title = document.createElement("div");
        title.id = "carbon-loading-title";
        title.style.marginBottom = "6px";
        div.appendChild(title);

        const barWrap = document.createElement("div");
        barWrap.style.height = "8px";
        barWrap.style.background = "#eee";
        barWrap.style.borderRadius = "4px";
        barWrap.style.overflow = "hidden";
        const bar = document.createElement("div");
        bar.id = "carbon-loading-bar";
        bar.style.height = "100%";
        bar.style.width = "0%";
        bar.style.background = "#2e7d32";
        barWrap.appendChild(bar);
        div.appendChild(barWrap);

        document.body.appendChild(div);
    }
    const titleEl = document.getElementById("carbon-loading-title");
    const barEl = document.getElementById("carbon-loading-bar");
    if (titleEl) titleEl.innerText = label || "Scanning...";
    if (barEl) barEl.style.width = Math.max(0, Math.min(100, Number(percent) || 0)) + "%";
}

// Show error panel
function showCarbonError(message) {
    // Remove loading if present
    const loading = document.getElementById("carbon-loading");
    if (loading) loading.remove();

    // Remove old widget
    let oldDiv = document.getElementById("carbon-widget");
    if (oldDiv) oldDiv.remove();

    let div = document.createElement("div");
    div.id = "carbon-widget";
    div.style.position = "fixed";
    div.style.bottom = "20px";
    div.style.right = "20px";
    div.style.width = "300px";
    div.style.background = "white";
    div.style.border = "2px solid #333";
    div.style.borderRadius = "8px";
    div.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    div.style.padding = "10px";
    div.style.fontSize = "12px";
    div.style.fontFamily = "Arial, sans-serif";
    div.style.zIndex = "9999";

    /*let closeBtn = document.createElement("button");
    closeBtn.innerText = "✖";
    closeBtn.style.float = "right";
    closeBtn.style.border = "none";
    closeBtn.style.background = "transparent";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = () => div.remove();
    div.appendChild(closeBtn);
    */
    let closeBtn = document.createElement("button");
    closeBtn.innerText = "✖";
    closeBtn.style.float = "right";
    closeBtn.style.border = "none";
    closeBtn.style.background = "transparent";
    closeBtn.style.cursor = "pointer";
    /*closeBtn.onclick = () => {
        window.carbonWidgetClosed = true; // mark widget as closed
        div.remove();
    };*/
    closeBtn.onclick = () => {
        window.carbonWidgetClosed = true;
        div.remove();
    };

    div.appendChild(closeBtn);

    let title = document.createElement("h4");
    title.innerText = "Carbon Estimate";
    title.style.margin = "0 0 10px 0";
    div.appendChild(title);

    let msg = document.createElement("div");
    msg.innerText = message || "Unable to find carbon emission of the cart.";
    div.appendChild(msg);

    document.body.appendChild(div);
}


// Make any element draggable by mouse
function makeDraggable(el) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    el.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        // Only drag if not resizing (skip clicks near border)
        if (e.offsetX > el.clientWidth - 10 || e.offsetY > el.clientHeight - 10) {
            return; // user is resizing, not dragging
        }
        e = e || window.event;
        e.preventDefault();
        // get initial mouse pos
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set element's new position
        el.style.top = (el.offsetTop - pos2) + "px";
        el.style.left = (el.offsetLeft - pos1) + "px";
        el.style.bottom = "auto"; // disable anchoring to bottom/right
        el.style.right = "auto";
        el.style.position = "absolute"; // switch from fixed so it stays draggable
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
