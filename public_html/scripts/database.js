/* 
 *Javascript file for database
 */

var userProgress = 0;

//Stores user progress as the level number 
function setUserProgress(levelNum){
    
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId);
 
    dbRef.update({
        "progress" : levelNum
    });
}

//retrieve user progress
function getUserProgress (){
    
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId);
    dbRef.on('value', function(snapshot) {
        if (snapshot.val().progress!==undefined) userProgress = snapshot.val().progress;
        return userProgress;
    });
    return userProgress;
    
}

//controls user's access to levels based on their progress
function giveLevelAccess (levelNum){

    document.getElementById("level"+levelNum.toString()).disabled = false;
    document.getElementById("l"+levelNum+"img").setAttribute("src", "images/levels/level"+levelNum+".png");
}

//not used, still debugging
function levelSelectAccess (){
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId);
    dbRef.on('value', function(snapshot) {
        if (snapshot.val().progress!==undefined) progress = snapshot.val().progress;
        for (i = 1; i <= progress; i++){
            giveLevelAccess(i+1);
        }
    });
}

//saves custom map to datastore based on slot selected
//each user has 5 slots in which to save custom maps to
function storeMap(slot, img){
    
    if (slot === "1") writeUserData1(img);
    if (slot === "2") writeUserData2(img);
    if (slot === "3") writeUserData3(img);
    if (slot === "4") writeUserData4(img);
    if (slot === "5") writeUserData5(img);
    
    
    //writeUserData(slot,img);
}

//save custom map under the directory map in firebase database
function writeUserData(name, data) {
    var n = name;
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId+'/maps/'+n);
    dbRef.update({
        "name" : n,
        "map" : data
    });
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

//load map in user selected slot (in level editor)
function loadUserMap (name) {
    var n = name;
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId+'/maps/'+n);
    dbRef.once('value').then(function(snapshot) {
        var thumbnail = document.getElementById("thumbnail");
  
        thumbnail.setAttribute("src",snapshot.val().map);
        
        thumbnail.setAttribute("width", "64px");
        thumbnail.setAttribute("height","33px");
     
    });
    
}


//populate custom maps screen in level select with user created maps
function customLevelSelect (){
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId+'/maps/');

    dbRef.once('value', function(snapshot) {
        
        snapshot.forEach(function(data) {
            var customContainer = document.getElementById("level_maker_menu");
            var newLevel = document.createElement("div");
            newLevel.className = "custLevBar";
            newLevel.id = data.val().name;
            var title = document.createElement("div");
            title.className = "title";
            var mapTitle = document.createTextNode(data.val().name);
            title.appendChild(mapTitle);
            var levelThumb = document.createElement("img");
            levelThumb.className = "levelImg2";
            levelThumb.id = data.val().name+"img";
            levelThumb.setAttribute("src", data.val().map);
            var playBtn = document.createElement("button");
            playBtn.className = "levelButtonLM";
            playBtn.onclick = function(){loadCustomLevel(data.val().name)};
            playBtn.innerHTML = "Play";
            var editBtn = document.createElement("button");
            editBtn.className = "levelButtonLM";
            editBtn.innerHTML = "Edit";
            editBtn.onclick = "";
            var delBtn = document.createElement("button");
            delBtn.className = "levelButtonLM";
            delBtn.innerHTML = "Delete";
            delBtn.onclick = "";
            newLevel.appendChild(title);
            newLevel.appendChild(levelThumb);
            newLevel.appendChild(playBtn);
            newLevel.appendChild(editBtn);
            newLevel.appendChild(delBtn);
            customContainer.appendChild(newLevel);
            
            var customList = document.getElementById("customLevelsListLM");
            var item = document.createElement("li");
            item.id = data.val().name;
            item.value = "4";
            item.setAttribute("cellcountX", "64");
            item.setAttribute("cellcountY", "35");
            item.setAttribute("gameLostTimeout", "9001");
            customList.appendChild(item);
        });
        //initialize custom levels
        purpleGameLM.initCustLevels();
    });
   /* 
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
    });*/
}