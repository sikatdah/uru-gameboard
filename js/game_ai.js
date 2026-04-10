class game_ai {
  constructor() {
    this.army = [];
    // Strategy Library: Defines unit preference, behavior, and deployment row bias
    this.strategies = ai_strategies;
  }

  members() {
    return this.army;
  }

  // AI "Brain" - Analyzes player and picks best counter-strategy
  selectStrategy(playerParty) {
    const hasManyArchers =
      playerParty.filter((u) => u.type === "archer").length > 2;
    const hasManyInfantry =
      playerParty.filter((u) => u.type === "infantry").length > 2;

    if (hasManyArchers) return this.strategies["blitzkrieg"]; // Rush to counter range
    if (hasManyInfantry) return this.strategies["artillery_core"]; // Use magic to break tanks

    // Default random selection
    const keys = Object.keys(this.strategies);
    return this.strategies[keys[Math.floor(Math.random() * keys.length)]];
  }

  deploy(difficulty, playerParty) {
    this.army = [];
    const strategy = this.selectStrategy(playerParty);
    const multiplier = this.getDifficultyMultiplier(difficulty);
    let budget = 20 * multiplier;

    // Always deploy King first (mandatory)
    const kingRow = Math.max(1, Math.min(15, strategy.rowBias));
    const kingCol = Math.floor(Math.random() * 15) + 1;
    this.addUnit("king", kingRow, kingCol);
    budget -= master_unit["king"].cost;

    for (const [type, count] of Object.entries(strategy.priority)) {
      if (type === "king") continue; // Already deployed
      for (let i = 1; i <= count; i++) {
        if (budget >= master_unit[type].cost) {
          // 1. CLAMP THE ROW: Ensure rowBias is between 1 and 15
          let r = Math.max(1, Math.min(15, strategy.rowBias));

          // 2. ADJUST THE COL: Generate 1-15 (Math.random() * 15 is 0-14.9, +1 makes it 1-15.9)
          let c = Math.floor(Math.random() * 15) + 1;

          // Check if spot is taken; if so, we try to find a nearby valid spot
          if (!this.army.some((u) => u.row === r && u.col === c)) {
            this.addUnit(type, r, c);
            budget -= master_unit[type].cost;
          } else {
            // Optional: Simple logic to nudge the unit if the spot is taken
            c = (c % 15) + 1;
            if (!this.army.some((u) => u.row === r && u.col === c)) {
              this.addUnit(type, r, c);
              budget -= master_unit[type].cost;
            }
          }
        }
      }
    }
    this.render(strategy.behavior);
  }

  addUnit(type, r, c) {
    this.army.push({
      type: type,
      col: c,
      row: r,
      poisoned: false,
      move: true,
      attack: true,
      dead: false,
      player: 2, // 1 for Player, 2 for AI
    });
  }

  getDifficultyMultiplier(diff) {
    const rates = {
      "very easy": 0.5,
      easy: 0.8,
      standard: 1,
      hard: 1.5,
      "very hard": 2,
      impossible: 3,
    };
    return rates[diff.toLowerCase()] || 1;
  }

  render(behavior) {
    this.army.forEach((unit, index) => {
      const $tile = $(`.tile[data-row="${unit.row}"][data-col="${unit.col}"]`);
      $tile.html(
        `<img class="unit ai" src="${master_unit[unit.type].icon}" 
              data-unit="${unit.type}" data-player="2" data-id="ai-${index}" 
              data-behavior="${behavior}">`,
      );
    });
  }

  // Calculate best move/attack action for a given AI unit
  calculateBestAction(unitIndex, aiMembers, playerMembers) {
      const unit = aiMembers[unitIndex];
      const unitType = master_unit[unit.type];
      
      let bestAction = {
         moveTarget: null,
         attackTarget: null
      };

      // 1. Find live players
      const validTargets = playerMembers.filter(p => !p.dead);
      if (validTargets.length === 0) return null;

      // Basic naive AI score: Focus King, then closest
      const getDistance = (r1, c1, r2, c2) => Math.abs(r1 - r2) + Math.abs(c1 - c2);
      
      let primaryTarget = validTargets.reduce((best, curr) => {
          if (curr.type === "king" && best.type !== "king") return curr;
          if (best.type === "king" && curr.type !== "king") return best;
          
          const currDist = getDistance(unit.row, unit.col, curr.row, curr.col);
          const bestDist = getDistance(unit.row, unit.col, best.row, best.col);
          return currDist < bestDist ? curr : best;
      }, validTargets[0]);

      // Can we attack them right now?
      const distToPrimary = getDistance(unit.row, unit.col, primaryTarget.row, primaryTarget.col);
      
      if (distToPrimary <= unitType.ar && unit.attack) {
          bestAction.attackTarget = { row: primaryTarget.row, col: primaryTarget.col };
          // If siege, we can't move after attack
          if (unitType.siege) return bestAction;
      }
      
      if (unit.move) {
          // Find a valid adjacent tile closer to primary target
          // Currently, without rewriting full A* pathfinding, we will just move along manhattan distance
          let bestMove = null;
          let minMoveDist = distToPrimary;

          // Simple omni search for immediate tiles within move range
          const maxMove = unitType.mr;
          for (let r = -maxMove; r <= maxMove; r++) {
              for (let c = -maxMove; c <= maxMove; c++) {
                  // Only orthogonal for cross, etc. Simple approximation:
                  if (Math.abs(r) + Math.abs(c) > maxMove) continue;
                  
                  const targetRow = unit.row + r;
                  const targetCol = unit.col + c;

                  // Out of bounds
                  if (targetRow < 1 || targetRow > 15 || targetCol < 1 || targetCol > 15) continue;

                  // Is occupied?
                  const occupied = aiMembers.some(a => !a.dead && a.row === targetRow && a.col === targetCol) ||
                                   playerMembers.some(p => !p.dead && p.row === targetRow && p.col === targetCol);
                  
                  if (!occupied) {
                      const newDist = getDistance(targetRow, targetCol, primaryTarget.row, primaryTarget.col);
                      if (newDist < minMoveDist) {
                          minMoveDist = newDist;
                          bestMove = { row: targetRow, col: targetCol };
                      }
                  }
              }
          }

          if (bestMove) {
              bestAction.moveTarget = bestMove;
              // Check if we can attack after this simulated move
              if (!bestAction.attackTarget && !unitType.siege) {
                 const postMoveDist = getDistance(bestMove.row, bestMove.col, primaryTarget.row, primaryTarget.col);
                 if (postMoveDist <= unitType.ar) {
                     bestAction.attackTarget = { row: primaryTarget.row, col: primaryTarget.col };
                 }
              }
          }
      }

      return bestAction;
  }
}
