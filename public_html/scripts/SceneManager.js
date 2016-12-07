//SCENE MANAGER IS RESPONSIBLE FOR LOADING AND DELOADING SCENES AS OUR GAME CHANGES STATES.

var Scenes = {
  SPLASH: 0,
  GAME: 1,
  LEVELSELECT: 2,
  LEVELMAKER: 3
};

var currentScene;
var level1 = false;
var splashScreen;

var game;

function initSceneManager(currentScene, gameReference) {
    currentScene = currentScene;
    game = gameReference;

    splashScreen = new Image();
    splashScreen.src = "images/splash.png";
    splashScreen.onload = function () {
        canvas2D.drawImage(this, 60, 0, canvas.width-120, canvas.height - 60);
    };

    changeScene(currentScene);

}

function changeScene (scene) {
    switch(currentScene) {
        case Scenes.SPLASH:
            deloadSplashScene();
            break;
        case Scenes.GAME:
            deloadGameScene();
            break;
        case Scenes.LEVELSELECT:
            deloadLevelSelectScene();
            break;
        case Scenes.LEVELMAKER:
            deloadLevelMakerScene();
            break;
    }
    currentScene = scene;
    switch(scene) {
        case Scenes.SPLASH:
            loadSplashScene();
            break;
        case Scenes.GAME:
            loadGameScene();
            break;
        case Scenes.LEVELSELECT:
            loadLevelSelectScene();
            break;
        case Scenes.LEVELMAKER:
            loadLevelMakerScene();
            break;
    }
};

function loadSplashScene() {
    canvas2D.drawImage(this.splashScreen, 60, 0, canvas.width-120, canvas.height - 60);

    document.getElementById("Enter_button").style.visibility = "visible";
};

function deloadSplashScene() {
  canvas2D.clearRect(0, 0, canvasWidth, canvasHeight);
  document.getElementById("Enter_button").style.visibility = "hidden";
};

function loadGameScene() {
  document.getElementById("toolbar").style.display = "block";
  document.getElementById("toolbar").style.visibility = "visible";
  document.getElementById("game_canvas").removeAttribute('hidden');
  game.resetGameOfLife();
};

function deloadGameScene() {
  game.resetGameOfLife();
  game.pausePurpleGame();
  canvas2D.clearRect(0, 0, canvasWidth, canvasHeight);
  document.getElementById("toolbar").style.display = "none";
  document.getElementById("toolbar").style.visibility = "hidden";

};

function loadLevelSelectScene() {
  document.getElementById("Enter_button").style.visibility = "hidden";
  document.getElementById("ls-section").removeAttribute('hidden');
  
};

function deloadLevelSelectScene() {
  
  document.getElementById("ls-section").setAttribute('hidden', 'hidden');
  
};

function loadLevelMakerScene() {
  document.getElementById("game_canvas").setAttribute('hidden', 'hidden');
  document.getElementById("level_maker_menu").removeAttribute('hidden');
  
};

function deloadLevelMakerScene() {
  
  document.getElementById("level_maker_menu").setAttribute('hidden', 'hidden');
  
};

function goBack() {
  game.pausePurpleGame();
  if (userSignedIn) changeScene(Scenes.LEVELSELECT);
  else changeScene(Scenes.SPLASH);
};

function loadGameLevel(levelToLoad) {
    changeScene(Scenes.GAME);
    game.loadLevel("level" + levelToLoad + ".png");

  if (levelToLoad === 1) {
      showHelpNotes();
      level1 = true;
      playInstructions("weapon");
  }
};

function loadCustomLevel(levelNum) {
    if (game.customLevelExists(levelNum)) {
        this.changeScene(Scenes.GAME);
        //isCustomLevel = true;
        game.loadCustomLevel(levelNum);
    }
}



function getCurrentScene() {
    return currentScene;
};
