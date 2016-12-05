// CONSTANTS

// CELLS
var DEAD_CELL;
var LIVE_CELL;
var HOVER_CELL;
var NEW_CELL;
var PREV_CELL;
var VOID_CELL;
var OBJ_CELL;
var PLACEMENT_CELL;
var TELEPORT_CELL;
var SPLITTER_CELL;
var TURRET_CELL;
var TURRET_SPAWN_CELL;
var LIVE_TURRET_CELL;
var savedPlacementCells = [];
var placedWeapons = [];
var savedCellsCount = 0;
var placedWeaponCount = 0;

// COLORS
var LIVE_COLOR;
var HOVER_COLOR;
var PREV_COLOR;
var BRIGHT_COLOR;
var BACKGROUND_COLOR;
var WALL_COLOR;
var OBJ_COLOR;
var TURRET_COLOR;
var LIVE_TURRET_COLOR;
var PLACEMENT_COLOR;
var GRID_LINES_COLOR;
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
var turretRenderTimer;
var fps;
var frameInterval;

// CANVAS VARIABLES
var canvasWidth;
var canvasHeight;
var canvas;
var canvas2D;
var mouseState;

// GRID VARIABLES
var gridWidth;
var gridHeight;
var updateGrid;
var renderGrid;
var tempGrid;
var brightGrid;

// RENDERING VARIABLES
var cellcountX;
var cellcountY;
var cellLengthX;
var cellLengthY;

// PATTERN PIXELS
var patterns;
var levels;
var cellLookup;
var imgDir;
var levelDir;

var cLevels; //custom levels array

//Level Stuff
var currentLevel;
var weaponCount;
var undoCounter;
var gameWon;
var isWonPlayed = false;
var gameLost;
var waitTillPlayerLoses;
var turretFireRate;
var nextTimeTurretCanFire;

var allSavedPlacements;
var placedCount = 0;


// INITIALIZATION METHODS

/*
 * This method initializes The Purple Life Game, setting it up with
 * and empty grid, ready to accept additions at the request
 * of the user.
 */
 function Game(canvas, canvas2D, canvasWidth, canvasHeight, mouseState) {
 	// INIT ALL THE CONSTANTS, i.e. ALL THE
    // THINGS THAT WILL NEVER CHANGE
   	this.initConstants();

   	//INIT CANVAS
   	this.initCanvas(canvas, canvas2D, canvasWidth, canvasHeight, mouseState);
    
    // INIT ALL THE GAME-RELATED VARIABLES
    this.initPurpleGameData();
    
    // INIT THE LOOKUP TABLES FOR THE SIMULATION
    this.initCellLookup();

    // LOAD THE PATTERNS FROM IMAGES
    this.initPatterns();

    // LOAD THE LEVELS FROM IMAGES
    this.initLevels();
            
    // SETUP THE EVENT HANDLERS
    this.initEventHandlers();

 }

 Game.prototype.initConstants = function() {
    // THESE REPRESENT THE POSSIBLE STATES FOR EACH CELL
    DEAD_CELL = 0;   
    LIVE_CELL = 1; 
    HOVER_CELL = 2;
    NEW_CELL = 3;
    VOID_CELL = 4;
    OBJ_CELL = 5;
    PLACEMENT_CELL = 6;
    PREV_CELL = 7;
    TURRET_CELL = 8;
    TURRET_SPAWN_CELL = 9;
    LIVE_TURRET_CELL = 10;
    
    // COLORS FOR RENDERING
    LIVE_COLOR = "rgb(255, 0, 0)";
    HOVER_COLOR = "rgba(255, 0, 0, 0.2)";
    PREV_COLOR =  "rgba(0, 0, 0, 0.2)";
    BRIGHT_COLOR = "rgb(227, 11, 92)";
    BACKGROUND_COLOR = "rgb(118,143,165)";
    WALL_COLOR = "rgb(128,128,128)";
    OBJ_COLOR = "rgb(128, 0, 128)";
    PLACEMENT_COLOR = "rgba(90,180,90, 0.3)";
    TURRET_COLOR = "rgb(28,147,64)";
    LIVE_TURRET_COLOR = "rgb(0,0,0)";
    GRID_LINES_COLOR = "#CCCCCC";
    TEXT_COLOR = "#7777CC";
    
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

    turretFireRate = 2000;
    cellcountX = 64;
    cellcountY = 36;

    allSavedPlacements = new Array();
    allSavedPlacements[0] = new Array();
};

Game.prototype.initCanvas = function(canvas, canvas2D, canvasWidth, canvasHeight, mouseState) {
	this.canvas = canvas;
	this.canvas2D = canvas2D;
	this.canvasWidth = canvasWidth;
	this.canvasHeight = canvasHeight;
	this.mouseState = mouseState;
};

Game.prototype.initPurpleGameData = function() {
	// INIT THE TIMING DATA
    timer = null;
    turretRenderTimer;
    fps = MAX_FPS;
    frameInterval = MILLISECONDS_IN_ONE_SECOND/fps;

    // INIT THE CELL LENGTH
    cellLengthX = MIN_CELL_LENGTH;
    cellLengthY = MIN_CELL_LENGTH;

};

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

Game.prototype.initCellLookup = function() {
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

Game.prototype.initPatterns = function () {
    // THIS IS WHERE ALL THE IMAGES SHOULD BE
    imgDir = "images/weapons/";
    
    // THIS WILL STORE ALL THE PATTERNS IN AN ASSOCIATIVE ARRAY
    patterns = new Array();

    // RECEIVE THE WEAPONS FROM THE HTML
    var patternsList = document.getElementById("weaponsList");
    var patternItems = patternsList.getElementsByTagName("li");

    for (var i = 0; i < patternItems.length; i++) {
        // GET THE NAME OF THE IMAGE FILE AND MAKE
        // A NEW ARRAY TO STORE IT'S PIXEL COORDINATES
        var key = patternItems[i].id;
        var pixelArray = new Array();

        // NOW LOAD THE DATA FROM THE IMAGE
        loadOffscreenImage(key, pixelArray);
            
        // AND PUT THE DATA IN THE ASSIATIVE ARRAY,
        // BY KEY
        patterns[key] = pixelArray;
    }
    
};

Game.prototype.initLevels = function () {
    // THIS IS WHERE ALL THE IMAGES SHOULD BE
    levelDir = "images/levels/";
    
    // THIS WILL STORE ALL THE PATTERNS IN AN ASSOCIATIVE ARRAY
    levels = new Array();

    // RECEIEVE THE LEVELS FROM THE HTML
    var levelList = document.getElementById("levelsList");
    var levelItems = levelList.getElementsByTagName("li");

    for (var i = 0; i < levelItems.length; i++) {
        // GET THE NAME OF THE IMAGE FILE AND MAKE
        // A NEW ARRAY TO STORE IT'S PIXEL COORDINATES
        var key = levelItems[i].id;
        var pixelArray = new Array();

        // NOW LOAD THE DATA FROM THE IMAGE
        loadOffScreenLevel(key, pixelArray);

        //SET THE WEAPON COUNT
        pixelArray[12] = levelItems[i].value;
        pixelArray[13] = levelItems[i].getAttribute("cellcountX");
        pixelArray[14] = levelItems[i].getAttribute("cellcountY");
            
        // AND PUT THE DATA IN THE ASSIATIVE ARRAY,
        // BY KEY
        levels[key] = pixelArray;
    }
    
};

Game.prototype.initCustLevels = function () {
    
    // THIS WILL STORE ALL THE PATTERNS IN AN ASSOCIATIVE ARRAY
    cLevels = new Array();

    // RECEIEVE THE LEVELS FROM THE HTML
    var cLevelList = document.getElementById("customLevelsList");
    var cLevelItems = cLevelList.getElementsByTagName("li");

    for (var i = 0; i < cLevelItems.length; i++) {
        // GET THE NAME OF THE IMAGE FILE AND MAKE
        // A NEW ARRAY TO STORE IT'S PIXEL COORDINATES
        var key = cLevelItems[i].id;
        var pixelArray = new Array();

        // NOW LOAD THE DATA FROM THE IMAGE
        loadOffScreenLevel(key, pixelArray);

        //SET THE WEAPON COUNT
        pixelArray[12] = cLevelItems[i].value;
        pixelArray[13] = levelItems[i].getAttribute("cellcountX");
        pixelArray[14] = levelItems[i].getAttribute("cellcountY");
            
        // AND PUT THE DATA IN THE ASSIATIVE ARRAY,
        // BY KEY
        cLevels[key] = pixelArray;
    }
    
};

function loadOffScreenLevel(imgName, pixelArray)
{    
    // FIRST GET THE IMAGE DATA
    var img = new Image();
    
    // NOTE THAT THE IMAGE WILL LOAD IN THE BACKGROUND, BUT
    // WE CAN TELL JavaScript TO LET US KNOW WHEN IT HAS FULLY
    // LOADED AND RESPOND THEN.
    img.onload = function() { respondToLoadedLevelImage(imgName, img, pixelArray); };
    
    // document.URL IS THE URL OF WHERE THE WEB PAGE IS FROM WHICH THIS
    // JavaScript PROGRAM IS BEING USED. NOTE THAT ASSIGNING A URL TO
    // A CONSTRUCTED Image's src VARIABLE INITIATES THE IMAGE-LOADING
    // PROCESS
    var path = document.URL;
    var indexLocation = path.indexOf("index.html");
    path = path.substring(0, indexLocation);
    img.src = path + levelDir + imgName;
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

/*
 * This method is called in response to an Image having completed loading. We
 * respond by examining the contents of the image, and keeping the non-white
 * pixel coordinates in our patterns array so that the user may use those
 * patterns in the simulation.
 */
function respondToLoadedLevelImage(imgName, img, pixelArray)
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
    var voidArrayCounter = 0;
    var objArrayCounter = 0;
    var placementArrayCounter = 0;
    var turretArrayCounter = 0;
    var turretSpawnDRArrayCounter = 0;
    var turretSpawnDLArrayCounter = 0;
    var turretSpawnDUArrayCounter = 0;
    var turretSpawnDDArrayCounter = 0;
    var turretSpawnSRArrayCounter = 0;
    var turretSpawnSLArrayCounter = 0;
    var turretSpawnSUArrayCounter = 0;
    var turretSpawnSDArrayCounter = 0;

    //LEVEL DATA ARRAYS
    var voidArray = new Array();
    var objArray = new Array();
    var placementArray = new Array();
    var turretArray = new Array();
    var turretSpawnDRArray = new Array();
    var turretSpawnDLArray = new Array();
    var turretSpawnDUArray = new Array();
    var turretSpawnDDArray = new Array();
    var turretSpawnSRArray = new Array();
    var turretSpawnSLArray = new Array();
    var turretSpawnSUArray = new Array();
    var turretSpawnSDArray = new Array();
   
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
                    if (((r == 128) && (g == 128) && (b == 128)) || 
                        ((r == 129) && (g == 129) && (b == 129)) ) {
                        // STORE THE COORDINATES OF OUR PIXELS
                        voidArray[voidArrayCounter] = x;
                        voidArray[voidArrayCounter+1] = y;
                        voidArrayCounter += 2;
                    }

                    // IF OBJECTIVE (PURPLE)
                    else if (((r == 128) && (g == 0) && (b == 128)) ||
                             ((r == 129) && (g == 0) && (b == 129)) ) {
                        objArray[objArrayCounter] = x;
                        objArray[objArrayCounter+1] = y;
                        objArrayCounter += 2;
                    }

                    // IF PLACEMENT CELL (LIGHT GRAY)
                    else if (((r == 232) && (g == 232) && (b == 232)) ||
                             ((r == 233) && (g == 233) && (b == 233))) {
                        placementArray[placementArrayCounter] = x;
                        placementArray[placementArrayCounter+1] = y;
                        placementArrayCounter += 2;
                    }

                    // IF TURRET CELL (GREEN)
                    else if (((r == 28) && (g == 147) && (b == 64)) ||
                             ((r == 21) && (g == 148) && (b == 62))) {
                        turretArray[turretArrayCounter] = x;
                        turretArray[turretArrayCounter+1] = y;
                        turretArrayCounter += 2;
                    }

                    // IF TURRET SPAWN CELL DR (PINK)
                    else if (((r == 253) && (g == 174) && (b == 201)) ||
                             ((r == 253) && (g == 176) && (b == 202))) {
                        turretSpawnDRArray[turretSpawnDRArrayCounter] = x;
                        turretSpawnDRArray[turretSpawnDRArrayCounter+1] = y;
                        turretSpawnDRArrayCounter += 2;
                    }

                    // IF TURRET SPAWN CELL DL (PINK)
                    else if (((r == 233) && (g == 174) && (b == 201)) ||
                             ((r == 233) && (g == 176) && (b == 202))) {
                        turretSpawnDLArray[turretSpawnDLArrayCounter] = x;
                        turretSpawnDLArray[turretSpawnDLArrayCounter+1] = y;
                        turretSpawnDLArrayCounter += 2;
                    }

                    // IF TURRET SPAWN CELL DU (PINK)
                    else if (((r == 213) && (g == 174) && (b == 201)) ||
                             ((r == 213) && (g == 176) && (b == 202))) {
                        turretSpawnDUArray[turretSpawnDUArrayCounter] = x;
                        turretSpawnDUArray[turretSpawnDUArrayCounter+1] = y;
                        turretSpawnDUArrayCounter += 2;
                    }

                    // IF TURRET SPAWN CELL DD (PINK)
                    else if (((r == 193) && (g == 174) && (b == 201)) ||
                             ((r == 193) && (g == 176) && (b == 202))) {
                        turretSpawnDDArray[turretSpawnDDArrayCounter] = x;
                        turretSpawnDDArray[turretSpawnDDArrayCounter+1] = y;
                        turretSpawnDDArrayCounter += 2;
                    }

                    // IF TURRET SPAWN CELL SR (PINK)
                    else if (((r == 253) && (g == 0) && (b == 0)) ||
                             ((r == 253) && (g == 0) && (b == 0))) {
                        turretSpawnSRArray[turretSpawnSRArrayCounter] = x;
                        turretSpawnSRArray[turretSpawnSRArrayCounter+1] = y;
                        turretSpawnSRArrayCounter += 2;
                    }

                    // IF TURRET SPAWN CELL SL (PINK)
                    else if (((r == 233) && (g == 0) && (b == 0)) ||
                             ((r == 233) && (g == 0) && (b == 0))) {
                        turretSpawnSLArray[turretSpawnSLArrayCounter] = x;
                        turretSpawnSLArray[turretSpawnSLArrayCounter+1] = y;
                        turretSpawnSLArrayCounter += 2;
                    }

                    // IF TURRET SPAWN CELL SU (PINK)
                    else if (((r == 213) && (g == 0) && (b == 0)) ||
                             ((r == 213) && (g == 0) && (b == 0))) {
                        turretSpawnSUArray[turretSpawnSUArrayCounter] = x;
                        turretSpawnSUArray[turretSpawnSUArrayCounter+1] = y;
                        turretSpawnSUArrayCounter += 2;
                    }

                    // IF TURRET SPAWN CELL SD (PINK)
                    else if (((r == 193) && (g == 0) && (b == 0)) ||
                             ((r == 193) && (g == 0) && (b == 0))) {
                        turretSpawnSDArray[turretSpawnSDArrayCounter] = x;
                        turretSpawnSDArray[turretSpawnSDArrayCounter+1] = y;
                        turretSpawnSDArrayCounter += 2;
                    }

                    // **DEBUG** CHECK FOR BROWSER DESCREPENCIES
                    else {
                        console.log(r +'\n' + g + '\n' + b + '\n');
                    }

                }            
        }  
    // SAVE THE DATA SO IT'S ACCESSIBLE LATER
    pixelArray[0] = voidArray;
    pixelArray[1] = objArray; 
    pixelArray[2] = placementArray; 
    pixelArray[3] = turretArray;
    pixelArray[4] = turretSpawnDRArray;
    pixelArray[5] = turretSpawnDLArray;
    pixelArray[6] = turretSpawnDUArray;
    pixelArray[7] = turretSpawnDDArray;
    pixelArray[8] = turretSpawnSRArray;
    pixelArray[9] = turretSpawnSLArray;
    pixelArray[10] = turretSpawnSUArray;
    pixelArray[11] = turretSpawnSDArray;   
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

Game.prototype.loadLevel = function (levelToLoad) {
    // LOAD THE COORDINATES OF THE PIXELS TO DRAW
    currentLevel = levelToLoad;
    var level = levels[levelToLoad];
    var walls = level[0];
    var objectives = level[1];
    var placements = level[2];
    var turrets = level[3];
    var turretSpawnDRArray = level[4];
    var turretSpawnDLArray = level[5];
    var turretSpawnDUArray = level[6];
    var turretSpawnDDArray = level[7];
    var turretSpawnSRArray = level[8];
    var turretSpawnSLArray = level[9];
    var turretSpawnSUArray = level[10];
    var turretSpawnSDArray = level[11];
    weaponCount = level[12];
    cellcountX = level[13];
    cellcountY = level[14];
    nextTimeTurretCanFire = Date.now();
    placedCount = 0;

    // START A NEW TIMER
    turretRenderTimer = setInterval(this.stepTurretTime, frameInterval);
    
    // GO THROUGH ALL THE CELL PLACEMENTS FOR THIS LEVEL AND PUT THEM IN THE GRID
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
            this.setGridCell(renderGrid, row, col, OBJ_CELL);
            this.setGridCell(updateGrid, row, col, OBJ_CELL);
        }
    for (var i = 0; i < placements.length; i += 2)
        {
            var col = placements[i];
            var row = placements[i+1];
            var index = (row * gridWidth) + col;
            this.setGridCell(renderGrid, row, col, PLACEMENT_CELL);
            this.setGridCell(updateGrid, row, col, PLACEMENT_CELL);
        }
    for (var i = 0; i < turrets.length; i += 2)
        {
            var col = turrets[i];
            var row = turrets[i+1];
            var index = (row * gridWidth) + col;
            this.setGridCell(renderGrid, row, col, TURRET_CELL);
            this.setGridCell(updateGrid, row, col, TURRET_CELL);
        }
    for (var i = 0; i < turretSpawnDRArray.length; i += 2)
        {
            var col = turretSpawnDRArray[i];
            var row = turretSpawnDRArray[i+1];
            var index = (row * gridWidth) + col;
            this.setGridCell(renderGrid, row, col, TURRET_SPAWN_CELL);
            this.setGridCell(updateGrid, row, col, TURRET_SPAWN_CELL);
        }
    for (var i = 0; i < turretSpawnDLArray.length; i += 2)
        {
            var col = turretSpawnDLArray[i];
            var row = turretSpawnDLArray[i+1];
            var index = (row * gridWidth) + col;
            this.setGridCell(renderGrid, row, col, TURRET_SPAWN_CELL);
            this.setGridCell(updateGrid, row, col, TURRET_SPAWN_CELL);
        }
    for (var i = 0; i < turretSpawnDUArray.length; i += 2)
        {
            var col = turretSpawnDUArray[i];
            var row = turretSpawnDUArray[i+1];
            var index = (row * gridWidth) + col;
            this.setGridCell(renderGrid, row, col, TURRET_SPAWN_CELL);
            this.setGridCell(updateGrid, row, col, TURRET_SPAWN_CELL);
        }
    for (var i = 0; i < turretSpawnDDArray.length; i += 2)
        {
            var col = turretSpawnDDArray[i];
            var row = turretSpawnDDArray[i+1];
            var index = (row * gridWidth) + col;
            this.setGridCell(renderGrid, row, col, TURRET_SPAWN_CELL);
            this.setGridCell(updateGrid, row, col, TURRET_SPAWN_CELL);
        }
    for (var i = 0; i < turretSpawnSRArray.length; i += 2)
        {
            var col = turretSpawnSRArray[i];
            var row = turretSpawnSRArray[i+1];
            var index = (row * gridWidth) + col;
            this.setGridCell(renderGrid, row, col, TURRET_SPAWN_CELL);
            this.setGridCell(updateGrid, row, col, TURRET_SPAWN_CELL);
        }
    for (var i = 0; i < turretSpawnSLArray.length; i += 2)
        {
            var col = turretSpawnSLArray[i];
            var row = turretSpawnSLArray[i+1];
            var index = (row * gridWidth) + col;
            this.setGridCell(renderGrid, row, col, TURRET_SPAWN_CELL);
            this.setGridCell(updateGrid, row, col, TURRET_SPAWN_CELL);
        }
    for (var i = 0; i < turretSpawnSUArray.length; i += 2)
        {
            var col = turretSpawnSUArray[i];
            var row = turretSpawnSUArray[i+1];
            var index = (row * gridWidth) + col;
            this.setGridCell(renderGrid, row, col, TURRET_SPAWN_CELL);
            this.setGridCell(updateGrid, row, col, TURRET_SPAWN_CELL);
        }
    for (var i = 0; i < turretSpawnSDArray.length; i += 2)
        {
            var col = turretSpawnSDArray[i];
            var row = turretSpawnSDArray[i+1];
            var index = (row * gridWidth) + col;
            this.setGridCell(renderGrid, row, col, TURRET_SPAWN_CELL);
            this.setGridCell(updateGrid, row, col, TURRET_SPAWN_CELL);
        }

    // RENDER THE GAME IMMEDIATELY
    this.renderGameWithoutSwapping();
}

Game.prototype.initEventHandlers = function () {
  canvas.onmousedown = this.setMouseDown;
  canvas.onmouseup = this.setMouseUp;
};

Game.prototype.setMouseDown = function () {
    mouseState = true;
};

Game.prototype.setMouseUp = function () {
    mouseState = false;
};



Game.prototype.realMouseClick = function(event, purpleGame) {

    // FIRST CHECK TO MAKE SURE WE CAN STILL PLACE A WEAPON
	if (purpleGame.getWeaponCount() != 0) {
	    // GET THE SELECTED WEAPON
	    var patternsList = document.getElementById("weaponsList");
	    var patternItems = patternsList.getElementsByTagName("li");
	    var selectedPattern = patternItems[0].id;
	    
	    // LOAD THE COORDINATES OF THE PIXELS TO DRAW
	    var pixels = patterns[selectedPattern];
	    
	    // CALCULATE THE ROW,COL OF THE CLICK
	    var canvasCoords = purpleGame.getRelativeCoords(event);
	    var clickCol = Math.floor(canvasCoords.x/cellLengthX);
	    var clickRow = Math.floor(canvasCoords.y/cellLengthY);
	    
        // TO CHECK IF WE ACTUALLY ENDED UP PLACING ANY PIXELS
        var placed = false;

        var undoArrayCount = 0;
        var undoArray = new Array();

	    // GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID
	    for (var i = 0; i < pixels.length; i += 2)
	        {
	            var col = clickCol + pixels[i];
	            var row = clickRow + pixels[i+1];
	            var index = (row * gridWidth) + col;
	            var cell = purpleGame.getGridCell(renderGrid, row, col);
                // ONLY ADD THE WEAPON IF THE CLICK IS PLAYING PIXELS INSIDE THE PLACEMENT CELLS
	            if (cell === PLACEMENT_CELL) {
	            	purpleGame.setGridCell(renderGrid, row, col, LIVE_CELL);
	            	purpleGame.setGridCell(updateGrid, row, col, LIVE_CELL);
	            	purpleGame.setGridCell(brightGrid, row, col, NEW_CELL);
                    // SAVE FOR UNDO
                    undoArray[undoArrayCount++] = col;
                    undoArray[undoArrayCount++] = row;
                    // SAVE COORDINATES OF WEAPON FOR LEVEL RETRY
                    savedPlacementCells[savedCellsCount++] = col;
                    savedPlacementCells[savedCellsCount++] = row;
                    placed = true;
	        	}
	        	
	        }

            allSavedPlacements[placedCount] = undoArray;
            placedCount++;

	        savedPlacementCells[savedCellsCount++] = -1;
            // SAVE PLACED WEAPON IN AN ARRAY
            var placedWeapon = weapon.substring(0, weapon.indexOf('_'));
            if(placedWeapon.length == 0)
                placedWeapon = weapon.substring(0, weapon.indexOf('.'));
            if(!checkIfAvailable(placedWeapon))
                placedWeapons[placedWeaponCount++] = placedWeapon;
            alert(placedWeapons);
	        
	    // RENDER THE GAME IMMEDIATELY
	    purpleGame.renderGameWithoutSwapping();

        // ONLY DECREMENT "WEAPONCOUNT" IF WE DID IN FACT PLACE PIXELS
        if (placed)
	       purpleGame.setWeaponCount(purpleGame.getWeaponCount()-1);
	}
};

// THIS FUNCTION CHECKS IF PLACED WEAPON IS ALREADY IN "PLACEDWEAPONS" ARRAY
function checkIfAvailable(placedWeapon) {
    for(var i = 0; i < placedWeapons.length; i++)
        if(placedWeapons[i] == placedWeapon)
            return true;
    return false;
}

Game.prototype.respondToMouseMove = function (event, purpleGame) {
    // GET THE PATTERN SELECTED IN THE DROP DOWN LIST
    var patternsList = document.getElementById("weaponsList");
    var patternItems = patternsList.getElementsByTagName("li");
    var selectedPattern = patternItems[0].id;
    
    // LOAD THE COORDINATES OF THE PIXELS TO DRAW
    var pixels = patterns[selectedPattern];
    
    // CALCULATE THE ROW,COL OF THE CLICK
    var canvasCoords = purpleGame.getRelativeCoords(event);
    var clickCol = Math.floor(canvasCoords.x/cellLengthX);
    var clickRow = Math.floor(canvasCoords.y/cellLengthY);
    
    // GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID
    tempGrid = new Array();
    for (var i = 0; i < pixels.length; i += 2)
        {
            var col = clickCol + pixels[i];
            var row = clickRow + pixels[i+1];
            var index = (row * gridWidth) + col;
           	var cell = purpleGame.getGridCell(renderGrid, row, col);
	        if (cell === PLACEMENT_CELL) {
            	purpleGame.setGridCell(tempGrid, row, col, HOVER_CELL);
            }
        }
        
    // RENDER THE GAME IMMEDIATELY
    purpleGame.renderGameWithoutSwapping();
};

Game.prototype.renderGame = function () {
    // CLEAR THE CANVAS
    canvas2D.clearRect(0, 0, canvasWidth, canvasHeight);

    if (currentLevel != undefined)
    this.renderPlacementCells();
    
    // RENDER THE GRID LINES, IF NEEDED
    if (cellLengthX >= GRID_LINE_LENGTH_RENDERING_THRESHOLD)
        this.renderGridLines();
    
    // RENDER THE GAME CELLS
    this.renderCells();

    // RENDER WEAPON COUNT
    this.renderWeaponCountText();

    // RNEDER WEAPON SELECT
    this.renderWeaponSelect();

    // AND RENDER THE TEXT
    if (gameWon) {
        this.renderYouWon();
        playWonSound();
        // IF THE PLAYER WANTS TO PRESS F TO GO ON TO THE NEXT LEVEL
        if (currentlyPressedKeys[70]) {
            var levelNumber = parseInt(currentLevel.match(/\d+/), 10) + 1;
            if (userSignedIn === true && getUserProgress() < levelNumber-1 ){
                console.log(getUserProgress());
                setUserProgress(levelNumber-1);
            }
            giveLevelAccess(levelNumber);
            var tempCurrentLevel = currentLevel;
            savedPlacementCells.length = 0;
            savedCellsCount = 0;
            this.resetGameOfLife();
            this.pausePurpleGame();
            this.loadLevel(tempCurrentLevel.substring(0,5) + levelNumber + ".png");
        }
    } else if (gameLost) {
        this.renderYouLostText();
        // IF THE PLAYER WANTS TO PRESS R TO RESTART THE LEVEL
        if (currentlyPressedKeys[82]) {
            this.resetLevel();
        }
    }
    
    // THE GRID WE RENDER THIS FRAME WILL BE USED AS THE BASIS
    // FOR THE UPDATE GRID NEXT FRAME
    this.swapGrids();
};

Game.prototype.renderGameWithoutSwapping = function()
{
    // CLEAR THE CANVAS
    canvas2D.clearRect(0, 0, canvasWidth, canvasHeight);

    this.renderPlacementCells();
    
    // RENDER THE GRID LINES, IF NEEDED
    if (cellLengthX >= GRID_LINE_LENGTH_RENDERING_THRESHOLD)
        this.renderGridLines();
    
    // RENDER THE GAME CELLS
    this.renderCells();

    // RENDER WEAPON COUNT
    this.renderWeaponCountText();

    // RENDER WEAPON SELECT
    this.renderWeaponSelect();
    
    // AND RENDER THE TEXT
    if (gameWon) {
        this.renderYouWon();
        playWonSound();
        // IF THE PLAYER WANTS TO PRESS F TO GO ON TO THE NEXT LEVEL
        if (currentlyPressedKeys[70]) {
            var levelNumber = parseInt(currentLevel.match(/\d+/), 10) + 1;
            if (userSignedIn === true && getUserProgress() < levelNumber-1 ) {
                console.log(getUserProgress());
                setUserProgress(levelNumber-1);
            }
            giveLevelAccess(levelNumber);
            this.resetGameOfLife();
            this.pausePurpleGame();
            this.loadLevel(currentLevel.substring(0,5) + levelNumber + ".png");
        }
    } else if (gameLost) {
        this.renderYouLostText();
        // IF THE PLAYER WANTS TO PRESS R TO RESTART THE LEVEL
        if (currentlyPressedKeys[82]) {
            this.resetLevel();
        }
    }
}

Game.prototype.renderPlacementCells = function() {
    //GET THE CURRENT LEVEL
	var level = levels[currentLevel];
    //GET THE PLACEMENT CELL LOCATIONS
	var placements = level[2];

    //RENDER THE PLACEMENT CELLS
	for (var i = 0; i < placements.length; i+=2) {
		var col = placements[i];
        var row = placements[i+1];
	    var x = col * cellLengthX;
	    var y = row * cellLengthY;
	    canvas2D.fillStyle = PLACEMENT_COLOR;
	    canvas2D.fillRect(x, y, cellLengthX, cellLengthY);
	}
};

Game.prototype.renderGridLines = function () {
    // SET THE PROPER COLOR
    canvas2D.strokeStyle = GRID_LINES_COLOR;

    // VERTICAL LINES
    for (var i = 0; i < gridWidth; i++)
        {
            var x1 = i * cellLengthX;
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
            var y1 = j * cellLengthY;
            var x2 = canvasWidth;
            var y2 = y1;
            canvas2D.moveTo(x1, y1);
            canvas2D.lineTo(x2, y2);
            canvas2D.stroke();            
        }
};

/*
 * Renders the cells in the game grid, with only the live
 * cells being rendered as filled boxes. Note that boxes are
 * rendered according to the current cell length.
 */
Game.prototype.renderCells = function() {   
	var objCellCount = 0;

    // RENDER THE LIVE CELLS IN THE GRID
    for (var i = 0; i <= gridHeight; i++)
        {
           for (var j = 0; j < gridWidth; j++)
               {
                   var cell = this.getGridCell(renderGrid, i, j);
                   var cell2 = this.getGridCell(tempGrid, i, j);
                   var cell3 = this.getGridCell(brightGrid, i, j);
                   if (cell === LIVE_CELL)
                       {
                           canvas2D.fillStyle = LIVE_COLOR;
                           var x = j * cellLengthX;
                           var y = i * cellLengthY;
                           canvas2D.fillRect(x, y, cellLengthX, cellLengthY);
                       }
                    else if (cell === VOID_CELL)
                       {
                           canvas2D.fillStyle = WALL_COLOR;
                           var x = j * cellLengthX;
                           var y = i * cellLengthY;
                           canvas2D.fillRect(x, y, cellLengthX, cellLengthY); 
                       } 
                    else if (cell === OBJ_CELL) {
                    	   objCellCount++;
                       	   canvas2D.fillStyle = OBJ_COLOR;
                           var x = j * cellLengthX;
                           var y = i * cellLengthY;
                           canvas2D.fillRect(x, y, cellLengthX, cellLengthY);
                       }
                    else if (cell === TURRET_CELL) {
                           canvas2D.fillStyle = TURRET_COLOR;
                           var x = j * cellLengthX;
                           var y = i * cellLengthY;
                           canvas2D.fillRect(x, y, cellLengthX, cellLengthY);
                       }
                    else if (cell === TURRET_SPAWN_CELL) {
                           canvas2D.fillStyle = TURRET_COLOR;
                           var x = j * cellLengthX;
                           var y = i * cellLengthY;
                           canvas2D.fillRect(x, y, cellLengthX, cellLengthY);
                       }
                    else if (cell === LIVE_TURRET_CELL) {
                           canvas2D.fillStyle = LIVE_TURRET_COLOR;
                           var x = j * cellLengthX;
                           var y = i * cellLengthY;
                           canvas2D.fillRect(x, y, cellLengthX, cellLengthY);
                    }
                    if (cell2 === HOVER_CELL) {
                           canvas2D.fillStyle = HOVER_COLOR;
                           var x = j * cellLengthX;
                           var y = i * cellLengthY;
                           canvas2D.fillRect(x, y, cellLengthX, cellLengthY);
                    }
                    if (cell3 == PREV_CELL) {
                        canvas2D.fillStyle = PREV_COLOR;
                        var x = j * cellLengthX;
                        var y = i * cellLengthY;
                        canvas2D.fillRect(x, y, cellLengthX, cellLengthY);
                    }
                    
                    if (cell3 === NEW_CELL) {
                           canvas2D.fillStyle = BRIGHT_COLOR;
                           var x = j * cellLengthX;
                           var y = i * cellLengthY;
                           canvas2D.fillRect(x, y, cellLengthX, cellLengthY);
                    }
               }
        } 
    // IF THE PLAYER ELIMINATED ALL THE OBJ CELLS, THEN HE WON THE GAME
    if (objCellCount == 0 && currentLevel != undefined) {
    	gameWon = true;
    }  
};

Game.prototype.renderWeaponCountText = function() {
    canvas2D.fillStyle = TEXT_COLOR;

    canvas2D.textAlign="left";
    canvas2D.fillText("Weapon Count: " + this.getWeaponCount(), 25,canvasHeight*(6/7));
}

Game.prototype.renderWeaponSelect = function() {
    canvas2D.fillStyle = TEXT_COLOR;

    canvas2D.textAlign="left"
    canvas2D.fillText("Weapon: " + this.getWeaponSelect() + " " + this.getWeaponDirection(), 25,canvasHeight*(5.5/7));
}

/*
 * Renders the text on top of the grid.
 */
Game.prototype.renderYouWon = function() {
    // SET THE PROPER COLOR
    canvas2D.fillStyle = TEXT_COLOR;
    
    // RENDER THE TEXT
    canvas2D.textAlign="center"; 
    canvas2D.fillText("You Won! Press F to Continue!", canvasWidth/2, canvasHeight/2);
}

Game.prototype.renderYouLostText = function() {
    // SET THE PROPER COLOR
    canvas2D.fillStyle = TEXT_COLOR;
    
    // RENDER THE TEXT
    canvas2D.textAlign="center"; 
    canvas2D.fillText("You Lost! Press R to retry!", canvasWidth/2, canvasHeight/2);
}

Game.prototype.stepPurpleGame = function() {
    // CHECK TO SEE IF TURRET IS ALLOWED TO FIRE
    var now = Date.now();
    if (nextTimeTurretCanFire <= now) {
        purpleGame.spawnProjectile();
        nextTimeTurretCanFire += turretFireRate;
    }

	//REMOVE BRIGHT ARRAY
    brightGrid = new Array();
    
    // FIRST PERFORM GAME LOGIC
    purpleGame.updateGame();

    // TURRET LOGIC
    purpleGame.updateTurretProjectiles();
    
    // RENDER THE GAME
    purpleGame.renderGame();
};

Game.prototype.stepTurretTime = function() {
    //CHECK TO SEE IF TURRET IS ALLOWED TO FIRE
    var now = Date.now();
    if (nextTimeTurretCanFire <= now) {
        purpleGame.spawnProjectile();
        nextTimeTurretCanFire += turretFireRate;
    }
    
    // FIRST PERFORM GAME LOGIC
    purpleGame.updateTurretProjectiles();

    // RENDER THE GAME
    purpleGame.renderGame();
};

/*
 * This function is called each frame of the simulation and
 * it tests and updates each cell according to the rules
 * of Conway's Game of Life.
 */
Game.prototype.updateGame = function () {
    // GO THROUGH THE UPDATE GRID AND USE IT TO CHANGE THE RENDER GRID
    for (var i = 0; i < gridHeight; i++)
        {
            for (var j = 0; j < gridWidth; j++)
                {
                    // HOW MANY NEIGHBORS DOES THIS CELL HAVE?
                    var numLivingNeighbors = this.calcLivingNeighbors(i, j);

                    // CALCULATE THE ARRAY INDEX OF THIS CELL
                    // AND GET ITS CURRENT STATE
                    var index = (i * gridWidth) + j;
                    var testCell = updateGrid[index];

                    // CASES
                    // 1) IT'S ALIVE
                    if (testCell != VOID_CELL && testCell != TURRET_CELL && testCell != TURRET_SPAWN_CELL && testCell != LIVE_TURRET_CELL) {
                        if (testCell === LIVE_CELL || testCell === OBJ_CELL || testCell === LIVE_TURRET_CELL)
                            {
                                // 1a FEWER THAN 2 LIVING NEIGHBORS
                                if (numLivingNeighbors < 2)
                                    {
                                        // IT DIES FROM UNDER-POPULATION
                                        renderGrid[index] = DEAD_CELL;
                                    }
                                // 1b MORE THAN 3 LIVING NEIGHBORS
                                else if (numLivingNeighbors > 3)
                                    {
                                        // IT DIES FROM OVERCROWDING
                                        renderGrid[index] = DEAD_CELL;
                                    }
                                // 1c 2 OR 3 LIVING NEIGHBORS, WE DO NOTHING
                                else
                                    {   
                                        if (testCell === LIVE_CELL) {
                                            renderGrid[index] = LIVE_CELL;
                                        } else if (testCell === LIVE_TURRET_CELL) {
                                            renderGrid[index] = LIVE_TURRET_CELL;
                                        } else {
                                            renderGrid[index] = OBJ_CELL;
                                        }
                                    }
                            }
                        // 2) IT'S DEAD
                       else if (numLivingNeighbors === 3)
                           {
                               if (renderGrid[index] === LIVE_TURRET_CELL) renderGrid[index] = LIVE_TURRET_CELL;
                               else renderGrid[index] = LIVE_CELL;
                           }                    
                       else
                           {
                               renderGrid[index] = DEAD_CELL;
                           }
                   }
                }
        } 
}

/*
 * This function is called each frame of the simulation, including
 * before the the game has started. It updates all the projectile cells
 * based on the rules of Conway's Game of Life.
 */
Game.prototype.updateTurretProjectiles = function () {
    // GO THROUGH THE UPDATE GRID AND USE IT TO CHANGE THE RENDER GRID
    for (var i = 0; i < gridHeight; i++)
        {
            for (var j = 0; j < gridWidth; j++)
                {
                    // HOW MANY NEIGHBORS DOES THIS CELL HAVE?
                    var numLivingNeighbors = this.calcLivingNeighborsTurret(i, j);

                    // CALCULATE THE ARRAY INDEX OF THIS CELL
                    // AND GET ITS CURRENT STATE
                    var index = (i * gridWidth) + j;
                    var testCell = updateGrid[index];

                    // CASES
                    // 1) IT'S ALIVE
                    if (testCell != VOID_CELL && testCell != TURRET_CELL && testCell != TURRET_SPAWN_CELL && testCell != PLACEMENT_CELL && testCell != LIVE_CELL) {
                        if (testCell === LIVE_TURRET_CELL || testCell === OBJ_CELL)
                            {
                                // 1a FEWER THAN 2 LIVING NEIGHBORS
                                if (numLivingNeighbors < 2)
                                    {
                                        // IT DIES FROM UNDER-POPULATION
                                        renderGrid[index] = DEAD_CELL;
                                    }
                                // 1b MORE THAN 3 LIVING NEIGHBORS
                                else if (numLivingNeighbors > 3)
                                    {
                                        // IT DIES FROM OVERCROWDING
                                        renderGrid[index] = DEAD_CELL;
                                    }
                                // 1c 2 OR 3 LIVING NEIGHBORS, WE DO NOTHING
                                else
                                    {   
                                        if (testCell === LIVE_TURRET_CELL) {
                                            renderGrid[index] = LIVE_TURRET_CELL;
                                        } else {
                                            renderGrid[index] = OBJ_CELL;
                                        }
                                    }
                            }
                        // 2) IT'S DEAD
                       else if (numLivingNeighbors === 3)
                           {
                               renderGrid[index] = LIVE_TURRET_CELL;
                           }                    
                       else if (numLivingNeighbors < 0) {}
                       else {
                               renderGrid[index] = DEAD_CELL;
                           }
                   }
                }
        } 
}

Game.prototype.spawnProjectile = function() {
    // GET THE TURRET SPAWN LOCATIONS
    var turretSpawnDRArray = levels[currentLevel][4];
    var turretSpawnDLArray = levels[currentLevel][5];
    var turretSpawnDUArray = levels[currentLevel][6];
    var turretSpawnDDArray = levels[currentLevel][7];
    var turretSpawnSRArray = levels[currentLevel][8];
    var turretSpawnSLArray = levels[currentLevel][9];
    var turretSpawnSUArray = levels[currentLevel][10];
    var turretSpawnSDArray = levels[currentLevel][11];

    // SPAWN THE PROJECTILES
    for (var i = 0; i < turretSpawnDRArray.length; i += 2) {
        //TOP RIGHT
        purpleGame.setGridCell(renderGrid, turretSpawnDRArray[i+1] + 2, turretSpawnDRArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDRArray[i+1] + 3, turretSpawnDRArray[i] + 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDRArray[i+1] + 4, turretSpawnDRArray[i] + 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDRArray[i+1] + 4, turretSpawnDRArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDRArray[i+1] + 4, turretSpawnDRArray[i] + 3, LIVE_TURRET_CELL);
        //BOTTOM RIGHT
        purpleGame.setGridCell(renderGrid, turretSpawnDRArray[i+1] - 1, turretSpawnDRArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDRArray[i+1] - 2, turretSpawnDRArray[i] + 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDRArray[i+1] - 3, turretSpawnDRArray[i] + 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDRArray[i+1] - 3, turretSpawnDRArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDRArray[i+1] - 3, turretSpawnDRArray[i] + 3, LIVE_TURRET_CELL);

        //UPDATE GRID
        purpleGame.setGridCell(updateGrid, turretSpawnDRArray[i+1] + 2, turretSpawnDRArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDRArray[i+1] + 3, turretSpawnDRArray[i] + 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDRArray[i+1] + 4, turretSpawnDRArray[i] + 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDRArray[i+1] + 4, turretSpawnDRArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDRArray[i+1] + 4, turretSpawnDRArray[i] + 3, LIVE_TURRET_CELL);

        purpleGame.setGridCell(updateGrid, turretSpawnDRArray[i+1] - 1, turretSpawnDRArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDRArray[i+1] - 2, turretSpawnDRArray[i] + 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDRArray[i+1] - 3, turretSpawnDRArray[i] + 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDRArray[i+1] - 3, turretSpawnDRArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDRArray[i+1] - 3, turretSpawnDRArray[i] + 3, LIVE_TURRET_CELL);
    }

    // SPAWN THE PROJECTILES
    for (var i = 0; i < turretSpawnDLArray.length; i += 2) {
        //TOP RIGHT
        purpleGame.setGridCell(renderGrid, turretSpawnDLArray[i+1] + 2, turretSpawnDLArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDLArray[i+1] + 3, turretSpawnDLArray[i] - 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDLArray[i+1] + 4, turretSpawnDLArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDLArray[i+1] + 4, turretSpawnDLArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDLArray[i+1] + 4, turretSpawnDLArray[i] - 3, LIVE_TURRET_CELL);
        //BOTTOM RIGHT
        purpleGame.setGridCell(renderGrid, turretSpawnDLArray[i+1] - 1, turretSpawnDLArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDLArray[i+1] - 2, turretSpawnDLArray[i] - 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDLArray[i+1] - 3, turretSpawnDLArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDLArray[i+1] - 3, turretSpawnDLArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDLArray[i+1] - 3, turretSpawnDLArray[i] - 3, LIVE_TURRET_CELL);

        //UPDATE GRID
        purpleGame.setGridCell(updateGrid, turretSpawnDLArray[i+1] + 2, turretSpawnDLArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDLArray[i+1] + 3, turretSpawnDLArray[i] - 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDLArray[i+1] + 4, turretSpawnDLArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDLArray[i+1] + 4, turretSpawnDLArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDLArray[i+1] + 4, turretSpawnDLArray[i] - 3, LIVE_TURRET_CELL);

        purpleGame.setGridCell(updateGrid, turretSpawnDLArray[i+1] - 1, turretSpawnDLArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDLArray[i+1] - 2, turretSpawnDLArray[i] - 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDLArray[i+1] - 3, turretSpawnDLArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDLArray[i+1] - 3, turretSpawnDLArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDLArray[i+1] - 3, turretSpawnDLArray[i] - 3, LIVE_TURRET_CELL);
    }

    // SPAWN THE PROJECTILES
    for (var i = 0; i < turretSpawnDUArray.length; i += 2) {
        //TOP RIGHT
        purpleGame.setGridCell(renderGrid, turretSpawnDUArray[i+1] + 2, turretSpawnDUArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDUArray[i+1] + 3, turretSpawnDUArray[i] + 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDUArray[i+1] + 1, turretSpawnDUArray[i] + 4, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDUArray[i+1] + 2, turretSpawnDUArray[i] + 4, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDUArray[i+1] + 3, turretSpawnDUArray[i] + 4, LIVE_TURRET_CELL);
        //BOTTOM RIGHT
        purpleGame.setGridCell(renderGrid, turretSpawnDUArray[i+1] + 2, turretSpawnDUArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDUArray[i+1] + 3, turretSpawnDUArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDUArray[i+1] + 1, turretSpawnDUArray[i] - 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDUArray[i+1] + 2, turretSpawnDUArray[i] - 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDUArray[i+1] + 3, turretSpawnDUArray[i] - 3, LIVE_TURRET_CELL);

        //UPDATE GRID
        purpleGame.setGridCell(updateGrid, turretSpawnDUArray[i+1] + 2, turretSpawnDUArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDUArray[i+1] + 3, turretSpawnDUArray[i] + 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDUArray[i+1] + 1, turretSpawnDUArray[i] + 4, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDUArray[i+1] + 2, turretSpawnDUArray[i] + 4, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDUArray[i+1] + 3, turretSpawnDUArray[i] + 4, LIVE_TURRET_CELL);

        purpleGame.setGridCell(updateGrid, turretSpawnDUArray[i+1] + 2, turretSpawnDUArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDUArray[i+1] + 3, turretSpawnDUArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDUArray[i+1] + 1, turretSpawnDUArray[i] - 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDUArray[i+1] + 2, turretSpawnDUArray[i] - 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDUArray[i+1] + 3, turretSpawnDUArray[i] - 3, LIVE_TURRET_CELL);
    }

        // SPAWN THE PROJECTILES
    for (var i = 0; i < turretSpawnDDArray.length; i += 2) {
        //TOP RIGHT
        purpleGame.setGridCell(renderGrid, turretSpawnDDArray[i+1] - 2, turretSpawnDDArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDDArray[i+1] - 3, turretSpawnDDArray[i] + 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDDArray[i+1] - 1, turretSpawnDDArray[i] + 4, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDDArray[i+1] - 2, turretSpawnDDArray[i] + 4, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDDArray[i+1] - 3, turretSpawnDDArray[i] + 4, LIVE_TURRET_CELL);
        //BOTTOM RIGHT
        purpleGame.setGridCell(renderGrid, turretSpawnDDArray[i+1] - 2, turretSpawnDDArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDDArray[i+1] - 3, turretSpawnDDArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDDArray[i+1] - 1, turretSpawnDDArray[i] - 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDDArray[i+1] - 2, turretSpawnDDArray[i] - 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnDDArray[i+1] - 3, turretSpawnDDArray[i] - 3, LIVE_TURRET_CELL);

        //UPDATE GRID
        purpleGame.setGridCell(updateGrid, turretSpawnDDArray[i+1] - 2, turretSpawnDDArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDDArray[i+1] - 3, turretSpawnDDArray[i] + 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDDArray[i+1] - 1, turretSpawnDDArray[i] + 4, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDDArray[i+1] - 2, turretSpawnDDArray[i] + 4, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDDArray[i+1] - 3, turretSpawnDDArray[i] + 4, LIVE_TURRET_CELL);

        purpleGame.setGridCell(updateGrid, turretSpawnDDArray[i+1] - 2, turretSpawnDDArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDDArray[i+1] - 3, turretSpawnDDArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDDArray[i+1] - 1, turretSpawnDDArray[i] - 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDDArray[i+1] - 2, turretSpawnDDArray[i] - 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnDDArray[i+1] - 3, turretSpawnDDArray[i] - 3, LIVE_TURRET_CELL);
    }

    for (var i = 0; i < turretSpawnSRArray.length; i += 2) {
        purpleGame.setGridCell(renderGrid, turretSpawnSRArray[i+1] - 0, turretSpawnSRArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSRArray[i+1] + 2, turretSpawnSRArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSRArray[i+1] - 1, turretSpawnSRArray[i] + 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSRArray[i+1] - 1, turretSpawnSRArray[i] + 4, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSRArray[i+1] - 1, turretSpawnSRArray[i] + 5, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSRArray[i+1] - 1, turretSpawnSRArray[i] + 6, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSRArray[i+1] - 0, turretSpawnSRArray[i] + 6, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSRArray[i+1] + 1, turretSpawnSRArray[i] + 6, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSRArray[i+1] + 2, turretSpawnSRArray[i] + 5, LIVE_TURRET_CELL);

        purpleGame.setGridCell(updateGrid, turretSpawnSRArray[i+1] - 0, turretSpawnSRArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSRArray[i+1] + 2, turretSpawnSRArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSRArray[i+1] - 1, turretSpawnSRArray[i] + 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSRArray[i+1] - 1, turretSpawnSRArray[i] + 4, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSRArray[i+1] - 1, turretSpawnSRArray[i] + 5, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSRArray[i+1] - 1, turretSpawnSRArray[i] + 6, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSRArray[i+1] - 0, turretSpawnSRArray[i] + 6, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSRArray[i+1] + 1, turretSpawnSRArray[i] + 6, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSRArray[i+1] + 2, turretSpawnSRArray[i] + 5, LIVE_TURRET_CELL);
    }

    for (var i = 0; i < turretSpawnSLArray.length; i += 2) {
        purpleGame.setGridCell(renderGrid, turretSpawnSLArray[i+1] - 0, turretSpawnSLArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSLArray[i+1] + 2, turretSpawnSLArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSLArray[i+1] - 1, turretSpawnSLArray[i] - 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSLArray[i+1] - 1, turretSpawnSLArray[i] - 4, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSLArray[i+1] - 1, turretSpawnSLArray[i] - 5, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSLArray[i+1] - 1, turretSpawnSLArray[i] - 6, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSLArray[i+1] - 0, turretSpawnSLArray[i] - 6, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSLArray[i+1] + 1, turretSpawnSLArray[i] - 6, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSLArray[i+1] + 2, turretSpawnSLArray[i] - 5, LIVE_TURRET_CELL);

        purpleGame.setGridCell(updateGrid, turretSpawnSLArray[i+1] - 0, turretSpawnSLArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSLArray[i+1] + 2, turretSpawnSLArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSLArray[i+1] - 1, turretSpawnSLArray[i] - 3, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSLArray[i+1] - 1, turretSpawnSLArray[i] - 4, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSLArray[i+1] - 1, turretSpawnSLArray[i] - 5, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSLArray[i+1] - 1, turretSpawnSLArray[i] - 6, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSLArray[i+1] - 0, turretSpawnSLArray[i] - 6, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSLArray[i+1] + 1, turretSpawnSLArray[i] - 6, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSLArray[i+1] + 2, turretSpawnSLArray[i] - 5, LIVE_TURRET_CELL);
    }

    for (var i = 0; i < turretSpawnSUArray.length; i += 2) {
        purpleGame.setGridCell(renderGrid, turretSpawnSUArray[i+1] - 2, turretSpawnSUArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSUArray[i+1] - 2, turretSpawnSUArray[i] - 0, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSUArray[i+1] - 3, turretSpawnSUArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSUArray[i+1] - 4, turretSpawnSUArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSUArray[i+1] - 5, turretSpawnSUArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSUArray[i+1] - 6, turretSpawnSUArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSUArray[i+1] - 6, turretSpawnSUArray[i] - 0, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSUArray[i+1] - 6, turretSpawnSUArray[i] + 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSUArray[i+1] - 5, turretSpawnSUArray[i] + 2, LIVE_TURRET_CELL);

        purpleGame.setGridCell(updateGrid, turretSpawnSUArray[i+1] - 2, turretSpawnSUArray[i] + 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSUArray[i+1] - 2, turretSpawnSUArray[i] - 0, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSUArray[i+1] - 3, turretSpawnSUArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSUArray[i+1] - 4, turretSpawnSUArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSUArray[i+1] - 5, turretSpawnSUArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSUArray[i+1] - 6, turretSpawnSUArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSUArray[i+1] - 6, turretSpawnSUArray[i] - 0, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSUArray[i+1] - 6, turretSpawnSUArray[i] + 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSUArray[i+1] - 5, turretSpawnSUArray[i] + 2, LIVE_TURRET_CELL);

    }

    for (var i = 0; i < turretSpawnSDArray.length; i += 2) {
        purpleGame.setGridCell(renderGrid, turretSpawnSDArray[i+1] + 2, turretSpawnSDArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSDArray[i+1] + 2, turretSpawnSDArray[i] + 0, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSDArray[i+1] + 3, turretSpawnSDArray[i] + 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSDArray[i+1] + 4, turretSpawnSDArray[i] + 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSDArray[i+1] + 5, turretSpawnSDArray[i] + 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSDArray[i+1] + 6, turretSpawnSDArray[i] + 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSDArray[i+1] + 6, turretSpawnSDArray[i] + 0, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSDArray[i+1] + 6, turretSpawnSDArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(renderGrid, turretSpawnSDArray[i+1] + 5, turretSpawnSDArray[i] - 2, LIVE_TURRET_CELL);

        purpleGame.setGridCell(updateGrid, turretSpawnSDArray[i+1] + 2, turretSpawnSDArray[i] - 2, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSDArray[i+1] + 2, turretSpawnSDArray[i] + 0, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSDArray[i+1] + 3, turretSpawnSDArray[i] + 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSDArray[i+1] + 4, turretSpawnSDArray[i] + 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSDArray[i+1] + 5, turretSpawnSDArray[i] + 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSDArray[i+1] + 6, turretSpawnSDArray[i] + 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSDArray[i+1] + 6, turretSpawnSDArray[i] + 0, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSDArray[i+1] + 6, turretSpawnSDArray[i] - 1, LIVE_TURRET_CELL);
        purpleGame.setGridCell(updateGrid, turretSpawnSDArray[i+1] + 5, turretSpawnSDArray[i] - 2, LIVE_TURRET_CELL);

    }
}

Game.prototype.startPurpleGame = function () {
    // CLEAR OUT ANY OLD TIMER
    if (timer !== null)
        {
            clearInterval(timer);
        }
    if (turretRenderTimer !== null) 
        {
            clearInterval(turretRenderTimer);
        }

    // PLAY SOUND OF WEAPON SELECTED
    playWeaponSound();

    // START A NEW TIMER
    timer = setInterval(this.stepPurpleGame, frameInterval);

    var purpleGame = this;
    var callMethod = function() {
        purpleGame.hasPlayerLost();
    }

    
    // CHECK IF PLAYER LOST, BY NOT BEATING THE LEVEL WITHIN 5 SECONDS
    waitTillPlayerLoses = setTimeout(function() { callMethod() }, 5000);
};

// EVERY WEAPON HAS A SOUND WHEN SHOT
function playWeaponSound() {
    var audio;
    for(var i = 0; i < placedWeapons.length; i++)
        switch(placedWeapons[i]) {
            case "rocket":
                audio = new Audio("./sounds/weapons/rocket.mp3");
                audio.play();
                audio.volume = 0.2;
                break;
            case "gun":
                audio = new Audio("./sounds/weapons/gun.mp3");
                audio.play();
                audio.volume = 0.3;
                audio.addEventListener("ended", function () {
                    audio = new Audio("./sounds/weapons/gunshell.mp3");
                    audio.play();
                    audio.volume = 0.3;
                });
                break;
        }
}

// PLAYS FIREWORKS FOR WINNING
function playWonSound() {
    if(!isWonPlayed) {
        var audio = new Audio("./sounds/winsound.mp3");
        audio.play();
        audio.volume = 0.25;
        isWonPlayed = true;
    }
}

// AUDIO PLAYS FOR USER INSTRUCTIONS
function playInstructions(instruction) {
    switch(instruction) {
        case "weapon":
            var audio = new Audio("./sounds/instructions/weaponselect.mp3");
            audio.play();
            audio.volume = 0.25;
            break;
        case "direction":
            var audio = new Audio("./sounds/instructions/directionselect.mp3");
            audio.play();
            audio.volume = 0.25;
            break;
        case "placement":
            var audio = new Audio("./sounds/instructions/placementselect.mp3");
            audio.play();
            audio.volume = 0.25;
            break;
    }
}

Game.prototype.pausePurpleGame = function () {
    // TELL JavaScript TO STOP RUNNING THE LOOP
    clearInterval(timer);
    clearInterval(turretRenderTimer);
    
    // AND THIS IS HOW WE'LL KEEP TRACK OF WHETHER
    // THE SIMULATION IS RUNNING OR NOT
    timer = null;
    turretRenderTimer = null;
    
    this.swapGrids();
};

Game.prototype.resetGameOfLife = function () {
    // RESET ALL THE DATA STRUCTURES TOO
    cellLengthX = canvasWidth/cellcountX;
    cellLengthY = canvasHeight/cellcountY;
    gridWidth = canvasWidth/cellLengthX;
    gridHeight = canvasHeight/cellLengthY;
    updateGrid = new Array();
    renderGrid = new Array();
    tempGrid = new Array();
    brightGrid = new Array();
    undoCounter = -1;
    currentLevel = undefined;
    gameWon = false;
    gameLost = false;
    clearTimeout(waitTillPlayerLoses);
    
    // INIT THE CELLS IN THE GRID
    for (var i = 0; i < gridHeight; i++)
        {
            for (var j = 0; j < gridWidth; j++)
                {
                    this.setGridCell(updateGrid, i, j, DEAD_CELL); 
                    this.setGridCell(renderGrid, i, j, DEAD_CELL);
                    this.setGridCell(tempGrid, i, j, DEAD_CELL);
                    this.setGridCell(brightGrid, i, j, DEAD_CELL);
                }
        }

    if(savedCellsCount != 0) {
        for(var i = 0; i < savedPlacementCells.length; i += 2) {
            if(savedPlacementCells[i] == -1)
                i--;
            else {
                var col = savedPlacementCells[i];
                var row = savedPlacementCells[i + 1];
                purpleGame.setGridCell(brightGrid, row, col, PREV_CELL);
            }
        }
        // RESET PREVIOUS PLACED CELLS
        savedPlacementCells.length = 0;
        savedCellsCount = 0;
    }
    // RESET "PLACEDWEAPONS" ARRAY AND "ISWONPLAYED" FOR NEXT ROUND
    placedWeapons.length = 0;
    placedWeaponCount = 0;
    isWonPlayed = false;

    // RENDER THE CLEARED SCREEN
    this.renderGame();
};

Game.prototype.resetLevel = function() {
    var levelToReset = currentLevel;
    this.resetGameOfLife();
    this.pausePurpleGame();
    var temp = placedCount;
    this.loadLevel(levelToReset);
    placedCount = temp;
    this.loadLastPlacedCells();
};

Game.prototype.loadLastPlacedCells = function() {
    for (var i = 0; i < placedCount; i++) {
        var undoArray = allSavedPlacements[i];
        for (var f = 0; f < undoArray.length; f += 2) {
            var col = undoArray[f];
            var row = undoArray[f + 1];
            purpleGame.setGridCell(renderGrid, row, col, LIVE_CELL);
            purpleGame.setGridCell(updateGrid, row, col, LIVE_CELL);
        }
        weaponCount--;
    }
}

Game.prototype.undo = function() {
    if (placedCount != 0) {
        var undoArray = allSavedPlacements[placedCount-1];
        for (var i = 0; i < undoArray.length; i += 2) {
            var col = undoArray[i];
            var row = undoArray[i + 1];
            purpleGame.setGridCell(renderGrid, row, col, PLACEMENT_CELL);
            purpleGame.setGridCell(updateGrid, row, col, PLACEMENT_CELL);
            this.renderGame();
        }
        placedCount--;
        weaponCount++;
    }
}
// HELPER METHODS FOR THE EVENT HANDLERS

/*
 * This function gets the mouse click coordinates relative to
 * the canvas itself, where 0,0 is the top, left corner of
 * the canvas.
 */
Game.prototype.getRelativeCoords = function(event) 
{
    if (event.offsetX !== undefined && event.offsetY !== undefined) 
    { 
        return { x: event.offsetX, y: event.offsetY }; 
    }
    else
    {
        return { x: event.layerX, y: event.layerY };
    }
};

// GRID CELL MANAGEMENT METHODS

/*
 * This function tests to see if (row, col) represents a 
 * valid cell in the grid. If it is a valid cell, true is
 * returned, else false.
 */
Game.prototype.isValidCell = function(row, col)
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
Game.prototype.getGridCell = function(grid, row, col)
{
    // IGNORE IF IT'S OUTSIDE THE GRID
    if (!this.isValidCell(row, col))
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
Game.prototype.setGridCell = function(grid, row, col, value)
{
    // IGNORE IF IT'S OUTSIDE THE GRID
    if (!this.isValidCell(row, col))
        {
            return;
        }
    var index = (row * gridWidth) + col;
    grid[index] = value;
}

/*
 * A cell's type determines which adjacent cells need to be tested
 * during each frame of the simulation. This method tests the cell
 * at (row, col), and returns the constant representing which of
 * the 9 different types of cells it is.
 */
Game.prototype.determineCellType = function(row, col)
{
    if ((row === 0) && (col === 0))                                 return TOP_LEFT;
    else if ((row === 0) && (col === (gridWidth-1)))                return TOP_RIGHT;
    else if ((row === (gridHeight-1)) && (col === 0))               return BOTTOM_LEFT;
    else if ((row === (gridHeight-1)) && (col === (gridHeight-1)))  return BOTTOM_RIGHT;
    else if (row === 0)                                             return TOP;
    else if (col === 0)                                             return LEFT;
    else if (row === (gridHeight-1))                                return RIGHT;
    else if (col === (gridWidth-1))                                 return BOTTOM;
    else                                                            return CENTER;
}

/*
 * This method counts the living cells adjacent to the cell at
 * (row, col). This count is returned.
 */
Game.prototype.calcLivingNeighbors = function(row, col)
{
    var numLivingNeighbors = 0;
    
    // DEPENDING ON THE TYPE OF CELL IT IS WE'LL CHECK
    // DIFFERENT ADJACENT CELLS
    var cellType = this.determineCellType(row, col);
    var cellsToCheck = cellLookup[cellType];
    for (var counter = 0; counter < (cellsToCheck.numNeighbors * 2); counter+=2)
        {
            var neighborCol = col + cellsToCheck.cellValues[counter];
            var neighborRow = row + cellsToCheck.cellValues[counter+1];
            var index = (neighborRow * gridWidth) + neighborCol;
            var neighborValue;
            if (updateGrid[index] !== VOID_CELL && updateGrid[index] !== TURRET_CELL && updateGrid[index] !== TURRET_SPAWN_CELL) {
            	if (updateGrid[index] === 5) {
            		neighborValue = 1;
            	}  else if (updateGrid[index] === 6) {
            		neighborValue = 0;
            	}  else if (updateGrid[index] === 8) {
                    neighborValue = 0;
                }  else if (updateGrid[index] === 9) {
                    neighborValue = 0;
                } else if (updateGrid[index] === 10) {
                    neighborValue = 1;
                }  else {
                	neighborValue = updateGrid[index];
            	}
            } else {
                neighborValue = 0;
            }
            numLivingNeighbors += neighborValue;
        }
    return numLivingNeighbors;
}

Game.prototype.calcLivingNeighborsTurret = function(row, col)
{
    var numLivingNeighbors = 0;
    
    // DEPENDING ON THE TYPE OF CELL IT IS WE'LL CHECK
    // DIFFERENT ADJACENT CELLS
    var cellType = this.determineCellType(row, col);
    var cellsToCheck = cellLookup[cellType];
    for (var counter = 0; counter < (cellsToCheck.numNeighbors * 2); counter+=2)
        {
            var neighborCol = col + cellsToCheck.cellValues[counter];
            var neighborRow = row + cellsToCheck.cellValues[counter+1];
            var index = (neighborRow * gridWidth) + neighborCol;
            var neighborValue;
            if (updateGrid[index] !== VOID_CELL && updateGrid[index] !== TURRET_CELL && updateGrid[index] !== TURRET_SPAWN_CELL) {
                if (updateGrid[index] === 5) {
                    neighborValue = 1;
                }  else if (updateGrid[index] === 6) {
                    neighborValue = 0;
                }  else if (updateGrid[index] === 8) {
                    neighborValue = 0;
                }  else if (updateGrid[index] === 9) {
                    neighborValue = 0;
                } else if (updateGrid[index] === 10) {
                    neighborValue = 1;
                }  else if (updateGrid[index] === 1) {
                    neighborValue = -10;
                }  else {
                    neighborValue = updateGrid[index];
                }
            } else {
                neighborValue = 0;
            }
            numLivingNeighbors += neighborValue;
        }
    return numLivingNeighbors;
}

/*
 * We need one grid's cells to determine the grid's values for
 * the next frame. So, we update the render grid based on the contents
 * of the update grid, and then, after rending, we swap them, so that
 * the next frame we'll be progressing the game properly.
 */
Game.prototype.swapGrids = function() {
    var temp = updateGrid;
    updateGrid = renderGrid;
    renderGrid = temp;
};

Game.prototype.getWeaponCount = function() {
	return weaponCount;
};

Game.prototype.setWeaponCount = function(count) {
	weaponCount = count;
};

Game.prototype.getWeaponSelect = function() {
    if(weapon.indexOf('_') == -1) {
        // weapon = weapon.substring(0, weapon.indexOf('.'));
        // weapon = weapon.substring(0,1).toUpperCase() + weapon.substring(1);
        return weapon.substring(0, weapon.indexOf('.'));
    }
    // weapon = weapon.substring(0, weapon.indexOf('_'));
    // weapon = weapon.substring(0,1).toUpperCase() + weapon.substring(1);
    return weapon.substring(0, weapon.indexOf('_'));
}

Game.prototype.getWeaponDirection = function() {
    if(weapon.indexOf('_') == -1) {
        return "";
    }
    return direction.substring(1);
}

Game.prototype.hasPlayerLost = function() {
    if (!gameWon) gameLost = true;
}

Game.prototype.resizeCanvas = function() {
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    if (currentLevel != null)
        this.resetLevel();
}