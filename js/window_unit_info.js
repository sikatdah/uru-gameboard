class window_unit_info {
  draw(key) {
    const unit = master_unit[key];

    $("#unitInfo").html(`
      <h3 class="unit-name">${unit.name}</h3>
      <div class="info-row">
        <img src="img/def.svg" alt="Defence Icon">
        <div class="info-name">DEF</div> 
        <div class="info-value">${unit.def}</div> 
      </div>
      <div class="info-row">
        <img src="img/mpath.svg" alt="M. Path Icon">
        <div class="info-name">M. Path</div> 
        <div class="info-value">${unit.mp}</div> 
      </div>
      <div class="info-row">
        <img src="img/mrange.svg" alt="M. Range Icon">
        <div class="info-name">M. Range</div> 
        <div class="info-value">${unit.mr}</div> 
      </div>
      <div class="info-row">
        <img src="img/mpath.svg" alt="A. Path Icon">
        <div class="info-name">A. Path</div> 
        <div class="info-value">${unit.ap}</div> 
      </div>
      <div class="info-row">
        <img src="img/arange.svg" alt="A. Range Icon">
        <div class="info-name">A. Range</div> 
        <div class="info-value">${unit.ar}</div> 
      </div>
      <hr>
      <div class="info-row">
        <img src="img/siege.svg" alt="Siege Mode Icon">
        <div class="info-name">Siege mode</div> 
        <div class="info-value">${unit.siege ? "Yes" : "No"}</div> 
      </div>

      `);

    let areaHtml = "";
    if (unit.aap !== null) {
      areaHtml = `
    
      <hr>
      <div class="info-row">
        <img src="img/mpath.svg" alt="Area Path Icon">
        <div class="info-name">Area Path</div> 
        <div class="info-value">${unit.aap}</div> 
      </div>
      <div class="info-row">
        <img src="img/arearange.svg" alt="Area Range Icon">
        <div class="info-name">Area Range</div> 
        <div class="info-value">${unit.aar}</div> 
      </div>
    `;

      $("#unitInfo").append(areaHtml);
    }

    let traitsHtml = "";
    if (unit.traits !== null) {
      traitsHtml = `
      <hr>
      <div class="info-row">
        <img src="img/trait.svg" alt="Trait Icon">
        <div class="info-name">Traits</div> 
      </div>
      <div class="info-row">
        <div class="info-value info-traits" style="text-align: left;">${unit.traits.join(", ")}</div> 
      </div>
    `;
      $("#unitInfo").append(traitsHtml);
    }
  }
}
