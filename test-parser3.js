const lines = `
https://cdn.desibf.com/2026/02/Desi-Ladki-Sex-XXX-HD-Porn-Video.mp4
https://desibf.com/wp-content/uploads/2026/02/Desi-Ladki-Sex-XXX-HD-Porn-Video.jpg

https://cdn.desibf.com/2026/02/Indian-Girl-Hardcore-Sex-Porn-Video-HD-xxx.mp4
https://desibf.com/wp-content/uploads/2026/02/Indian-Girl-Hardcore-Sex-Porn-Video-HD-xxx.jpg

https://cdn.desibf.com/2026/02/Super%20Sexy%20Bhabhi%20%20Fucked%20by%20Devar%20XXX%20Porn%20Video.mp4
https://desibf.com/wp-content/uploads/2026/02/Super%20Sexy%20Bhabhi%20%20Fucked%20by%20Devar%20XXX%20Porn%20Video.jpg
`.split('\n').map(l => l.trim()).filter(Boolean);

const mp4Lines = lines.filter(l => l.includes(".mp4"));
const imgLines = lines.filter(l => l.match(/\.(jpg|jpeg|png|webp)/i));

const pairs = [];
mp4Lines.forEach(mp4Line => {
    const match = mp4Line.match(/(https?:\/\/[^\s]+)/);
    if (!match) return;
    const mp4Url = match[1];

    const urlParts = mp4Url.split('/');
    const filenameWithExt = urlParts[urlParts.length - 1];
    const basename = filenameWithExt.replace(/\.[^/.]+$/, "");

    const matchingImgLine = imgLines.find(l => l.toLowerCase().includes(basename.toLowerCase()));
    let thumbUrl = "";
    if (matchingImgLine) {
        const imgMatch = matchingImgLine.match(/(https?:\/\/[^\s]+)/);
        if (imgMatch) thumbUrl = imgMatch[1];
    }
    pairs.push({ url: mp4Url, thumb: thumbUrl, basename });
});

console.log("Found pairs:", pairs);
