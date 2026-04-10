class window_unit_status {
  draw(id, side) {
    this.unitId = id;
    let unit;
    $("#unitStatus").empty();
    $("#unitAttribute").empty();

    if (side === 1) {
      unit = app.party.members()[id];
    } else {
      unit = app.ai.members()[id];
    }
    const poisoned = unit.poisoned ? "Yes" : "No";
    const canAttack = unit.attack ? "Yes" : "No";
    const canMove = unit.move ? "Yes" : "No";

    const target = master_unit[unit.type];
    const isSiege = target.siege ? "Yes" : "No";
    const isArea = target.area ? "Yes" : "No";

    $("#unitStatus").show();
    $("#unitAttribute").show();

    $("#unitStatus").html(`
        <div class="statusRow">
          <p id="unitName">${target.name}<p>
        </div>
        <div class="statusRow">
          <p class="paramName">Poisoned?</p>
          <p class="paramValue">${poisoned}</p>
        </div>
        <div class="statusRow">
          <p class="paramName">Can attack?</p>
          <p class="paramValue">${canAttack}</p>
        </div>
        <div class="statusRow">
          <p class="paramName">Can Move?</p>
          <p class="paramValue">${canMove}</p>
        </div>
      `);

    $("#unitAttribute").html(`
        
          <div class="statusRow">
            <p class="paramName">DEF</p>
            <p class="paramValue">${target.def}</div>
          </div>

          <div class="StatusRow">
            <p class="paramName">M.Range</p>
            <p class="paramValue">${target.mr}</div>
          </div>

          <div class="statusRow">
            <p class="paramName">A.Range</p>
            <p class="paramValue">${target.ar}</div>
          </div>

          <div class="statusRow">
            <p class="paramName">Siege Type?</p>
            <p class="paramValue">${isSiege}</div>
          </div>

          <div class="statusRow">
            <p class="paramName">Area Type?</p>
            <p class="paramValue">${isArea}</div>
          </div>
        `);
  }
}
