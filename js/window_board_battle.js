class window_board_battle {
  draw() {
    const p = window.app.party.members();
    const ai = window.app.ai.members();
    const board = $(".board");
    board.empty();
    board.css({
      display: "grid",
      gridTemplateColumns: "repeat(" + boardCol + ", 40px)",
      gridTemplateRows: "repeat(" + boardRow + ", 40px)",
      gap: "2px",
      margin: "2rem auto",
      width: "max-content" /* Ensures the container shrinks to the grid size */,
    });

    for (let r = 1; r <= boardRow; r++) {
      for (let c = 1; c <= boardCol; c++) {
        let tile = ` <div class="tile" data-row="${r}" data-col="${c}">`;
        const unitIndex = p.findIndex((u) => u.row === r && u.col === c && !u.dead);
        const aiIndex = ai.findIndex((u) => u.row === r && u.col === c && !u.dead);

        // Draw player party
        if (unitIndex !== -1) {
          const unitId = unitIndex;
          const unitType = p[unitIndex].type;
          const units = master_unit;
          tile += `<img src="${units[unitType].icon}" class="player1 unit" data-id="${unitId}" data-unit="${unitType}">`;
        }

        // Draw AI party
        if (aiIndex !== -1) {
          const aiId = aiIndex;
          const aiType = ai[aiId].type;
          const aiUnits = master_unit;
          tile += `<img src="${aiUnits[aiType].icon}" class="player2 unit" data-id="${aiId}" data-unit="${aiType}">`;
        }

        tile += `</div>`;

        board.append(tile);
      }
    }
  }
}
