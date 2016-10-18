'use strict';

// Initializes Purple Life
function PurpleLife() {
  //this.checkSetup();

  // Shortcuts to DOM Elements.
 // this.messageList = document.getElementById('messages');
 // this.messageForm = document.getElementById('message-form');
 // this.messageInput = document.getElementById('message');
 // this.submitButton = document.getElementById('submit');
 // this.submitImageButton = document.getElementById('submitImage');
 // this.imageForm = document.getElementById('image-form');
 // this.mediaCapture = document.getElementById('mediaCapture');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
 // this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // Saves message on form submit.
 // this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Toggle for the button.
 // var buttonTogglingHandler = this.toggleButton.bind(this);
 // this.messageInput.addEventListener('keyup', buttonTogglingHandler);
 // this.messageInput.addEventListener('change', buttonTogglingHandler);

  // Events for image upload.
 // this.submitImageButton.addEventListener('click', function() {
 //   this.mediaCapture.click();
 // }.bind(this));
 // this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));

  this.initFirebase();
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
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
PurpleLife.prototype.onAuthStateChanged = function(user) {
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



window.onload = function() {
  window.purpleLife = new PurpleLife();
};