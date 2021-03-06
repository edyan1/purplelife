'use strict';
//DISPLAY (LOCAL OR MARKET)
var display;

//KEYS
var currentlyPressedKeys = {};

// CANVAS VARIABLES
var canvasWidth;
var canvasHeight;
var canvas;
var canvas2D;
var canvasScaleX;
var canvasScaleY;
var defaultFontSize;
var userSignedIn;
var mouseState;

//GAME VARIABLE
var purpleGameLM;

//Toolbar
var toolbar;

//Weapon Manager
var weapon;
var direction;

var searchButton;
// Initializes Purple Life
function PurpleLifeLM() {
  //this.checkSetup();

  // Shortcuts to DOM Elements.
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');

  searchButton = document.getElementsByClassName('search-button')[0];
  searchButton.onclick = function(event) {
    updateListWithSearchTerm(document.getElementById("search").value);
    return false;
  }

  $('#searchBar').submit(function () {
    return false;
  });

  // Saves message on form submit.
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  canvasScaleX = .672;
  canvasScaleY = .75;
  defaultFontSize = 40;

  this.initFirebase();

  this.initCanvas();
  this.initGame();
  
  //Initialize the Scene Manager
  initSceneManager(Scenes.LEVELMAKER, purpleGameLM);
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
PurpleLifeLM.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Signs-in with google
PurpleLifeLM.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out 
PurpleLifeLM.prototype.signOut = function() {
  // Sign out of Firebase.
   var r = confirm(
    "Are you sure you want to sign out?\n\Signing out will delete any unsaved progress and take you back to the main screen.");
  if (r === true) {
      this.auth.signOut();
      location.href = "index.html";
  } else {
      
  }
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
PurpleLifeLM.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');
    
    //generate level maker menu
    customLevelSelect();
    levelMarketPopulate();
    display = "local";
 
 } else { // User is signed out!
    //redirect to error
    alert("For logged in users only!");
    window.location.href = "index.html";
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

PurpleLifeLM.prototype.initCanvas = function() {
    // GET THE CANVAS
    canvas = document.getElementById("game_canvas");

    // GET THE 2D RENDERING CONTEXT
    canvas2D = canvas.getContext("2d");
    
    // INIT THE FONT FOR TEXT RENDERED ON THE CANVAS. NOTE
    // THAT WE'LL BE RENDERING THE FRAME RATE AND ZOOM LEVEL
    // ON THE CANVAS
    canvas2D.font = "24px Arial";
    
    window.addEventListener('resize', this.resizeCanvas, false);
    this.resizeCanvas();
    
    // NOTE THAT THESE DIMENSIONS SHOULD BE THE
    // SAME AS SPECIFIED IN THE WEB PAGE, WHERE
    // THE CANVAS IS SIZED
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    
    mouseState = false;

    this.initWeapons();
    this.initDirections();
    
    canvas.onclick = respondToMouseClick;
    canvas.onmousemove = respondToMouseMove;

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
    //SET ALL KEYS WE'RE GONNA USE
    currentlyPressedKeys[70] = false;
    currentlyPressedKeys[81] = false;
    currentlyPressedKeys[82] = false;
};

PurpleLifeLM.prototype.resizeCanvas = function() {
    canvas.width = Math.round(window.innerWidth * canvasScaleX);
    canvas.height = Math.round(window.innerHeight * canvasScaleY);
    document.getElementById("container").style.height = canvas.height + "px";
    document.getElementById("toolbar").style.width = canvas.width + "px";
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    var hyp = Math.sqrt(canvasScaleX * canvasScaleX, canvasScaleY * canvasScaleY);
    canvas2D.font = defaultFontSize * hyp + "px Arial";

      if (getCurrentScene() == Scenes.GAME)
        purpleGameLM.resizeCanvas();
      else if (getCurrentScene() == Scenes.SPLASH)
        changeScene(Scenes.SPLASH);
};

function respondToMouseClick (event) {
  purpleGameLM.realMouseClick(event, purpleGameLM);
};

function respondToMouseMove (event) {
  if (currentScene == Scenes.GAME) {
    purpleGameLM.respondToMouseMove(event, purpleGameLM);
  }
};

PurpleLifeLM.prototype.initGame = function() {
	purpleGameLM = new customGame(canvas, canvas2D, canvasWidth, canvasHeight, mouseState);
};

PurpleLifeLM.prototype.initWeapons = function() {
  $('#weaponMenu').fanmenu({
    eventName:'click',
    hideOnClick: true,
    hideOnClickExcept: 'fm_antihide',
    initAngle: 0,
    angleDisplay: 90,
    radius: 100,
    clActive:'fm_active',
    clDeactive:'fm_off',
    clToggleEffect:'fm_rotate',
    cssMenuToggle: '.fm_btntoggle',
    cssMenuItem: '.fm_list>*'
  });
};

PurpleLifeLM.prototype.initDirections = function() {
  $('#directionMenu').fanmenu({
    eventName:'click',
    hideOnClick: true,
    hideOnClickExcept: 'fm_antihide',
    initAngle: -90,
    angleDisplay: 90,
    radius: 100,
    clActive:'fm_active',
    clDeactive:'fm_off',
    clToggleEffect:'fm_rotate',
    cssMenuToggle: '.fm_btntoggle',
    cssMenuItem: '.fm_list>*'
  });
};

$(document).ready(function() {
    weapon = $(this).find('.weaponSize').attr('src');
    weapon = weapon.substring(15);
});

// GRABS THE WEAPON SELECTED AND LOADS IT ON THE CANVAS
$(document).ready(function() {
    $('#weaponSelect li').click(function() {
    
        weapon = $(this).find('.weaponSize').attr('src');
        weapon = weapon.substring(15);
        $.notify("Your Selected Weapon: " + weapon.substring(0, weapon.indexOf('.')), 'success');
        $('#weaponsList li:first').prop('id', weapon);
        // CHANGE DIRECTIONS TO DIAGONALS WHEN GUN WEAPON IS SELECTED
        if(weapon.localeCompare("gun.png") == 0) {
            $('#leftdir').attr('src', 'icons/downleft.png');
            $('#leftdir').css("transform", "rotate(-50deg)")
            $('#rightdir').attr('src', 'icons/downright.png');
            $('#rightdir').css("transform", "rotate(10deg)");
            $('#downdir').attr('src', 'icons/upleft.png');
            $('#downdir').css("transform", "rotate(100deg)");
            $('#updir').attr('src', 'icons/upright.png');
            $('#updir').css("transform", "rotate(-50deg)");
        }
        // CHANGE DIRECTIONS TO NORMAL WHEN OTHER WEAPONS ARE SELECTED
        else {
            $('#leftdir').attr('src', 'icons/left.png');
            $('#leftdir').css("transform", "rotate(182deg)")
            $('#rightdir').attr('src', 'icons/right.png');
            $('#rightdir').css("transform", "rotate(-118deg)");
            $('#downdir').attr('src', 'icons/down.png');
            $('#downdir').css("transform", "rotate(-119deg)");
            $('#updir').attr('src', 'icons/up.png');
            $('#updir').css("transform", "rotate(-90deg)");
        }
    });
});

// GRABS THE DIRECTIONS SELECTED, CONCATENATES IT TO THE WEAPON SELECTED, THEN LOADS THE WEAPON
$(document).ready(function() {
    $('#weaponDirection li').click(function() {
        if(level1) {
            playInstructions("placement");
        }
        weapon = weapon.substring(0, weapon.indexOf('.')) + '_';
        direction = $(this).find('.weaponDir').attr('src');
        $.notify("Your Selected Direction: " + direction.substring(6, direction.indexOf('.')), 'success');
        direction = '_' + direction.substring(6, direction.indexOf('.'));
        weapon = weapon.substring(0, weapon.indexOf('_')) + direction + '.png';
        $('#weaponsList li:first').prop('id', weapon);
    });
});

function handleKeyDown(event) {
  currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
  currentlyPressedKeys[event.keyCode] = false;
}

function loadLocalLevels() {
 
    //hide market div and show local div
    document.getElementById('level_market_menu').setAttribute('hidden', 'true');
    document.getElementById('level_maker_menu').removeAttribute('hidden');
    display = "local";
}

function loadMarketLevels() {

    //show market div and hide local div
    document.getElementById('level_maker_menu').setAttribute('hidden', 'true');
    document.getElementById('level_market_menu').removeAttribute('hidden');
    display = "market";
}

window.onload = function() {
  window.purpleLifeLM = new PurpleLifeLM();
  
};

function updateListWithSearchTerm(userSearchString) {
  var searchString = userSearchString.toUpperCase();
  
  var customContainer = document.getElementById("level_market_menu");
  var customContainerLocal = document.getElementById("level_maker_menu");
  var children = customContainer.children;
  var childrenLocal = customContainerLocal.children;

  for (var i = 0; i < children.length; i++) {
    var childTitle = children[i].getElementsByClassName("title")[0];
    var childAlias = children[i].getElementsByClassName("alias")[0];
    
    if (!$(childTitle).text().toUpperCase().includes(searchString) && !$(childAlias).text().toUpperCase().includes(searchString)) {
      children[i].style.display = "none";
    } else {
      children[i].style.display = "";
    }
  }

  for (var i = 0; i < childrenLocal.length; i++) {
    var childTitle = childrenLocal[i].getElementsByClassName("title")[0];
    var childAlias = childrenLocal[i].getElementsByClassName("alias")[0];
    
    if (!$(childTitle).text().toUpperCase().includes(searchString) && !$(childAlias).text().toUpperCase().includes(searchString)) {
      childrenLocal[i].style.display = "none";
    } else {
      childrenLocal[i].style.display = "";
    }
  }
}
