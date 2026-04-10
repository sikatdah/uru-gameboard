class scene_title extends scene_base {
  constructor() {
    super("title");
    this.difficulty = new window_difficulty();
  }

  run() {
    // Play title BGM
    app.audio.playBGM("title");

    this.container.append(`<p id="gameName">URU GAMEBOARD</p>`);
    this.container.append(this.difficulty.draw());

    // Event handler
    this.container
      .find(".menu-item")
      .off("mouseenter")
      .on("mouseenter", () => {
        app.audio.playSFX("hover");
      })
      .on("click", (e) => {
        app.audio.playSFX("bigClick");
        app.level = $(e.currentTarget).data("level");
        app.scene("deployment");
      });
  }
}
