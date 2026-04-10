class scene_deployment extends scene_base {
  constructor() {
    super("deployment");
    this.coin = 20;
    this.selected = "";
    this.king = 1;

    this.audio = new game_audio();
  }

  run() {
    // CREATING VISUAL CONTENT
    this.deployment = new window_deployment();
    this.catalogue = new window_catalogue();
    this.board = new window_board_deploy();
    this.info = new window_unit_info();
    this.catalogue.draw(this.coin);
    this.board.draw();

    // CATALOGUE EVENT LISTENER
    this.catalogueEvent();

    // BOARD EVENT LISTENER
    this.boardEvent();

    // MODAL EVENT LISTENER
    this.modalEvent();

    this.container.on("click", "#deployEnd", () => {
      this.level = app.level;
      // 1. Logic: Generate Data
      window.app.party.create();
      window.app.ai.deploy(this.level, window.app.party.members());

      // 2. Show Loading Screen
      $("#loading-screen").fadeIn();

      // 3. Animate Bar and Switch
      let width = 0;
      const interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          $("#loading-screen").fadeOut();

          // Move to battle scene
          window.app.scene("battle");
        } else {
          width += 5; // Increase speed of loading here
          $("#progress-bar").css("width", width + "%");
        }
      }, 50); // Speed of the interval
    });
  }

  //===================================================================
  // CATALOGUE EVENT
  //===================================================================
  catalogueEvent() {
    this.container
      //---------------------------------------------------------------
      // Hover
      //---------------------------------------------------------------
      .on("mouseenter", ".unit-item", (e) => {
        this.audio.playSFX("hover");
      })
      //---------------------------------------------------------------
      // Click
      //---------------------------------------------------------------
      .on("click", ".unit-item", (e) => {
        this.audio.playSFX("click");
        this.container.find(".unit-item").removeClass("selected");
        $(e.currentTarget).addClass("selected");
        this.selected = $(e.currentTarget).data("unit");
        this.info.draw(this.selected);
      });
  }

  //===================================================================
  // BOARD EVENT
  //===================================================================
  boardEvent() {
    this.container
      .on("mouseenter", ".tile", () => {
        this.audio.playSFX("hover");
      })
      .on("click", ".tile", (e) => {
        this.audio.playSFX("click");
        const $tile = $(e.currentTarget);
        const existingUnit = $tile.find("img").data("unit");

        // WHEN UNIT ON BOARD IS CLICKED
        if (existingUnit) {
          this.refundUnit(existingUnit, $tile);
          return;
        }

        // WHEN SELECTED CATALOGUE UNIT AFFORDABLE
        if (this.selected) {
          if (
            this.selected === "king" &&
            $(".tile").find('.unit[data-unit="king"]').length > 0
          )
            return;
          this.placeUnit(this.selected, $tile);
          return;
        }
      });
  }

  //===================================================================
  // MODAL EVENT
  //===================================================================
  modalEvent() {
    this.container.on("click", "#howTo", () => {
      $("#instruction").addClass("active");
    });

    $("#instruction .close").click(() => {
      $("#instruction").removeClass("active");
    });
  }

  //===================================================================
  // ACTION REFUND UNIT
  //===================================================================
  refundUnit(unit, tile) {
    this.audio.playSFX("click");
    this.coin += master_unit[unit].cost;
    tile.empty();
    this.catalogue.update(this.coin);
  }

  //===================================================================
  // ACTION PLACING UNIT
  //===================================================================
  placeUnit(unit, tile) {
    this.audio.playSFX("bigClick");
    tile.html(
      `<img class="unit" src="${master_unit[unit].icon}" data-unit="${unit}" data-player="1">`,
    );
    this.coin -= master_unit[unit].cost;
    if (master_unit[unit].cost > this.coin) this.selected = "";
    this.catalogue.update(this.coin);
  }
}
