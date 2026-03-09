const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const path = require("path");

console.log("FFMPEG Static Path:", ffmpegStatic);
ffmpeg.setFfmpegPath(ffmpegStatic);

const url = "https://cdn.desibf.com/2024/09/Viral-Girl-Sex-MMS-XNXX.mp4";
const uploadDir = path.join(process.cwd(), "public", "uploads", "thumbnails");

console.log("Upload Dir:", uploadDir);

ffmpeg(url)
    .on('end', () => console.log("Success!"))
    .on('error', (err) => console.error("FFMPEG error:", err))
    .screenshots({
        count: 1,
        timestamps: ['10%'],
        filename: "test-thumb.png",
        folder: uploadDir,
        size: '640x360'
    });
