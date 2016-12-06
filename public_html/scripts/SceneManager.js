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

function SceneManager(currentScene) {
    this.currentScene = currentScene;

    this.splashScreen = new Image();
    this.splashScreen.src = "images/splash.png";
    this.splashScreen.onload = function () {
        canvas2D.drawImage(this, 60, 0, canvas.width-120, canvas.height - 60);
    };

    this.changeScene(currentScene);

}

SceneManager.prototype.changeScene = function(scene) {
    switch(this.currentScene) {
        case Scenes.SPLASH:
            this.deloadSplashScene();
            break;
        case Scenes.GAME:
            this.deloadGameScene();
            break;
        case Scenes.LEVELSELECT:
            this.deloadLevelSelectScene();
            break;
        case Scenes.LEVELMAKER:
            this.deloadLevelMakerScene();
            break;
    }
    this.currentScene = scene;
    switch(scene) {
        case Scenes.SPLASH:
            this.loadSplashScene();
            break;
        case Scenes.GAME:
            this.loadGameScene();
            break;
        case Scenes.LEVELSELECT:
            this.loadLevelSelectScene();
            break;
        case Scenes.LEVELMAKER:
            this.loadLevelMakerScene();
            break;
    }
};

SceneManager.prototype.loadSplashScene = function() {
    canvas2D.drawImage(this.splashScreen, 60, 0, canvas.width-120, canvas.height - 60);

    document.getElementById("Enter_button").style.visibility = "visible";
};

SceneManager.prototype.deloadSplashScene = function() {
  canvas2D.clearRect(0, 0, canvasWidth, canvasHeight);
  document.getElementById("Enter_button").style.visibility = "hidden";
};

SceneManager.prototype.loadGameScene = function() {
  document.getElementById("toolbar").style.display = "block";
  document.getElementById("toolbar").style.visibility = "visible";

  purpleGame.resetGameOfLife();
};

SceneManager.prototype.deloadGameScene = function() {
  purpleGame.resetGameOfLife();
  purpleGame.pausePurpleGame();
  canvas2D.clearRect(0, 0, canvasWidth, canvasHeight);
  document.getElementById("toolbar").style.display = "none";
  document.getElementById("toolbar").style.visibility = "hidden";

};

SceneManager.prototype.loadLevelSelectScene = function() {
  document.getElementById("Enter_button").style.visibility = "hidden";
  document.getElementById("ls-section").removeAttribute('hidden');
  
};

SceneManager.prototype.deloadLevelSelectScene = function() {
  
  document.getElementById("ls-section").setAttribute('hidden', 'hidden');
  
};

SceneManager.prototype.goBack = function() {
  purpleGame.pausePurpleGame();
  if (userSignedIn) this.changeScene(Scenes.LEVELSELECT);
  else this.changeScene(Scenes.SPLASH);
};

SceneManager.prototype.loadGameLevel = function(levelToLoad) {
    this.changeScene(Scenes.GAME);
    purpleGame.loadLevel("level" + levelToLoad + ".png");

  if (levelToLoad === 1) {
      showHelpNotes();
      level1 = true;
      playInstructions("weapon");
  }
};

SceneManager.prototype.getCurrentScene = function() {
    return this.currentScene;
};
