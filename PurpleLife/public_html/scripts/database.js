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


//save custom map under the directory map in firebase database
function writeUserData(name, alias, map, wcount) {
    var n = name;
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId+'/maps/'+n);
    dbRef.update({
        "name" : n,
        "alias" : alias,
        "map" : map,
        "wcount" : wcount
    });
    alert("Level saved!");
}

//upload user map to market
function uploadToMarket(name, alias, map, wcount) {
    var n = name;
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('marketmaps/'+userId+'/'+n);
    dbRef.update({
        "name" : n,
        "alias" : alias,
        "map" : map,
        "wcount" : wcount,
        "userId" : userId
    });
    alert("Level uploaded!");
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
        
        if (snapshot.val().alias !== undefined){
            userAlias = snapshot.val().alias;
            document.getElementById('levelCreatorName').value = userAlias;
        }
      document.getElementById('levelWeaponCount').value = snapshot.val().wcount;
    });
    
}


//populate custom maps screen in level select with user created maps
function customLevelSelect (){
    //set displaying flag to local
    displaying = "local";
    
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId+'/maps/');
    
    //show "loading" message
    document.getElementById('loading').removeAttribute('hidden');
    
    //call database and dynamically generate custom level rows
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
            playBtn.onclick = function(){loadCustomLevel(data.val().name);};
            playBtn.innerHTML = "Play";
            var editBtn = document.createElement("button");
            editBtn.className = "levelButtonLM";
            editBtn.innerHTML = "Edit";
            editBtn.onclick = function(){editCustomLevel(data.val().name);};
            var delBtn = document.createElement("button");
            delBtn.className = "levelButtonLM";
            delBtn.innerHTML = "Delete";
            delBtn.onclick = function(){customLevelDelete(data.val().name);};
            newLevel.appendChild(title);
            newLevel.appendChild(levelThumb);
            newLevel.appendChild(playBtn);
            newLevel.appendChild(editBtn);
            newLevel.appendChild(delBtn);
            customContainer.appendChild(newLevel);
            
            var customList = document.getElementById("customLevelsListLM");
            var item = document.createElement("li");
            item.id = data.val().name;
            item.value = data.val().wcount;
            item.setAttribute("cellcountX", "64");
            item.setAttribute("cellcountY", "35");
            item.setAttribute("gameLostTimeout", "9001");
            customList.appendChild(item);
        });
        //initialize custom levels
        purpleGameLM.initCustLevels();
        
        //delete the temporary stored mapToEdit from database
        firebase.database().ref('users/'+userId+'/mapToEdit').remove();
        
        //remove "loading" message
        document.getElementById('loading').setAttribute('hidden', 'true');
        
        
    });
  
}

//delete a custom level
function customLevelDelete (name) {
    
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId+'/maps/'+name);
    if (confirm('Are you sure you want to delete this map forever?')) {
        document.getElementById(name).setAttribute('hidden', 'hidden');
        dbRef.remove();
    } else {
    
    }
    
}

//TODO: FIX open one of your custom levels for editing
function editCustomLevel(name) {
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId);
    dbRef.update({
        "mapToEdit" : name
    });
    window.location = 'levelcreate.html';
   
};

//once levelcreate.html has loaded, load in the map the user wants to edit
function loadMapToEdit(){
    var userId = firebase.auth().currentUser.uid;
    var dbRef = firebase.database().ref('users/'+userId);
    dbRef.once('value').then(function(snapshot) {
        var mapToEdit = snapshot.val().mapToEdit;
        loadCustomMapEdit(mapToEdit);
        if (mapToEdit !== undefined) document.getElementById('customLevelName').value = mapToEdit;
        
    });
    //load in user name into alias field
    userName = firebase.auth().currentUser.displayName;
    document.getElementById('levelCreatorName').value = userName;
    
}

//populate level market with all maps uploaded by users
function levelMarketPopulate (){
    
    var dbRef = firebase.database().ref('marketmaps/');
    var userId = firebase.auth().currentUser.uid;
    
    //show "loading" message
    document.getElementById('loadMarket').removeAttribute('hidden');
    
    //call database and dynamically generate custom level rows
    dbRef.once('value', function(snapshot) {
        //gets each child node of user IDs
        //then gets the maps they've created
        // dynamically load them onto page (levelmaker.html)
        snapshot.forEach(function(userIDs) {
            userIDs.forEach (function (data) {
                var customContainer = document.getElementById("level_market_menu");
                var newLevel = document.createElement("div");
                newLevel.className = "custLevBar";
                newLevel.id = data.val().name;
                var title = document.createElement("div");
                title.className = "title";
                var mapTitle = document.createTextNode("By: "+data.val().name);
                title.appendChild(mapTitle);
                var alias = document.createElement("div");
                alias.className = "alias";
                var mapCreator = document.createTextNode(data.val().alias);
                alias.appendChild(mapCreator);
                var levelThumb = document.createElement("img");
                levelThumb.className = "levelImg2";
                levelThumb.id = data.val().name+"img";
                levelThumb.setAttribute("src", data.val().map);
                var playBtn = document.createElement("button");
                playBtn.className = "levelButtonLM";
                playBtn.onclick = function(){loadCustomLevel(data.val().name);};
                playBtn.innerHTML = "Play";

                newLevel.appendChild(title);
                newLevel.appendChild(alias);
                newLevel.appendChild(levelThumb);
                newLevel.appendChild(playBtn);

                customContainer.appendChild(newLevel);

                var customList = document.getElementById("customLevelsListLM");
                var item = document.createElement("li");
                item.id = data.val().name;
                item.value = data.val().wcount;
                item.setAttribute("cellcountX", "64");
                item.setAttribute("cellcountY", "35");
                item.setAttribute("gameLostTimeout", "9001");
                customList.appendChild(item);
            });
        });
    //initialize custom levels
    purpleGameLM.initCustLevels();

    //delete the temporary stored mapToEdit from database
    firebase.database().ref('users/'+userId+'/mapToEdit').remove();

    //remove "loading" message
    document.getElementById('loadMarket').setAttribute('hidden', 'true');
    });
  
}
