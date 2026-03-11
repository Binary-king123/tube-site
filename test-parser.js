const lines = `
https://cdn.desibf.com/2026/03/Sexy%20Indian%20Girl%20Prefect%20Blowjob%20XXX%20Video%20in%20Jungle.mp4
https://desibf.com/wp-content/uploads/2026/03/Sexy%20Indian%20Girl%20Prefect%20Blowjob%20XXX%20Video%20in%20Jungle.jpg

https://cdn.desibf.com/2026/03/Desi-Bhabhi-Real-Orgasm-Sex-XXX-Video.mp4
https://desibf.com/wp-content/uploads/2026/03/Desi-Bhabhi-Real-Orgasm-Sex-XXX-Video.jpg
`.split('\n').filter(Boolean);

const mp4Lines = lines.filter(l => l.includes('.mp4'));
const imgLines = lines.filter(l => l.match(/\.(jpg|jpeg|png|webp)/i));

console.log("MP4 Lines:", mp4Lines.length);
console.log("IMG Lines:", imgLines.length);

const pairs = [];
mp4Lines.forEach(mp4Line => {
    const match = mp4Line.match(/(https?:\/\/[^\s]+)/);
    if (!match) return;
    const mp4Url = match[1];

    const urlParts = mp4Url.split('/');
    const filenameWithExt = urlParts[urlParts.length - 1];
    const basename = filenameWithExt.replace(/\.[^/.]+$/, "");

    console.log("Found Basename:", basename);

    const matchingImgLine = imgLines.find(l => l.includes(basename));
    let thumbUrl = "";
    if (matchingImgLine) {
        const imgMatch = matchingImgLine.match(/(https?:\/\/[^\s]+)/);
        if (imgMatch) thumbUrl = imgMatch[1];
    }
    pairs.push({ url: mp4Url, thumb: thumbUrl });
});

console.log(pairs);
