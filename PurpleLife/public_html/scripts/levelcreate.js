// GAME OF LIFE GLOBAL CONSTANTS & VARIABLES

// CONSTANTS
var DEAD_CELL;
var LIVE_CELL;
var ghostpixels; //array for the ghost pattern
var ghostLock; //locks the ghost function so feedback bright cell function can work
var VOID_CELL;
var voidFlag;
var PLACEMENT_CELL;
var placeFlag;
var LIVE_COLOR;
var VOID_COLOR;
var GHOST_COLOR;
var GRID_LINES_COLOR;
var PLACEMENT_COLOR;
var TEXT_COLOR;
var TOP_LEFT;
var TOP_RIGHT;
var BOTTOM_LEFT;
var BOTTOM_RIGHT;
var TOP;
var BOTTOM;
var LEFT;
var RIGHT;
var CENTER;
var MILLISECONDS_IN_ONE_SECOND;
var MAX_FPS;
var MIN_FPS;
var FPS_INC;
var FPS_X;
var FPS_Y;
var MAX_CELL_LENGTH;
var MIN_CELL_LENGTH;
var CELL_LENGTH_INC;
var CELL_LENGTH_X;
var CELL_LENGTH_Y;
var GRID_LINE_LENGTH_RENDERING_THRESHOLD;

// FRAME RATE TIMING VARIABLES
var timer;
var fps;
var frameInterval;

// CANVAS VARIABLES
var canvas;
var canvasWidth;
var canvasHeight;
var canvas2D;

// GRID VARIABLES
var gridWidth;
var gridHeight;
var updateGrid;
var renderGrid;

// RENDERING VARIABLES
var cellLength;

// PATTERN PIXELS
var patterns;
var cellLookup;
var imgDir;

function initLevelMaker()
{
    // INIT ALL THE CONSTANTS, i.e. ALL THE
    // THINGS THAT WILL NEVER CHANGE
    initConstants();
    
    // INIT THE RENDERING SURFACE
    initCanvas();
    
    // INIT ALL THE GAME-RELATED VARIABLES
    initLevelMakerData();
    
    // INIT THE LOOKUP TABLES FOR THE SIMULATION
    initCellLookup();

    // LOAD THE PATTERNS FROM IMAGES
    initPatterns();
            
    // SETUP THE EVENT HANDLERS
    initEventHandlers();
            
    // RESET EVERYTHING, CLEARING THE CANVAS
    resetGameOfLife();
}

function initConstants()
{
    // THESE REPRESENT THE TWO POSSIBLE STATES FOR EACH CELL
    DEAD_CELL = 0;   
    LIVE_CELL = 1; 
    VOID_CELL = 2;
    PLACEMENT_CELL = 3;
    
    // COLORS FOR RENDERING
    LIVE_COLOR = "rgb(128, 0, 128)";
    //set void cell color as the background color as taken from the CSS
    VOID_COLOR = "rgb(128,128,128)";
    GRID_LINES_COLOR = "#CCCCCC";
    TEXT_COLOR = "#7777CC";
    GHOST_COLOR = "rgba(255, 0, 0, 0.2)";
    FEEDBACK_COLOR = "#CC00CC";
    PLACEMENT_COLOR = "rgb(90,180,90)";
    //flag for placing and removing void cells
    voidFlag = false;
    placeFlag = false;
    
    // THESE REPRESENT THE DIFFERENT TYPES OF CELL LOCATIONS IN THE GRID
    TOP_LEFT = 0;
    TOP_RIGHT = 1;
    BOTTOM_LEFT = 2;
    BOTTOM_RIGHT = 3;
    TOP = 4;
    BOTTOM = 5;
    LEFT = 6;
    RIGHT = 7;
    CENTER = 8;
    
    // FPS CONSTANTS
    MILLISECONDS_IN_ONE_SECOND = 1000;
    MAX_FPS = 33;
    MIN_FPS = 1;
    FPS_INC = 1;
    
    // CELL LENGTH CONSTANTS
    MAX_CELL_LENGTH = 32;
    MIN_CELL_LENGTH = 16;
    CELL_LENGTH_INC = 2;
    GRID_LINE_LENGTH_RENDERING_THRESHOLD = 8;
    
    // RENDERING LOCATIONS FOR TEXT ON THE CANVAS
    FPS_X = 20;
    FPS_Y = 450;
    CELL_LENGTH_X = 20;
    CELL_LENGTH_Y = 480;
}

function initCanvas()
{
    // GET THE CANVAS
    canvas = document.getElementById("level_maker_canvas");
    
    // GET THE 2D RENDERING CONTEXT
    canvas2D = canvas.getContext("2d");
    
    
    // NOTE THAT THESE DIMENSIONS SHOULD BE THE
    // SAME AS SPECIFIED IN THE WEB PAGE, WHERE
    // THE CANVAS IS SIZED
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
}

function initLevelMakerData()
{    
    // INIT THE TIMING DATA
    timer = null;
    fps = MAX_FPS;
    frameInterval = MILLISECONDS_IN_ONE_SECOND/fps;

    // INIT THE CELL LENGTH
    cellLength = MIN_CELL_LENGTH;
}

/*
 * This function returns a JavaScript object, which is kind of like
 * a C struct in that it only has data. There are 9 different types of
 * cells in the grid, and so we use 9 CellType objects to store which
 * adjacent cells need to be checked when running the simulation.
 */
function CellType(initNumNeighbors, initCellValues)
{
    this.numNeighbors = initNumNeighbors;
    this.cellValues = initCellValues;
}

function initPatterns()
{
    // THIS IS WHERE ALL THE IMAGES SHOULD BE
    imgDir = "./images/maker/";
    
    // THIS WILL STORE ALL THE PATTERNS IN AN ASSOCIATIVE ARRAY
    patterns = new Array();
    
    // GET THE DROP DOWN LIST
    var patternsList = document.getElementById("game_of_life_patterns");
    
    // GO THROUGH THE LIST AND LOAD ALL THE IMAGES
    for (var i = 0; i < patternsList.options.length; i++)
        {
            // GET THE NAME OF THE IMAGE FILE AND MAKE
            // A NEW ARRAY TO STORE IT'S PIXEL COORDINATES
            var key = patternsList.options[i].value;
            var pixelArray = new Array();
            
            // NOW LOAD THE DATA FROM THE IMAGE
            loadOffscreenImage(key, pixelArray);
            
            // AND PUT THE DATA IN THE ASSIATIVE ARRAY,
            // BY KEY
            patterns[key] = pixelArray;
        }
}

/*
 * This function initizlies the 9 CellType objects that serve
 * as a lookup table for when we are running the simulation so
 * that we know which neighboring cells have to be examined for
 * determining the next frame's state for a given cell.
 */
function initCellLookup()
{
    // WE'LL PUT ALL THE VALUES IN HERE
    cellLookup = new Array();
    
    // TOP LEFT
    var topLeftArray        = new Array( 1, 0,  1,  1,  0,  1);
    cellLookup[TOP_LEFT]    = new CellType(3, topLeftArray);
    
    // TOP RIGHT
    var topRightArray       = new Array(-1, 0, -1,  1,  0,  1);
    cellLookup[TOP_RIGHT]   = new CellType(3, topRightArray);
    
    // BOTTOM LEFT
    var bottomLeftArray     = new Array( 1, 0,  1, -1, 0, -1);
    cellLookup[BOTTOM_LEFT] = new CellType(3, bottomLeftArray);
    
    // BOTTOM RIGHT
    var bottomRightArray    = new Array(-1, 0, -1, -1, 0, -1);
    cellLookup[BOTTOM_RIGHT]= new CellType(3, bottomRightArray);
    
    // TOP 
    var topArray            = new Array(-1, 0, -1, 1, 0, 1, 1, 1, 1, 0);
    cellLookup[TOP]         = new CellType(5, topArray);
    
    // BOTTOM
    var bottomArray         = new Array(-1, 0, -1, -1, 0, -1, 1, -1, 1, 0);
    cellLookup[BOTTOM]      = new CellType(5, bottomArray);

    // LEFT
    var leftArray           = new Array(0, -1, 1, -1, 1, 0, 1, 1, 0, 1);
    cellLookup[LEFT]        = new CellType(5, leftArray);

    // RIGHT
    var rightArray          = new Array(0, -1, -1, -1, -1, 0, -1, 1, 0, 1);
    cellLookup[RIGHT]       = new CellType(5, rightArray);
    
    // CENTER
    var centerArray         = new Array(-1, -1, -1, 0, -1, 1, 0, 1, 1, 1, 1, 0, 1, -1, 0, -1);
    cellLookup[CENTER]      = new CellType(8, centerArray);
}


/*
 * This function loads the image and then examines it, extracting
 * all the pixels and saving the coordinates that are non-white.
 */
function loadOffscreenImage(imgName, pixelArray)
{    
    // FIRST GET THE IMAGE DATA
    var img = new Image();
    
    // NOTE THAT THE IMAGE WILL LOAD IN THE BACKGROUND, BUT
    // WE CAN TELL JavaScript TO LET US KNOW WHEN IT HAS FULLY
    // LOADED AND RESPOND THEN.
    img.onload = function() { respondToLoadedImage(imgName, img, pixelArray); };
    
    // document.URL IS THE URL OF WHERE THE WEB PAGE IS FROM WHICH THIS
    // JavaScript PROGRAM IS BEING USED. NOTE THAT ASSIGNING A URL TO
    // A CONSTRUCTED Image's src VARIABLE INITIATES THE IMAGE-LOADING
    // PROCESS
    var path = document.URL;
    var indexLocation = path.indexOf("index.html");
    path = path.substring(0, indexLocation);
    img.src = path + imgDir + imgName;
}

function voidPlaceChange () 
{
    voidFlag = false;
    placeFlag = false;
    canvas.onmousemove = respondToMoveGhost;
}

function initEventHandlers()
{
    //mouse move check for ghost and void
 
    canvas.onmousemove = respondToMoveGhost;
   
    // WE'LL RESPOND TO MOUSE CLICKS ON THE CANVAS
    canvas.onclick = respondToMouseClick;
    
    //for void cell placement, allows dragging
    canvas.onmousedown = voidCellPlace;   
    canvas.onmouseup = voidPlaceChange;
    
    // AND ALL THE APP'S BUTTONS
    
    //document.getElementById("undo_button").onclick=pauseGameOfLife;
    document.getElementById("reset_button").onclick=resetGameOfLife;
    document.getElementById("save_upload").onclick=saveCanvas;
    document.getElementById("load_from_save").onclick=loadCustomMap;
    //document.getElementById("dec_cell_length_button").onclick=decCellLength;
    //document.getElementById("inc_cell_length_button").onclick=incCellLength;
}

//saves the canvas as a png to a url
function saveCanvas() {
    drawBorders();
    renderCells();
    var canvasSave = document.getElementById("level_maker_canvas");
    var imgURL = canvasSave.toDataURL("image/png");
    var img = new Image();
    img.src = imgURL;
    var offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = 64;
    offscreenCanvas.height = 33;
    var offscreenCanvas2D = offscreenCanvas.getContext("2d");
    offscreenCanvas2D.drawImage(img, 0, 0, 64, 33);
    
    var imgSave = offscreenCanvas.toDataURL("image/png");
    
    
    var thumbnail = document.getElementById("thumbnail");
    thumbnail.setAttribute("src",imgSave);
    thumbnail.setAttribute("width", "64px");
    thumbnail.setAttribute("height","33px");
    
    //var storedCustoms = document.getElementById("stored_customs");
    //var slot = storedCustoms.options[storedCustoms.selectedIndex].value;//
    
    var customName = document.getElementById("customLevelName").value;
    //storeMap(slot, imgSave);
    //storeMap(customName,imgSave);
    writeUserData(customName,imgSave);
}

function loadCustomMap() {
    var name;
    name = document.getElementById("loadName").value;

    resetGameOfLife();
    loadUserMap(name);
    var mapLoaded = document.getElementById("thumbnail");
    
    pixelArray = new Array();
    mapLoaded.onload = function(){
        respondToLoadedLevelImage(mapLoaded, pixelArray);
        renderLoadedLevel(pixelArray);
    };
}

function loadCustomMapEdit(mapname) {
    var name = mapname;

    resetGameOfLife();
    loadUserMap(name);
    var mapLoaded = document.getElementById("thumbnail");
    
    pixelArray = new Array();
    mapLoaded.onload = function(){
        respondToLoadedLevelImage(mapLoaded, pixelArray);
        renderLoadedLevel(pixelArray);
    };
}

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] === variable){return pair[1];}
       }
       return(false);
}

function respondToLoadedLevelImage(img, pixelArray)
{
    // WE'LL EXAMINE THE PIXELS BY FIRST DRAWING THE LOADED
    // IMAGE TO AN OFFSCREEN CANVAS. SO FIRST WE NEED TO
    // MAKE THE CANVAS, WHICH WILL NEVER ACTUALLY BE VISIBLE.
    var offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = 64;
    offscreenCanvas.height = 33;
    var offscreenCanvas2D = offscreenCanvas.getContext("2d");
    offscreenCanvas2D.drawImage(img, 0, 0, 64, 33);
    
    // NOW GET THE DATA FROM THE IMAGE WE JUST DREW TO OUR OFFSCREEN CANVAS
    var imgData = offscreenCanvas2D.getImageData( 0, 0, img.width, img.height );
    // THIS WILL COUNT THE FOUND NON-WHITE PIXLS
    var voidArrayCounter = 0;
    var objArrayCounter = 0;
    var placementArrayCounter = 0;

    //LEVEL DATA ARRAYS
    var voidArray = new Array();
    var objArray = new Array();
    var placementArray = new Array();
   
    // GO THROUGH THE IMAGE DATA AND PICK OUT THE COORDINATES
    for (var i = 0; i < imgData.data.length; i+=4)
        {
            // THE DATA ARRAY IS STRIPED RGBA, WE'LL IGNORE 
            // THE ALPHA CHANNEL
            var r = imgData.data[i];
            var g = imgData.data[i+1];
            var b = imgData.data[i+2];
            
            // KEEP THE PIXEL IF IT'S PART OF THE GAME DATA LOGIC
            if ((r < 255) && (g < 255) && (b < 255))
                {
                    // CALCULATE THE LOCAL COORDINATE OF
                    // THE FOUND PIXEL. WE DO THIS BECAUSE WE'RE
                    // NOT KEEPING ALL THE PIXELS
                    var x = Math.floor((i/4)) % img.width;
                    var y = Math.floor(Math.floor((i/4)) / img.width);

                    // IF WALL (GRAY)
                    if ((r === 128) && (g === 128) && (b === 128)) {
                    	// STORE THE COORDINATES OF OUR PIXELS
                    	voidArray[voidArrayCounter] = x;
                    	voidArray[voidArrayCounter+1] = y;
                    	voidArrayCounter += 2;
                    }

                    // IF OBJECTIVE (PURPLE)
                    else if ((r === 128) && (g === 0) && (b === 128)) {
                    	objArray[objArrayCounter] = x;
                    	objArray[objArrayCounter+1] = y;
                    	objArrayCounter += 2;
                    }

                    // IF PLACEMENT CELL (LIGHT GRAY)
                    else if ((r === 90) && (g === 180) && (b === 90)) {
                    	placementArray[placementArrayCounter] = x;
                    	placementArray[placementArrayCounter+1] = y;
                    	placementArrayCounter += 2;
                    }

                }            
        }  
    pixelArray[0] = voidArray;
    pixelArray[1] = objArray; 
    pixelArray[2] = placementArray;    
}

function renderLoadedLevel (pixelArray) {
    // LOAD THE COORDINATES OF THE PIXELS TO DRAW
   
    var walls = pixelArray[0];
    var objectives = pixelArray[1];
    var placements = pixelArray[2];
    
    // GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID
    for (var i = 0; i < walls.length; i += 2)
        {
            var col = walls[i];
            var row = walls[i+1];
            var index = (row * gridWidth) + col;
            this.setGridCell(renderGrid, row, col, VOID_CELL);
            this.setGridCell(updateGrid, row, col, VOID_CELL);
        }
    for (var i = 0; i < objectives.length; i += 2)
        {
            var col = objectives[i];
            var row = objectives[i+1];
            var index = (row * gridWidth) + col;
            this.setGridCell(renderGrid, row, col, LIVE_CELL);
            this.setGridCell(updateGrid, row, col, LIVE_CELL);
        }
    for (var i = 0; i < placements.length; i += 2)
        {
            var col = placements[i];
            var row = placements[i+1];
            var index = (row * gridWidth) + col;
            this.setGridCell(renderGrid, row, col, PLACEMENT_CELL);
            this.setGridCell(updateGrid, row, col, PLACEMENT_CELL);
        }
        
    // RENDER THE GAME IMMEDIATELY
    this.renderGameWithoutSwapping();
}

/*
 * This method is called in response to an Image having completed loading. We
 * respond by examining the contents of the image, and keeping the non-white
 * pixel coordinates in our patterns array so that the user may use those
 * patterns in the simulation.
 */
function respondToLoadedImage(imgName, img, pixelArray)
{
    // WE'LL EXAMINE THE PIXELS BY FIRST DRAWING THE LOADED
    // IMAGE TO AN OFFSCREEN CANVAS. SO FIRST WE NEED TO
    // MAKE THE CANVAS, WHICH WILL NEVER ACTUALLY BE VISIBLE.
    var offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = img.width;
    offscreenCanvas.height = img.height;
    var offscreenCanvas2D = offscreenCanvas.getContext("2d");
    offscreenCanvas2D.drawImage(img, 0, 0);
    
    // NOW GET THE DATA FROM THE IMAGE WE JUST DREW TO OUR OFFSCREEN CANVAS
    var imgData = offscreenCanvas2D.getImageData( 0, 0, img.width, img.height );
    
    // THIS WILL COUNT THE FOUND NON-WHITE PIXLS
    var pixelArrayCounter = 0;
   
    // GO THROUGH THE IMAGE DATA AND PICK OUT THE COORDINATES
    for (var i = 0; i < imgData.data.length; i+=4)
        {
            // THE DATA ARRAY IS STRIPED RGBA, WE'LL IGNORE 
            // THE ALPHA CHANNEL
            var r = imgData.data[i];
            var g = imgData.data[i+1];
            var b = imgData.data[i+2];
            
            // KEEP THE PIXEL IF IT'S NON-WHITE
            if ((r < 255) && (g < 255) && (b < 255))
                {
                    // CALCULATE THE LOCAL COORDINATE OF
                    // THE FOUND PIXEL. WE DO THIS BECAUSE WE'RE
                    // NOT KEEPING ALL THE PIXELS
                    var x = Math.floor((i/4)) % img.width;
                    var y = Math.floor(Math.floor((i/4)) / img.width);
                    
                    // STORE THE COORDINATES OF OUR PIXELS
                    pixelArray[pixelArrayCounter] = x;
                    pixelArray[pixelArrayCounter+1] = y;
                    pixelArrayCounter += 2;
                }            
        }    
}

/*
 * This is the event handler for when the user clicks on the canvas,
 * which means the user wants to put a pattern in the grid at
 * that location.
 */
function respondToMouseClick(event)
{
    // GET THE PATTERN SELECTED IN THE DROP DOWN LIST
    var patternsList = document.getElementById("game_of_life_patterns");
    var selectedPattern = patternsList.options[patternsList.selectedIndex].value;
    
    //for void cell placement:
    if (selectedPattern === "VoidCell.png" || selectedPattern === "RemoveVC" || selectedPattern === "Placement.png") {
        return;
    }
    
    // LOAD THE COORDINATES OF THE PIXELS TO DRAW
    var pixels = patterns[selectedPattern];
    
    // CALCULATE THE ROW,COL OF THE CLICK
    var canvasCoords = getRelativeCoords(event);
    var clickCol = Math.floor(canvasCoords.x/cellLength);
    var clickRow = Math.floor(canvasCoords.y/cellLength);
    
        
    // GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID 
    // feedback bright cell
    ghostLock = true;
    canvas2D.fillStyle = FEEDBACK_COLOR;
    for (var i = 0; i < pixels.length; i += 2)
        {
        var col = clickCol + pixels[i];
        var row = clickRow + pixels[i+1];
        
        canvas2D.fillRect(col*cellLength, row*cellLength, cellLength, cellLength);
            
        }
    
    
    // RENDER THE GAME IMMEDIATELY
    setTimeout( function(){
        for (var i = 0; i < pixels.length; i += 2)
        {
            var col = clickCol + pixels[i];
            var row = clickRow + pixels[i+1];
            if (getGridCell(renderGrid, row, col) !== VOID_CELL)
                {setGridCell(renderGrid, row, col, LIVE_CELL);}
            if (getGridCell(updateGrid, row, col) !== VOID_CELL)
                {setGridCell(updateGrid, row, col, LIVE_CELL);}
        }
        ghostLock = false;
        renderGame(); }, 250);
}

function voidCellPlace()
{
    voidFlag = true;
    var patternsList = document.getElementById("game_of_life_patterns");
    var selectedPattern = patternsList.options[patternsList.selectedIndex].value;
    if (selectedPattern === "VoidCell.png"){
        
        // CALCULATE THE ROW,COL OF THE CLICK
         //set the void boolean for placing void sets to true
        canvas2D.fillStyle = VOID_COLOR;
        var canvasCoords = getRelativeCoords(event);
        var clickCol = Math.floor(canvasCoords.x/cellLength);
        var clickRow = Math.floor(canvasCoords.y/cellLength);
        setGridCell(renderGrid, clickRow, clickCol, VOID_CELL);
        setGridCell(updateGrid, clickRow, clickCol, VOID_CELL);
        
        canvas2D.fillRect(clickCol*cellLength, clickRow*cellLength, cellLength, cellLength);
        canvas.onmousemove = respondToMoveVoid;
        
    }
    //for setting placement cells
    else if (selectedPattern === "Placement.png") {
       
        // CALCULATE THE ROW,COL OF THE CLICK
        placeFlag = true;
        canvas2D.fillStyle = PLACEMENT_COLOR;
        var canvasCoords = getRelativeCoords(event);
        var clickCol = Math.floor(canvasCoords.x/cellLength);
        var clickRow = Math.floor(canvasCoords.y/cellLength);
        if (clickCol !== 0 && clickCol !== gridWidth-1 && clickRow !== 0 && clickRow !== gridHeight-1){
            setGridCell(renderGrid, clickRow, clickCol, PLACEMENT_CELL);
            setGridCell(updateGrid, clickRow, clickCol, PLACEMENT_CELL);
        }
        canvas2D.fillRect(clickCol*cellLength, clickRow*cellLength, cellLength, cellLength);
        canvas.onmousemove = respondToMovePlace; 
    }
    //for deleting cells
    else if (selectedPattern === "RemoveVC") {
       
        // CALCULATE THE ROW,COL OF THE CLICK
        
        canvas2D.fillStyle = "#FFFFFF";
        var canvasCoords = getRelativeCoords(event);
        var clickCol = Math.floor(canvasCoords.x/cellLength);
        var clickRow = Math.floor(canvasCoords.y/cellLength);
        if (clickCol !== 0 && clickCol !== gridWidth-1 && clickRow !== 0 && clickRow !== gridHeight-1){
            setGridCell(renderGrid, clickRow, clickCol, DEAD_CELL);
            setGridCell(updateGrid, clickRow, clickCol, DEAD_CELL);
        }
        canvas2D.fillRect(clickCol*cellLength, clickRow*cellLength, cellLength, cellLength);
        canvas.onmousemove = respondToMoveVoidRemove;
        
    }
    
    else {
        voidFlag = false;
        placeFlag = false;
        return;
    }
    
    drawBorders();
}

function respondToMoveVoid(event){
    //check to see if voidFlag boolean is true
    if (voidFlag === false) return;
    else {
        canvas2D.fillStyle = VOID_COLOR;
        var canvasCoords = getRelativeCoords(event);
        var clickCol = Math.floor(canvasCoords.x/cellLength);
        var clickRow = Math.floor(canvasCoords.y/cellLength);
        setGridCell(renderGrid, clickRow, clickCol, VOID_CELL);
        setGridCell(updateGrid, clickRow, clickCol, VOID_CELL);
        
        canvas2D.fillRect(clickCol*cellLength, clickRow*cellLength, cellLength, cellLength);
    }
    
    renderGridLines();
    drawBorders();
}

function respondToMovePlace(event){
     if (placeFlag === false) return;
    else {
        canvas2D.fillStyle = PLACEMENT_COLOR;
        var canvasCoords = getRelativeCoords(event);
        var clickCol = Math.floor(canvasCoords.x/cellLength);
        var clickRow = Math.floor(canvasCoords.y/cellLength);
        if (clickCol !== 0 && clickCol !== gridWidth-1 && clickRow !== 0 && clickRow !== gridHeight-1){
            setGridCell(renderGrid, clickRow, clickCol, PLACEMENT_CELL);
            setGridCell(updateGrid, clickRow, clickCol, PLACEMENT_CELL);
        }
        
        canvas2D.fillRect(clickCol*cellLength, clickRow*cellLength, cellLength, cellLength);
    }
    
    renderGridLines();
    drawBorders();
}

function respondToMoveVoidRemove(event) {
    //check to see if voidRemove boolean is true
    if (voidFlag === false) return;
    else {
        canvas2D.fillStyle = "#FFFFFF";
        var canvasCoords = getRelativeCoords(event);
        var clickCol = Math.floor(canvasCoords.x/cellLength);
        var clickRow = Math.floor(canvasCoords.y/cellLength);
        if (clickCol !== 0 && clickCol !== gridWidth-1 && clickRow !== 0 && clickRow !== gridHeight-1){
            setGridCell(renderGrid, clickRow, clickCol, DEAD_CELL);
            setGridCell(updateGrid, clickRow, clickCol, DEAD_CELL);
        }
        
        canvas2D.fillRect(clickCol*cellLength, clickRow*cellLength, cellLength, cellLength);
    }
    
    renderGridLines();
    drawBorders();
}

function respondToMoveGhost(event)
{
    //first check to see if function has been locked (by mouseclick function)
    if (ghostLock === true) return; 
    
    //remove all previous ghost cells
    ghostpixels = null;
    clearGhostCells();
   
    // GET THE PATTERN SELECTED IN THE DROP DOWN LIST
    var patternsList = document.getElementById("game_of_life_patterns");
    var selectedPattern = patternsList.options[patternsList.selectedIndex].value;
    ghostpixels = patterns[selectedPattern];
    // LOAD THE COORDINATES OF THE PIXELS TO DRAW
    
    
    // CALCULATE THE ROW,COL OF the mouse cursor
    var canvasCoords = getRelativeCoords(event);
    var clickCol = Math.floor(canvasCoords.x/cellLength);
    var clickRow = Math.floor(canvasCoords.y/cellLength);
    canvas2D.fillStyle = GHOST_COLOR;
    
    // GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID
    for (var i = 0; i < ghostpixels.length; i += 2)
        {
            var col = clickCol + ghostpixels[i];
            var row = clickRow + ghostpixels[i+1];
            canvas2D.fillRect(col*cellLength, row*cellLength, cellLength, cellLength);
            
        }
        
   renderGridLines();
    
}

// HELPER METHODS FOR THE EVENT HANDLERS

/*
 * This function gets the mouse click coordinates relative to
 * the canvas itself, where 0,0 is the top, left corner of
 * the canvas.
 */
function getRelativeCoords(event) 
{
    if (event.offsetX !== undefined && event.offsetY !== undefined) 
    { 
        return { x: event.offsetX, y: event.offsetY }; 
    }
    else
    {
        return { x: event.layerX, y: event.layerY };
    }
}

// GRID CELL MANAGEMENT METHODS

/*
 * This function tests to see if (row, col) represents a 
 * valid cell in the grid. If it is a valid cell, true is
 * returned, else false.
 */
function isValidCell(row, col)
{
    // IS IT OUTSIDE THE GRID?
    if (    (row < 0) || 
            (col < 0) ||
            (row >= gridHeight) ||
            (col >= gridWidth))
        {
            return false;
        }    
    // IT'S INSIDE THE GRID
    else
        {
            return true;
        }
}

/*
 * Accessor method for getting the cell value in the grid at
 * location (row, col).
 */
function getGridCell(grid, row, col)
{
    // IGNORE IF IT'S OUTSIDE THE GRID
    if (!isValidCell(row, col))
        {
            return -1;
        }
    var index = (row * gridWidth) + col;
    return grid[index];
}

/*
 * Mutator method for setting the cell value in the grid at
 * location (row, col).
 */
function setGridCell(grid, row, col, value)
{
    // IGNORE IF IT'S OUTSIDE THE GRID
    if (!isValidCell(row, col))
        {
            return;
        }
    var index = (row * gridWidth) + col;
    
    grid[index] = value;
}

/*
 * This function renders a single frame of the simulation, including
 * the grid itself, as well as the text displaying the current
 * fps and cellLength levels.
 */
function renderGame()
{
    // CLEAR THE CANVAS
    canvas2D.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // RENDER THE GRID LINES, IF NEEDED
    if (cellLength >= GRID_LINE_LENGTH_RENDERING_THRESHOLD)
        renderGridLines();
    
    // RENDER THE GAME CELLS
    drawBorders();
    renderCells();
    
    // AND RENDER THE TEXT
    renderText();
    
    // THE GRID WE RENDER THIS FRAME WILL BE USED AS THE BASIS
    // FOR THE UPDATE GRID NEXT FRAME
    swapGrids();
}

function renderGameWithoutSwapping()
{
    // CLEAR THE CANVAS
    canvas2D.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // RENDER THE GRID LINES, IF NEEDED
    if (cellLength >= GRID_LINE_LENGTH_RENDERING_THRESHOLD)
        renderGridLines();
    
    // RENDER THE GAME CELLS
    drawBorders();
    renderCells();
    
    // AND RENDER THE TEXT
    renderText();
    

}

/*
 * Renders the cells in the game grid, with only the live
 * cells being rendered as filled boxes. Note that boxes are
 * rendered according to the current cell length.
 */
function renderCells()
{
    // SET THE PROPER RENDER COLOR
    canvas2D.fillStyle = LIVE_COLOR;
    
    // RENDER THE LIVE nd void CELLS IN THE GRID
    for (var i = 0; i <= gridHeight; i++)
        {
           for (var j = 0; j < gridWidth; j++)
               {
                   var cell = getGridCell(renderGrid, i, j);
                   if (cell === LIVE_CELL)
                       {
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillRect(x, y, cellLength, cellLength);
                       }
               }
        }  
    
    canvas2D.fillStyle = VOID_COLOR;
    
    for (var i = 0; i <= gridHeight; i++)
        {
           for (var j = 0; j < gridWidth; j++)
               {
                   var cell = getGridCell(renderGrid, i, j);
                   if (cell === VOID_CELL)
                       {
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillRect(x, y, cellLength, cellLength);
                       }
               }
        }
        
   canvas2D.fillStyle = PLACEMENT_COLOR;
   for (var i = 0; i <= gridHeight; i++)
        {
           for (var j = 0; j < gridWidth; j++)
               {
                   var cell = getGridCell(renderGrid, i, j);
                   if (cell === PLACEMENT_CELL)
                       {
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillRect(x, y, cellLength, cellLength);
                       }
               }
        }
}

function clearGhostCells()
{
     
    // clear THE ghost CELLS IN THE GRID
    for (var i = 0; i <= gridHeight; i++)
        {
           for (var j = 0; j < gridWidth; j++)
               {
                   var cell = getGridCell(renderGrid, i, j);
                   if (cell === LIVE_CELL)
                       {
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillStyle = LIVE_COLOR;
                           canvas2D.fillRect(x, y, cellLength, cellLength);
                           
                       }
                   else if (cell === DEAD_CELL)
                        {
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillStyle = "#FFFFFF";
                           canvas2D.fillRect(x, y, cellLength, cellLength);
                       }
                    else if (cell === VOID_CELL)
                        {
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillStyle = VOID_COLOR;
                           canvas2D.fillRect(x, y, cellLength, cellLength);
                        }
                    else if (cell === PLACEMENT_CELL)
                        {
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillStyle = PLACEMENT_COLOR;
                           canvas2D.fillRect(x, y, cellLength, cellLength);
                        }
               }
        }          
}

/*
 * Renders the text on top of the grid.
 */
function renderText()
{
    // SET THE PROPER COLOR
    canvas2D.fillStyle = TEXT_COLOR;
    
    // RENDER THE TEXT
    //canvas2D.fillText("FPS: " + fps, FPS_X, FPS_Y);
    //canvas2D.fillText("Cell Length: " + cellLength, CELL_LENGTH_X, CELL_LENGTH_Y);
}

/*
 * This function resets the grid containing the current state of the
 * Game of Life such that all cells in the game are dead.
 */
function resetGameOfLife()
{
    // RESET ALL THE DATA STRUCTURES TOO
    gridWidth = canvasWidth/cellLength;
    gridHeight = canvasHeight/cellLength;
    updateGrid = new Array();
    renderGrid = new Array();
    
    // INIT THE CELLS IN THE GRID
    boardReset();

    
    // RENDER THE CLEARED SCREEN
    renderGame();
}

function boardReset(){
    
    for (var i = 0; i < gridHeight; i++) {
        for (var j = 0; j < gridWidth; j++){
            //sets up void cells around the border
            if (i === 0 || i === gridHeight-1){
                setGridCell(updateGrid, i, j, VOID_CELL); 
                setGridCell(renderGrid, i, j, VOID_CELL);
            }
                    
            else if (j === 0 || j === gridWidth-1){
                setGridCell(updateGrid, i, j, VOID_CELL); 
                setGridCell(renderGrid, i, j, VOID_CELL);
            }
            else {
                setGridCell(updateGrid, i, j, DEAD_CELL); 
                setGridCell(renderGrid, i, j, DEAD_CELL);
            }
        }
    }
}

function drawBorders(){
    for (var i = 0; i < gridHeight; i++) {
        for (var j = 0; j < gridWidth; j++){
            //sets up void cells around the border
            if (i === 0 || i === gridHeight-1){
                setGridCell(updateGrid, i, j, VOID_CELL); 
                setGridCell(renderGrid, i, j, VOID_CELL);
            }
                    
            else if (j === 0 || j === gridWidth-1){
                setGridCell(updateGrid, i, j, VOID_CELL); 
                setGridCell(renderGrid, i, j, VOID_CELL);
            }
            
        }
    }
}

/*
 * Renders the grid lines.
 */
function renderGridLines()
{
    // SET THE PROPER COLOR
    canvas2D.strokeStyle = GRID_LINES_COLOR;

    // VERTICAL LINES
    for (var i = 0; i < gridWidth; i++)
        {
            var x1 = i * cellLength;
            var y1 = 0;
            var x2 = x1;
            var y2 = canvasHeight;
            canvas2D.beginPath();
            canvas2D.moveTo(x1, y1);
            canvas2D.lineTo(x2, y2);
            canvas2D.stroke();
        }
        
    // HORIZONTAL LINES
    for (var j = 0; j < gridHeight; j++)
        {
            var x1 = 0;
            var y1 = j * cellLength;
            var x2 = canvasWidth;
            var y2 = y1;
            canvas2D.moveTo(x1, y1);
            canvas2D.lineTo(x2, y2);
            canvas2D.stroke();            
        }
}

/*
 * We need one grid's cells to determine the grid's values for
 * the next frame. So, we update the render grid based on the contents
 * of the update grid, and then, after rending, we swap them, so that
 * the next frame we'll be progressing the game properly.
 */
function swapGrids()
{
    var temp = updateGrid;
    updateGrid = renderGrid;
    renderGrid = temp;
}

