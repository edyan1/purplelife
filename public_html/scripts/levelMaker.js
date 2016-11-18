'use strict';

// CANVAS VARIABLES
var canvasWidth;
var canvasHeight;
var canvas;
var canvas2D;
var mouseState;

// Initializes Purple Life
function PurpleLifeLM() {
  //this.checkSetup();

  // Shortcuts to DOM Elements.
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');

  // Saves message on form submit.
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  this.initFirebase();

  //this.initCanvas();
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

    // We load currently existing chant messages.
    //this.loadMessages();
 } else { // User is signed out!
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
    
    // NOTE THAT THESE DIMENSIONS SHOULD BE THE
    // SAME AS SPECIFIED IN THE WEB PAGE, WHERE
    // THE CANVAS IS SIZED
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    
    mouseState = false;



    //@TODO ADD CHECK FOR COOKIES REGARDING SPLASH SCREEN
    this.initGridScreen();
    this.initWall();
    this.initObstacles();
    this.initObjectives();
}

PurpleLifeLM.prototype.initGridScreen = function() {
    var gridScreen = new Image();
    gridScreen.src = "images/emptyGrid.png";
    gridScreen.onload = function () {
       canvas2D.drawImage(this, 0, 0, canvasWidth, canvasHeight*0.9);
    }
}

PurpleLifeLM.prototype.initWall = function() {
  $('#wallMenu').fanmenu({
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
}

PurpleLifeLM.prototype.initObstacles = function() {
  $('#obstacleMenu').fanmenu({
    eventName:'click',
    hideOnClick: true,
    hideOnClickExcept: 'fm_antihide',
    initAngle: -90,
    angleDisplay: 180,
    radius: 100,
    clActive:'fm_active',
    clDeactive:'fm_off',
    clToggleEffect:'fm_rotate',
    cssMenuToggle: '.fm_btntoggle',
    cssMenuItem: '.fm_list>*'
  });
}

PurpleLifeLM.prototype.initObjectives = function() {
  $('#objectiveMenu').fanmenu({
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

window.onload = function() {
  window.purpleLifeLM = new PurpleLifeLM();
};