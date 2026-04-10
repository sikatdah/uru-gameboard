class window_battle {
  constructor() {
    $("#battle").html(`
        <div class="centerPanel">
          <div>
            <div class="board"></div>
          </div>
          <div id="unitContainer">
            <div id="unitStatus"></div>
            <div id="unitAttribute"></div>
            
            <button class="primary-btn" id="turnEnd">
              End Turn
            </button>
          </div>
        </div>
            `);

    $("#unitStatus").hide();
    $("#unitAttribute").hide();
  }
}
