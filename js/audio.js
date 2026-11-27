// Moteur d'effets sonores Web Audio API (fonctionne 100% hors-ligne, sans fichiers MP3)

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  setEnabled(val) {
    this.enabled = val;
  }

  tone(freq, duration, type = "sine", gainVal = 0.15, delay = 0, endFreq = null) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  click() {
    this.tone(520, 0.06, "triangle", 0.08, 0, 700);
  }

  laser() {
    this.tone(880, 0.18, "sawtooth", 0.12, 0, 180);
    this.tone(1200, 0.12, "square", 0.07, 0.03, 300);
  }

  superAttack() {
    this.tone(330, 0.12, "sawtooth", 0.14, 0, 660);
    this.tone(660, 0.14, "sawtooth", 0.15, 0.08, 1320);
    this.tone(110, 0.32, "square", 0.16, 0.16, 55);
  }

  hit() {
    this.tone(180, 0.14, "square", 0.14, 0, 60);
    this.tone(523.25, 0.1, "triangle", 0.12, 0.06);
    this.tone(659.25, 0.14, "triangle", 0.12, 0.12);
  }

  boing() {
    // Son rigolo en cas d'erreur (non punitif)
    this.tone(280, 0.16, "sine", 0.14, 0, 170);
    this.tone(190, 0.18, "triangle", 0.12, 0.12, 240);
  }

  victory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.tone(n, 0.18, "triangle", 0.15, i * 0.1);
    });
  }

  switchCoin() {
    this.tone(987.77, 0.08, "sine", 0.13, 0);
    this.tone(1318.51, 0.22, "sine", 0.15, 0.08);
  }

  levelUp() {
    const notes = [392.0, 523.25, 659.25, 783.99, 659.25, 1046.5];
    const times = [0, 0.1, 0.2, 0.3, 0.42, 0.52];
    const durs = [0.1, 0.1, 0.1, 0.12, 0.1, 0.38];
    notes.forEach((n, i) => {
      this.tone(n, durs[i], "triangle", 0.17, times[i]);
      this.tone(n / 2, durs[i], "sawtooth", 0.06, times[i]);
    });
  }
}

const sfx = new SoundFX();
