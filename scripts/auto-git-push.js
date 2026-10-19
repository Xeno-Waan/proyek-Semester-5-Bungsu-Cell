/**
 * SPK Bungsu Cell — Auto Git Sync Watcher
 * Memantau perubahan file lokal dan melakukan commit serta push otomatis ke GitHub
 * setelah jeda (debounce) penyimpanan berkas.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEBOUNCE_DELAY_MS = 6000; // Tunggu 6 detik setelah perubahan terakhir
let syncTimeout = null;
let isSyncing = false;

// Pola file/folder yang diabaikan agar tidak terjadi perulangan
const IGNORED_PATTERNS = [
  '.git',
  'node_modules',
  '.DS_Store',
  'Thumbs.db',
  '.tmp',
  'auto-git-push.js'
];

function isIgnored(filepath) {
  return IGNORED_PATTERNS.some(pattern => filepath.includes(pattern));
}

function triggerAutoSync(changedFile) {
  if (isIgnored(changedFile)) return;

  console.log(`[Auto-Git] Perubahan terdeteksi pada: ${path.relative(PROJECT_ROOT, changedFile)}`);

  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(() => {
    executeGitSync();
  }, DEBOUNCE_DELAY_MS);
}

function executeGitSync() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const status = execSync('git status --porcelain', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
    if (!status) {
      console.log('[Auto-Git] Tidak ada perubahan berkas untuk di-commit.');
      isSyncing = false;
      return;
    }

    const changedLines = status.split('\n');
    console.log(`[Auto-Git] Menemukan ${changedLines.length} perubahan. Memulai proses sinkronisasi...`);

    // 1. Stage all changes
    execSync('git add .', { cwd: PROJECT_ROOT, stdio: 'inherit' });

    // 2. Commit dengan timestamp lokal
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const commitMsg = `auto: pembaruan berkas [${timestamp}]`;

    execSync(`git commit -m "${commitMsg}"`, { cwd: PROJECT_ROOT, stdio: 'inherit' });
    console.log(`[Auto-Git] Berhasil membuat commit: "${commitMsg}"`);

    // 3. Push ke GitHub origin main
    console.log('[Auto-Git] Mengunggah (push) ke GitHub origin/main...');
    execSync('git push origin main', { cwd: PROJECT_ROOT, stdio: 'inherit' });
    console.log(`[Auto-Git] ✔ SUKSES: Seluruh perubahan telah tersinkronisasi ke GitHub pada ${timestamp}!\n`);

  } catch (err) {
    console.error('[Auto-Git] ✖ Terjadi kesalahan saat sinkronisasi Git:', err.message);
  } finally {
    isSyncing = false;
  }
}

// Mulai watcher rekursif
console.log('======================================================');
console.log('SPK Bungsu Cell — Auto Git Sync Aktif');
console.log(`Memantau direktori: ${PROJECT_ROOT}`);
console.log('Perubahan akan otomatis di-commit & push ke GitHub dalam 6 detik setelah save.');
console.log('Tekan Ctrl + C untuk menghentikan watcher.');
console.log('======================================================\n');

fs.watch(PROJECT_ROOT, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  const fullPath = path.join(PROJECT_ROOT, filename);
  triggerAutoSync(fullPath);
});
