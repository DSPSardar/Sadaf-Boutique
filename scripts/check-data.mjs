// Sanity checks for the mock catalogue: size, unique slugs, and that every referenced asset exists on disk.
import fs from "node:fs";
import { execSync } from "node:child_process";

const json = execSync(
  `npx tsx -e "import { PRODUCTS } from './src/data/products'; console.log(JSON.stringify(PRODUCTS))"`,
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
);
const products = JSON.parse(json.trim().split("\n").pop());
const slugs = new Set(products.map((p) => p.slug));
const problems = [];
if (products.length < 100) problems.push(`only ${products.length} products`);
if (slugs.size !== products.length) problems.push(`duplicate slugs: ${products.length - slugs.size}`);
for (const p of products) {
  for (const img of p.images) {
    for (const f of ["card-400.webp", "card-600.webp", "card-800.webp", "large.webp"]) {
      if (!fs.existsSync(`public/products/${img.assetId}/${f}`)) problems.push(`${p.slug}: missing ${img.assetId}/${f}`);
    }
  }
  if (p.video && !fs.existsSync(`public${p.video.src}`)) problems.push(`${p.slug}: missing video ${p.video.src}`);
}
const videos = products.filter((p) => p.video).length;
const sale = products.filter((p) => p.compareAtPrice).length;
const fresh = products.filter((p) => p.isNew).length;
console.log(`${products.length} products, ${videos} with video, ${sale} on sale, ${fresh} new`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("data ok");
