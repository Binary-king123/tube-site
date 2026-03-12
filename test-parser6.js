const lines = `
https://cdn.desibf.com/2026/02/Desi-Ladki-Sex-XXX-HD-Porn-Video.mp4
https://desibf.com/wp-content/uploads/2026/02/Desi-Ladki-Sex-XXX-HD-Porn-Video.jpg
`.split('\n').map(l => l.trim()).filter(Boolean);

const mp4Lines = lines.filter(l => l.includes(".mp4"));
const imgLines = lines.filter(l => l.match(/\.(jpg|jpeg|png|webp)/i));

mp4Lines.forEach(mp4Line => {
    const match = mp4Line.match(/(https?:\/\/[^\s]+)/);
    if (!match) return;
    const mp4Url = match[1];

    const urlParts = mp4Url.split('/');
    const filenameWithExt = urlParts[urlParts.length - 1];
    const basename = filenameWithExt.replace(/\.[^/.]+$/, "");

    console.log("Basename:", basename, "| Length:", basename.length);
    console.log("First Img Line:", imgLines[0], "| Length:", imgLines[0].length);

    const matchingImgLine = imgLines.find(l => {
       console.log("Comparing:", l.toLowerCase(), "with", basename.toLowerCase());
       return l.toLowerCase().includes(basename.toLowerCase());
    });
    
    let thumbUrl = "";
    if (matchingImgLine) {
        const imgMatch = matchingImgLine.match(/(https?:\/\/[^\s]+)/);
        if (imgMatch) thumbUrl = imgMatch[1];
    }
    console.log("Result:", thumbUrl);
});
