class game_party {
  constructor() {
    this.party = [];
    this.coord = [];
  }

  create() {
    // Using an arrow function keeps 'this' pointing to the class instance
    $(".tile").each((index, el) => {
      const $tile = $(el); // Wrap the element in jQuery to use .find()
      const $img = $tile.find("img");

      if ($img.length > 0) {
        $img.attr("data-id", this.party.length);
        this.party.push({
          type: $img.data("unit"),
          col: $tile.data("col"),
          row: $tile.data("row"),
          poisoned: false,
          move: true,
          attack: true,
          dead: false,
        });
      }
    });
  }
  members() {
    return this.party;
  }

  target(i) {
    const id = Number(i);
    this.coord = [this.party[id].col, this.party[id].row];
    return this.coord;
  }
}
