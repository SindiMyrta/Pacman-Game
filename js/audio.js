let audioContext = null;
let enabled = true;

export function setSoundEnabled(value) {
  enabled = Boolean(value);
}

export function isSoundEnabled() {
  return enabled;
}

export function playTone(frequency = 440, duration = 0.07, type = "square", volume = 0.035) {
  if (!enabled) return;

  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn("Audio is unavailable:", error);
  }
}

export function playCollectSound() {
  playTone(620, 0.045, "square", 0.025);
}

export function playPowerSound() {
  playTone(260, 0.12, "sawtooth", 0.04);
  setTimeout(() => playTone(520, 0.16, "sawtooth", 0.035), 100);
}
