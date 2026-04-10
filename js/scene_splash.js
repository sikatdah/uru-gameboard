class scene_splash extends scene_base {
  constructor() {
    super("splash");
  }

  run() {
    this.container.prepend(`<p id="startBtn">Click anywhere to start</p>`);
    this.container.on("click", () => {
      app.scene("title");
    });
  }
}
