const canvas = document.querySelector("canvas"),
ctx = canvas.getContext("2d");
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
colorPicker = document.querySelector("#color-picker"),
clearCanvas = document.querySelector(".clear-canvas"),
saveImg = document.querySelector(".save-img");



const canvasWidthInput = document.querySelector("#canvas-width");
const canvasHeightInput = document.querySelector("#canvas-height");
const resizeCanvasBtn = document.querySelector("#resize-canvas");

const resizeCanvas = () => { //function to resize canvas
    const newWidth = parseInt(canvasWidthInput.value);
    const newHeight = parseInt(canvasHeightInput.value);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); //taking snapshot of canvas
    canvas.width = newWidth; //changing canvas width
    canvas.height = newHeight;
    ctx.putImageData(imageData, 0, 0); //restoring canvas snapshot

    setCanvasbackground();  //setting background color
};

resizeCanvasBtn.addEventListener("click", resizeCanvas); //adding click event to resize button

//global variables with default values
let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
selectedTool = "brush",
brushWidth = 5,
selectedColor = "#000";

const setCanvasbackground = () => {
     ctx.fillStyle = "#fff"; //setting background color to white
     ctx.fillRect(0, 0, canvas.width, canvas.height); //drawing rectangle to cover canvas
     ctx.fillStyle = selectedColor; //changing color to selected color
}

window.addEventListener("load", () => {
     canvas.width = canvas.offsetWidth; //canvas width/height
     canvas.height = canvas.offsetHeight;
     setCanvasbackground();
});

const drawRect = (x, y) => {
     if (!fillColor.checked) {
          return ctx.strokeRect(x, y, prevMouseX - x, prevMouseY - y);
     }
     ctx.fillRect(x, y, prevMouseX - x, prevMouseY - y);
};

const drawCircle = (x, y) => {
     ctx.beginPath();
     let radius = Math.sqrt(Math.pow(prevMouseX - x, 2) + Math.pow(prevMouseY - y, 2));
     ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
     fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (x, y) => {
     ctx.beginPath();
     ctx.moveTo(prevMouseX, prevMouseY);
     ctx.lineTo(x, y);
     ctx.lineTo(prevMouseX * 2 - x, y);
     ctx.closePath();
     fillColor.checked ? ctx.fill() : ctx.stroke();
};

const getMousePos = (event) => {
     const rect = canvas.getBoundingClientRect(); // Get the canvas position
     const scaleX = canvas.width / rect.width;   // Scale factor for X
     const scaleY = canvas.height / rect.height; // Scale factor for Y
     return {
         x: (event.clientX - rect.left) * scaleX,
         y: (event.clientY - rect.top) * scaleY
     };
};

const startDraw = (e) => {
     isDrawing = true;
     const { x, y } = getMousePos(e);
     prevMouseX = x;
     prevMouseY = y;       
     ctx.beginPath(); //create new path to draw
     ctx.lineWidth = brushWidth; // passing brushSize
     ctx.strokeStyle = selectedColor; // passing selected color
     ctx.fillStyle = selectedColor;
     snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height); //taking snapshot of canvas
}

const drawing = (e) => {
     if (!isDrawing) return; // if iSdrawing is false, return
     ctx.putImageData(snapshot, 0, 0); // restoring canvas to previous snapshot

     const { x, y } = getMousePos(e); //getting mouse position

     if (selectedTool === "brush" || selectedTool === "eraser") {
          ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
          ctx.lineTo(x, y); //draw line to new coordinates
          ctx.lineCap = "round"; 
          ctx.lineJoin = "round";  
          ctx.stroke(); 
     } else if (selectedTool === "rectangle") {
          drawRect(x, y);
     } else if (selectedTool === "circle") {
          drawCircle(x, y);
     } else {
          drawTriangle(x, y);
     }
};

toolBtns.forEach(btn => {
     btn.addEventListener("click", () => { //adding click event to all tool option
          document.querySelector(".options .active").classList.remove("active"); //removing active class from all tool option
          btn.classList.add("active"); //adding active class to clicked tool option
          selectedTool = btn.id; //storing selected tool in selectedTool variable    
          console.log(selectedTool);
     });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value); //changing brush size according to slider value

colorBtns.forEach(btn => {
     btn.addEventListener("click", () => {
           document.querySelector(".options .selected").classList.remove("selected"); //removing selected class from all color option
           btn.classList.add("selected"); //adding selected class to clicked color option
           selectedColor = window.getComputedStyle(btn).backgroundColor; //storing selected color in selectedColor variable
     });
});

colorPicker.addEventListener("change", () => {
     colorPicker.parentElement.style.background = colorPicker.value; //changing background color of color picker parent
     colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
     ctx.clearRect(0, 0, canvas.width, canvas.height); //clearing canvas
     setCanvasbackground(); //setting background color
});

saveImg.addEventListener("click", () => {
     const img = new Image();
     img.src = canvas.toDataURL("image/png"); //converting canvas to image
     const link = document.createElement("a"); //creating anchor element
     link.href = img.src; //passing image source to anchor href
     link.download = "modernPaint.png"; //setting download attribute
     link.click(); //clicking anchor element
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => isDrawing = false); //adding mouseup event to canvas

canvas.addEventListener("mouseleave", () => isDrawing = false); //adding mouseleave event to canvas


const zoomSlider = document.querySelector("#zoom-slider");  
const resetZoomBtn = document.querySelector("#reset-zoom");  
let scaleFactor = 1;
let originX = 0, originY = 0;  

const applyTransform = () => { 
    canvas.style.transform = `translate(${originX}px, ${originY}px) scale(${scaleFactor})`;
    canvas.style.transformOrigin = "0 0"; // Keep the transformation origin fixed
};

zoomSlider.addEventListener("input", (e) => {  
    let newScale = parseFloat(e.target.value);
    zoomAtCenter(newScale);
});

resetZoomBtn.addEventListener("click", () => {  
    scaleFactor = 1;
    originX = 0;
    originY = 0;
    zoomSlider.value = 1;
    applyTransform();
});

const zoomAtCenter = (newScale) => {  
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    let scaleRatio = newScale / scaleFactor;
    
    originX -= centerX * (scaleRatio - 1);
    originY -= centerY * (scaleRatio - 1);

    scaleFactor = newScale;
    applyTransform();
};

canvas.addEventListener("wheel", (e) => {  
    e.preventDefault();
    let zoomIntensity = 0.1; 
    let newScale = scaleFactor + (e.deltaY < 0 ? zoomIntensity : -zoomIntensity); 
    newScale = Math.min(Math.max(newScale, 0.3), 10);  

    zoomAtCenter(newScale); 
    zoomSlider.value = scaleFactor.toFixed(1);
});


const toggleThemeBtn = document.querySelector("#toggle-theme");

// Check if dark mode was previously enabled
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    toggleThemeBtn.textContent = "Light Mode";
}

toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    
    // Save the theme preference
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        toggleThemeBtn.textContent = "Light Mode";
    } else {
        localStorage.setItem("theme", "light");
        toggleThemeBtn.textContent = "Dark Mode";
    }
});


const customCursor = document.querySelector("#customCursor");
  
const updateCursorSize = () => { //function to update cursor size
    customCursor.style.width = `${brushWidth}px`;
    customCursor.style.height = `${brushWidth}px`;
};

sizeSlider.addEventListener("input", () => { //adding input event to size slider
     brushWidth = Math.max(5, Math.min(sizeSlider.value, 50));
     customCursor.style.width = `${brushWidth}px`;
     customCursor.style.height = `${brushWidth}px`;  //changing cursor size according to slider value
});

canvas.addEventListener("mousemove", (e) => { //adding mousemove event to canvas
    customCursor.style.left = `${e.pageX}px`;  
    customCursor.style.top = `${e.pageY}px`;  
});

canvas.addEventListener("mouseenter", () => {  //adding mouseenter event to canvas
    customCursor.style.display = "block";
});

canvas.addEventListener("mouseleave", () => { //adding mouseleave event to canvas
    customCursor.style.display = "none";
});

updateCursorSize();  //calling updateCursorSize function
