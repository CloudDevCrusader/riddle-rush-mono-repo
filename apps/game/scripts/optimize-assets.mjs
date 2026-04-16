import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const assetsRoot = path.resolve('public/assets');
const webpQuality = 80;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return [fullPath];
    })
  );
  return files.flat();
}

function toKb(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}

async function main() {
  const files = await walk(assetsRoot);
  const pngFiles = files.filter((file) => file.endsWith('.png'));

  if (!pngFiles.length) {
    console.log('No PNG files found under public/assets');
    return;
  }

  let totalInputBytes = 0;
  let totalOutputBytes = 0;

  for (const pngFile of pngFiles) {
    const webpFile = pngFile.replace(/\.png$/u, '.webp');
    const inputStat = await fs.stat(pngFile);

    await sharp(pngFile).webp({ quality: webpQuality }).toFile(webpFile);

    const outputStat = await fs.stat(webpFile);
    totalInputBytes += inputStat.size;
    totalOutputBytes += outputStat.size;

    const relativePng = path.relative(assetsRoot, pngFile);
    const relativeWebp = path.relative(assetsRoot, webpFile);
    const reduction = ((1 - outputStat.size / inputStat.size) * 100).toFixed(1);

    console.log(
      `${relativePng} -> ${relativeWebp} (${toKb(inputStat.size)} -> ${toKb(outputStat.size)}, ${reduction}% smaller)`
    );
  }

  const overallReduction = ((1 - totalOutputBytes / totalInputBytes) * 100).toFixed(1);
  console.log(`\nConverted ${pngFiles.length} PNG files to WebP (quality ${webpQuality}).`);
  console.log(
    `Total size: ${toKb(totalInputBytes)} -> ${toKb(totalOutputBytes)} (${overallReduction}% smaller)`
  );
}

await main();
