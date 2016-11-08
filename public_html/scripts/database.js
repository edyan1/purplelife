/* 
 *Javascript file for database
 */

var secret;
function store(){
    var secretU = document.getElementById("secret").value;
    writeUserData(secretU);
    //document.getElementById("showSecret").value = secretU;
}

function writeUserData(userSecret) {
    
    firebase.database().ref('users/').set({
    secret: userSecret
    });
}

var secretRef = firebase.database().ref('users/');
secretRef.on('value', function(snapshot) {
  
  document.getElementById("showSecret").value = snapshot.val().secret;
});