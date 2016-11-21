/* 
 *Javascript file for database
 */

//Stores user progress as the level number 
function setUserProgress(levelNum){
    
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId);
    dbRef.update({
        "progress" : levelNum
    });
}

function getUserProgress (){
    var userProgress;
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId);
    dbRef.on('value', function(snapshot) {
        userProgress = snapshot.val().progress;
    });
    return userProgress;
    
}

//saves custom map to datastore based on slot selected
//each user has 5 slots in which to save custom maps to
function storeMap(slot, img){
    
    if (slot === "1") writeUserData1(img);
    if (slot === "2") writeUserData2(img);
    if (slot === "3") writeUserData3(img);
    if (slot === "4") writeUserData4(img);
    if (slot === "5") writeUserData5(img);
    
}

//save map to slot 1
function writeUserData1(data) {
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId+'/maps/');
    dbRef.update({
        "map1" : data
    });
}

//save map to slot 2
function writeUserData2(data) {
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId+'/maps/');
    dbRef.update({
        "map2" : data
    });
}

//save map to slot 3
function writeUserData3(data) {
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId+'/maps/');
    dbRef.update({
        "map3" : data
    });
}

//save map to slot 4
function writeUserData4(data) {
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId+'/maps/');
    dbRef.update({
        "map4" : data
    });
}

//save map to slot 5
function writeUserData5(data) {
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId+'/maps/');
    dbRef.update({
        "map5" : data
    });
}

//populate custom maps screen in level select with user created maps
function loadUserMap (slot) {
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId+'/maps/');
    dbRef.once('value').then(function(snapshot) {
        var thumbnail = document.getElementById("thumbnail");
        if (slot === "1") thumbnail.setAttribute("src",snapshot.val().map1);
        if (slot === "2") thumbnail.setAttribute("src",snapshot.val().map2);
        if (slot === "3") thumbnail.setAttribute("src",snapshot.val().map3);
        if (slot === "4") thumbnail.setAttribute("src",snapshot.val().map4);
        if (slot === "5") thumbnail.setAttribute("src",snapshot.val().map5);
        thumbnail.setAttribute("width", "64px");
        thumbnail.setAttribute("height","33px");
     
    });
    
}

//load map in user selected slot (in level editor)
function customLevelSelect (){
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId+'/maps/');
    dbRef.on('value', function(snapshot) {
        var slot1 = document.getElementById("slot1");
        if (snapshot.val().map1 !== undefined) slot1.setAttribute("src",snapshot.val().map1);
    });
    
    dbRef.on('value', function(snapshot) {
        var slot2 = document.getElementById("slot2");
        if (snapshot.val().map2 !== undefined) slot2.setAttribute("src",snapshot.val().map2);
    });
    
    dbRef.on('value', function(snapshot) {
        var slot3 = document.getElementById("slot3");
        if (snapshot.val().map3 !== undefined) slot3.setAttribute("src",snapshot.val().map3);
    });
    
    dbRef.on('value', function(snapshot) {
        var slot4 = document.getElementById("slot4");
        if (snapshot.val().map4 !== undefined) slot4.setAttribute("src",snapshot.val().map4);
    });
    
    dbRef.on('value', function(snapshot) {
        var slot5 = document.getElementById("slot5");
        if (snapshot.val().map5 !== undefined) slot5.setAttribute("src",snapshot.val().map5);
    });
}