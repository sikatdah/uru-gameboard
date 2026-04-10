class window_action_menu {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.terminate();
  }

  draw(id) {
    const unit = app.party.members()[id];
    const canMove = unit.move ? "" : "disabled";
    const canAttack = unit.attack ? "" : "disabled";
    $("body").append(`
            
            <div id="actionMenu" class="action-menu" style="display: none">
                <button class="menu-btn btn ${canMove}" id="btnMove">Move</button>
                <button class="menu-btn btn ${canAttack}" id="btnAttack">Attack</button>
                <button class="menu-btn cancel btn" id="btnCancel">Cancel</button>
            </div>
            `);

    $("#actionMenu")
      .css({
        top: this.y + "px",
        left: this.x + "px",
        display: "flex", // Pastikan terlihat
      })
      .hide()
      .fadeIn(150);
  }

  terminate() {
    $("#actionMenu").remove();
  }
}
