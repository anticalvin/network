let context;
export function systemSound(kind = 'open') {
  if (sessionStorage.getItem('awaken.sound') !== 'true') return;
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  try {
    context ||= new Context();
    void context.resume().catch(() => {});
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = kind === 'notice' ? 660 : 440;
    gain.gain.setValueAtTime(.025, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .12);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(); oscillator.stop(context.currentTime + .13);
  } catch {}
}
