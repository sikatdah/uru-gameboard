class scene_base {
  constructor(id) {
    this.id = id;
  }

  start() {
    let sceneDiv = $(`<div id="${this.id}"></div>`);
    $("body").prepend(sceneDiv);
    this.container = sceneDiv;
    this.run();
  }

  terminate() {
    this.container.remove();
    this.exit();
  }

  run() {}
  exit() {}
}
