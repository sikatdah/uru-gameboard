class game_controller {
  constructor() {
    this.scenes = {
      splash: new scene_splash("splash"),
      title: new scene_title("title"),
      deployment: new scene_deployment("deployment"),
      battle: new scene_battle("battle"),
    };

    this.audio = new game_audio();
    this.party = new game_party();
    this.ai = new game_ai();

    this.currentScene = null;
    this.level = null;
  }

  // Changing scene
  scene(sceneName) {
    if (this.currentScene) {
      this.currentScene.terminate();
    }

    const nextScene = this.scenes[sceneName];
    if (nextScene) {
      this.currentScene = nextScene;
      nextScene.start();
    } else {
      console.error(`Scene ${sceneName} tidak ditemukan!`);
    }
  }
}
