// CONSTANTS

// CELLS
var DEAD_CELL;
var LIVE_CELL;
var HOVER_CELL;
var NEW_CELL;
var VOID_CELL;
var OBJ_CELL;
var PLACEMENT_CELL;
var TELEPORT_CELL;
var SPLITTER_CELL;

// COLORS
var LIVE_COLOR;
var HOVER_COLOR;
var BRIGHT_COLOR;
var BACKGROUND_COLOR;
var WALL_COLOR;
var OBJ_COLOR;
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
var cellLength;

// PATTERN PIXELS
var patterns;
var levels;
var cellLookup;
var imgDir;
var levelDir;

//Level Stuff
var currentLevel;
var weaponCount;
var undoArray;
var undoCounter;
var gameWon;

// INITIALIZATION METHODS

/*
 * This method initializes the Game of Life, setting it up with
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
    // THESE REPRESENT THE TWO POSSIBLE STATES FOR EACH CELL
    DEAD_CELL = 0;   
    LIVE_CELL = 1; 
    HOVER_CELL = 2;
    NEW_CELL = 3;
    VOID_CELL = 4;
    OBJ_CELL = 5;
    PLACEMENT_CELL = 6;
    
    // COLORS FOR RENDERING
    LIVE_COLOR = "rgb(255, 0, 0)";
    HOVER_COLOR = "rgba(255, 0, 0, 0.2)";
    BRIGHT_COLOR = "rgb(227, 11, 92)";
    BACKGROUND_COLOR = "rgb(118,143,165)";
    WALL_COLOR = "rgb(128,128,128)";
    OBJ_COLOR = "rgb(128, 0, 128)";
    PLACEMENT_COLOR = "rgb(232,232,232)";
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
    fps = MAX_FPS;
    frameInterval = MILLISECONDS_IN_ONE_SECOND/fps;

    // INIT THE CELL LENGTH
    cellLength = MIN_CELL_LENGTH;

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
    imgDir = "/images/weapons/";
    
    // THIS WILL STORE ALL THE PATTERNS IN AN ASSOCIATIVE ARRAY
    patterns = new Array();

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
    levelDir = "/images/levels/";
    
    // THIS WILL STORE ALL THE PATTERNS IN AN ASSOCIATIVE ARRAY
    levels = new Array();

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
        pixelArray[3] = levelItems[i].value;
            
        // AND PUT THE DATA IN THE ASSIATIVE ARRAY,
        // BY KEY
        levels[key] = pixelArray;
    }
    
};

Game.prototype.loadLevel = function (levelToLoad) {
    // LOAD THE COORDINATES OF THE PIXELS TO DRAW
    currentLevel = levelToLoad;
    var level = levels[levelToLoad];
    var walls = level[0];
    var objectives = level[1];
    var placements = level[2];
    weaponCount = level[3];
    
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
        
    // RENDER THE GAME IMMEDIATELY
    this.renderGameWithoutSwapping();
}

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

Game.prototype.initEventHandlers = function () {
  canvas.onmousedown = this.setMouseDown;
  canvas.onmouseup = this.setMouseUp;
};

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
                    if ((r == 128) && (g == 128) && (b == 128)) {
                    	// STORE THE COORDINATES OF OUR PIXELS
                    	voidArray[voidArrayCounter] = x;
                    	voidArray[voidArrayCounter+1] = y;
                    	voidArrayCounter += 2;
                    }

                    // IF OBJECTIVE (PURPLE)
                    else if ((r == 128) && (g == 0) && (b == 128)) {
                    	objArray[objArrayCounter] = x;
                    	objArray[objArrayCounter+1] = y;
                    	objArrayCounter += 2;
                    }

                    // IF PLACEMENT CELL (LIGHT GRAY)
                    else if ((r == 232) && (g == 232) && (b == 232)) {
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

Game.prototype.setMouseDown = function () {
    mouseState = true;
};

Game.prototype.setMouseUp = function () {
    mouseState = false;
};



Game.prototype.realMouseClick = function(event, purpleGame) {

	if (purpleGame.getWeaponCount() != 0) {
	    // GET THE PATTERN SELECTED IN THE DROP DOWN LIST
	    var patternsList = document.getElementById("weaponsList");
	    var patternItems = patternsList.getElementsByTagName("li");
	    var selectedPattern = patternItems[0].id;
	    
	    // LOAD THE COORDINATES OF THE PIXELS TO DRAW
	    var pixels = patterns[selectedPattern];
	    
	    // CALCULATE THE ROW,COL OF THE CLICK
	    var canvasCoords = purpleGame.getRelativeCoords(event);
	    var clickCol = Math.floor(canvasCoords.x/cellLength);
	    var clickRow = Math.floor(canvasCoords.y/cellLength);
	    
	    // GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID
	    for (var i = 0; i < pixels.length; i += 2)
	        {
	            var col = clickCol + pixels[i];
	            var row = clickRow + pixels[i+1];
	            var index = (row * gridWidth) + col;
	            var cell = purpleGame.getGridCell(renderGrid, row, col);
	            if (cell === PLACEMENT_CELL) {
	            	purpleGame.setGridCell(renderGrid, row, col, LIVE_CELL);
	            	purpleGame.setGridCell(updateGrid, row, col, LIVE_CELL);
	            	purpleGame.setGridCell(brightGrid, row, col, NEW_CELL);
	        	}
	        	
	        }
	        
	    // RENDER THE GAME IMMEDIATELY
	    purpleGame.renderGameWithoutSwapping();
	    purpleGame.setWeaponCount(purpleGame.getWeaponCount()-1);
	}
};

Game.prototype.respondToMouseMove = function (event, purpleGame) {
    // GET THE PATTERN SELECTED IN THE DROP DOWN LIST
    var patternsList = document.getElementById("weaponsList");
    var patternItems = patternsList.getElementsByTagName("li");
    var selectedPattern = patternItems[0].id;
    
    // LOAD THE COORDINATES OF THE PIXELS TO DRAW
    var pixels = patterns[selectedPattern];
    
    // CALCULATE THE ROW,COL OF THE CLICK
    var canvasCoords = purpleGame.getRelativeCoords(event);
    var clickCol = Math.floor(canvasCoords.x/cellLength);
    var clickRow = Math.floor(canvasCoords.y/cellLength);
    
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
    if (cellLength >= GRID_LINE_LENGTH_RENDERING_THRESHOLD)
        this.renderGridLines();
    
    // RENDER THE GAME CELLS
    this.renderCells();

    // AND RENDER THE TEXT
    if (gameWon) {
        this.renderText();
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
    if (cellLength >= GRID_LINE_LENGTH_RENDERING_THRESHOLD)
        this.renderGridLines();
    
    // RENDER THE GAME CELLS
    this.renderCells();
    
    // AND RENDER THE TEXT
    if (gameWon) {
    	this.renderText();
	}
}

Game.prototype.renderPlacementCells = function() {
	var level = levels[currentLevel];
	var placements = level[2];
	for (var i = 0; i < placements.length; i+=2) {
		var col = placements[i];
        var row = placements[i+1];
	    var x = col * cellLength;
	    var y = row * cellLength;
	    canvas2D.fillStyle = PLACEMENT_COLOR;
	    canvas2D.fillRect(x, y, cellLength, cellLength);
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
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillRect(x, y, cellLength, cellLength);
                       }
                    else if (cell === VOID_CELL)
                       {
                           canvas2D.fillStyle = WALL_COLOR;
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillRect(x, y, cellLength, cellLength); 
                       } 
                    else if (cell === OBJ_CELL) {
                    	   objCellCount++;
                       	   canvas2D.fillStyle = OBJ_COLOR;
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillRect(x, y, cellLength, cellLength);
                       }
                    if (cell2 === HOVER_CELL) {
                           canvas2D.fillStyle = HOVER_COLOR;
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillRect(x, y, cellLength, cellLength);
                    }
                    
                    if (cell3 === NEW_CELL) {
                           canvas2D.fillStyle = BRIGHT_COLOR;
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillRect(x, y, cellLength, cellLength);
                    }
               }
        } 
    if (objCellCount == 0 && currentLevel != undefined) {
    	gameWon = true;
    }  
};

/*
 * Renders the text on top of the grid.
 */
Game.prototype.renderText = function() {
    // SET THE PROPER COLOR
    canvas2D.fillStyle = TEXT_COLOR;
    
    // RENDER THE TEXT
    canvas2D.textAlign="center"; 
    canvas2D.fillText("You Won!", canvasWidth/2, canvasHeight/2);
}

Game.prototype.stepPurpleGame = function() {
	//REMOVE BRIGHT ARRAY
    brightGrid = new Array();
    
    // FIRST PERFORM GAME LOGIC
    purpleGame.updateGame();
    
    // RENDER THE GAME
    purpleGame.renderGame();
};

Game.prototype.startPurpleGame = function () {
    // CLEAR OUT ANY OLD TIMER
    if (timer !== null)
        {
            clearInterval(timer);
        }
        
    // START A NEW TIMER
    timer = setInterval(this.stepPurpleGame, frameInterval);
};

Game.prototype.resetGameOfLife = function () {
    // RESET ALL THE DATA STRUCTURES TOO
    gridWidth = canvasWidth/cellLength;
    gridHeight = canvasHeight/cellLength;
    updateGrid = new Array();
    renderGrid = new Array();
    tempGrid = new Array();
    brightGrid = new Array();
    undoArray = new Array();
    undoCounter = -1;
    currentLevel = undefined;
    gameWon = false;
    
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

    // RENDER THE CLEARED SCREEN
    this.renderGame();
};

Game.prototype.resetLevel = function() {
  var levelToReset = currentLevel;
  this.resetGameOfLife();
  this.pausePurpleGame();
  this.loadLevel(levelToReset);
};

Game.prototype.pausePurpleGame = function () {
    // TELL JavaScript TO STOP RUNNING THE LOOP
    clearInterval(timer);
    
    // AND THIS IS HOW WE'LL KEEP TRACK OF WHETHER
    // THE SIMULATION IS RUNNING OR NOT
    timer = null;
    
    this.swapGrids();
};

Game.prototype.renderGridLines = function () {
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
                    if (testCell != VOID_CELL) {
                        if (testCell === LIVE_CELL || testCell === OBJ_CELL)
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
                                    	} else {
                                    		renderGrid[index] = OBJ_CELL;
                                    	}
                                    }
                            }
                        // 2) IT'S DEAD
                       else if (numLivingNeighbors === 3)
                           {
                               renderGrid[index] = LIVE_CELL;
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
            if (updateGrid[index] !== VOID_CELL) {
            	if (updateGrid[index] === 5) {
            		neighborValue = 1;
            	}  else if (updateGrid[index] === 6) {
            		neighborValue = 0;
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

Game.prototype.getWeaponCount = function() {
	return weaponCount;
};

Game.prototype.setWeaponCount = function(count) {
	weaponCount = count;
};