const lines = `
https://cdn.desibf.com/2026/02/Desi-Ladki-Sex-XXX-HD-Porn-Video.mp4
https://desibf.com/wp-content/uploads/2026/02/Desi-Ladki-Sex-XXX-HD-Porn-Video.jpg
`.split('\n').filter(Boolean);

const imgLines = lines.filter(l => l.match(/\.(jpg|jpeg|png|webp)/i));
const mp4Url = "https://cdn.desibf.com/2026/02/Desi-Ladki-Sex-XXX-HD-Porn-Video.mp4";

const urlParts = mp4Url.split('/');
const filenameWithExt = urlParts[urlParts.length - 1];
const basename = filenameWithExt.replace(/\.[^/.]+$/, "");

const matchingImgLine = imgLines.find(l => l.toLowerCase().includes(basename.toLowerCase()));
let thumbUrl = "";
if (matchingImgLine) {
    console.log("Found matching line:", matchingImgLine);
    const imgMatch = matchingImgLine.match(/(https?:\/\/[^\s]+)/);
    console.log("imgMatch result:", imgMatch);
    if (imgMatch) thumbUrl = imgMatch[1];
}

console.log("Extracted Thumb URL:", thumbUrl);
