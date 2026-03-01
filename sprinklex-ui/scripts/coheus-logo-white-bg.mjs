import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, "../public/coheus-logo.png");
const outputPath = join(__dirname, "../public/coheus-logo-white.png");

const img = sharp(inputPath);
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

const threshold = 40;
for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3];
  if (a > 0 && r < threshold && g < threshold && b < threshold) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
  }
}

await sharp(data, { raw: info }).png().toFile(outputPath);
console.log("Created coheus-logo-white.png");
