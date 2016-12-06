'use strict';

//KEYS
var currentlyPressedKeys = {};

// CANVAS VARIABLES
var canvasWidth;
var canvasHeight;
var canvas;
var canvas2D;
var canvasScaleX;
var canvasScaleY;
var userSignedIn;

//GAME VARIABLE
var purpleGame;

//Toolbar
var toolbar;

//Scene Manager
var sceneManager;

//Weapon Manager
var weapon;
var direction;


// Initializes Purple Life
function PurpleLife() {
  //this.checkSetup();

  // Shortcuts to DOM Elements.
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.levelSelect = document.getElementById('ls-section');
  this.toolbar = document.getElementById('toolbar');

  // Saves message on form submit.
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  canvasScaleX = .672;
  canvasScaleY = .75;

  this.initFirebase();

  this.initCanvas();

  this.initGame();

  //Initialize the Scene Manager
  sceneManager = new SceneManager(Scenes.SPLASH);
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
PurpleLife.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Signs-in with google
PurpleLife.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out 
PurpleLife.prototype.signOut = function() {
  // Sign out of Firebase.
  var r = confirm(
    "Are you sure you want to sign out?\n\Signing out will delete any unsaved progress and take you back to the main screen.");
  if (r === true) {
      this.auth.signOut();
      location.reload();
  } else {
      
  }
  
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
PurpleLife.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;
    userSignedIn = true;
    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    // We load currently existing chant messages.
    //this.loadMessages();
    
    //document.getElementById("game_canvas").style.visibility = 'hidden';
    sceneManager.changeScene(Scenes.LEVELSELECT);
    customLevelSelect();
    levelSelectAccess();
    
 } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');
    userSignedIn = false;
    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

PurpleLife.prototype.initCanvas = function() {
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

    //@TODO ADD CHECK FOR COOKIES REGARDING SPLASH SCREEN
    this.initWeapons();
    this.initDirections();

    canvas.onclick = respondToMouseClick;
    canvas.onmousemove = respondToMouseMove;

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    //SET ALL KEYS WE'RE GONNA USE
    currentlyPressedKeys[70] = false;
    currentlyPressedKeys[82] = false;
};

PurpleLife.prototype.resizeCanvas = function() {
    canvas.width = Math.round(window.innerWidth * canvasScaleX);
    canvas.height = Math.round(window.innerHeight * canvasScaleY);
    document.getElementById("container").style.height = canvas.height + "px";
    document.getElementById("toolbar").style.width = canvas.width + "px";
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    if (sceneManager != undefined) {
      if (sceneManager.getCurrentScene() == Scenes.GAME)
        purpleGame.resizeCanvas();
      else if (sceneManager.getCurrentScene() == Scenes.SPLASH)
        sceneManager.changeScene(Scenes.SPLASH);
    }
}

function respondToMouseClick (event) {
  purpleGame.realMouseClick(event, purpleGame);
};

function respondToMouseMove (event) {
  if (sceneManager.currentScene == Scenes.GAME) {
    purpleGame.respondToMouseMove(event, purpleGame);
  }
};

PurpleLife.prototype.initGame = function() {
	purpleGame = new Game(canvas, canvas2D, canvasWidth, canvasHeight, mouseState);
}

PurpleLife.prototype.initWeapons = function() {
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

PurpleLife.prototype.initDirections = function() {
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
})

// GRABS THE WEAPON SELECTED AND LOADS IT ON THE CANVAS
$(document).ready(function() {
    $('#weaponSelect li').click(function() {
        if(level1)
            playInstructions("direction");
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
            level1 = false;
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



function showHelpNotes (){
    
    setTimeout(function () {$("#weaponMenu").notify("Click here to select your weapon.", "info"); }, 500);
    setTimeout(function () {$("#directionMenu").notify("Click here to change the direction it will point.","info");},3000);
    setTimeout(function () {$(".playBtn").notify("Once you have placed your weapons, click Play to start the attack!","info");},8000);
    setTimeout(function () {$(".resetBtn").notify("Or click Reset to clear your placed weapons to place them again.","info");},13000);
    setTimeout(function () {$(".quitBtn").notify("Quit brings you back to the level select screen.","info");},18000);
};

function handleKeyDown(event) {
  currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
  currentlyPressedKeys[event.keyCode] = false;
}

window.onload = function() {
  window.purpleLife = new PurpleLife();
};