const sharp = require("sharp");
async function processImage() {
  const { data, info } = await sharp("public/logo.png").raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];
    // Simple black removal with a small threshold to catch compression artifacts
    if (r < 20 && g < 20 && b < 20) {
      data[i+3] = 0; 
    }
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png()
    .toFile("public/logo.png");
}
processImage().catch(console.error);
