const fs = require('fs');
async function test() {
    try {
        const url = "https://desibf.com/wp-content/uploads/2026/03/Punjabi-Girl-Car-Sex-XXX-Video.jpg";
        console.log("Fetching...", url);
        const imgRes = await fetch(url, {
            headers: {
                "Referer": "https://desibf.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        console.log("Status:", imgRes.status);
        console.log("Content-Type:", imgRes.headers.get("content-type"));
        console.log("Content-Length:", imgRes.headers.get("content-length"));
        
        if (imgRes.ok) {
           const buffer = Buffer.from(await imgRes.arrayBuffer());
           fs.writeFileSync("test.jpg", buffer);
           console.log("Saved test.jpg of size", buffer.length);
        } else {
           console.error("Failed to load. Body:", await imgRes.text());
        }
    } catch(e) {
        console.error(e);
    }
}
test();
