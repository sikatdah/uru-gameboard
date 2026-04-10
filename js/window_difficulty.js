class window_difficulty {
  constructor() {
    this.content;
  }

  draw() {
    this.content = `
      
      
      <span id="difDesc">Choose computer's difficulty</span>
      <div id="difficulty" class="menu">
        <div class="menu-item" data-level="very easy">Very Easy</div>
        <div class="menu-item" data-level="easy">Easy</div>
        <div class="menu-item" data-level="standard">Standard</div>
        <div class="menu-item" data-level="hard">Hard</div>
        <div class="menu-item" data-level="very hard">Very Hard</div>
        <div class="menu-item" data-level="impossible">Impossible</div>
      </div>`;

    return this.content;
  }
}
