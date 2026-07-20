/**
 * Script per creare lo ZIP dell'estensione per il Chrome Web Store.
 * Uso: npm run build
 */
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
//
// File e cartelle da includere nello ZIP.
const FILES_TO_INCLUDE = [
  "manifest.json",
  "background.js",
  "content.js",
  "storage.js",
  "popup.html",
  "popup.js",
  "popup.css",
  "icons"
];
//
// Cartella di output.
const OUTPUT_DIR = "dist";
//
// Legge la versione dal manifest.
function getVersion() {
  const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
  return manifest.version;
}
//
// Crea la cartella dist se non esiste.
function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}
//
// Crea lo ZIP.
async function createZip() {
  const version = getVersion();
  ensureOutputDir();
  //
  const zipName = `easy-copy-dom-v${version}.zip`;
  const zipPath = path.join(OUTPUT_DIR, zipName);
  //
  // Rimuove ZIP precedente se esiste.
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  //
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  //
  return new Promise((resolve, reject) => {
    output.on("close", () => {
      console.log(`✓ ZIP creato: ${zipName}`);
      console.log(`  File inclusi: ${FILES_TO_INCLUDE.length}`);
      console.log(`  Dimensione: ${(archive.pointer() / 1024).toFixed(2)} KB`);
      console.log(`  Percorso: ${zipPath}`);
      resolve();
    });
    //
    archive.on("error", (err) => reject(err));
    archive.pipe(output);
    //
    // Aggiunge file e cartelle.
    FILES_TO_INCLUDE.forEach((item) => {
      const stats = fs.statSync(item);
      if (stats.isDirectory()) {
        archive.directory(item, item);
      } else {
        archive.file(item, { name: item });
      }
    });
    //
    archive.finalize();
  });
}
//
// Main.
createZip()
  .then(() => console.log("\n✓ Build completata!"))
  .catch((err) => {
    console.error("✗ Errore:", err.message);
    process.exit(1);
  });
