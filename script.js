//biased
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const clearBtn = document.getElementById("clear");
const undoBtn = document.getElementById("undo");
const brushSizeInput = document.getElementById("brushSize");
const sizeValueSpan = document.getElementById("sizeValue");
const fillToggleBtn = document.getElementById("fillToggle");

//resizeCanvas
function resizeCanvas() {
    const maxWidth = Math.min(window.innerWidth - 40, 900);
    const maxHeight = Math.min(window.innerHeight - 220, 550);

    canvas.width = maxWidth;
    canvas.height = maxHeight;

    setCanvasBackground();
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

//Theme Light/Dark
const root = document.documentElement;
const toggle = document.getElementById('themeToggle');
const saved = localStorage.getItem('theme') || 'light';

const sunIcon = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4" y1="12" x2="2" y2="12"/><line x1="22" y1="12" x2="20" y2="12"/><line x1="5.6" y1="5.6" x2="4.2" y2="4.2"/><line x1="19.8" y1="19.8" x2="18.4" y2="18.4"/><line x1="5.6" y1="18.4" x2="4.2" y2="19.8"/><line x1="19.8" y1="4.2" x2="18.4" y2="5.6"/></svg>';
const moonIcon = '<svg viewBox="0 0 24 24"><path d="M20 14.5 A8.5 8.5 0 1 1 9.5 4 A6.8 6.8 0 0 0 20 14.5 Z"/></svg>';

root.setAttribute('data-theme', saved);
toggle.innerHTML = saved === 'dark' ? sunIcon : moonIcon;

toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    toggle.innerHTML = next === 'dark' ? sunIcon : moonIcon;
});

//Background
function setCanvasBackground() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
setCanvasBackground();

let painting = false;
let startX, startY;
let currentTool = "pencil";
let color = "#000000";
let brushSize = 4;
let isFilled = false;
let snapshot;
let history = [];
let redoHistory = [];


// Take a snapshot of the current canvas state
function takeSnapshot() {
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Start drawing when mouse is pressed
function startPosition(e) {
    painting = true;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    startX = (e.clientX - rect.left) * scaleX;
    startY = (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = (currentTool === "eraser") ? brushSize * 2.5 : brushSize;

    if (currentTool === "eraser") {
        ctx.strokeStyle = "white";
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    takeSnapshot();
}

function finishedPosition() {
    painting = false;
    ctx.closePath();

    history.push(
        ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
            
        )
    
    );
    redoHistory = [];
}


// Draw on the canvas based on the selected tool
function draw(e) {
    if (!painting) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    ctx.putImageData(snapshot, 0, 0);
    ctx.strokeStyle = (currentTool === "eraser") ? "white" : color;
    ctx.fillStyle = color;
    ctx.lineWidth = (currentTool === "eraser") ? brushSize * 2.5 : brushSize;

    if (currentTool === "pencil" || currentTool === "eraser") {
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
    }
    else if (currentTool === "rect") {
        if (isFilled) {
            ctx.fillRect(startX, startY, currentX - startX, currentY - startY);
        } else {
            ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
        }
    }
    else if (currentTool === "circle") {
        let radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        if (isFilled) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
    }
    else if (currentTool === "Triangle"){
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.lineTo(startX - (currentX - startX), currentY);
        ctx.closePath();
        
        if (isFilled) {
            ctx.fill();
        } else {
            ctx.stroke();
        }


    }


}

// switching between tools and highlighting the selected button
function setActiveTool(buttonId) {
    const toolButtons = ["pencil", "rect", "circle", "eraser", "Triangle"];
    toolButtons.forEach(id => {
        document.getElementById(id).classList.remove("active");
    });
    if(buttonId) document.getElementById(buttonId).classList.add("active");
}


// Event Listeners for tool buttons
document.getElementById("pencil").onclick = () => { currentTool = "pencil"; setActiveTool("pencil"); canvas.className = "pencil-cursor"; };
document.getElementById("rect").onclick = () => { currentTool = "rect"; setActiveTool("rect"); canvas.className = ""; };
document.getElementById("circle").onclick = () => { currentTool = "circle"; setActiveTool("circle"); canvas.className = ""; };
document.getElementById("eraser").onclick = () => { currentTool = "eraser"; setActiveTool("eraser"); canvas.className = "eraser-cursor"; };
document.getElementById("Triangle").onclick = () => { currentTool = "Triangle"; setActiveTool("Triangle"); canvas.className = ""; };

// Event Listeners for other controls
fillToggleBtn.onclick = () => {
    isFilled = !isFilled;
    fillToggleBtn.classList.toggle("active", isFilled);
};

brushSizeInput.oninput = (e) => {
    brushSize = e.target.value;
    sizeValueSpan.textContent = brushSize + "px";
};

clearBtn.onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
    history = [];
    redoHistory = [];
};
// Undo functionality
undoBtn.onclick = () => {
    if (history.length > 0) {
        redoHistory.push(history.pop());

        if (history.length > 0) {
            ctx.putImageData(
                history[history.length - 1], 0, 0
            );
        } else {
            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );
            setCanvasBackground();
        }
    }
};



// Redo functionality
const redoBtn = document.getElementById("redo");

redoBtn.onclick = () => {
    if (redoHistory.length > 0) {

        const image = redoHistory.pop();
        history.push(image);

        ctx.putImageData(image, 0, 0);

    }
};

// Event Listeners for color picker and save buttons
colorPicker.oninput = (e) => {
    color = e.target.value;
    syncColorInputs(color);
};

// ===== Color format switcher (HEX / RGB / HSL) =====
let activeFormat = "hex";
const colorInputsWrapper = document.getElementById("colorInputs");
const formatButtons = document.querySelectorAll(".format-btn");

function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r, g, b) {
    const clamp = (x) => Math.max(0, Math.min(255, Math.round(x)));
    return "#" + [r, g, b].map(x => clamp(x).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// Renders the input fields for the currently active format, filled with the given hex color
function renderColorInputs(hex) {
    const rgb = hexToRgb(hex);

    if (activeFormat === "hex") {
        colorInputsWrapper.innerHTML = `<input type="text" id="hexInput" class="color-text-input" maxlength="7" value="${hex}">`;
        document.getElementById("hexInput").addEventListener("change", (e) => {
            let val = e.target.value.trim();
            if (!val.startsWith("#")) val = "#" + val;
            if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
                applyColor(val);
            }
        });
    }
    else if (activeFormat === "rgb") {
        colorInputsWrapper.innerHTML = `
            <input type="number" id="rInput" class="color-num-input" min="0" max="255" value="${rgb.r}" title="Red">
            <input type="number" id="gInput" class="color-num-input" min="0" max="255" value="${rgb.g}" title="Green">
            <input type="number" id="bInput" class="color-num-input" min="0" max="255" value="${rgb.b}" title="Blue">
        `;
        ["rInput", "gInput", "bInput"].forEach(id => {
            document.getElementById(id).addEventListener("change", updateFromRgbInputs);
        });
    }
    else if (activeFormat === "hsl") {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        colorInputsWrapper.innerHTML = `
            <input type="number" id="hInput" class="color-num-input" min="0" max="360" value="${hsl.h}" title="Hue">
            <input type="number" id="sInput" class="color-num-input" min="0" max="100" value="${hsl.s}" title="Saturation">
            <input type="number" id="lInput" class="color-num-input" min="0" max="100" value="${hsl.l}" title="Lightness">
        `;
        ["hInput", "sInput", "lInput"].forEach(id => {
            document.getElementById(id).addEventListener("change", updateFromHslInputs);
        });
    }
}

function updateFromRgbInputs() {
    const r = parseInt(document.getElementById("rInput").value) || 0;
    const g = parseInt(document.getElementById("gInput").value) || 0;
    const b = parseInt(document.getElementById("bInput").value) || 0;
    applyColor(rgbToHex(r, g, b));
}

function updateFromHslInputs() {
    const h = parseInt(document.getElementById("hInput").value) || 0;
    const s = parseInt(document.getElementById("sInput").value) || 0;
    const l = parseInt(document.getElementById("lInput").value) || 0;
    const rgb = hslToRgb(h, s, l);
    applyColor(rgbToHex(rgb.r, rgb.g, rgb.b));
}

// Applies a hex color to the drawing tool, the native picker swatch, and re-renders the current format's inputs
function applyColor(hex) {
    color = hex;
    colorPicker.value = hex;
    renderColorInputs(hex);
}

// Keeps the format inputs in sync when the native color picker is used
function syncColorInputs(hex) {
    renderColorInputs(hex);
}

formatButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        formatButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeFormat = btn.dataset.format;
        renderColorInputs(color);
    });
});

//  Save Image and PDF functionality
document.getElementById("saveImage").onclick = () => {
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
};

document.getElementById("savePDF").onclick = () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("landscape", "px", [canvas.width, canvas.height]);
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("drawing.pdf");
};

//Event Listeners for touch and mouse events
canvas.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];

    startPosition({
        clientX: touch.clientX,
        clientY: touch.clientY
    });

    e.preventDefault();
});

canvas.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];

    draw({
        clientX: touch.clientX,
        clientY: touch.clientY
    });

    e.preventDefault();
});

// Handle touch end event 
canvas.addEventListener("touchend", finishedPosition);

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", finishedPosition);
canvas.addEventListener("mousemove", draw);