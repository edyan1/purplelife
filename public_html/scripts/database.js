/* 
 *Javascript file for database
 */

var secret;
var dbRef = firebase.database().ref('users/');
function store(){
    var secretU = document.getElementById("secret").value;
    writeUserData(secretU);
    //document.getElementById("showSecret").value = secretU;
}

function storeMap(img){
    
    writeUserData(img);
    //document.getElementById("showSecret").value = secretU;
}

function writeUserData(data) {
    
    dbRef.set({
        "maps" : data
    });
}


function loadUserMap () {
  
    dbRef.once('value').then(function(snapshot) {
        var thumbnail = document.getElementById("thumbnail");
        thumbnail.setAttribute("src",snapshot.val().maps);
        thumbnail.setAttribute("width", "64px");
        thumbnail.setAttribute("height","33px");
     
    });
    
}