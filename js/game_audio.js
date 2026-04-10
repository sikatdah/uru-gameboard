class game_audio {
  constructor() {
    this.bgmList = {
      // Ganti nama agar tidak tertukar
      title: new Audio("audio/Opening.mp3"),
      battle: new Audio("audio/Battle.mp3"),
    };
    this.sfxList = {
      bigClick: new Audio("audio/btnClick.mp3"),
      click: new Audio("audio/tileClick.mp3"),
      hover: new Audio("audio/tileHover.mp3"),
      move: new Audio("audio/move.mp3"),
      attack: new Audio("audio/attack.mp3")
    };

    this.currentBGM = null; // Variabel untuk melacak BGM yang sedang bunyi
    this.isMuted = false;
    this.volumeBGM = 0.2;
    this.volumeSFX = 1;
  }

  playBGM(key) {
    this.stopBGM(); // Matikan lagu sebelumnya

    const sound = this.bgmList[key]; // Ambil lagu dari daftar
    if (!sound) return; // Proteksi jika key salah

    this.currentBGM = sound; // Tandai sebagai lagu aktif
    this.currentBGM.loop = true;
    this.currentBGM.volume = this.volumeBGM;

    if (!this.isMuted) {
      this.currentBGM.play().catch((e) => {
        console.warn("Autoplay dicegah browser, perlu interaksi user.");
      });
    }
  }

  stopBGM() {
    if (this.currentBGM) {
      this.currentBGM.pause();
      this.currentBGM.currentTime = 0; // Reset ke awal lagu
      this.currentBGM = null;
    }
  }

  playSFX(key) {
    if (this.isMuted) return;

    const sfx = this.sfxList[key];
    if (sfx) {
      sfx.currentTime = 0; // Agar jika diklik berkali-kali, suara mulai dari awal
      sfx.volume = this.volumeSFX;
      sfx.play();
    }
  }
}
