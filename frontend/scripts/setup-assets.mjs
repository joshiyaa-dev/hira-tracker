// Copies MediaPipe WASM runtime + pose model into public/ so the app runs
// fully offline (no CDN calls at runtime).
// Run: npm run setup:assets
import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const wasmSrc = resolve(root, 'node_modules/@mediapipe/tasks-vision/wasm');
const wasmDest = resolve(root, 'public/mediapipe/wasm');

mkdirSync(wasmDest, { recursive: true });
cpSync(wasmSrc, wasmDest, { recursive: true });
console.log('Copied tasks-vision wasm ->', wasmDest);

const modelUrl = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';
const modelDest = resolve(root, 'public/models/pose_landmarker_lite.task');

if (!existsSync(modelDest)) {
  const res = await fetch(modelUrl);
  if (!res.ok) throw new Error(`Model download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(modelDest), { recursive: true });
  (await import('node:fs')).writeFileSync(modelDest, buf);
  console.log(`Downloaded pose model (${(buf.length / 1e6).toFixed(1)} MB) ->`, modelDest);
} else {
  console.log('Pose model already present.');
}
