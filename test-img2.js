const fs = require('fs');

async function testFetch() {
    const urls = [
        "https://desibf.com/wp-content/uploads/2026/02/Desi-Ladki-Sex-XXX-HD-Porn-Video.jpg",
        "https://desibf.com/wp-content/uploads/2026/02/Indian-Girl-Hardcore-Sex-Porn-Video-HD-xxx.jpg"
    ];

    for (const url of urls) {
        console.log("Fetching:", url);
        try {
            const res = await fetch(url, {
                headers: {
                    "Referer": "https://desibf.com/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
            console.log("Status:", res.status);
            console.log("Content-Type:", res.headers.get("content-type"));
            if (!res.ok) {
                console.log("Failed Body:", await res.text().catch(()=>"N/A"));
            }
        } catch (e) {
            console.error("Fetch error:", e.message);
        }
        console.log("---");
    }
}

testFetch();
