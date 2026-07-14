// Oyun ses efektlerini sentezler ve assets/sfx/*.wav olarak yazar.
// Kullanım: node scripts/gen_sounds.js
// Sesler koddan üretildiği için telif sorunu yoktur ve istenildiğinde
// parametrelerle oynayarak yeniden üretilebilir.

const fs = require('fs');
const path = require('path');

const SR = 22050; // örnekleme hızı (mono, 16-bit)

function sec(d) {
  return Math.round(d * SR);
}

// Frekans kayması (chirp) destekli, zarflı ton ekler.
function addTone(buf, { start = 0, dur, f0, f1 = f0, type = 'sine', gain = 1, attack = 0.004, decay }) {
  const n0 = sec(start);
  const n = sec(dur);
  const d = decay === undefined ? dur : decay;
  for (let i = 0; i < n && n0 + i < buf.length; i++) {
    const t = i / SR;
    // chirp fazı: f(t) = f0 + (f1-f0)*t/dur integrali
    const phase = 2 * Math.PI * (f0 * t + ((f1 - f0) * t * t) / (2 * dur));
    let v = Math.sin(phase);
    if (type === 'tri') v = (2 / Math.PI) * Math.asin(Math.sin(phase));
    const env = Math.min(1, t / attack) * Math.exp((-3 * t) / d);
    buf[n0 + i] += v * env * gain;
  }
}

function addNoise(buf, { start = 0, dur, gain = 0.3, decay }) {
  const n0 = sec(start);
  const n = sec(dur);
  const d = decay === undefined ? dur : decay;
  for (let i = 0; i < n && n0 + i < buf.length; i++) {
    const t = i / SR;
    const env = Math.exp((-4 * t) / d);
    buf[n0 + i] += (Math.random() * 2 - 1) * env * gain;
  }
}

function normalize(buf, peak = 0.62) {
  let max = 1e-9;
  for (const v of buf) max = Math.max(max, Math.abs(v));
  const k = peak / max;
  for (let i = 0; i < buf.length; i++) buf[i] *= k;
  // tık sesini önlemek için kısa giriş/çıkış yumuşatması
  const fade = Math.min(sec(0.004), buf.length >> 1);
  for (let i = 0; i < fade; i++) {
    buf[i] *= i / fade;
    buf[buf.length - 1 - i] *= i / fade;
  }
  return buf;
}

function writeWav(file, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(file, buf);
  console.log('yazıldı:', file, (buf.length / 1024).toFixed(1) + ' KB');
}

const outDir = path.join(__dirname, '..', 'assets', 'sfx');
fs.mkdirSync(outDir, { recursive: true });

// ── place: taş yerleştirme — yumuşak, tok bir "tık"
{
  const b = new Float64Array(sec(0.12));
  addNoise(b, { start: 0, dur: 0.015, gain: 0.5, decay: 0.01 });
  addTone(b, { start: 0, dur: 0.1, f0: 210, f1: 150, gain: 1, decay: 0.06 });
  addTone(b, { start: 0, dur: 0.08, f0: 420, f1: 300, gain: 0.25, decay: 0.04 });
  writeWav(path.join(outDir, 'place.wav'), normalize(b));
}

// ── clear: satır patlatma — yükselen üçlü "pırıltı" (G5-B5-E6)
{
  const b = new Float64Array(sec(0.38));
  addTone(b, { start: 0.0, dur: 0.22, f0: 784, gain: 0.8, decay: 0.16 });
  addTone(b, { start: 0.06, dur: 0.22, f0: 988, gain: 0.7, decay: 0.16 });
  addTone(b, { start: 0.12, dur: 0.24, f0: 1319, gain: 0.9, decay: 0.18 });
  addTone(b, { start: 0.12, dur: 0.2, f0: 2637, gain: 0.15, decay: 0.1 }); // parlaklık
  addNoise(b, { start: 0.0, dur: 0.05, gain: 0.12, decay: 0.03 });
  writeWav(path.join(outDir, 'clear.wav'), normalize(b));
}

// ── combo: seri patlatma — hızlı gliss + parlak akor
{
  const b = new Float64Array(sec(0.45));
  addTone(b, { start: 0, dur: 0.14, f0: 500, f1: 1400, gain: 0.5, decay: 0.12 });
  addTone(b, { start: 0.1, dur: 0.22, f0: 1319, gain: 0.8, decay: 0.16 });
  addTone(b, { start: 0.16, dur: 0.22, f0: 1568, gain: 0.7, decay: 0.16 });
  addTone(b, { start: 0.22, dur: 0.23, f0: 1976, gain: 0.85, decay: 0.17 });
  addTone(b, { start: 0.22, dur: 0.18, f0: 3951, gain: 0.12, decay: 0.09 });
  writeWav(path.join(outDir, 'combo.wav'), normalize(b, 0.66));
}

// ── gameover: oyun sonu — inen, yumuşak üçlü (G4-E4-C4)
{
  const b = new Float64Array(sec(0.75));
  addTone(b, { start: 0.0, dur: 0.2, f0: 392, type: 'tri', gain: 0.8, decay: 0.18 });
  addTone(b, { start: 0.18, dur: 0.2, f0: 330, type: 'tri', gain: 0.8, decay: 0.18 });
  addTone(b, { start: 0.36, dur: 0.34, f0: 262, type: 'tri', gain: 0.9, decay: 0.28 });
  addTone(b, { start: 0.36, dur: 0.3, f0: 131, gain: 0.3, decay: 0.26 }); // alt oktav
  writeWav(path.join(outDir, 'gameover.wav'), normalize(b, 0.55));
}

// ── record: yeni rekor — kısa fanfar (C5-E5-G5-C6)
{
  const b = new Float64Array(sec(0.85));
  addTone(b, { start: 0.0, dur: 0.16, f0: 523, gain: 0.7, decay: 0.13 });
  addTone(b, { start: 0.13, dur: 0.16, f0: 659, gain: 0.7, decay: 0.13 });
  addTone(b, { start: 0.26, dur: 0.16, f0: 784, gain: 0.75, decay: 0.13 });
  addTone(b, { start: 0.39, dur: 0.4, f0: 1047, gain: 0.9, decay: 0.3 });
  addTone(b, { start: 0.39, dur: 0.35, f0: 1319, gain: 0.45, decay: 0.26 });
  addTone(b, { start: 0.39, dur: 0.3, f0: 2093, gain: 0.15, decay: 0.16 });
  writeWav(path.join(outDir, 'record.wav'), normalize(b, 0.66));
}

console.log('Tüm sesler üretildi.');
