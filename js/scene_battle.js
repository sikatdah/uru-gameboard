class scene_battle extends scene_base {
  constructor() {
    super("battle");
    this.audio = new game_audio();
    this.unitId = "";
    this.side = "";
    this.turn = true;
    this.activeActor = null;
    this.activeMember = null;
    this.gameOver = false;
    this.activeAreaMode = false;
  }

  run() {
    // DRAWING CONTENT
    app.audio.playBGM("battle");
    this.battle = new window_battle();
    this.board = new window_board_battle();
    this.status = new window_unit_status();
    this.info = new window_unit_info();
    this.board.draw();

    // BOARD EVENT LISTENER
    this.boardEvent();

    // SHOW STARTING TURN
    this.showTurnBanner();
  }

  async showTurnBanner() {
     if (this.gameOver) return Promise.resolve();
     const text = this.turn ? "PLAYER TURN" : "ENEMY TURN";
     const color = this.turn ? "#4d94ff" : "#ff4d4d";
     const $banner = $(`<div class="turn-banner">${text}</div>`).css({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#fff',
        textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
        background: 'rgba(0,0,0,0.7)',
        padding: '20px 60px',
        borderRadius: '10px',
        zIndex: 2000,
        pointerEvents: 'none',
        display: 'none',
        opacity: 0
     });
     $("body").append($banner);
     
     if (this.turn && !this.gameOver) {
         $("#turnEnd").show();
     } else {
         $("#turnEnd").hide();
     }

     return new Promise(resolve => {
        $banner.css('display', 'block').animate({ opacity: 1 }, 300, () => {
            setTimeout(() => {
               $banner.animate({ opacity: 0 }, 300, () => {
                   $banner.remove();
                   resolve();
               });
            }, 1000);
        });
     });
  }

  //===================================================================
  // BOARD EVENT
  //===================================================================
  boardEvent() {
    this.container
      .on("mouseenter", ".tile .unit", () => {
        if (!this.turn) return;
        this.audio.playSFX("hover");
      })
      .on("click", ".unit", (e) => {
        if (this.gameOver || !this.turn) return;
        
        const $target = $(e.currentTarget);
        const $tile = $target.parent('.tile');
        const activeUnitData = this.activeMember ? master_unit[this.activeMember.type] : null;

        if (this.activeAreaMode && $tile.hasClass("areable")) {
            e.stopPropagation();
            this.audio.playSFX("click");
            this.executeAreaAttack($tile.data("row"), $tile.data("col"));
            return;
        }

        // Is this a valid attack intercept against a unit?
        if (this.activeMember && this.activeActor && $tile.hasClass("attackable")) {
            if (activeUnitData.area && !this.activeAreaMode) {
                e.stopPropagation();
                this.audio.playSFX("click");
                this.enterAreaMode($tile.data("row"), $tile.data("col"));
                return;
            } else if (!activeUnitData.area) {
                const isTargetPlayer1 = $target.hasClass("player1");
                const isAttackerPlayer1 = this.activeActor.hasClass("player1");

                if (isTargetPlayer1 !== isAttackerPlayer1) {
                   e.stopPropagation();
                   this.audio.playSFX("click");
                   this.executeAttack($target);
                   return;
                } else if (isTargetPlayer1 === isAttackerPlayer1 && activeUnitData.traits.includes("Protect")) {
                   e.stopPropagation();
                   this.audio.playSFX("click");
                   this.executeProtect($target);
                   return;
                }
            }
        }

        e.stopPropagation();
        this.audio.playSFX("click");
        $(".tile").removeClass("moveable attackable areable priority-move priority-attack");
        this.activeAreaMode = false;

        const isPlayer1 = $target.hasClass("player1");
        const $unit = master_unit[$target.data("unit")];
        
        let $member;
        if (isPlayer1) {
          $member = app.party.members()[$target.data("id")];
        } else {
          $member = app.ai.members()[$target.data("id")];
        }
        
        this.showUnitInfo($target);

        if (this.turn) {
          if (isPlayer1 && !$member.dead) {
            this.activeActor = $target;
            this.activeMember = $member;
          } else {
            this.activeActor = null;
            this.activeMember = null;
          }

          if (!$member.dead) {
            if ($member.move) {
              this.draw_path($unit, $member, "move", isPlayer1 ? 1 : 2);
            }

            if ($member.attack) {
              this.draw_path($unit, $member, "attack", isPlayer1 ? 1 : 2);
            }

            // Path Overlap Priority
            if ($member.move && $member.attack) {
                if (!window.priorityClassesAdded) {
                    $("head").append(`<style>
                       .priority-move { background: #5dade3 !important; }
                       .priority-attack { background-color: #e35d5d !important; }
                    </style>`);
                    window.priorityClassesAdded = true;
                }

                if ($unit.ar < $unit.mr) {
                    $(".tile.moveable.attackable").addClass("priority-attack");
                } else if ($unit.mr < $unit.ar) {
                    $(".tile.moveable.attackable").addClass("priority-move");
                } else {
                    $(".tile.moveable.attackable").addClass("priority-move");
                }
            }
          }
        }
      })
      .on("click", ".tile", (e) => {
        if (this.gameOver || !this.turn) return;
        const $tile = $(e.currentTarget);
        const row = $tile.data("row");
        const col = $tile.data("col");

        if (this.activeAreaMode && $tile.hasClass("areable")) {
            this.executeAreaAttack(row, col);
            return;
        }

        if ($tile.hasClass("moveable") && this.activeMember && this.activeActor && $tile.find(".unit").length === 0) {
             this.executeMove(row, col);
             return;
        }
        
        const activeUnitData = this.activeMember ? master_unit[this.activeMember.type] : null;
        
        const isPriorityAttack = $tile.hasClass("priority-attack");
        if ($tile.hasClass("attackable") && this.activeMember && this.activeActor) {
             if (activeUnitData.area && !this.activeAreaMode && isPriorityAttack) {
                 this.enterAreaMode(row, col);
                 return;
             }
        }

        if ($tile.hasClass("moveable") && this.activeMember && this.activeActor && $tile.find(".unit").length === 0) {
             this.executeMove(row, col);
             return;
        }
        
        if ($tile.hasClass("attackable") && this.activeMember && this.activeActor) {
             if (activeUnitData.area && !this.activeAreaMode) {
                 this.enterAreaMode(row, col);
                 return;
             }
        }

        // Clicked outside valid paths / canceled
        $(".tile").removeClass("attackable moveable areable priority-move priority-attack");
        this.activeActor = null;
        this.activeMember = null;
        this.activeAreaMode = false;
      });
      
      // We bind #turnEnd at the document level or since button is inside container
      $("#turnEnd").on("click", () => {
         if (this.gameOver) return;
         if (this.turn) {
             this.audio.playSFX("click");
             $(".tile").removeClass("moveable attackable areable priority-move priority-attack");
             this.activeActor = null;
             this.activeMember = null;
             this.activeAreaMode = false;
             this.endTurn();
         }
      });
  }

  showUnitInfo($target) {
    this.unitId = $target.data("id");
    if ($target.hasClass("player1")) this.side = 1;
    if ($target.hasClass("player2")) this.side = 2;
    this.status.draw(this.unitId, this.side);
  }

  async executeMove(row, col) {
    const activeMover = this.activeMember;
    const oldRow = activeMover.row;
    const oldCol = activeMover.col;

    const dist = Math.abs(row - oldRow) + Math.abs(col - oldCol);
    if (dist > 1 && master_unit[activeMover.type].traits.includes("Charge")) {
        activeMover.chargeActive = true;
    } else {
        activeMover.chargeActive = false;
    }

    activeMover.row = row;
    activeMover.col = col;
    activeMover.move = false;

    // Siege units can only move OR attack
    const unitType = master_unit[activeMover.type];
    if (unitType.siege) {
      activeMover.attack = false;
    }

    const $originalImg = this.activeActor;

    this.activeActor = null;
    this.activeMember = null;
    $(".tile").removeClass("attackable moveable");

    // ANIMATION
    this.audio.playSFX("move");

    const $startTile = $(`.tile[data-row="${oldRow}"][data-col="${oldCol}"]`);
    const $endTile = $(`.tile[data-row="${row}"][data-col="${col}"]`);
    
    if ($startTile.length > 0 && $endTile.length > 0 && $originalImg && $originalImg.length > 0) {
        const startOffset = $startTile.offset();
        const endOffset = $endTile.offset();

        const $clone = $originalImg.clone();
        $clone.css({
            position: "absolute",
            top: startOffset.top,
            left: startOffset.left,
            zIndex: 100,
            width: $originalImg.width(),
            height: $originalImg.height()
        });

        $("body").append($clone);
        $originalImg.css("opacity", 0); // Hide original while cloning

        await new Promise(resolve => {
            $clone.animate({
                top: endOffset.top,
                left: endOffset.left
            }, 300, "linear", () => {
                $clone.remove();
                resolve();
            });
        });
    }

    this.board.draw();
  }

  async executeAttack($targetUnit) {
    const targetId = $targetUnit.data("id");
    const isTargetPlayer1 = $targetUnit.hasClass("player1");
    // Get the array of the enemy side
    const enemySideArray = isTargetPlayer1 ? app.party.members() : app.ai.members();
    const targetMember = enemySideArray[targetId];
    const targetDef = master_unit[targetMember.type].def;
    
    const activeAttacker = this.activeMember;
    
    // Clear state before await to block double clicks
    activeAttacker.attack = false;
    const unitType = master_unit[activeAttacker.type];
    if (unitType.siege) {
      activeAttacker.move = false;
    }
    
    this.activeActor = null;
    this.activeMember = null;
    $(".tile").removeClass("attackable moveable areable");

    // Dice D6 logic
    const roll = Math.floor(Math.random() * 6) + 1;
    console.log(`Attacker rolled ${roll} vs Def ${targetDef}`);
    
    this.audio.playSFX("attack");
    
    const $attackerDOM = $(`.tile[data-row="${activeAttacker.row}"][data-col="${activeAttacker.col}"]`).find(".unit");
    
    // Blinking animation
    const blinkDuration = 100;
    for(let i=0; i<3; i++) {
        if ($attackerDOM.length > 0) $attackerDOM.fadeTo(blinkDuration, 0.2).fadeTo(blinkDuration, 1);
        if ($targetUnit.length > 0) $targetUnit.fadeTo(blinkDuration, 0.2).fadeTo(blinkDuration, 1);
    }
    await new Promise(r => setTimeout(r, blinkDuration * 6));

    // Wait for the UI animation
    await this.showDiceAnimation($targetUnit, roll, targetDef);

    if (roll > targetDef) {
      targetMember.dead = true;
      console.log(`Target ${targetMember.type} dies!`);
    } else {
      if (unitType.traits.includes("Venom") && !targetMember.protected) {
         targetMember.poisoned = true;
      }
    }

    // Charge Logic Piercing
    if (activeAttacker.chargeActive) {
        const normRow = (targetMember.row - activeAttacker.row) === 0 ? 0 : (targetMember.row - activeAttacker.row) / Math.abs(targetMember.row - activeAttacker.row);
        const normCol = (targetMember.col - activeAttacker.col) === 0 ? 0 : (targetMember.col - activeAttacker.col) / Math.abs(targetMember.col - activeAttacker.col);
        const pierceRow = targetMember.row + normRow;
        const pierceCol = targetMember.col + normCol;

        const pierceTarget = enemySideArray.find(u => !u.dead && u.row === pierceRow && u.col === pierceCol);
        
        if (pierceTarget) {
            const pDef = master_unit[pierceTarget.type].def;
            const pRoll = Math.floor(Math.random() * 6) + 1;
            const $pDOM = $(`.tile[data-row="${pierceRow}"][data-col="${pierceCol}"]`).find(".unit");
            
            if ($pDOM.length > 0) {
               this.audio.playSFX("attack");
               for(let i=0; i<3; i++) {
                   $pDOM.fadeTo(blinkDuration, 0.2).fadeTo(blinkDuration, 1);
               }
               await new Promise(r => setTimeout(r, blinkDuration * 6));

               await this.showDiceAnimation($pDOM, pRoll, pDef);
               if (pRoll > pDef) {
                   pierceTarget.dead = true;
               } else {
                   if (unitType.traits.includes("Venom") && !pierceTarget.protected) pierceTarget.poisoned = true;
               }
            }
        }
    }

    this.board.draw();

    // Check Berserk counter-attack
    const defType = master_unit[targetMember.type];
    if (!targetMember.dead && defType.traits.includes("Berserk")) {
       await this.counterAttack(targetMember, activeAttacker);
       this.board.draw();
    }

    this.checkWinCondition();
  }

  executeProtect($targetUnit) {
     const targetId = $targetUnit.data("id");
     const isTargetPlayer1 = $targetUnit.hasClass("player1");
     const allySideArray = isTargetPlayer1 ? app.party.members() : app.ai.members();
     const targetMember = allySideArray[targetId];

     // Apply Protect buff
     targetMember.protected = true;
     // If they are currently poisoned, Protect cleanses it!
     targetMember.poisoned = false;

     this.activeMember.attack = false;
     if (master_unit[this.activeMember.type].siege) this.activeMember.move = false;

     this.activeActor = null;
     this.activeMember = null;
     $(".tile").removeClass("attackable moveable areable");

     // Add visual cue for buff
     const fadeDur = 150;
     $targetUnit.fadeTo(fadeDur, 0).css('background', '#fff').fadeTo(fadeDur, 1, () => {
         $targetUnit.css('background', '');
         this.board.draw();
     });
     this.audio.playSFX("click");
  }

  enterAreaMode(r, c) {
      this.activeAreaMode = true;
      this.audio.playSFX("click");
      $(".tile").removeClass("moveable attackable areable");

      const unitParams = master_unit[this.activeMember.type];
      
      const config = {
          range: unitParams.aar,
          row: r,
          col: c,
          className: "areable",
          traits: [],
          action: "area",
          side: this.side,
          unit: unitParams
      };

      $(`.tile[data-row="${r}"][data-col="${c}"]`).addClass("areable area-center");

      switch (unitParams.aap) {
          case "cross": this.cross_path(config); break;
          case "diagonal": this.diagonal_path(config); break;
          case "omni": this.omni_path(config); break;
          case "square": this.square_path(config); break;
          case "circle": this.circle_path(config); break;
      }
  }

  async executeAreaAttack(centerRow, centerCol) {
      // Find all enemies on any tile marked .areable
      const activeAttacker = this.activeMember;
      const unitType = master_unit[activeAttacker.type];
      const isAttackerP1 = this.activeActor.hasClass("player1");
      const attackerPlayerNum = isAttackerP1 ? 1 : 2;
      
      // Collect enemy data BEFORE clearing state (store member refs + positions, not DOM)
      const enemyTargets = [];

      $(".tile.areable").each((idx, tileDOM) => {
          const $tile = $(tileDOM);
          const $unitDOM = $tile.find(".unit");
          
          if ($unitDOM.length > 0) {
              const targetId = $unitDOM.data("id");
              const targetPlayerNum = $unitDOM.hasClass("player1") ? 1 : 2;
              const targetMember = targetPlayerNum === 1 ? app.party.members()[targetId] : app.ai.members()[targetId];
              
              if (attackerPlayerNum !== targetPlayerNum && !targetMember.dead) {
                   enemyTargets.push({
                       member: targetMember,
                       row: targetMember.row,
                       col: targetMember.col
                   });
              }
          }
      });

      // Now clear state
      activeAttacker.attack = false;
      if (unitType.siege) activeAttacker.move = false;

      this.activeActor = null;
      this.activeMember = null;
      this.activeAreaMode = false;
      $(".tile").removeClass("attackable moveable areable priority-move priority-attack");

      if (enemyTargets.length > 0) {
          this.audio.playSFX("attack");

          // Sequential blink + dice per target
          for (let idx = 0; idx < enemyTargets.length; idx++) {
               if (this.gameOver) break;
               const target = enemyTargets[idx];
               const targetMember = target.member;
               if (targetMember.dead) continue;

               // Fresh DOM lookup each iteration (board.draw() may have re-rendered)
               const $t = $(`.tile[data-row="${target.row}"][data-col="${target.col}"]`).find(".unit");
               if ($t.length === 0) continue;

               // Blink animation on this target
               const blinkDuration = 100;
               for(let b = 0; b < 3; b++) {
                   $t.fadeTo(blinkDuration, 0.2).fadeTo(blinkDuration, 1);
               }
               await new Promise(r => setTimeout(r, blinkDuration * 6));

               // Dice roll animation
               const targetDef = master_unit[targetMember.type].def;
               const roll = Math.floor(Math.random() * 6) + 1;
               await this.showDiceAnimation($t, roll, targetDef);
               
               if (roll > targetDef) {
                   targetMember.dead = true;
               } else {
                   if (unitType.traits.includes("Venom") && !targetMember.protected) targetMember.poisoned = true;
               }
               
               this.board.draw();
               this.checkWinCondition();
          }
      }

      this.board.draw();
      this.checkWinCondition();
  }

  async counterAttack(defenderMember, attackerMember) {
      // Check if attacker is within defender's attack range
      const dist = Math.abs(defenderMember.row - attackerMember.row) + Math.abs(defenderMember.col - attackerMember.col);
      const defUnitData = master_unit[defenderMember.type];
      
      if (dist <= defUnitData.ar) {
          const targetDef = master_unit[attackerMember.type].def;
          const roll = Math.floor(Math.random() * 6) + 1;
          console.log(`Berserker counter-attack rolled ${roll} vs Def ${targetDef}`);
          
          // Wait for attack UI before counter attack
          await new Promise(r => setTimeout(r, 500)); 
          const isPlayer1 = attackerMember.player === 1 || app.party.members().includes(attackerMember);
          const $targetUnit = $(`.tile[data-row="${attackerMember.row}"][data-col="${attackerMember.col}"]`).find(".unit");
          const $defenderUnit = $(`.tile[data-row="${defenderMember.row}"][data-col="${defenderMember.col}"]`).find(".unit");

          if ($targetUnit.length > 0) {
              this.audio.playSFX("attack");
              const blinkDuration = 100;
              for(let i=0; i<3; i++) {
                 if ($defenderUnit.length > 0) $defenderUnit.fadeTo(blinkDuration, 0.2).fadeTo(blinkDuration, 1);
                 $targetUnit.fadeTo(blinkDuration, 0.2).fadeTo(blinkDuration, 1);
              }
              await new Promise(r => setTimeout(r, blinkDuration * 6));

              await this.showDiceAnimation($targetUnit, roll, targetDef);
          }

          if (roll > targetDef) {
             attackerMember.dead = true;
             console.log(`Player ${attackerMember.type} dies from counter-attack!`);
          }
      }
  }

  showDiceAnimation($targetUnit, finalRoll, targetDef) {
      return new Promise((resolve) => {
          const offset = $targetUnit.offset();
          const popupId = `dice-${Date.now()}`;
          const $popup = $(`<div id="${popupId}" class="dice-popup"></div>`).css({
              position: "absolute",
              top: offset.top - 40 + "px",
              left: offset.left + "px",
              background: "rgba(0,0,0,0.8)",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: "5px",
              fontWeight: "bold",
              fontSize: "16px",
              zIndex: 1000,
              pointerEvents: "none",
              boxShadow: "0 0 5px rgba(255,255,255,0.5)",
              textAlign: "center"
          });
          $("body").append($popup);

          let ticks = 0;
          const maxTicks = 20; // about 1 second at 50ms interval
          
          const interval = setInterval(() => {
              const randomRoll = Math.floor(Math.random() * 6) + 1;
              $popup.text(`Roll: ${randomRoll}`);
              ticks++;
              if (ticks >= maxTicks) {
                  clearInterval(interval);
                  $popup.text(`Roll: ${finalRoll} (vs ${targetDef})`);
                  
                  if (finalRoll > targetDef) {
                      $popup.append(`<div style="color: #ff4d4d; font-size: 12px; margin-top:2px;">HIT!</div>`);
                  } else {
                      $popup.append(`<div style="color: #4d94ff; font-size: 12px; margin-top:2px;">MISS</div>`);
                  }

                  setTimeout(() => {
                      $popup.fadeOut(300, () => {
                          $popup.remove();
                          resolve();
                      });
                  }, 1000);
              }
          }, 50);
      });
  }

  checkWinCondition() {
      if (this.gameOver) return; // Block multiple trigger layers
      const aiKingDead = app.ai.members().some(u => u.type === "king" && u.dead);
      const playerKingDead = app.party.members().some(u => u.type === "king" && u.dead);

      if (aiKingDead || playerKingDead) {
          this.gameOver = true;
          $(".turn-banner").remove(); // Strip out remaining banners visually
          setTimeout(() => {
             if (aiKingDead) alert("You Win!");
             else if (playerKingDead) alert("You Lose!");
             
             // Cleanup DOM elements/events manually before switching
             $("#turnEnd").off("click");
             this.container.off("click", ".unit").off("click", ".tile").off("mouseenter");
             
             app.scene("title");
          }, 300);
      }
  }

  async endTurn() {
    this.turn = !this.turn;
    
    if (this.gameOver) return;

    $("#turnEnd").hide(); // immediately hide
    await this.showTurnBanner();
    if (this.gameOver) return;

    const currentSide = this.turn ? app.party.members() : app.ai.members();
    
    // Process poison for current side
    currentSide.forEach((member) => {
        if (!member.dead && member.poisoned) {
            const defTarget = master_unit[member.type].def;
            const roll = Math.floor(Math.random() * 6) + 1;
            console.log(`Poison rolled ${roll} vs Def ${defTarget} for ${member.type}`);
            if (roll > defTarget) {
               member.dead = true;
               console.log(`${member.type} died from poison!`);
            }
            // Clear poison since it lasts 1 turn
            member.poisoned = false;
        }

        // Reset move and attack for the new turn
        if (!member.dead) {
            member.move = true;
            member.attack = true;
            member.chargeActive = false;
            // Also reset UI if selected
        }
    });

    this.board.draw();
    this.checkWinCondition();

    // If it's AI's turn, simply make them pass for now and end their turn
    if (!this.turn) {
        console.log("AI Turn Start...");
        this.processAITurn();
    } else {
        console.log("Player Turn Start...");
    }
  }

  async processAITurn() {
      // Small pause before AI starts acting
      await new Promise(r => setTimeout(r, 600));

      const aiMembers = app.ai.members();
      const playerMembers = app.party.members();

      for (let i = 0; i < aiMembers.length; i++) {
          const aiUnit = aiMembers[i];
          if (aiUnit.dead || (!aiUnit.move && !aiUnit.attack)) continue;

          // Ask game_ai to compute the best action for this specific unit
          const bestAction = app.ai.calculateBestAction(i, aiMembers, playerMembers);

          if (bestAction) {
              // 1. Execute Move if there's a target tile
              if (bestAction.moveTarget && aiUnit.move) {
                 // Trigger the async movement logically
                 this.activeMember = aiUnit;
                 this.activeActor = $(`.tile[data-row="${aiUnit.row}"][data-col="${aiUnit.col}"]`).find(".unit");
                 await this.executeMove(bestAction.moveTarget.row, bestAction.moveTarget.col);
                 
                 await new Promise(r => setTimeout(r, 200)); // small delay post move
              }
              
              // 2. Execute Attack if there's a target to hit
              if (bestAction.attackTarget && aiUnit.attack) {
                 const $targetDOM = $(`.tile[data-row="${bestAction.attackTarget.row}"][data-col="${bestAction.attackTarget.col}"]`).find(".unit");
                 
                 // Fake the active states for standard executeAttack logic to consume
                 this.activeMember = aiUnit;
                 this.activeActor = $(`.tile[data-row="${aiUnit.row}"][data-col="${aiUnit.col}"]`).find(".unit");
                 
                 const activeUnitData = master_unit[aiUnit.type];
                 
                  if (activeUnitData.area) {
                      this.enterAreaMode(bestAction.attackTarget.row, bestAction.attackTarget.col);
                      await this.executeAreaAttack(bestAction.attackTarget.row, bestAction.attackTarget.col);
                  } else {
                     if ($targetDOM.length > 0) {
                         // Check protect AI logic here? AI doesn't know how to cast protect right now,
                         // so it defaults to attacking enemy units only based on bestAction.
                         await this.executeAttack($targetDOM);
                     } else {
                         aiUnit.attack = false;
                         if (activeUnitData.siege) aiUnit.move = false;
                     }
                 }
              }
          } else {
              // No valid actions found, expend to prevent loops
              aiUnit.move = false;
              aiUnit.attack = false;
          }
      }

      console.log("AI turn complete. Passing back to Player.");
      setTimeout(() => {
          if (!this.turn) {
             this.endTurn(); // pass turn back to player
          }
      }, 500);
  }

  draw_path($unit, $member, $action, side) {
    const config = {
      unit: $unit,
      range: $action === "move" ? $unit.mr : $unit.ar,
      row: $member.row,
      col: $member.col,
      className: $action === "move" ? "moveable" : "attackable",
      traits: $unit.traits || [],
      action: $action,
      side: side,
    };
    switch ($unit.mp) {
      case "cross":
        this.cross_path(config);
        break;
      case "diagonal":
        this.diagonal_path(config);
        break;
      case "omni":
        this.omni_path(config);
        break;
      case "square":
        this.square_path(config);
        break;
      case "circle":
        this.circle_path(config);
        break;
    }
  }

  checkDirection(config, rowOffset, colOffset) {
    const { range, row, col, className, action, traits, side } = config;

    for (let i = 1; i <= range; i++) {
      const targetRow = row + i * rowOffset;
      const targetCol = col + i * colOffset;
      const $tile = $(
        `.tile[data-col="${targetCol}"][data-row="${targetRow}"]`,
      );

      if ($tile.length === 0) break;

      const $occupant = $tile.find(".unit");

      if ($occupant.length > 0) {
        const isOccupantP1 = $occupant.hasClass("player1");
        const isAlly = (side === 1 && isOccupantP1) || (side === 2 && !isOccupantP1);
        const isEnemy = !isAlly;

        if (action === "area") {
            $tile.addClass(className);
            continue; // Area pieces through units.
        }

        if (action === "move") {
          if (traits.includes("Jump")) continue; // Can fly over, does not land on unit
          break; // Blocked by any unit
        }

        if (action === "attack") {
          if (traits.includes("Arc")) {
            if (isEnemy || (isAlly && traits.includes("Protect"))) $tile.addClass(className);
            continue; // Continue ray over units
          }

          if (isAlly) {
            if (traits.includes("Protect")) $tile.addClass(className);
            break; // Blocked by ally
          } else {
            $tile.addClass(className); // Target enemy
            break; // Stop after hitting enemy
          }
        }
      }

      // Automatically falls through to here if it's empty space and not broken out
      if (action === "move" || action === "attack" || action === "area") {
        $tile.addClass(className);
      }
    }
  }

  cross_path(config) {
    // Run for all 4 directions
    this.checkDirection(config, 0, 1); // Right
    this.checkDirection(config, 0, -1); // Left
    this.checkDirection(config, 1, 0); // Down
    this.checkDirection(config, -1, 0); // Up
  }

  diagonal_path(config) {
    this.checkDirection(config, 1, 1); // Bottom-Right
    this.checkDirection(config, 1, -1); // Bottom-Left
    this.checkDirection(config, -1, 1); // Top-Right
    this.checkDirection(config, -1, -1); // Top-Left
  }

  omni_path(config) {
    // An omni path is just a cross and a diagonal combined
    this.cross_path(config);
    this.diagonal_path(config);
  }

  square_path(config) {
    const { range, row, col, className, action, traits, side } = config;
    // Loop through rows from -range to +range
    for (let y = -range; y <= range; y++) {
      // Loop through columns from -range to +range
      for (let x = -range; x <= range; x++) {
        const $tile = $(`.tile[data-col="${col + x}"][data-row="${row + y}"]`);

        if (x === 0 && y === 0) continue; // Skip center

        if ($tile.length === 0) continue;

        const $occupant = $tile.find(".unit");
        
        if ($occupant.length > 0) {
          const isOccupantP1 = $occupant.hasClass("player1");
          const isAlly = (side === 1 && isOccupantP1) || (side === 2 && !isOccupantP1);
          
          if (action === "area") {
             $tile.addClass(className);
             continue;
          }
          if (action === "move") {
             continue; // You cannot move onto any unit
          }
          if (action === "attack" && isAlly && !traits.includes("Protect")) {
             continue; // You cannot attack an ally unless protecting
          }
        }

        $tile.addClass(className);
      }
    }
  }

  circle_path(config) {
    const { range, row, col, className, side, action } = config;
    for (let y = -range; y <= range; y++) {
      for (let x = -range; x <= range; x++) {
        const $tile = $(`.tile[data-col="${col + x}"][data-row="${row + y}"]`);
        if (x === 0 && y === 0) continue; // Skip center

        if ($tile.length === 0) continue;

        const $occupant = $tile.find(".unit");
        
        if ($occupant.length > 0) {
          const isOccupantP1 = $occupant.hasClass("player1");
          const isAlly = (side === 1 && isOccupantP1) || (side === 2 && !isOccupantP1);
          
          if (action === "area") {
             // Let it add class below in the sum check
          } else if (action === "move") {
             continue; // You cannot move onto any unit
          } else if (action === "attack" && isAlly && !traits.includes("Protect")) {
             continue; // You cannot attack an ally unless protecting
          }
        }

        // Only add class if the total steps (x + y) are within range
        if (Math.abs(x) + Math.abs(y) <= range) {
          $(`.tile[data-col="${col + x}"][data-row="${row + y}"]`).addClass(
            className,
          );
        }
      }
    }
  }
}
