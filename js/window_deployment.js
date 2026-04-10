class window_deployment {
  constructor() {
    $("#deployment").html(`
        <div class="leftPanel"></div>
        <div class="centerPanel">
            <div class="board"></div>
            <button class="primary-btn" id="deployEnd" style="display: none">
            End Deployment
            </button>
        </div>

        <div class="rightPanel">
            <p class="headerPanel">Unit Info</p>
            <div id="unitInfo"></div>
        </div>
            `);
    $("#instruction").remove();
    $("#loading-screen").remove();

    $("body").append(`
        
        <div id="instruction" class="modal">
            <div id="content">
                <h2>How to deploy your units</h2>
                <ol>
                <li><p>Click unit in catalogue on your left side</p></li>
                <li><p>Click on the board for deployment</p></li>
                <li>
                    <p>Click your unit again on the board to cancel unit deployment</p>
                </li>
                <li><p>You have initial 20 gold</p></li>
                <li><p>Each unit has its own gold cost</p></li>
                </ol>
                <button class="close">Close</button>
            </div>
        </div>
        
        <div
        id="loading-screen"
        style="
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: black;
            color: white;
            z-index: 9999;
            text-align: center;
        "
        >
            <div id="bar-container">
                <div id="progress-bar"></div>
            </div>
            <p>Preparing Battle...</p>
        </div>
    `);
  }
}
