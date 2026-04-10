class window_catalogue {
  draw(coin) {
    this.coin = coin;
    const units = master_unit;

    let html = "";
    html += `
        <p class="headerPanel">Unit Catalogue</p>
        <p class="playercoin">
          <span>Balance: </span>
          <span style="align-items: center; display: flex">
            <span class="coin">${coin}</span>
            <img src="img/coin.svg" />
          </span>
        </p>
        <div id="unitCatalogue">
        `;
    for (let key in units) {
      let unit = units[key];

      html += `
          <div class="unit-item" data-unit="${key}">
            <div class="unit-content">
              <img src="${unit.icon}">
              <span>${units[key].name}</span>
            </div>
            <div class="unit-coin">
              <span class="unit-dp"> ${unit.cost}</span>
              <img src="img/coin.svg">
            </div>
          </div>
          `;
    }

    html += "</div>";
    html += `<button class="question-btn" id="howTo">
              <span>How to Deploy</span>
              <span class="material-symbols-outlined help">help</span>
            </button>`;
    $(`.leftPanel`).html(html);
  }

  update(coin) {
    const isKingExist = $('.unit[data-unit="king"]').length > 0;

    for (let key in master_unit) {
      let unit = master_unit[key];
      let $target = $(`.unit-item[data-unit="${key}"]`);

      if (unit.cost > coin) {
        $target.addClass("disabled");
        $target.removeClass("selected");
      } else {
        $target.removeClass("disabled");
      }
    }

    if (isKingExist) {
      let $target = $(`.unit-item[data-unit="king"]`);
      $target.addClass("disabled");
      $target.removeClass("selected");
      $("#deployEnd").show();
    } else {
      $("#deployEnd").hide();
    }

    $(".coin").html(coin);
  }
}
