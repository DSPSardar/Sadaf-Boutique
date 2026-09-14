// Builds a labelled contact sheet of every source photo so assets can be tagged by eye.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets/source";
const OUT = process.argv[2] ?? "assets/contact-sheet.jpg";
const W = 260, H = 325, COLS = 8;
const files = fs.readdirSync(SRC).filter((f) => /\.jpe?g$/i.test(f)).sort();
const rows = Math.ceil(files.length / COLS);
const tiles = await Promise.all(
  files.map(async (f, i) => {
    const img = await sharp(path.join(SRC, f)).rotate().resize(W, H, { fit: "cover", position: "attention" }).toBuffer();
    const label = Buffer.from(`<svg width="${W}" height="${H}"><rect x="0" y="0" width="${W}" height="30" fill="black" fill-opacity="0.65"/><text x="8" y="21" font-family="Helvetica" font-size="17" fill="white">${i + 1}  ${f.slice(0, 8)}</text></svg>`);
    const tile = await sharp(img).composite([{ input: label, top: 0, left: 0 }]).toBuffer();
    return { input: tile, left: (i % COLS) * W, top: Math.floor(i / COLS) * H };
  })
);
await sharp({ create: { width: COLS * W, height: rows * H, channels: 3, background: "#ffffff" } })
  .composite(tiles).jpeg({ quality: 88 }).toFile(OUT);
console.log(`wrote ${OUT} (${files.length} photos)`);
