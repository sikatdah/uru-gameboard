class window_board_deploy {
  draw() {
    const board = $(".board");
    board.empty();
    board.css({
      display: "grid",
      gridTemplateColumns: "repeat(" + boardRow + ", 40px)",
      gridTemplateRows: "repeat(" + 3 + ", 40px)",
      gap: "2px",
      margin: "2rem auto",
      width: "max-content",
    });

    for (let r = 1; r <= 3; r++) {
      for (let c = 1; c <= boardCol; c++) {
        const tile = $("<div>", {
          class: "tile",
          "data-row": r + (boardRow - 3),
          "data-col": c,
        });

        board.append(tile);
      }
    }
  }
}
